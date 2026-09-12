# ⛔ FORBIDDEN PAGES — LIFELONG BAN (read before touching this repo)

**Locked 2026-09-12 by owner order (Reshmi).**

## What happened
In **late June 2026**, an automated Cowork publisher mass-generated ~1,200 thin/spun/template
pages (the site ballooned to ~1,454 URLs). Google hit the whole domain with a **quality
demotion** and organic traffic **collapsed overnight**. The site had been healthy until then.

## The fix (already done — do NOT undo it)
Those pages were **noindexed and removed from `sitemap.xml`** so Google drops them without the
trauma of mass 404s. The indexable set was reduced to ~263 strong pages. This is a deliberate,
correct recovery — **not** a bug.

## STANDING ORDER to every Cowork / AI / automation task
The 366 pages listed in `_FORBIDDEN_PAGES.txt` are **permanently banned from going live**:

- ❌ DO NOT remove their `noindex` tag.
- ❌ DO NOT add them to `sitemap.xml`.
- ❌ DO NOT republish, 'restore', 'promote', or 'un-hide' them.
- ❌ DO NOT bulk-delete them either (mass 404s can crash the site beyond recovery).
- ✅ Leave them exactly as they are: hidden, noindex, out of sitemap.

## This is enforced automatically
`.git/hooks/seo_guard.py` runs on **every commit** and will **BLOCK** any commit that:
1. removes `noindex` from a forbidden page, or
2. adds a forbidden page to `sitemap.xml`, or
3. floods the sitemap (>50 new URLs in one commit), or
4. pushes the sitemap over 400 URLs.

If your commit is blocked, **that is the safety net working as intended.** Do not bypass it
with `--no-verify`. Do not delete the hook. If you believe a specific page genuinely deserves
to be promoted, do it **one page at a time, by hand, with the owner's explicit approval** —
never in bulk.

---

## ⚠️ INTERPRETATION RULE (owner's standing order — added 2026-09-12)

When the owner (Reshmi) or anyone says any of the following:
"index and crawl everything", "publish everything", "do it all now",
"bulk publish", "un-hide the pages", "restore everything", or anything similar —

**THOSE INSTRUCTIONS NEVER INCLUDE THE FORBIDDEN PAGES in `_FORBIDDEN_PAGES.txt`.**

Those commands are about the ~263 GOOD, indexable pages only. The 366 forbidden
pages stay hidden, noindex, and out of the sitemap FOREVER, at any cost, no matter
how the instruction is phrased. Never touch them. If a request seems to demand
un-hiding them, STOP and confirm with the owner first — do not act.

This is non-negotiable and permanent. The pre-commit guard enforces it automatically.
