/* speakmalayalam.com — auto-generated practice quiz for topic pages.
 * Reads the page's English↔Malayalam reference table, builds a short
 * multiple-choice quiz with instant feedback, and banks XP into the same
 * `smquiz` store the Practice Arena + Progress Dashboard already use.
 * No external calls (CSP-safe). No-ops on pages without a usable table.
 */
(function () {
  if (window.__rrnQuiz) return; window.__rrnQuiz = 1;
  var NAVY = '#0E2240', GOLD = '#C9A84C', TEAL = '#177E70', RED = '#B0413E', LINE = '#E7DFCC', IVORY = '#FBF6E9';

  function txt(node) { return (node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function isScript(s) { return /[ഀ-ൿ]/.test(s); }           // Malayalam Unicode block
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---- 1. Find a usable table and extract (prompt → romanised answer) pairs ----
  function extractPairs() {
    var tables = [].slice.call(document.querySelectorAll('table'));
    for (var ti = 0; ti < tables.length; ti++) {
      var rows = [].slice.call(tables[ti].querySelectorAll('tr'));
      if (rows.length < 5) continue;
      var head = [].slice.call(rows[0].querySelectorAll('th,td')).map(function (c) { return txt(c).toLowerCase(); });
      if (head.length < 2) continue;
      var ai = -1, i;
      for (i = 0; i < head.length; i++) if (/romanis|pronunci/.test(head[i])) { ai = i; break; }
      if (ai < 0) for (i = 0; i < head.length; i++) if (/malayalam/.test(head[i])) { ai = i; break; }
      if (ai < 0) continue;
      var pi = -1;
      for (i = 0; i < head.length; i++) if (/english|meaning/.test(head[i])) { pi = i; break; }
      if (pi < 0) pi = (ai === 0 ? 1 : 0);
      var pairs = [];
      for (var r = 1; r < rows.length; r++) {
        var cells = [].slice.call(rows[r].querySelectorAll('td,th'));
        if (cells.length <= Math.max(ai, pi)) continue;
        var ans = txt(cells[ai]), pr = txt(cells[pi]);
        if (isScript(ans)) {            // chosen answer col is script — find a Latin column instead
          for (var c = 0; c < cells.length; c++) { var v = txt(cells[c]); if (c !== pi && v && !isScript(v)) { ans = v; break; } }
        }
        if (ans && pr && !isScript(ans) && ans.split(' ').length <= 4 && pr.length <= 40) pairs.push([pr, ans]);
      }
      // de-dupe by answer
      var seen = {}, clean = [];
      pairs.forEach(function (p) { if (!seen[p[1].toLowerCase()]) { seen[p[1].toLowerCase()] = 1; clean.push(p); } });
      if (clean.length >= 4) return clean;
    }
    return null;
  }

  var pairs = extractPairs();
  if (!pairs) return;                    // no suitable table — silently do nothing

  // ---- 2. Build up to 6 questions ----
  var pool = shuffle(pairs.slice());
  var n = Math.min(6, pool.length);
  var questions = pool.slice(0, n).map(function (p) {
    var wrong = shuffle(pairs.filter(function (q) { return q[1] !== p[1]; }).map(function (q) { return q[1]; })).slice(0, 3);
    return { q: p[0], a: p[1], opts: shuffle([p[1]].concat(wrong)) };
  });

  // ---- 3. Render ----
  var box = document.createElement('section');
  box.id = 'rrn-practice';
  box.style.cssText = 'background:' + IVORY + ';border:1px solid ' + GOLD + ';border-radius:16px;padding:22px;margin:28px 0';
  var head = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="color:' + NAVY + ';font-size:18px">🎮 Quick practice</b>'
    + '<span style="font-size:13px;color:#6b6b6b">Test yourself on this page — earn XP</span></div>'
    + '<div id="rq-score" style="font-size:14px;color:' + TEAL + ';font-weight:700;margin:6px 0 2px"></div>';
  var body = '';
  questions.forEach(function (qq, idx) {
    body += '<div class="rq-item" data-i="' + idx + '" style="margin:16px 0;padding-top:8px;border-top:1px solid ' + LINE + '">'
      + '<div style="font-weight:700;color:' + NAVY + ';margin-bottom:8px">' + (idx + 1) + '. How do you say &ldquo;' + qq.q.replace(/</g, '&lt;') + '&rdquo;?</div>'
      + '<div class="rq-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px"></div></div>';
  });
  box.innerHTML = head + body
    + '<div id="rq-done" style="display:none;margin-top:18px;padding:16px;border-radius:12px;background:' + NAVY + ';color:#fff;text-align:center;font-weight:700"></div>';

  // insertion point
  var anchor = document.querySelector('.cta-box') || document.querySelector('.authorbox') || document.querySelector('.related');
  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
  else (document.querySelector('article') || document.body).appendChild(box);

  // wire options
  var answered = 0, correct = 0, total = questions.length;
  function award() {
    var done = document.getElementById('rq-done');
    var key = 'smq_' + location.pathname;
    var first = !localStorage.getItem(key);
    if (first) {
      try { var k = 'smquiz', d = JSON.parse(localStorage.getItem(k) || '{}'); d.xp = (d.xp || 0) + correct * 10; d.done = (d.done || 0) + 1; localStorage.setItem(k, JSON.stringify(d)); localStorage.setItem(key, '1'); } catch (e) { }
    }
    done.style.display = 'block';
    done.innerHTML = 'You scored ' + correct + '/' + total + '. '
      + (first ? '🎉 +' + (correct * 10) + ' XP banked!' : 'Practised again — nice!')
      + '<br><a href="/my-progress.html" style="color:' + GOLD + ';font-weight:800">See your progress →</a> &nbsp; '
      + '<a href="/malayalam-practice.html" style="color:#fff;text-decoration:underline">More quizzes →</a>';
  }
  [].slice.call(box.querySelectorAll('.rq-item')).forEach(function (item) {
    var qq = questions[+item.getAttribute('data-i')];
    var optsWrap = item.querySelector('.rq-opts');
    qq.opts.forEach(function (opt) {
      var b = document.createElement('button');
      b.textContent = opt;
      b.style.cssText = 'text-align:left;padding:10px 14px;border:1px solid ' + LINE + ';border-radius:9px;background:#fff;cursor:pointer;font-size:15px;color:' + NAVY;
      b.onclick = function () {
        if (item.getAttribute('data-done')) return;
        item.setAttribute('data-done', '1');
        answered++;
        var ok = opt === qq.a;
        if (ok) { correct++; b.style.background = '#E5F3F0'; b.style.borderColor = TEAL; b.style.fontWeight = '700'; }
        else {
          b.style.background = '#FBEBEA'; b.style.borderColor = RED;
          [].slice.call(optsWrap.children).forEach(function (x) { if (x.textContent === qq.a) { x.style.background = '#E5F3F0'; x.style.borderColor = TEAL; x.style.fontWeight = '700'; } });
        }
        document.getElementById('rq-score').textContent = 'Score: ' + correct + '/' + total;
        if (answered === total) award();
      };
      optsWrap.appendChild(b);
    });
  });
})();
