# scripts/generar-iconos.ps1 — genera los íconos de la PWA a partir del diseño de la app.
#
# Por qué existe: iOS no acepta SVG como ícono y Chrome/Android piden 192 y 512 en PNG. En vez de
# guardar binarios que nadie sabe de dónde salieron, se dibujan acá (System.Drawing, sin
# dependencias) con el mismo diseño de siempre: cuadrado verde #4A6741 con las letras "MA" en crema.
#
# La geometría no es a ojo: se midió el icon-512.png que ya estaba en el repo.
#   - Lienzo de 32x32 unidades (como el viewBox de un SVG), dibujo centrado.
#   - Fondo #4A6741 (R74 G103 B65) y letras #F5F2EC (R245 G242 B236), medidos pixel a pixel.
#   - Trazo de las letras: 25px a 512 => 1.56 unidades; esquinas: 41px => 2.5 unidades.
#   - Líneas centrales de las letras (unidades): la M va de 2.13 a 14.19 y la A de 18.19 a 29.78,
#     con el vértice de la M cerca de la base y el travesaño de la A al 70% de la altura.
#
# Uso:  powershell -NoProfile -File scripts/generar-iconos.ps1
# Salida:
#   public/icons/icon-192.png            esquinas redondeadas, fondo transparente afuera
#   public/icons/icon-512.png            idem
#   public/icons/icon-maskable-512.png   a sangre y con el dibujo al 78%: Android lo recorta en círculo
#   public/apple-touch-icon.png          180, a sangre y opaco: iOS no acepta transparencia
#   public/favicon-16x16.png
#   public/favicon-32x32.png
#   public/favicon.ico                   16, 32 y 48 embebidos (PNG adentro del ICO)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$verde = [System.Drawing.Color]::FromArgb(74, 103, 65) # #4A6741, el color del tema
$crema = [System.Drawing.Color]::FromArgb(245, 242, 236) # #F5F2EC, el de las letras

$TRAZO = 1.56 # grosor de las letras (25px a 512)
$RADIO = 2.5 # esquinas redondeadas (41px a 512)

# Letras, como líneas centrales (x1, y1, x2, y2) en el lienzo de 32x32.
$M = @(
  @(2.13, 9.59, 2.13, 22.41), # trazo izquierdo
  @(2.13, 9.59, 8.16, 20.46), # diagonal que baja al vértice
  @(8.16, 20.46, 14.19, 9.59), # diagonal que sube
  @(14.19, 9.59, 14.19, 22.41) # trazo derecho
)
$A = @(
  @(23.97, 9.59, 18.19, 22.41), # pata izquierda
  @(23.97, 9.59, 29.78, 22.41), # pata derecha
  @(19.89, 18.63, 28.07, 18.63) # travesaño
)

# Rectángulo con esquinas redondeadas, igual que el rx del diseño.
function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2 * $r
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# Dibuja el cuadrado (o el fondo a sangre) y encima las letras "MA".
# $contenido: proporción del lienzo que ocupa el dibujo (1.0 = a sangre; 0.78 = maskable/apple).
function New-Lienzo([int]$size, [double]$contenido, [bool]$redondeado) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  if ($redondeado) {
    $g.Clear([System.Drawing.Color]::Transparent)
    $radio = [float]($size * $RADIO / 32)
    $fondo = New-RoundedPath 0 0 $size $size $radio
    $g.FillPath((New-Object System.Drawing.SolidBrush($verde)), $fondo)
    $fondo.Dispose()
  } else {
    $g.Clear($verde)
  }

  # Escala del lienzo de 32 unidades y centrado del dibujo.
  $s = [double]($size * $contenido / 32)
  $o = [double](($size - 32 * $s) / 2)

  $pen = New-Object System.Drawing.Pen($crema, [float]($TRAZO * $s))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  foreach ($t in ($M + $A)) {
    $g.DrawLine($pen, [float]($o + $t[0] * $s), [float]($o + $t[1] * $s), [float]($o + $t[2] * $s), [float]($o + $t[3] * $s))
  }

  $pen.Dispose()
  $g.Dispose()
  return $bmp
}

function Save-Png($bmp, [string]$destino) {
  $bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host ("  {0,-26} {1,4}px  {2,7} bytes" -f (Split-Path $destino -Leaf), $bmp.Width, (Get-Item $destino).Length)
}

# ICO con PNG embebidos (formato ICONDIR + una entrada de 16 bytes por tamaño + los PNG).
function New-Ico([int[]]$tamanos, [string]$destino) {
  $pngs = @()
  foreach ($t in $tamanos) {
    $bmp = New-Lienzo $t 1.0 $false
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngs += , $ms.ToArray()
    $bmp.Dispose()
    $ms.Dispose()
  }

  $fs = [System.IO.File]::Create($destino)
  $bw = New-Object System.IO.BinaryWriter($fs)
  $bw.Write([UInt16]0) # reservado
  $bw.Write([UInt16]1) # tipo: ícono
  $bw.Write([UInt16]$pngs.Count)

  $offset = 6 + 16 * $pngs.Count
  for ($i = 0; $i -lt $pngs.Count; $i++) {
    $t = $tamanos[$i]
    $lado = if ($t -ge 256) { 0 } else { $t } # 0 = 256
    $bw.Write([byte]$lado)
    $bw.Write([byte]$lado)
    $bw.Write([byte]0) # colores de paleta
    $bw.Write([byte]0) # reservado
    $bw.Write([UInt16]1) # planos
    $bw.Write([UInt16]32) # bits por píxel
    $bw.Write([UInt32]$pngs[$i].Length)
    $bw.Write([UInt32]$offset)
    $offset += $pngs[$i].Length
  }
  foreach ($p in $pngs) { $bw.Write($p) }

  $bw.Close()
  $fs.Close()
  Write-Host ("  {0,-26} {1,9}px  {2,7} bytes" -f (Split-Path $destino -Leaf), ($tamanos -join "+"), (Get-Item $destino).Length)
}

$outDir = Join-Path $PSScriptRoot '..\public'
$outIcons = Join-Path $outDir 'icons'
New-Item -ItemType Directory -Force -Path $outIcons | Out-Null

Write-Host 'Generando íconos de Mandado App en public/:'

# Íconos de la PWA: esquinas redondeadas y fondo transparente afuera.
foreach ($t in 192, 512) {
  $bmp = New-Lienzo $t 1.0 $true
  Save-Png $bmp (Join-Path $outIcons "icon-$t.png")
  $bmp.Dispose()
}

# Maskable y apple: a sangre (sin esquinas) y con el dibujo al 78%, porque Android recorta el
# maskable en círculo y iOS aplica su propia máscara.
$bmp = New-Lienzo 512 0.78 $false
Save-Png $bmp (Join-Path $outIcons 'icon-maskable-512.png')
$bmp.Dispose()

$bmp = New-Lienzo 180 0.78 $false
Save-Png $bmp (Join-Path $outDir 'apple-touch-icon.png')
$bmp.Dispose()

# Favicons.
foreach ($t in 32, 16) {
  $bmp = New-Lienzo $t 1.0 $false
  Save-Png $bmp (Join-Path $outDir "favicon-$($t)x$($t).png")
  $bmp.Dispose()
}
New-Ico 16, 32, 48 (Join-Path $outDir 'favicon.ico')

Write-Host 'Listo.'
