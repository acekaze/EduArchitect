from __future__ import annotations

import argparse
import re
import shutil
import uuid
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile
import xml.etree.ElementTree as ET


DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
PRESENTATION_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
P14_NS = "http://schemas.microsoft.com/office/powerpoint/2010/main"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CONTENT_TYPES_NS = "http://schemas.openxmlformats.org/package/2006/content-types"

ET.register_namespace("a", DRAWING_NS)
ET.register_namespace("p", PRESENTATION_NS)
ET.register_namespace("r", REL_NS)
ET.register_namespace("p14", P14_NS)

SECTION_EXT_URI = "{521415D9-36F7-43E2-AB2F-B90AF26B5E84}"
SLIDE_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
NOTES_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"
SLIDE_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml"


def natural_slide_order(path: str) -> int:
    stem = Path(path).stem
    number = stem.replace("slide", "")
    return int(number)


def update_slide_text(slide_xml: bytes, replacement: str) -> bytes:
    root = ET.fromstring(slide_xml)
    text_nodes = root.findall(f".//{{{DRAWING_NS}}}t")
    if not text_nodes:
        raise ValueError("No text nodes found in slide XML.")

    text_nodes[0].text = replacement
    for extra in text_nodes[1:]:
        extra.text = ""
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def parse_lines_file(path: Path) -> tuple[list[str], list[dict[str, object]]]:
    slide_lines: list[str] = []
    sections: list[dict[str, object]] = []
    current_day_label = "1일차"
    current_section: dict[str, object] | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue

        day_match = re.match(r"^(\d+일차)(?:\s|$)", line)
        if day_match:
            if current_section is not None and "end_index" not in current_section:
                current_section["end_index"] = len(slide_lines)
            current_day_label = day_match.group(1)
            slide_lines.append(line)
            continue

        normalized = re.sub(r"\s+", "", line).rstrip(".")
        is_class_section = bool(re.fullmatch(r"\d+교시", normalized))
        is_closing_section = normalized == "마무리"
        if is_class_section or is_closing_section:
            if current_section is not None and "end_index" not in current_section:
                current_section["end_index"] = len(slide_lines)
            current_section = {
                "name": f"{current_day_label} - {normalized}",
                "start_index": len(slide_lines),
            }
            sections.append(current_section)
            continue

        slide_lines.append(line)

    if current_section is not None and "end_index" not in current_section:
        current_section["end_index"] = len(slide_lines)

    finalized_sections = [
        {
            "name": str(section["name"]),
            "start_index": int(section["start_index"]),
            "end_index": int(section["end_index"]),
        }
        for section in sections
        if int(section["end_index"]) > int(section["start_index"])
    ]
    return slide_lines, finalized_sections


def strip_notes_relationships(slide_rel_xml: bytes) -> bytes:
    root = ET.fromstring(slide_rel_xml)
    for rel in list(root):
        if rel.attrib.get("Type") == NOTES_REL_TYPE:
            root.remove(rel)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def ensure_slide_override(content_types_xml: bytes, slide_number: int) -> bytes:
    ET.register_namespace("", CONTENT_TYPES_NS)
    root = ET.fromstring(content_types_xml)
    override_path = f"/ppt/slides/slide{slide_number}.xml"
    for node in root.findall(f"{{{CONTENT_TYPES_NS}}}Override"):
        if node.attrib.get("PartName") == override_path:
            return ET.tostring(root, encoding="utf-8", xml_declaration=True)

    ET.SubElement(
        root,
        f"{{{CONTENT_TYPES_NS}}}Override",
        {"PartName": override_path, "ContentType": SLIDE_CONTENT_TYPE},
    )
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def ensure_slide_capacity(payload: dict[str, bytes], desired_count: int) -> None:
    slide_members = sorted(
        [
            name
            for name in payload
            if name.startswith("ppt/slides/slide") and name.endswith(".xml")
        ],
        key=natural_slide_order,
    )
    current_count = len(slide_members)
    if desired_count <= current_count:
        return

    template_slide_number = natural_slide_order(slide_members[-1])
    template_slide_xml = payload[slide_members[-1]]
    template_rel_member = f"ppt/slides/_rels/slide{template_slide_number}.xml.rels"
    template_slide_rel_xml = strip_notes_relationships(payload[template_rel_member])

    presentation_root = ET.fromstring(payload["ppt/presentation.xml"])
    sld_id_lst = presentation_root.find(f"{{{PRESENTATION_NS}}}sldIdLst")
    if sld_id_lst is None:
        raise ValueError("Presentation is missing slide id list.")
    max_slide_id = max(int(el.attrib["id"]) for el in sld_id_lst)

    rel_root = ET.fromstring(payload["ppt/_rels/presentation.xml.rels"])
    rel_numbers = []
    for rel in rel_root.findall(f"{{{PKG_REL_NS}}}Relationship"):
        match = re.match(r"rId(\d+)$", rel.attrib.get("Id", ""))
        if match:
            rel_numbers.append(int(match.group(1)))
    next_rel_number = max(rel_numbers or [0]) + 1

    for slide_number in range(current_count + 1, desired_count + 1):
        slide_member = f"ppt/slides/slide{slide_number}.xml"
        slide_rel_member = f"ppt/slides/_rels/slide{slide_number}.xml.rels"
        payload[slide_member] = template_slide_xml
        payload[slide_rel_member] = template_slide_rel_xml

        rel_id = f"rId{next_rel_number}"
        next_rel_number += 1
        ET.SubElement(
            rel_root,
            f"{{{PKG_REL_NS}}}Relationship",
            {
                "Id": rel_id,
                "Type": SLIDE_REL_TYPE,
                "Target": f"slides/slide{slide_number}.xml",
            },
        )

        max_slide_id += 1
        ET.SubElement(
            sld_id_lst,
            f"{{{PRESENTATION_NS}}}sldId",
            {"id": str(max_slide_id), f"{{{REL_NS}}}id": rel_id},
        )

        payload["[Content_Types].xml"] = ensure_slide_override(
            payload["[Content_Types].xml"], slide_number
        )

    payload["ppt/presentation.xml"] = ET.tostring(
        presentation_root, encoding="utf-8", xml_declaration=True
    )
    payload["ppt/_rels/presentation.xml.rels"] = ET.tostring(
        rel_root, encoding="utf-8", xml_declaration=True
    )


def update_sections(
    presentation_xml: bytes, slide_ids: list[str], sections: list[dict[str, object]]
) -> bytes:
    root = ET.fromstring(presentation_xml)
    ext_lst = root.find(f"{{{PRESENTATION_NS}}}extLst")
    if ext_lst is None:
        ext_lst = ET.SubElement(root, f"{{{PRESENTATION_NS}}}extLst")

    for ext in list(ext_lst):
        if ext.attrib.get("uri") == SECTION_EXT_URI:
            ext_lst.remove(ext)

    if sections:
        ext = ET.SubElement(ext_lst, f"{{{PRESENTATION_NS}}}ext", {"uri": SECTION_EXT_URI})
        section_lst = ET.SubElement(ext, f"{{{P14_NS}}}sectionLst")

        for section in sections:
            section_el = ET.SubElement(
                section_lst,
                f"{{{P14_NS}}}section",
                {
                    "name": str(section["name"]),
                    "id": "{" + str(uuid.uuid4()).upper() + "}",
                },
            )
            sld_id_lst = ET.SubElement(section_el, f"{{{P14_NS}}}sldIdLst")
            for slide_id in slide_ids[int(section["start_index"]) : int(section["end_index"])]:
                ET.SubElement(sld_id_lst, f"{{{P14_NS}}}sldId", {"id": slide_id})

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def build_updated_pptx(
    source: Path,
    destination: Path,
    slide_lines: list[str],
    sections: list[dict[str, object]] | None = None,
) -> None:
    sections = sections or []
    with TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir) / source.name
        shutil.copy2(source, temp_path)

        with ZipFile(temp_path, "r") as zin:
            payload = {name: zin.read(name) for name in zin.namelist()}

        ensure_slide_capacity(payload, len(slide_lines))
        slide_members = sorted(
            [
                name
                for name in payload
                if name.startswith("ppt/slides/slide") and name.endswith(".xml")
            ],
            key=natural_slide_order,
        )

        presentation_root = ET.fromstring(payload["ppt/presentation.xml"])
        sld_id_elements = presentation_root.findall(
            f"./{{{PRESENTATION_NS}}}sldIdLst/{{{PRESENTATION_NS}}}sldId"
        )
        slide_ids = [el.attrib["id"] for el in sld_id_elements]

        for index, line in enumerate(slide_lines):
            payload[slide_members[index]] = update_slide_text(payload[slide_members[index]], line)

        payload["ppt/presentation.xml"] = update_sections(
            payload["ppt/presentation.xml"],
            slide_ids,
            sections,
        )

        destination.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(destination, "w", compression=ZIP_DEFLATED) as zout:
            for name in sorted(payload.keys()):
                zout.writestr(name, payload[name])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replace the title text in Samsung template slides."
    )
    parser.add_argument("--source", required=True, help="Path to the source PPTX template.")
    parser.add_argument("--output", required=True, help="Path to write the updated PPTX.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--line",
        action="append",
        help="Slide text to apply in order. Repeat for multiple slides.",
    )
    group.add_argument(
        "--lines-file",
        help="UTF-8 text file with one slide line per line and optional section headers.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.lines_file:
        slide_lines, sections = parse_lines_file(Path(args.lines_file))
    else:
        slide_lines = [line.strip() for line in args.line if line and line.strip()]
        sections = []

    if not slide_lines:
        raise ValueError("No slide lines were provided.")

    build_updated_pptx(Path(args.source), Path(args.output), slide_lines, sections)
    if sections:
        print(
            f"Updated {len(slide_lines)} slide(s) with {len(sections)} section(s): {args.output}"
        )
    else:
        print(f"Updated {len(slide_lines)} slide(s): {args.output}")


if __name__ == "__main__":
    main()
