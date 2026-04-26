$ErrorActionPreference = "Stop"

$src = 'C:\Users\aceka\Downloads\Mastering_AI_Judgment.pptx'
$out = 'C:\코딩\교육설계\Mastering_AI_Judgment_animated_trial.pptx'

# PowerPoint / Office constants (late binding)
$msoAnimEffectAppear = 1
$msoAnimEffectFade = 10
$msoAnimTriggerOnPageClick = 1
$msoAnimTriggerAfterPrevious = 3
$msoAnimTextUnitEffectByParagraph = 0
$msoTrue = -1
$msoFalse = 0
$ppEffectFadeSmoothly = 3849

function Get-TextShapes($slide) {
    $items = @()
    foreach ($shape in $slide.Shapes) {
        try {
            if ($shape.HasTextFrame -eq $msoTrue -and $shape.TextFrame.HasText -eq $msoTrue) {
                $text = $shape.TextFrame.TextRange.Text
                if (-not [string]::IsNullOrWhiteSpace($text)) {
                    $fontSize = 0
                    try { $fontSize = [double]$shape.TextFrame.TextRange.Font.Size } catch { $fontSize = 0 }
                    $paragraphCount = 1
                    try { $paragraphCount = [int]$shape.TextFrame.TextRange.Paragraphs().Count } catch { $paragraphCount = 1 }
                    $items += [pscustomobject]@{
                        Shape = $shape
                        Text = $text
                        FontSize = $fontSize
                        ParagraphCount = $paragraphCount
                        Top = [double]$shape.Top
                        Left = [double]$shape.Left
                        Area = ([double]$shape.Width * [double]$shape.Height)
                    }
                }
            }
        } catch {}
    }
    return $items
}

function Clear-Animations($slide) {
    $seq = $slide.TimeLine.MainSequence
    for ($i = $seq.Count; $i -ge 1; $i--) {
        try { $seq.Item($i).Delete() } catch {}
    }
}

function Add-TextAnimation($seq, $shapeInfo, $effectId, $trigger, $duration, $delaySeconds) {
    $effect = $seq.AddEffect($shapeInfo.Shape, $effectId, 0, $trigger)
    try { $effect.Timing.Duration = $duration } catch {}
    try { $effect.Timing.TriggerDelayTime = $delaySeconds } catch {}

    if ($shapeInfo.ParagraphCount -gt 1) {
        try { $seq.ConvertToTextUnitEffect($effect, $msoAnimTextUnitEffectByParagraph) | Out-Null } catch {}
    }

    return $effect
}

Copy-Item -LiteralPath $src -Destination $out -Force

$ppt = $null
$pres = $null

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = -1
    $pres = $ppt.Presentations.Open($out, $msoFalse, $msoFalse, $msoFalse)

    foreach ($slide in $pres.Slides) {
        try {
            # Simple, low-risk transition for the whole slide
            $slide.SlideShowTransition.EntryEffect = $ppEffectFadeSmoothly
            $slide.SlideShowTransition.Duration = 0.35
            $slide.SlideShowTransition.AdvanceOnClick = $msoTrue
        } catch {}

        Clear-Animations $slide
        $seq = $slide.TimeLine.MainSequence

        $textShapes = Get-TextShapes $slide
        if (-not $textShapes -or $textShapes.Count -eq 0) { continue }

        # Heuristic: largest-font text near the top is the key sentence / title
        $keyShape = $textShapes |
            Sort-Object @{Expression='FontSize';Descending=$true}, @{Expression='Top';Ascending=$true}, @{Expression='Area';Descending=$true} |
            Select-Object -First 1

        Add-TextAnimation -seq $seq -shapeInfo $keyShape -effectId $msoAnimEffectFade -trigger $msoAnimTriggerOnPageClick -duration 0.45 -delaySeconds 0

        $others = $textShapes | Where-Object { $_.Shape.Id -ne $keyShape.Shape.Id } | Sort-Object Top, Left
        $delay = 0.05
        foreach ($shapeInfo in $others) {
            $effectId = if ($shapeInfo.ParagraphCount -gt 1) { $msoAnimEffectAppear } else { $msoAnimEffectFade }
            Add-TextAnimation -seq $seq -shapeInfo $shapeInfo -effectId $effectId -trigger $msoAnimTriggerAfterPrevious -duration 0.35 -delaySeconds $delay | Out-Null
            $delay += 0.05
        }
    }

    $pres.Save()

    foreach ($slide in $pres.Slides) {
        Write-Output ("SLIDE " + $slide.SlideIndex + " | effects=" + $slide.TimeLine.MainSequence.Count)
    }
}
finally {
    if ($pres) { $pres.Close() }
    if ($ppt) { $ppt.Quit() }
}

Write-Output ("OUTPUT=" + $out)
