@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo ==================================================
echo    SpeakMalayalam - FIX ALL ^& PUBLISH LIVE
echo ==================================================
echo.

REM --- 1. clear any stale git lock that can block publishing ---
if exist ".git\index.lock" (
  echo [1/5] Clearing stale git lock...
  del /f /q ".git\index.lock"
) else (
  echo [1/5] No stale git lock. OK.
)

REM --- 2. remove the stray backup page (duplicate content) ---
if exist "_backup_malayalam-resources.html" (
  echo [2/5] Removing stray backup page ...
  git rm --quiet --ignore-unmatch "_backup_malayalam-resources.html" >nul 2>&1
  if exist "_backup_malayalam-resources.html" del /f /q "_backup_malayalam-resources.html" >nul 2>&1
) else (
  echo [2/5] No backup page found. OK.
)

REM --- 3. keep backup files out of the repo for good ---
findstr /x /c:"_backup_*.html" ".gitignore" >nul 2>&1
if errorlevel 1 (
  echo [3/5] Adding _backup_*.html to .gitignore ...
  echo _backup_*.html>>.gitignore
) else (
  echo [3/5] .gitignore already covers backups. OK.
)

REM --- 4. stage everything ---
echo [4/5] Staging all changes...
git add -A

REM --- 5. commit + push, with a clear message either way ---
echo [5/5] Committing and publishing...
git commit -m "Site update" 1>commit_log.txt 2>&1
if errorlevel 1 (
  findstr /C:"nothing to commit" commit_log.txt >nul 2>&1
  if not errorlevel 1 (
    echo.
    echo ==================================================
    echo    ALREADY LIVE - no new changes to publish.
    echo    Your site is up to date with GitHub. Nothing
    echo    to do. This is a GOOD result, not an error.
    echo ==================================================
    del /q commit_log.txt >nul 2>&1
    echo.
    pause
    exit /b 0
  )
  echo.
  echo *** BLOCKED - the SEO guard stopped this commit ***
  echo Reason:
  type commit_log.txt
  del /q commit_log.txt >nul 2>&1
  echo.
  pause
  exit /b 1
)
del /q commit_log.txt >nul 2>&1

git push 1>push_log.txt 2>&1
if errorlevel 1 (
  echo.
  echo *** COMMITTED BUT PUSH FAILED - check internet / GitHub sign-in, then run again ***
  type push_log.txt
  del /q push_log.txt >nul 2>&1
  echo.
  pause
  exit /b 1
)
del /q push_log.txt >nul 2>&1

echo.
echo ==================================================
echo    PUBLISHED - your changes are now LIVE.
echo    Allow ~10 minutes, then hard-refresh the site.
echo ==================================================
echo.
pause
