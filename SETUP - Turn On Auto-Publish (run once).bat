@echo off
title SpeakMalayalam Auto-Publish - One-Time Setup
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
set "SCRIPT=%USERPROFILE%\sm_deploy\AUTO-PUBLISH.ps1"

echo.
echo   Turning on automatic publishing for speakmalayalam.com...
echo   (Every 30 minutes: if the site folder changed, it auto-commits and pushes,
echo    and Cloudflare deploys the update - no clicking needed.)
echo.

schtasks /Create /TN "SpeakMalayalam Auto-Publish" /TR "\"%PS%\" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%SCRIPT%\"" /SC MINUTE /MO 30 /F

"%PS%" -NoProfile -ExecutionPolicy Bypass -Command "$t=Get-ScheduledTask -TaskName 'SpeakMalayalam Auto-Publish'; $t.Settings.StartWhenAvailable=$true; Set-ScheduledTask -InputObject $t | Out-Null; Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Automatic publishing is now ON.' + [char]10 + [char]10 + 'Every 30 minutes, any change in your sm_deploy folder is auto-published to speakmalayalam.com via Cloudflare. You do not need to click anything. A log is written to sm_deploy\\_autopublish_log.txt.','SpeakMalayalam Auto-Publish')"

echo.
echo   Done. Make sure AUTO-PUBLISH.ps1 is in your sm_deploy folder, then close this window.
echo.
pause
