$url = "https://github.com/Bicheka/gommit/releases/latest/download/gommit-windows-amd64.exe" "
$dest = "$HOME\AppData\Local\Microsoft\WindowsApps\gommit.exe"

Write-Host "Downloading gommit..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $dest

Write-Host "Success! You can now use 'gommit' in any terminal." -ForegroundColor Green
