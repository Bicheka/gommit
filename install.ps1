$ErrorActionPreference = "Stop"

$Repo = "bicheka/gommit"

function Get-LatestVersion {
    $latest = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
    return $latest.tag_name
}

function Add-ToUserPath {
    param (
        [string]$Dir
    )

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")

    $pathEntries = @()
    if ($userPath) {
        $pathEntries = $userPath -split ';' | Where-Object { $_ -ne '' }
    }

    if ($pathEntries -notcontains $Dir) {
        $newUserPath = if ($userPath -and $userPath.Trim() -ne "") {
            "$userPath;$Dir"
        } else {
            $Dir
        }

        [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
        Write-Host "Added $Dir to your User PATH"
    } else {
        Write-Host "$Dir is already in your User PATH"
    }

    # Also update current session PATH so command works immediately
    $sessionEntries = $env:Path -split ';'
    if ($sessionEntries -notcontains $Dir) {
        $env:Path = "$env:Path;$Dir"
    }
}

$Version = if ($env:VERSION) { $env:VERSION } else { Get-LatestVersion }

$BinName = "gommit-windows-amd64.exe"
$BaseUrl = "https://github.com/$Repo/releases/download/$Version"
$BinUrl = "$BaseUrl/$BinName"
$ChecksumUrl = "$BaseUrl/checksums.txt"

$InstallDir = Join-Path $HOME "bin"
$BinPath = Join-Path $env:TEMP $BinName
$ChecksumPath = Join-Path $env:TEMP "checksums.txt"
$FinalPath = Join-Path $InstallDir "gommit.exe"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Host "Installing gommit $Version..."
Invoke-WebRequest -Uri $BinUrl -OutFile $BinPath
Invoke-WebRequest -Uri $ChecksumUrl -OutFile $ChecksumPath

$Expected = $null
Get-Content $ChecksumPath | ForEach-Object {
    $parts = $_ -split '\s+'
    if ($parts.Length -ge 2 -and $parts[1] -eq $BinName) {
        $Expected = $parts[0].ToLower()
    }
}

if (-not $Expected) {
    throw "Could not find checksum for $BinName in checksums.txt"
}

$Actual = (Get-FileHash -Algorithm SHA256 $BinPath).Hash.ToLower()

if ($Actual -ne $Expected) {
    throw "Checksum verification failed. Expected $Expected but got $Actual"
}

Copy-Item $BinPath $FinalPath -Force

Add-ToUserPath -Dir $InstallDir

Write-Host "Installed to $FinalPath"
Write-Host "Run: gommit --help"
