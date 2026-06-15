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
