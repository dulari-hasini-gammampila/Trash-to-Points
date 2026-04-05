# Use if `npm` / `node` is not on PATH. From PowerShell:  .\dev.ps1
# Or use dev.cmd (no PowerShell nesting). Do not run `powershell -File` if `powershell` is missing from PATH.
$nodeDir = Join-Path $env:ProgramFiles "nodejs"
if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
  $pf86 = [Environment]::GetEnvironmentVariable("ProgramFiles(x86)")
  if ($pf86) { $nodeDir = Join-Path $pf86 "nodejs" }
}
if (Test-Path (Join-Path $nodeDir "node.exe")) {
  $env:Path = "$nodeDir;$env:Path"
} else {
  Write-Error "Node.js not found under Program Files. Install from https://nodejs.org and add it to PATH."
  exit 1
}
Set-Location $PSScriptRoot
& (Join-Path $nodeDir "npm.cmd") run dev
