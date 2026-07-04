@echo off
cd /d C:\Users\LENOVO\sm_deploy
git add audio sitemap.xml
git commit -m "Add listen-along audio pages for Kids Books 1-5 (Meera narration + QR landing pages)"
git push origin main
echo.
echo DONE! Audio pages will be live at speakmalayalam.com/audio/kids1 ... kids5 in ~2 minutes.
pause
