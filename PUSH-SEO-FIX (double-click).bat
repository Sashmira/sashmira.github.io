@echo off
REM Push the SEO fix commit made on 2026-09-04
cd /d "C:\Users\LENOVO\sm_deploy"
echo Pushing to GitHub...
git push origin main
if errorlevel 1 goto FAIL
echo.
echo ================================================
echo   PUSHED. Live on speakmalayalam.com in 1-2 min.
echo ================================================
goto END
:FAIL
echo.
echo PUSH FAILED - check internet or GitHub token.
:END
pause
