# ============================================================
#  SpeakMalayalam AUTO-PUBLISH
#  Runs on a schedule. If there are ANY changes in the site
#  folder, it commits and pushes them so Cloudflare auto-deploys
#  speakmalayalam.com - fully hands-off, no clicking needed.
# ============================================================
$ErrorActionPreference = 'SilentlyContinue'
$Repo = 'C:\Users\LENOVO\sm_deploy'
$Log  = Join-Path $Repo '_autopublish_log.txt'
Set-Location $Repo

$changes = git status --porcelain
if ($changes) {
    git add -A
    $msg = "Auto-publish: site update " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    git commit -m "$msg" | Out-Null
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Add-Content -Path $Log -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "  PUBLISHED changes to speakmalayalam.com")
    } else {
        Add-Content -Path $Log -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "  WARNING: push failed - check internet / GitHub token")
    }
} else {
    Add-Content -Path $Log -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "  no changes")
}
