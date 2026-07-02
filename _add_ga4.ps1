$root = 'C:\Users\LENOVO\sm_deploy'
$ga = '<!-- Google tag (gtag.js) -->' + "`n" +
'<script async src="https://www.googletagmanager.com/gtag/js?id=G-NR81BKS7FX"></script>' + "`n" +
'<script>' + "`n" +
'window.dataLayer = window.dataLayer || [];' + "`n" +
'function gtag(){dataLayer.push(arguments);}' + "`n" +
"gtag('js', new Date());" + "`n" +
"gtag('config', 'G-NR81BKS7FX', { 'anonymize_ip': true }); gtag('config','AW-10945166310');" + "`n" +
'</script>' + "`n"
$done = 0; $skipCsp = 0; $skipOther = 0
Get-ChildItem -Path $root -Filter *.html | ForEach-Object {
  $n = $_.Name
  if ($n -eq 'googleaa89e58eb79dd9df.html') { return }
  $t = [System.IO.File]::ReadAllText($_.FullName)
  if ($t -match 'G-NR81BKS7FX') { $skipOther++; return }
  if ($t -notmatch '</head>') { $skipOther++; return }
  $csp = [regex]::Match($t, '<meta http-equiv="Content-Security-Policy"[^>]*>')
  if ($csp.Success -and $csp.Value -notmatch 'googletagmanager') { $skipCsp++; return }
  $idx = $t.IndexOf('</head>')
  $t2 = $t.Substring(0, $idx) + $ga + $t.Substring($idx)
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  [System.IO.File]::WriteAllText($_.FullName, $t2, (New-Object System.Text.UTF8Encoding($bom)))
  $done++
}
"TAGGED: $done  SKIPPED_CSP: $skipCsp  SKIPPED_OTHER: $skipOther"
