@echo off
REM Reinstalls the site-safety SEO guard into .git\hooks after any fresh clone or accidental loss.
cd /d "%~dp0"
copy /Y "_seo_guard.py" ".git\hooks\seo_guard.py" >nul
> ".git\hooks\pre-commit" echo #!/bin/sh
>> ".git\hooks\pre-commit" echo python "$(git rev-parse --show-toplevel)/.git/hooks/seo_guard.py" ^|^| exit 1
echo.
echo   SEO SAFETY GUARD REINSTALLED.
echo   Every commit is now checked again - forbidden pages, floods,
echo   mass-deletes and sitemap blow-ups are all blocked before publish.
echo.
pause
