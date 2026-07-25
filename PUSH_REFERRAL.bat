@echo off
cd /d C:\Users\LENOVO\sm_deploy
git add index.html book-malayalam-trial-lesson.html
git commit -m "Add partner referral code field + homepage ref capture"
git push origin main
echo.
echo DONE! The partner referral system will be live at speakmalayalam.com in ~2 minutes (Cloudflare auto-deploys from the push).
pause
