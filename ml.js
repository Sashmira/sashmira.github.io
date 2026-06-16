/* speakmalayalam.com — MailerLite list-building (additive, single opt-in).
 * Sends any email submitted through a site form to the MailerLite
 * "Website Subscribers" group via the JSONP subscribe endpoint.
 * Design goals:
 *   - NEVER block or break the existing FormSubmit flow.
 *   - Works under the site CSP (uses an <img> GET; img-src allows https:).
 *   - Reliable for BOTH the homepage AJAX forms (no navigation) and the
 *     guide-page plain-POST forms (which navigate away on submit).
 * Account 2430406 · form 190157557696824411.
 */
(function () {
  var ACCOUNT = '2430406';
  var FORM = '190157557696824411';

  function endpoint(email) {
    return 'https://dashboard.mailerlite.com/jsonp/' + ACCOUNT + '/forms/' + FORM +
      '/subscribe?fields[email]=' + encodeURIComponent(email) + '&ml-submit=1&anticsrf=true';
  }

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;

    var email = '';
    try {
      var inp = f.querySelector('input[type="email"], input[name*="email" i]');
      email = inp && inp.value ? inp.value.trim() : '';
    } catch (_) { return; }
    if (!email || email.indexOf('@') < 1) return;

    // Homepage forms have an inline onsubmit handler and submit via AJAX
    // (no page navigation), so a plain fire-and-forget beacon is reliable.
    // Guide-page forms are plain POST that navigate away — for those we hold
    // the navigation until the beacon has been sent, then submit normally.
    var navigates = !f.getAttribute('onsubmit') &&
      (f.getAttribute('action') || '').indexOf('http') === 0;

    if (!navigates) {
      try { (new Image()).src = endpoint(email); } catch (_) {}
      return; // do not interfere with the AJAX handler
    }

    if (f.__mlResubmit) return;   // our own re-submit — let it through
    e.preventDefault();

    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      try { f.__mlResubmit = 1; f.submit(); } catch (_) {}
    };
    try {
      var img = new Image();
      img.onload = go;
      img.onerror = go;       // endpoint returns JSON, so onerror is expected & fine
      img.src = endpoint(email);
    } catch (_) { go(); return; }
    setTimeout(go, 1200);     // guaranteed fallback so the form ALWAYS submits
  }, true);                   // capture phase: runs before the form's own handler
})();

/* ───────────────────────────────────────────────────────────────────────
 * Timed, mobile-safe lead-capture popup.
 * Offers the free Starter Pack PDF in exchange for an email.
 * The email is captured by the document 'submit' listener above (MailerLite
 * image beacon), so this needs no extra network/CSP permissions.
 * Triggers AFTER engagement (25s OR 45% scroll) — never on load — to stay
 * within Google's intrusive-interstitial rules. Shows once per visitor.
 * ─────────────────────────────────────────────────────────────────────── */
(function () {
  try { if (window.self !== window.top) return; } catch (_) { return; }
  var KEY = 'sm_pop_v1';
  try { if (localStorage.getItem(KEY)) return; } catch (_) {}
  var shown = false, timer;

  var NAVY = '#0E2240', GOLD = '#C9A84C', CREAM = '#FCF9F2', INK = '#0E2240';

  function remember() { try { localStorage.setItem(KEY, '1'); } catch (_) {} }
  function close(persist) {
    var el = document.getElementById('sm-pop'); if (el) el.parentNode.removeChild(el);
    if (persist) remember();
  }

  function build() {
    if (shown || document.getElementById('sm-pop')) return;
    shown = true;
    if (timer) clearTimeout(timer);
    var mobile = window.innerWidth < 700;

    var wrap = document.createElement('div');
    wrap.id = 'sm-pop';
    var overlay = mobile
      ? 'position:fixed;left:0;right:0;bottom:0;z-index:2147483000;'
      : 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(14,34,64,.55);backdrop-filter:saturate(120%) blur(2px);';
    wrap.setAttribute('style', overlay);

    var cardStyle = mobile
      ? 'background:' + NAVY + ';color:' + CREAM + ';border-top:4px solid ' + GOLD + ';box-shadow:0 -12px 40px rgba(0,0,0,.4);padding:18px 18px calc(18px + env(safe-area-inset-bottom,0));font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:relative;'
      : 'background:' + NAVY + ';color:' + CREAM + ';max-width:430px;width:92%;border-radius:16px;border:1px solid rgba(201,168,76,.4);box-shadow:0 24px 70px rgba(0,0,0,.5);padding:30px 28px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:relative;';

    wrap.innerHTML =
      '<div role="dialog" aria-label="Free Malayalam Starter Pack" style="' + cardStyle + '">' +
        '<button id="sm-pop-x" aria-label="Close" style="position:absolute;top:10px;right:12px;background:none;border:0;color:' + CREAM + ';opacity:.6;font-size:24px;line-height:1;cursor:pointer">&times;</button>' +
        '<div class="sm-pop-body">' +
          '<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:' + GOLD + ';font-weight:700">🌴 Free Starter Pack</div>' +
          '<h3 style="margin:6px 0 6px;font-size:' + (mobile ? '20px' : '23px') + ';line-height:1.25;color:' + CREAM + '">Start speaking Malayalam from day one</h3>' +
          '<p style="margin:0 0 14px;font-size:14.5px;line-height:1.5;color:#D7DEEA">Get <b>120 essential everyday phrases</b> — casual, spoken Malayalam with easy pronunciation. Straight to your inbox, free.</p>' +
          '<form id="sm-pop-form" novalidate style="display:flex;flex-direction:column;gap:9px">' +
            '<input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
            '<input id="sm-pop-email" type="email" name="email" required placeholder="you@email.com" autocomplete="email" style="padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:' + CREAM + ';font-size:16px;outline:none">' +
            '<button type="submit" style="padding:12px 16px;border:0;border-radius:10px;background:' + GOLD + ';color:' + INK + ';font-weight:800;font-size:15.5px;cursor:pointer">Send me the free PDF →</button>' +
          '</form>' +
          '<p style="margin:10px 0 0;font-size:11.5px;color:#9DA8BC">No spam. Unsubscribe anytime. — Dr. Reshmi R Nair, PhD</p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    document.getElementById('sm-pop-x').addEventListener('click', function () { close(true); });
    if (!mobile) wrap.addEventListener('click', function (e) { if (e.target === wrap) close(true); });

    var form = document.getElementById('sm-pop-form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); // the capture-phase listener above already fired the MailerLite beacon
      var email = (document.getElementById('sm-pop-email').value || '').trim();
      if (!email || email.indexOf('@') < 1) { document.getElementById('sm-pop-email').focus(); return; }
      remember();
      var body = wrap.querySelector('.sm-pop-body');
      if (body) body.innerHTML =
        '<div style="text-align:center;padding:6px 2px 2px">' +
          '<div style="font-size:34px;line-height:1">✓</div>' +
          '<h3 style="margin:8px 0 6px;font-size:21px;color:' + CREAM + '">Sib! You\'re in 🎉</h3>' +
          '<p style="margin:0 0 16px;font-size:14.5px;color:#D7DEEA">Check your inbox for the Starter Pack. You can also grab it right now:</p>' +
          '<a href="/free-malayalam-starter-pack.html" style="display:inline-block;padding:12px 22px;border-radius:10px;background:' + GOLD + ';color:' + INK + ';font-weight:800;text-decoration:none;font-size:15px">Download the PDF →</a>' +
        '</div>';
      setTimeout(function () { close(false); }, 9000);
    });
  }

  function onScroll() {
    var sc = window.scrollY || document.documentElement.scrollTop || 0;
    var h = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    if (sc / h > 0.45) { window.removeEventListener('scroll', onScroll); build(); }
  }

  function start() {
    timer = setTimeout(build, 25000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* ───────────────────────────────────────────────────────────────────────
 * Tier-1 upgrades (all opt-in / additive, never alter default layout):
 *  (A) Audio playback-speed controls on every <audio>
 *  (B) Copy + Share buttons on phrase boxes (.phrase)
 *  (C) Dark-mode toggle (default OFF; remembers choice). Default light view
 *      is never changed for anyone unless they click the moon button.
 * ─────────────────────────────────────────────────────────────────────── */
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  ready(function () {
    /* (A) audio speed */
    try {
      document.querySelectorAll('audio').forEach(function (au) {
        if (au.dataset.smSpeed) return; au.dataset.smSpeed = '1';
        var bar = document.createElement('div');
        bar.style.cssText = 'display:flex;gap:6px;align-items:center;margin:4px 0 10px;font-size:12.5px;color:#5A6478';
        bar.innerHTML = '<span style="font-weight:600">Speed:</span>';
        [['0.75×',0.75],['1×',1],['1.25×',1.25]].forEach(function (p) {
          var b = document.createElement('button');
          b.type='button'; b.textContent=p[0];
          b.style.cssText='padding:3px 9px;border-radius:8px;border:1px solid rgba(201,168,76,.5);background:'+(p[1]===1?'#C9A84C':'#fff')+';color:#0E2240;cursor:pointer;font-weight:700;font-size:12px';
          b.onclick=function(){ au.playbackRate=p[1]; Array.prototype.forEach.call(bar.querySelectorAll('button'),function(x){x.style.background='#fff';}); b.style.background='#C9A84C'; };
          bar.appendChild(b);
        });
        au.parentNode.insertBefore(bar, au.nextSibling);
      });
    } catch (_) {}

    /* (B) copy + share on phrase boxes */
    try {
      var ph = document.querySelector('.phrase');
      if (ph && !ph.dataset.smTools) {
        ph.dataset.smTools = '1';
        var row = document.createElement('div');
        row.style.cssText='display:flex;gap:10px;margin-top:12px';
        var txt = (ph.innerText||'').replace(/\s+/g,' ').trim();
        var mk = function(label){ var b=document.createElement('button'); b.type='button'; b.textContent=label;
          b.style.cssText='padding:8px 14px;border-radius:9px;border:1px solid rgba(201,168,76,.5);background:#fff;color:#0E2240;font-weight:700;font-size:13.5px;cursor:pointer'; return b; };
        var cBtn=mk('⧉ Copy'), sBtn=mk('↗ Share');
        cBtn.onclick=function(){ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){cBtn.textContent='✓ Copied';setTimeout(function(){cBtn.textContent='⧉ Copy';},1500);}).catch(function(){}); };
        sBtn.onclick=function(){ var d={title:document.title,text:txt,url:location.href}; if(navigator.share){navigator.share(d).catch(function(){});} else { (navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(function(){sBtn.textContent='✓ Link copied';setTimeout(function(){sBtn.textContent='↗ Share';},1500);}).catch(function(){}); } };
        row.appendChild(cBtn); row.appendChild(sBtn); ph.appendChild(row);
      }
    } catch (_) {}

    /* (C) dark-mode toggle — opt-in, default OFF */
    try {
      var DK='sm_theme';
      var css = 'html[data-theme="dark"] body{background:#0f1722 !important;color:#dbe2ec !important}'
        + 'html[data-theme="dark"] article p,html[data-theme="dark"] article li,html[data-theme="dark"] .en,html[data-theme="dark"] td,html[data-theme="dark"] th,html[data-theme="dark"] .lead,html[data-theme="dark"] p{color:#c2ccda !important}'
        + 'html[data-theme="dark"] h1,html[data-theme="dark"] h2,html[data-theme="dark"] h3,html[data-theme="dark"] h4{color:#F0E6C8 !important}'
        + 'html[data-theme="dark"] .phrase,html[data-theme="dark"] .idx-card,html[data-theme="dark"] .authorbox,html[data-theme="dark"] .card,html[data-theme="dark"] table,html[data-theme="dark"] .ref{background:#16202e !important;border-color:rgba(201,168,76,.3) !important}'
        + 'html[data-theme="dark"] header{background:rgba(15,23,34,.92) !important;border-bottom-color:rgba(255,255,255,.08) !important}'
        + 'html[data-theme="dark"] .nav-links a,html[data-theme="dark"] .brand{color:#dbe2ec !important}'
        + 'html[data-theme="dark"] a{color:#7FD0C2 !important}'
        + 'html[data-theme="dark"] .nav-links a.btn{color:#0E2240 !important}';
      var st=document.createElement('style'); st.id='sm-dark-css'; st.textContent=css; document.head.appendChild(st);
      function apply(t){ if(t==='dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme'); }
      var saved=''; try{saved=localStorage.getItem(DK)||'';}catch(_){}
      apply(saved);
      var btn=document.createElement('button');
      btn.type='button'; btn.setAttribute('aria-label','Toggle dark mode');
      btn.style.cssText='position:fixed;bottom:22px;left:22px;z-index:80;width:48px;height:48px;border-radius:50%;border:1px solid rgba(201,168,76,.5);background:#0E2240;color:#C9A84C;font-size:20px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3)';
      function setIcon(){ btn.textContent = document.documentElement.getAttribute('data-theme')==='dark' ? '☀️' : '🌙'; }
      setIcon();
      btn.onclick=function(){ var dark=document.documentElement.getAttribute('data-theme')!=='dark'; apply(dark?'dark':''); try{localStorage.setItem(DK,dark?'dark':'light');}catch(_){ } setIcon(); };
      document.body.appendChild(btn);
    } catch (_) {}
  });
})();
