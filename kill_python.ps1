$procs = Get-Process -Name python
foreach ($p in $procs) {
    Write-Host "Stopping PID:" $p.Id
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "Done"
