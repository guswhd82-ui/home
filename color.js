/* 색 보기 · 공식 사진 (11/18 제작 시안 · 본부 주문 '사진 활용 ①') — official.json(홈페이지_공식사진.py · 매주 월 색상360확인.py 뒤)
   차 화면(#detail)의 #dName 이 바뀌면 그 트림의 외장색·시트 수로 버튼을 맞춤 · 사진 없으면 버튼 없음
   외장 = 색 칩 → 8각 넘기기(밀기·끌기·버튼·←→) · 실내 360 = 시트 칩 → 큐브 6면을 CSS 3D 로 끌어 돌리기(라이브러리 없음) */
(function () {
  var BASE = (document.currentScript && document.currentScript.src) || location.href;
  function abs(p) { try { return new URL(p, BASE).href; } catch (e) { return p; } }
  var D = {}, NOTE = '', cur = null, ci = 0, ai = 1, si = 0, tab = 'ext', lastFocus = null;
  var btn = document.getElementById('bColor'), nameEl = document.getElementById('dName');
  if (!btn || !nameEl) return;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sync() {
    cur = D[(nameEl.textContent || '').trim()] || null;
    var ne = cur ? cur.외장.length : 0, ni = cur ? cur.실내.length : 0;
    btn.hidden = !(ne || ni);
    if (ne || ni) {
      btn.textContent = ''; btn.appendChild(el('span', 'ri ci', '')); btn.appendChild(el('span', 'rt', '색 보기 · 공식 사진'));
      btn.appendChild(el('span', 'rn', [ne ? '외장 ' + ne + '색' : '', ni ? '실내 ' + ni : ''].filter(Boolean).join(' · ')));
    }
  }
  fetch(abs('official.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (d) {
    D = (d && d.모델) || {}; NOTE = (d && d.안내) || ''; sync();
  }).catch(function () {});
  new MutationObserver(sync).observe(nameEl, { childList: true, characterData: true, subtree: true });

  // ── 틀 ──
  var ov = el('div', 'rov cov'); ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'covT');
  var box = el('div', 'rbox'), hd = el('div', 'rhd'), tt = el('div', 'rtt'), x = el('button', 'rx', '닫기'); x.type = 'button';
  var h = el('b', '', ''); h.id = 'covT'; tt.appendChild(h); var sub = el('span', '', '공식 사진'); tt.appendChild(sub); hd.appendChild(tt); hd.appendChild(x);
  var seg = el('div', 'cseg'), tE = el('button', '', '외장'), tI = el('button', '', '실내 360'); tE.type = tI.type = 'button'; seg.appendChild(tE); seg.appendChild(tI);
  // 외장
  var pE = el('div', 'cpane'), stage = el('div', 'cstage'), img = el('img', 'cimg'), pv = el('button', 'cnav cp', '‹'), nx = el('button', 'cnav cn', '›'), dots = el('div', 'cdots');
  pv.type = nx.type = 'button'; pv.setAttribute('aria-label', '왼쪽으로 돌리기'); nx.setAttribute('aria-label', '오른쪽으로 돌리기'); img.alt = ''; img.draggable = false;
  stage.appendChild(img); stage.appendChild(pv); stage.appendChild(nx); stage.appendChild(dots);
  var cname = el('div', 'cname', ''), chips = el('div', 'cchips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', '외장색');
  pE.appendChild(stage); pE.appendChild(cname); pE.appendChild(chips);
  // 실내 360
  var pI = el('div', 'cpane'), vr = el('div', 'cv'), wr = el('div', 'cw'), hint = el('div', 'chint', '끌어서 둘러보기');
  var faces = [];
  ['f', 'r', 'b', 'l', 'u', 'd'].forEach(function (k) { var f = el('img', 'cf cf-' + k); f.alt = ''; f.draggable = false; faces.push(f); wr.appendChild(f); });
  vr.appendChild(wr); vr.appendChild(hint); vr.setAttribute('aria-label', '실내 360 보기 · 끌어서 돌리기 · 화살표 키');
  vr.tabIndex = 0;
  var sname = el('div', 'cname', ''), schips = el('div', 'cchips cseat'); schips.setAttribute('role', 'group'); schips.setAttribute('aria-label', '시트');
  pI.appendChild(vr); pI.appendChild(sname); pI.appendChild(schips);
  var note = el('p', 'rnote', '');
  box.appendChild(hd); box.appendChild(seg); box.appendChild(pE); box.appendChild(pI); box.appendChild(note); ov.appendChild(box); document.body.appendChild(ov);

  function lock(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  // 외장
  function showE() {
    var c = cur.외장[ci]; if (!c) return;
    img.src = abs(c.그림[ai]); img.alt = h.textContent + ' ' + c.색 + ' 공식 사진';
    cname.textContent = c.색;
    [].forEach.call(dots.children, function (d, i) { d.className = i === ai ? 'on' : ''; });
    [].forEach.call(chips.children, function (b, i) { b.setAttribute('aria-pressed', i === ci ? 'true' : 'false'); });
    c.그림.forEach(function (s) { var p = new Image(); p.src = abs(s); });   // 넘길 때 안 깜빡이게 그 색 8장 미리
  }
  function turn(d) { ai = (ai + d + 8) % 8; showE(); }
  // 실내 (큐브: 카메라가 가운데 · 면 크기 F · 보는 각 = 창 너비 기준 가로 95°)
  var F = 1024, yaw = 0, pitch = -8, P = 400;
  function lay() {
    var w = vr.clientWidth || 360; P = w / 2 / Math.tan(95 / 2 * Math.PI / 180);
    vr.style.perspective = P + 'px';
    var tf = ['translateZ(-' + F / 2 + 'px)', 'rotateY(-90deg) translateZ(-' + F / 2 + 'px)', 'rotateY(180deg) translateZ(-' + F / 2 + 'px)',
      'rotateY(90deg) translateZ(-' + F / 2 + 'px)', 'rotateX(-90deg) translateZ(-' + F / 2 + 'px)', 'rotateX(90deg) translateZ(-' + F / 2 + 'px)'];
    faces.forEach(function (f, i) { f.style.width = f.style.height = (F + 2) + 'px'; f.style.margin = -(F + 2) / 2 + 'px 0 0 ' + -(F + 2) / 2 + 'px'; f.style.transform = tf[i]; });
    look();
  }
  function look() { pitch = Math.max(-85, Math.min(85, pitch)); wr.style.transform = 'translateZ(' + P + 'px) rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg)'; }
  function showI() {
    var s = cur.실내[si]; if (!s) return;
    faces.forEach(function (f, i) { f.src = abs(s.면[i]); });
    sname.textContent = '시트 · ' + s.시트;
    [].forEach.call(schips.children, function (b, i) { b.setAttribute('aria-pressed', i === si ? 'true' : 'false'); });
    lay();
  }
  function setTab(t) {
    tab = t; var hasE = cur.외장.length > 0, hasI = cur.실내.length > 0;
    if (tab === 'ext' && !hasE) tab = 'int'; if (tab === 'int' && !hasI) tab = 'ext';
    tE.hidden = !hasE; tI.hidden = !hasI; seg.hidden = !(hasE && hasI);
    tE.setAttribute('aria-pressed', tab === 'ext' ? 'true' : 'false'); tI.setAttribute('aria-pressed', tab === 'int' ? 'true' : 'false');
    pE.hidden = tab !== 'ext'; pI.hidden = tab !== 'int';
    if (tab === 'ext') showE(); else showI();
  }
  function open() {
    if (!cur) return;
    lastFocus = document.activeElement; h.textContent = nameEl.textContent.trim(); note.textContent = NOTE;
    ci = 0; ai = 1; si = 0; yaw = 0; pitch = -8;
    dots.textContent = ''; for (var i = 0; i < 8; i++) dots.appendChild(el('i'));
    chips.textContent = '';
    cur.외장.forEach(function (c, i) {
      var b = el('button', 'cchip'); b.type = 'button'; b.setAttribute('aria-label', c.색);
      var im = el('img'); im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.src = abs(c.작은); b.appendChild(im); b.appendChild(el('span', '', c.색));
      b.addEventListener('click', function () { ci = i; showE(); }); chips.appendChild(b);
    });
    schips.textContent = '';
    cur.실내.forEach(function (s, i) {
      var b = el('button', 'cpill', s.시트); b.type = 'button';
      b.addEventListener('click', function () { si = i; showI(); }); schips.appendChild(b);
    });
    ov.hidden = false; lock(true); box.scrollTop = 0; setTab('ext'); x.focus();
  }
  function close() { ov.hidden = true; lock(false); img.removeAttribute('src'); faces.forEach(function (f) { f.removeAttribute('src'); }); if (lastFocus) lastFocus.focus(); }
  btn.addEventListener('click', open); x.addEventListener('click', close);
  window.__color = { open: function (t) { if (!cur) return; open(); if (t) setTab(t); } };   // 11/18 시안 B: 차 화면 '실내 360 보기' 글 링크가 바로 실내 탭으로
  tE.addEventListener('click', function () { setTab('ext'); }); tI.addEventListener('click', function () { setTab('int'); });
  pv.addEventListener('click', function () { turn(-1); }); nx.addEventListener('click', function () { turn(1); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (tab === 'ext' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { turn(e.key === 'ArrowLeft' ? -1 : 1); e.preventDefault(); }
    if (tab === 'int' && /^Arrow/.test(e.key) && document.activeElement === vr) {
      if (e.key === 'ArrowLeft') yaw += 10; if (e.key === 'ArrowRight') yaw -= 10; if (e.key === 'ArrowUp') pitch += 8; if (e.key === 'ArrowDown') pitch -= 8; look(); e.preventDefault();
    }
  });
  // 끌기: 외장 = 옆으로 40px 마다 한 칸 · 실내 = 끈 만큼 돌림
  function drag(node, onMove) {
    var sx = null, sy = null;
    node.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; node.setPointerCapture && node.setPointerCapture(e.pointerId); });
    node.addEventListener('pointermove', function (e) { if (sx == null) return; if (onMove(e.clientX - sx, e.clientY - sy)) { sx = e.clientX; sy = e.clientY; } });
    function up() { sx = null; } node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
  }
  drag(img, function (dx) { if (Math.abs(dx) < 40) return false; turn(dx < 0 ? 1 : -1); return true; });
  drag(vr, function (dx, dy) { var k = 95 / (vr.clientWidth || 360); yaw += dx * k; pitch -= dy * k; look(); hint.hidden = true; return true; });
  window.addEventListener('resize', function () { if (!ov.hidden && tab === 'int') lay(); });
})();
