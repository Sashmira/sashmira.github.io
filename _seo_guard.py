import os, re, glob, sys, subprocess
os.chdir(os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")))
ROBOTS = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*>', re.I)
def noidx(h):
    m = ROBOTS.search(h); return bool(m and "noindex" in m.group(0).lower())
def sm_urls(txt):
    u = set(re.findall(r"<loc>https://speakmalayalam\.com/([^<]*)</loc>", txt))
    return {p if p else "index.html" for p in u}
def git(*a):
    try: return subprocess.run(["git"]+list(a), capture_output=True, text=True, timeout=25).stdout
    except Exception: return ""
fails = []
sm = open("sitemap.xml", encoding="utf-8").read() if os.path.exists("sitemap.xml") else ""
urls = sm_urls(sm)
# --- integrity checks (original) ---
for p in sorted(urls):
    if not os.path.exists(p): fails.append("sitemap lists missing file: " + p); continue
    if noidx(open(p, encoding="utf-8", errors="ignore").read()): fails.append("NOINDEX page in sitemap: " + p)
for p in glob.glob("*.html"):
    h = open(p, encoding="utf-8", errors="ignore").read()
    b = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", " ", h)
    w = len(re.sub(r"(?s)<[^>]+>", " ", b).split())
    c = re.search(r'rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', h, re.I)
    tg = c.group(1).replace("https://speakmalayalam.com/", "").strip("/") if c else ""
    if w < 60 and tg and tg != p and not noidx(h): fails.append("thin stub indexable (%dw): %s" % (w, p))
if len(urls) > 400: fails.append("SITEMAP TOO LARGE (%d>400). Mass-generation blocked." % len(urls))
# --- LIFELONG BAN: forbidden pages must stay noindex + out of sitemap ---
forb = []
if os.path.exists("_FORBIDDEN_PAGES.txt"):
    forb = [l.strip() for l in open("_FORBIDDEN_PAGES.txt", encoding="utf-8") if l.strip() and not l.startswith("#")]
    reexposed = [p for p in forb if os.path.exists(p) and not noidx(open(p, encoding="utf-8", errors="ignore").read())]
    insm = [p for p in forb if p in urls]
    if reexposed: fails.append("LIFELONG BAN: noindex removed from %d forbidden page(s) e.g. %s . Restore noindex. See _FORBIDDEN_PAGES_README.md" % (len(reexposed), ", ".join(reexposed[:4])))
    if insm: fails.append("LIFELONG BAN: %d forbidden page(s) put back in sitemap e.g. %s . Remove them." % (len(insm), ", ".join(insm[:4])))
# --- circuit breakers: flood / mass add / mass delete ---
try:
    prevn = len(sm_urls(git("show", "HEAD:sitemap.xml")))
    if prevn and len(urls) - prevn > 50: fails.append("FLOOD: sitemap %d->%d (+%d) in one commit. Publish a few pages at a time." % (prevn, len(urls), len(urls) - prevn))
except Exception: pass
ns = git("diff", "--cached", "--name-status")
add = len(re.findall(r'(?m)^A\s+.*\.html$', ns)); dele = len(re.findall(r'(?m)^D\s+.*\.html$', ns))
if add > 30: fails.append("MASS PUBLISH BLOCKED: %d new .html pages in one commit. Auto-flood risk (June 2026 crash). Add a few at a time." % add)
if dele > 30: fails.append("MASS DELETE BLOCKED: %d .html deletions in one commit. Bulk delete can crash the site beyond recovery. Remove a few at a time." % dele)
if fails:
    sys.stderr.write("\n[SEO GUARD] COMMIT BLOCKED (site-safety lock):\n" + "\n".join("  - " + f for f in fails) + "\n")
    sys.exit(1)
sys.stderr.write("[SEO GUARD] OK: %d sitemap URLs, %d forbidden pages locked & safe, 0 conflicts.\n" % (len(urls), len(forb)))
sys.exit(0)
