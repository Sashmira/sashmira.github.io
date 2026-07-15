import os, re, glob, collections
os.chdir(r"C:\Users\LENOVO\sm_deploy")

ROBOTS = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*>', re.I)
def noidx(h):
    m = ROBOTS.search(h); return bool(m and "noindex" in m.group(0).lower())

allhtml = set(glob.glob("*.html"))
sm = open("sitemap.xml", encoding="utf-8").read()
start = set(re.findall(r"<loc>https://speakmalayalam\.com/([^<]*)</loc>", sm))
start = {p if p else "index.html" for p in start}
start |= {"index.html","404.html"}
start = {p for p in start if p in allhtml}

LINK = re.compile(r'href=["\']([^"\']+)["\']', re.I)
graph = {}
for p in allhtml:
    h = open(p, encoding="utf-8", errors="ignore").read()
    outs = set()
    for href in LINK.findall(h):
        if href.startswith(("http","mailto:","tel:","#","javascript:","data:","upi:","whatsapp:")): continue
        t = href.split("#")[0].split("?")[0].lstrip("/")
        if t in allhtml: outs.add(t)
    graph[p] = outs

# transitive reachability from indexable/start set
seen = set(start); stack = list(start)
while stack:
    cur = stack.pop()
    for nxt in graph.get(cur, ()):
        if nxt not in seen:
            seen.add(nxt); stack.append(nxt)

reachable = seen
unreachable = allhtml - reachable
dead = sorted(p for p in unreachable if noidx(open(p,encoding="utf-8",errors="ignore").read()))
unreachable_indexable = sorted(p for p in unreachable if not noidx(open(p,encoding="utf-8",errors="ignore").read()))

print("total html            :", len(allhtml))
print("reachable from live   :", len(reachable))
print("UNREACHABLE + noindex (SAFE TO DELETE):", len(dead))
print("unreachable but indexable (DO NOT auto-delete):", len(unreachable_indexable))
for p in unreachable_indexable[:20]: print("   keep-check:", p)
print("--- sample dead ---")
for p in dead[:30]: print("   dead:", p)
open("_dead.txt","w",encoding="utf-8").write("\n".join(dead))
