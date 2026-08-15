@echo off
REM ============================================================
REM  PUBLISH NOW - SpeakMalayalam
REM  Commits and pushes pending changes. Reports HONESTLY:
REM  the SEO guard can block the commit, and that is NOT a
REM  successful publish.
REM ============================================================
cd /d "C:\Users\LENOVO\sm_deploy"
echo.
echo Staging changes...
git add -A

echo.
echo Committing (SEO guard runs here)...
git commit -m "Publish: comparative linguistics pages + sitemap update"
if errorlevel 1 goto BLOCKED

echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 goto PUSHFAIL

echo.
echo ================================================
echo   PUBLISHED. Live on speakmalayalam.com in 1-2 min.
echo ================================================
goto END

:BLOCKED
echo.
echo ================================================
echo   NOT PUBLISHED - commit was blocked or empty.
echo   Scroll up: if you see [SEO GUARD] COMMIT BLOCKED,
echo   fix the listed items first. Nothing was pushed.
echo ================================================
goto END

:PUSHFAIL
echo.
echo ================================================
echo   COMMIT OK but PUSH FAILED.
echo   Check internet / GitHub sign-in, then run again.
echo ================================================

:END
echo.
pause
