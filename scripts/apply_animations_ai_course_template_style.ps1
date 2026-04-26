$ErrorActionPreference = "Stop"

$src = 'C:\코딩\교육설계\output\slides\생성형AI_기초활용역량_실전강의슬라이드_템플릿스타일.pptx'
$out = 'C:\코딩\교육설계\output\slides\생성형AI_기초활용역량_실전강의슬라이드_템플릿스타일_애니메이션시험.pptx'
$tmpRoot = 'C:\Temp\ai-course-animation'
$tmpPpt = Join-Path $tmpRoot 'work.pptx'

# Late-bound PowerPoint constants
$msoFalse = 0
$msoTrue = -1
$msoAnimEffectAppear = 1
$msoAnimEffectFade = 10
$msoAnimTriggerOnPageClick = 1
$msoAnimTriggerAfterPrevious = 3
$msoAnimTextUnitEffectByParagraph = 0
$ppEffectFadeSmoothly = 3849

function Get-ShapeById($slide, $shapeId) {
    foreach ($shape in $slide.Shapes) {
        try {
            if ($shape.Id -eq $shapeId) { return $shape }
        } catch {}
    }
    return $null
}

function Clear-Animations($slide) {
    $seq = $slide.TimeLine.MainSequence
    for ($i = $seq.Count; $i -ge 1; $i--) {
        try { $seq.Item($i).Delete() } catch {}
    }
}

function Add-Anim($slide, $shapeId, $effectId, $trigger, $duration = 0.35, $delay = 0, $byParagraph = $false) {
    $shape = Get-ShapeById $slide $shapeId
    if (-not $shape) { return $null }
    $seq = $slide.TimeLine.MainSequence
    $effect = $seq.AddEffect($shape, $effectId, 0, $trigger)
    try { $effect.Timing.Duration = $duration } catch {}
    try { $effect.Timing.TriggerDelayTime = $delay } catch {}
    if ($byParagraph) {
        try { $seq.ConvertToTextUnitEffect($effect, $msoAnimTextUnitEffectByParagraph) | Out-Null } catch {}
    }
    return $effect
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

    # Subtle slide transition on all slides
    foreach ($slide in $pres.Slides) {
        try {
            $slide.SlideShowTransition.EntryEffect = $ppEffectFadeSmoothly
            $slide.SlideShowTransition.Duration = 0.3
            $slide.SlideShowTransition.AdvanceOnClick = $msoTrue
        } catch {}
        Clear-Animations $slide
    }

    # Slide 1: title -> subtitle -> right cards sequence
    $slide = $pres.Slides.Item(1)
    Add-Anim $slide 9  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.45 0
    Add-Anim $slide 10 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.35 0.05
    Add-Anim $slide 14 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.3 0.05
    Add-Anim $slide 18 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.3 0.05
    Add-Anim $slide 22 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.3 0.05

    # Slide 2: title then 4MAT stages
    $slide = $pres.Slides.Item(2)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 11 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 15 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 19 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 23 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 24 $msoAnimEffectFade   $msoAnimTriggerAfterPrevious 0.22 0.02

    # Slide 3: maturity steps
    $slide = $pres.Slides.Item(3)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 10,13,16,19,22) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03 | Out-Null
    }
    Add-Anim $slide 27 $msoAnimEffectFade $msoAnimTriggerAfterPrevious 0.25 0.03

    # Slide 4: compare houses across, then takeaway
    $slide = $pres.Slides.Item(4)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,15,19,23) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03 | Out-Null
    }
    Add-Anim $slide 24 $msoAnimEffectFade $msoAnimTriggerAfterPrevious 0.25 0.03

    # Slide 5: ladder by paragraph, then example
    $slide = $pres.Slides.Item(5)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 8 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03 $true
    Add-Anim $slide 12 $msoAnimEffectFade $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 13 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.02

    # Slide 6: role-specific cards
    $slide = $pres.Slides.Item(6)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,15,19,23) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.03 | Out-Null
    }
    Add-Anim $slide 24 $msoAnimEffectFade $msoAnimTriggerAfterPrevious 0.22 0.02

    # Slide 7: compare left to right
    $slide = $pres.Slides.Item(7)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 11 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 12 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.03
    Add-Anim $slide 16 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 17 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.03

    # Slide 8: search -> generate -> reason
    $slide = $pres.Slides.Item(8)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,16,21) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.26 0.04 | Out-Null
    }

    # Slide 9: philosophy cards
    $slide = $pres.Slides.Item(9)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,16,21) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.26 0.04 | Out-Null
    }
    Add-Anim $slide 23 $msoAnimEffectFade $msoAnimTriggerAfterPrevious 0.22 0.02

    # Slide 10: CRAFTO cards sequential
    $slide = $pres.Slides.Item(10)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,15,19,23,27,31) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03 | Out-Null
    }

    # Slide 11: before / after
    $slide = $pres.Slides.Item(11)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 11 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04
    Add-Anim $slide 12 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03
    Add-Anim $slide 16 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04
    Add-Anim $slide 17 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03

    # Slide 12: 10-80-10
    $slide = $pres.Slides.Item(12)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,12,13,14,15,16) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.18 0.02 | Out-Null
    }

    # Slide 13: 1-3-1 funnel
    $slide = $pres.Slides.Item(13)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 11 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04
    Add-Anim $slide 17 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04
    Add-Anim $slide 23 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04

    # Slide 14: feedback loop quadrants
    $slide = $pres.Slides.Item(14)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,15,19,23) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03 | Out-Null
    }

    # Slide 15: left statement then right dark card
    $slide = $pres.Slides.Item(15)
    Add-Anim $slide 7  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.45 0
    Add-Anim $slide 8  $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.25 0.03
    Add-Anim $slide 12 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.28 0.04
    Add-Anim $slide 13 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.02

    # Slide 16: tool map cards
    $slide = $pres.Slides.Item(16)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,15,19,23,27) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.2 0.03 | Out-Null
    }

    # Slide 17: synthesis cards
    $slide = $pres.Slides.Item(17)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    foreach ($id in 11,16,21) {
        Add-Anim $slide $id $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.25 0.03 | Out-Null
    }

    # Slide 18: instructions by paragraph then final check
    $slide = $pres.Slides.Item(18)
    Add-Anim $slide 6 $msoAnimEffectFade $msoAnimTriggerOnPageClick 0.4 0
    Add-Anim $slide 8 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.18 0.02 $true
    Add-Anim $slide 12 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.24 0.04
    Add-Anim $slide 13 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.22 0.03

    # Slide 19: big takeaway then action prompt
    $slide = $pres.Slides.Item(19)
    Add-Anim $slide 6  $msoAnimEffectFade   $msoAnimTriggerOnPageClick 0.5 0
    Add-Anim $slide 11 $msoAnimEffectAppear $msoAnimTriggerAfterPrevious 0.25 0.06

    $pres.Save()
    foreach ($slide in $pres.Slides) {
        Write-Output ('SLIDE ' + $slide.SlideIndex + ' | effects=' + $slide.TimeLine.MainSequence.Count)
    }
}
finally {
    if ($pres) { $pres.Close() }
    if ($ppt) { $ppt.Quit() }
}

Copy-Item -LiteralPath $tmpPpt -Destination $out -Force

Write-Output ('OUTPUT=' + $out)
