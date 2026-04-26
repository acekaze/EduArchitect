$ErrorActionPreference = "Stop"

$src = 'C:\코딩\교육설계\output\slides\생성형AI_기초활용역량_실전강의슬라이드_템플릿스타일.pptx'
$out = 'C:\코딩\교육설계\output\slides\생성형AI_기초활용역량_실전강의슬라이드_템플릿스타일_애니메이션시선유도.pptx'
$tmpRoot = 'C:\Temp\ai-course-directional-animation'
$tmpPpt = Join-Path $tmpRoot 'work.pptx'

# PowerPoint constants
$msoFalse = 0
$msoTrue = -1
$msoAnimEffectAppear = 1
$msoAnimEffectFly = 2
$msoAnimEffectFade = 10
$msoAnimTriggerOnPageClick = 1
$msoAnimTriggerAfterPrevious = 3
$msoAnimTextUnitEffectByParagraph = 0
$ppEffectFadeSmoothly = 3849

# MsoAnimDirection
$dirUp = 1
$dirRight = 2
$dirDown = 3
$dirLeft = 4

function Get-ShapeById($slide, $shapeId) {
    foreach ($shape in $slide.Shapes) {
        try { if ($shape.Id -eq $shapeId) { return $shape } } catch {}
    }
    return $null
}

function Clear-Animations($slide) {
    $seq = $slide.TimeLine.MainSequence
    for ($i = $seq.Count; $i -ge 1; $i--) {
        try { $seq.Item($i).Delete() } catch {}
    }
}

function Add-Fade($slide, $shapeId, $trigger, $duration = 0.35, $delay = 0, $byParagraph = $false) {
    $shape = Get-ShapeById $slide $shapeId
    if (-not $shape) { return }
    $seq = $slide.TimeLine.MainSequence
    $effect = $seq.AddEffect($shape, $msoAnimEffectFade, 0, $trigger)
    try { $effect.Timing.Duration = $duration } catch {}
    try { $effect.Timing.TriggerDelayTime = $delay } catch {}
    if ($byParagraph) {
        try { $seq.ConvertToTextUnitEffect($effect, $msoAnimTextUnitEffectByParagraph) | Out-Null } catch {}
    }
}

function Add-Fly($slide, $shapeId, $direction, $trigger, $duration = 0.35, $delay = 0, $byParagraph = $false) {
    $shape = Get-ShapeById $slide $shapeId
    if (-not $shape) { return }
    $seq = $slide.TimeLine.MainSequence
    $effect = $seq.AddEffect($shape, $msoAnimEffectFly, 0, $trigger)
    try { $effect.EffectParameters.Direction = $direction } catch {}
    try { $effect.Timing.Duration = $duration } catch {}
    try { $effect.Timing.TriggerDelayTime = $delay } catch {}
    if ($byParagraph) {
        try { $seq.ConvertToTextUnitEffect($effect, $msoAnimTextUnitEffectByParagraph) | Out-Null } catch {}
    }
}

if (Test-Path -LiteralPath $tmpRoot) {
    Remove-Item -LiteralPath $tmpRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $tmpRoot | Out-Null
Copy-Item -LiteralPath $src -Destination $tmpPpt -Force

$ppt = $null
$pres = $null

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = -1
    $openPath = (Get-Item -LiteralPath $tmpPpt).FullName
    $pres = $ppt.Presentations.Open($openPath, $msoFalse, $msoFalse, $msoFalse)

    foreach ($slide in $pres.Slides) {
        try {
            $slide.SlideShowTransition.EntryEffect = $ppEffectFadeSmoothly
            $slide.SlideShowTransition.Duration = 0.25
            $slide.SlideShowTransition.AdvanceOnClick = $msoTrue
        } catch {}
        Clear-Animations $slide
    }

    # 1. cover: title fade, subtitle from bottom, right cards from right
    $slide = $pres.Slides.Item(1)
    Add-Fade $slide 9  $msoAnimTriggerOnPageClick 0.45 0
    Add-Fly  $slide 10 $dirUp $msoAnimTriggerAfterPrevious 0.35 0.05
    Add-Fly  $slide 14 $dirRight $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Fly  $slide 18 $dirRight $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Fly  $slide 22 $dirRight $msoAnimTriggerAfterPrevious 0.28 0.04

    # 2. 4MAT: stages left to right
    $slide = $pres.Slides.Item(2)
    Add-Fade $slide 6  $msoAnimTriggerOnPageClick 0.4 0
    Add-Fly  $slide 11 $dirLeft $msoAnimTriggerAfterPrevious 0.25 0.03
    Add-Fly  $slide 15 $dirLeft $msoAnimTriggerAfterPrevious 0.25 0.03
    Add-Fly  $slide 19 $dirLeft $msoAnimTriggerAfterPrevious 0.25 0.03
    Add-Fly  $slide 23 $dirLeft $msoAnimTriggerAfterPrevious 0.25 0.03
    Add-Fade $slide 24 $msoAnimTriggerAfterPrevious 0.2 0.02

    # 3. current position: left-to-right maturity
    $slide = $pres.Slides.Item(3)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    foreach ($id in 10,13,16,19,22) {
        Add-Fly $slide $id $dirUp $msoAnimTriggerAfterPrevious 0.2 0.02
    }
    Add-Fade $slide 27 $msoAnimTriggerAfterPrevious 0.22 0.02

    # 4. pretty house: four cards left-to-right, then takeaway
    $slide = $pres.Slides.Item(4)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    foreach ($id in 11,15,19,23) {
        Add-Fly $slide $id $dirUp $msoAnimTriggerAfterPrevious 0.2 0.02
    }
    Add-Fade $slide 24 $msoAnimTriggerAfterPrevious 0.22 0.02

    # 5. ladder: paragraph-by-paragraph top-down, then example card from right
    $slide = $pres.Slides.Item(5)
    Add-Fade $slide 6  $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 8  $dirUp $msoAnimTriggerAfterPrevious 0.18 0.02 $true
    Add-Fly  $slide 12 $dirRight $msoAnimTriggerAfterPrevious 0.25 0.04
    Add-Fade $slide 13 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 6. role scenes: top row then bottom row
    $slide = $pres.Slides.Item(6)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 15 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 19 $dirLeft  $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 23 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fade $slide 24 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 7. doctor compare: left then right
    $slide = $pres.Slides.Item(7)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft $msoAnimTriggerAfterPrevious 0.24 0.03
    Add-Fade $slide 12 $msoAnimTriggerAfterPrevious 0.18 0.02
    Add-Fly  $slide 16 $dirRight $msoAnimTriggerAfterPrevious 0.24 0.03
    Add-Fade $slide 17 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 8. search/generate/reason left to right
    $slide = $pres.Slides.Item(8)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 16 $dirLeft $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 21 $dirLeft $msoAnimTriggerAfterPrevious 0.22 0.03

    # 9. philosophy 3 cards left to right
    $slide = $pres.Slides.Item(9)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 16 $dirUp   $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 21 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fade $slide 23 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 10. CRAFTO top row then bottom row
    $slide = $pres.Slides.Item(10)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 15 $dirUp    $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 19 $dirRight $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 23 $dirLeft  $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 27 $dirUp    $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 31 $dirRight $msoAnimTriggerAfterPrevious 0.2 0.02

    # 11. before/after
    $slide = $pres.Slides.Item(11)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.24 0.03
    Add-Fade $slide 12 $msoAnimTriggerAfterPrevious 0.18 0.02
    Add-Fly  $slide 16 $dirRight $msoAnimTriggerAfterPrevious 0.24 0.03
    Add-Fade $slide 17 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 12. 10-80-10 left-center-right
    $slide = $pres.Slides.Item(12)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.18 0.02
    Add-Fly  $slide 12 $dirUp    $msoAnimTriggerAfterPrevious 0.18 0.02
    Add-Fly  $slide 13 $dirRight $msoAnimTriggerAfterPrevious 0.18 0.02
    Add-Fade $slide 14 $msoAnimTriggerAfterPrevious 0.16 0.02
    Add-Fade $slide 15 $msoAnimTriggerAfterPrevious 0.16 0.02
    Add-Fade $slide 16 $msoAnimTriggerAfterPrevious 0.16 0.02

    # 13. 1-3-1 funnel
    $slide = $pres.Slides.Item(13)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 17 $dirUp    $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 23 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03

    # 14. feedback loop quadrants clockwise
    $slide = $pres.Slides.Item(14)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 15 $dirRight $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 23 $dirDown  $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 19 $dirDown  $msoAnimTriggerAfterPrevious 0.2 0.02

    # 15. section break
    $slide = $pres.Slides.Item(15)
    Add-Fly  $slide 7  $dirLeft  $msoAnimTriggerOnPageClick 0.35 0
    Add-Fade $slide 8  $msoAnimTriggerAfterPrevious 0.2 0.02
    Add-Fly  $slide 12 $dirRight $msoAnimTriggerAfterPrevious 0.25 0.04
    Add-Fade $slide 13 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 16. tool map left to right
    $slide = $pres.Slides.Item(16)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    foreach ($id in 11,15,19,23,27) {
        Add-Fly $slide $id $dirUp $msoAnimTriggerAfterPrevious 0.18 0.02 | Out-Null
    }

    # 17. synthesis left-center-right
    $slide = $pres.Slides.Item(17)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 11 $dirLeft  $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 16 $dirUp    $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fly  $slide 21 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03

    # 18. instructions by paragraph then check
    $slide = $pres.Slides.Item(18)
    Add-Fade $slide 6 $msoAnimTriggerOnPageClick 0.35 0
    Add-Fly  $slide 8 $dirUp $msoAnimTriggerAfterPrevious 0.16 0.02 $true
    Add-Fly  $slide 12 $dirRight $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Fade $slide 13 $msoAnimTriggerAfterPrevious 0.18 0.02

    # 19. takeaway then prompt
    $slide = $pres.Slides.Item(19)
    Add-Fade $slide 6  $msoAnimTriggerOnPageClick 0.45 0
    Add-Fly  $slide 11 $dirUp $msoAnimTriggerAfterPrevious 0.25 0.05

    $pres.Save()
    foreach ($slide in $pres.Slides) {
        Write-Output ('SLIDE ' + $slide.SlideIndex + ' | effects=' + $slide.TimeLine.MainSequence.Count)
    }
} finally {
    if ($pres) { $pres.Close() }
    if ($ppt) { $ppt.Quit() }
}
Copy-Item -LiteralPath $tmpPpt -Destination $out -Force
Write-Output ('OUTPUT=' + $out)
