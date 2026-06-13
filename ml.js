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
