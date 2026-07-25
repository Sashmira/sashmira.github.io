@echo off
REM ============================================================
REM  FALLBACK DEPLOY - pushes the site STRAIGHT to Cloudflare
REM  Pages with Wrangler, bypassing the git auto-build.
REM  Use this only if the normal PUSH_REFERRAL.bat (git push)
REM  does not update the live site.
REM ============================================================
cd /d C:\Users\LENOVO\sm_deploy

echo.
echo If Wrangler asks you to authenticate, use your Cloudflare API token.
echo (It is saved in C:\Users\LENOVO\RRN_Publisher\token.txt)
echo You can set it for this window by running, before this script:
echo     set CLOUDFLARE_API_TOKEN=your_token_here
echo.
echo === Your Cloudflare Pages projects ===
call npx wrangler pages project list
echo.
set /p PROJECT="Type your SpeakMalayalam project name from the list above, then press Enter: "
echo.
echo Deploying the whole folder to project "%PROJECT%" ...
call npx wrangler pages deploy . --project-name=%PROJECT% --commit-dirty=true
echo.
echo DONE (if there were no errors above). speakmalayalam.com should update within ~1 minute.
pause
