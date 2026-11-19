# Samples a generated image into a pixel grid: each cell takes the most common colour among
# its inner pixels (the edges of a cell are blurred in generated "pixel art"). Writes JSON.
param([string]$In, [string]$Out, [double]$Cell = 5.06, [int]$X0 = 0, [int]$Y0 = 0, [int]$MaxX = 320)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($In)
$cols = [int][math]::Floor(($MaxX - $X0) / $Cell); $rows = [int][math]::Floor(($b.Height - $Y0) / $Cell)
$px = New-Object System.Collections.Generic.List[int]
for ($r = 0; $r -lt $rows; $r++) { for ($c = 0; $c -lt $cols; $c++) {
  $counts = @{}
  $sx = $X0 + $c * $Cell; $sy = $Y0 + $r * $Cell
  for ($dy = 1; $dy -lt [int]$Cell - 1; $dy++) { for ($dx = 1; $dx -lt [int]$Cell - 1; $dx++) {
    $p = $b.GetPixel([int]($sx + $dx), [int]($sy + $dy))
    $k = (([int]($p.R / 8)) -shl 10) -bor (([int]($p.G / 8)) -shl 5) -bor ([int]($p.B / 8))
    if ($counts.ContainsKey($k)) { $counts[$k] += 1 } else { $counts[$k] = 1 } } }
  $best = ($counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
  $r8 = (($best -shr 10) -band 31) * 8 + 4; $g8 = (($best -shr 5) -band 31) * 8 + 4; $b8 = ($best -band 31) * 8 + 4
  $px.Add(($r8 -shl 16) -bor ($g8 -shl 8) -bor $b8) } }
$b.Dispose()
[IO.File]::WriteAllText($Out, "{`"w`":$cols,`"h`":$rows,`"px`":[" + ($px -join ",") + "]}")
"$cols x $rows"
