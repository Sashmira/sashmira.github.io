/* SpeakMalayalam analytics helpers (loaded site-wide, deferred).
   1) Key-event tracking for bookings and contact.
   2) Cookie banner for visitors in Europe (GDPR) who have not chosen yet.
   Consent defaults + bot exclusion run inline in <head> before gtag.js. */
(function () {
  function ev(name, params) { try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {} }

  // --- 1. Booking / contact events ---
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/calendly\.com/i.test(h)) ev('book_lesson', { method: 'calendly', link_url: h });
    else if (/wa\.me|whatsapp\.com/i.test(h)) ev('whatsapp_click', { link_url: h, page: location.pathname });
    else if (/^mailto:/i.test(h)) ev('email_click', { page: location.pathname });
    else if (/book-malayalam-trial-lesson|#book$|#direct$/i.test(h)) ev('book_cta_click', { link_url: h, page: location.pathname });
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.tagName !== 'FORM') return;
    var act = f.getAttribute('action') || '';
    if (f.id === 'bookForm' || /trial-lesson|book-malayalam/i.test(location.pathname) || /bform|booking/i.test(f.className || '')) {
      ev('book_lesson', { method: 'form', page: location.pathname });
    } else if (/formsubmit\.co/i.test(act)) {
      var subj = f.querySelector('input[name="_subject"]');
      if (subj && /starter pack/i.test(subj.value || '')) {
        ev('sign_up', { method: 'starter_pack', page: location.pathname });
        // Also add the subscriber to MailerLite (Website Free Guide Signup form -> welcome sequence).
        // The homepage has its own handler (window.smMailerLite); skip there to avoid a double post.
        if (typeof window.smMailerLite !== 'function') {
          try {
            var em = (f.querySelector('input[type=email],input[name=email]') || {}).value;
            if (em) {
              var fd = new FormData();
              fd.append('fields[email]', em);
              fd.append('ml-submit', '1');
              fd.append('anticsrf', 'true');
              fetch('https://assets.mailerlite.com/jsonp/2430406/forms/190157557696824411/subscribe', { method: 'POST', body: fd, mode: 'no-cors', keepalive: true });
            }
          } catch (e2) {}
        }
      }
      else ev('contact_form_submit', { page: location.pathname });
    } else if (/ml-block-form|mailerlite/i.test((f.className || '') + ' ' + act)) {
      ev('sign_up', { method: 'mailerlite', page: location.pathname });
    }
  }, true);

  // Booking-page view (funnel step before a paid lesson request)
  if (/book-malayalam-trial-lesson/i.test(location.pathname)) ev('booking_page_view', { page: location.pathname });

  // --- 2. Cookie banner for Europe-based visitors without a stored choice ---
  var choice = null; try { choice = localStorage.getItem('rrn_consent'); } catch (e) {}
  var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  if (choice || document.getElementById('rrn-consent') || !/^Europe\//.test(tz)) return;
  window.rrnConsent = window.rrnConsent || function (state) {
    try { gtag('consent', 'update', { ad_storage: state, analytics_storage: state, ad_user_data: state, ad_personalization: state }); } catch (e) {}
    try { localStorage.setItem('rrn_consent', state); } catch (e) {}
    var b = document.getElementById('rrn-consent'); if (b) b.style.display = 'none';
  };
  var d = document.createElement('div');
  d.id = 'rrn-consent'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Cookie choice');
  d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;background:#0E2240;color:#fff;padding:14px 18px;font:14px system-ui;z-index:9999;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap';
  d.innerHTML = '<span>We use cookies for analytics and ads. You can accept or decline. <a href="/privacy.html" style="color:#c9a24b">Privacy</a></span><span><button type="button" data-c="granted" style="background:#c9a24b;border:0;padding:8px 14px;border-radius:6px;font-weight:700;cursor:pointer">Accept</button><button type="button" data-c="denied" style="background:transparent;border:1px solid #fff;color:#fff;padding:8px 14px;border-radius:6px;margin-left:6px;cursor:pointer">Decline</button></span>';
  d.addEventListener('click', function (e) { var c = e.target.getAttribute && e.target.getAttribute('data-c'); if (c) window.rrnConsent(c); });
  document.body.appendChild(d);
})();
