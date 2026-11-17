/* 실제 차량 사진 확인하기 (11/17 제작 시안) — real.json(모델 → 사진 주소) · 차 화면(#detail)의 #dName 이 바뀌면 버튼 글·장수를 맞춤
   사진 0장이면 버튼 없음 · 바둑판 → 누르면 크게(좌우 넘김·밀기·키보드) · 사진은 위치 정보(EXIF·GPS)를 지운 사본 */
(function () {
  var BASE = (document.currentScript && document.currentScript.src) || location.href;   // 주소가 /?car= 로 바뀌어도 사진 경로가 안 어긋나게
  function abs(p) { try { return new URL(p, BASE).href; } catch (e) { return p; } }
  var R = {}, cur = [], idx = 0, lastFocus = null;
  var btn = document.getElementById('bReal'), nameEl = document.getElementById('dName');
  if (!btn || !nameEl) return;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sync() {
    cur = R[(nameEl.textContent || '').trim()] || [];
    btn.hidden = !cur.length;
    if (cur.length) { btn.textContent = ''; btn.appendChild(el('span', 'ri', '')); btn.appendChild(el('span', 'rt', '실제 차량 사진 확인하기')); }
  }
  fetch(abs('real.json') + '?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (d) { R = {}; var m = (d && d.모델) || {}; Object.keys(m).forEach(function (k) { R[k] = m[k].map(abs); }); sync(); }).catch(function () {});
  new MutationObserver(sync).observe(nameEl, { childList: true, characterData: true, subtree: true });

  // ── 바둑판 ──
  var ov = el('div', 'rov'); ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'rovT');
  var box = el('div', 'rbox'), hd = el('div', 'rhd'), tt = el('div', 'rtt'), x = el('button', 'rx', '닫기'); x.type = 'button';
  var h = el('b', '', ''); h.id = 'rovT'; tt.appendChild(h); var sub = el('span', '', ''); tt.appendChild(sub); hd.appendChild(tt); hd.appendChild(x);
  var grid = el('div', 'rgrid'), note = el('p', 'rnote', '차장님이 전시장·시승차를 직접 찍은 사진입니다. 색·옵션은 차마다 다를 수 있어 견적 때 다시 확인해 드립니다.');
  box.appendChild(hd); box.appendChild(grid); box.appendChild(note); ov.appendChild(box); document.body.appendChild(ov);

  // ── 크게 보기 ──
  var vw = el('div', 'rvw'); vw.hidden = true; vw.setAttribute('role', 'dialog'); vw.setAttribute('aria-modal', 'true'); vw.setAttribute('aria-label', '사진 크게 보기');
  var img = el('img', 'rimg'), cnt = el('div', 'rcnt', ''), pv = el('button', 'rnav rp', '‹'), nx = el('button', 'rnav rn2', '›'), vx = el('button', 'rx rvx', '닫기');
  pv.type = nx.type = vx.type = 'button'; pv.setAttribute('aria-label', '앞 사진'); nx.setAttribute('aria-label', '다음 사진');
  vw.appendChild(img); vw.appendChild(pv); vw.appendChild(nx); vw.appendChild(cnt); vw.appendChild(vx); document.body.appendChild(vw);

  function lock(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function openGrid() {
    lastFocus = document.activeElement; h.textContent = nameEl.textContent.trim(); sub.textContent = '실제 차량 사진';
    grid.textContent = '';
    cur.forEach(function (src, i) {
      var b = el('button', 'rth'); b.type = 'button'; b.setAttribute('aria-label', (i + 1) + '번째 사진 크게 보기');
      var im = el('img'); im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.src = src; b.appendChild(im);
      b.addEventListener('click', function () { show(i); }); grid.appendChild(b);
    });
    ov.hidden = false; lock(true); box.scrollTop = 0; x.focus();
  }
  function closeGrid() { ov.hidden = true; lock(false); if (lastFocus) lastFocus.focus(); }
  function show(i) { idx = (i + cur.length) % cur.length; img.src = cur[idx]; img.alt = h.textContent + ' 실제 사진 ' + (idx + 1); cnt.textContent = (idx + 1) + ' / ' + cur.length; vw.hidden = false; vx.focus(); }
  function closeView() { vw.hidden = true; var t = grid.children[idx]; if (t) t.focus(); }
  btn.addEventListener('click', openGrid);
  x.addEventListener('click', closeGrid); vx.addEventListener('click', closeView);
  pv.addEventListener('click', function () { show(idx - 1); }); nx.addEventListener('click', function () { show(idx + 1); });
  ov.addEventListener('click', function (e) { if (e.target === ov) closeGrid(); });
  vw.addEventListener('click', function (e) { if (e.target === vw) closeView(); });
  document.addEventListener('keydown', function (e) {
    if (!vw.hidden) { if (e.key === 'Escape') closeView(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1); return; }
    if (!ov.hidden && e.key === 'Escape') closeGrid();
  });
  var sx = null;   // 밀어서 넘기기
  vw.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  vw.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); });
})();
