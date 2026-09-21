$iconsDir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

$base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
$bytes = [Convert]::FromBase64String($base64)

foreach ($size in @(16, 48, 128)) {
    $filePath = Join-Path $iconsDir "icon$size.png"
    [IO.File]::WriteAllBytes($filePath, $bytes)
    Write-Host "Created $filePath"
}
