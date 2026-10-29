/* 유현종 차장 개인 상담 페이지 — 공통 코드 v2 '앱처럼' (홈페이지 방 2026-10-26 · 10/29 재고 상태 = '재고 있음' 하나(차장님 10/29 지시) · S.ko 영어 색·소재 이름 한글 표기)
   하는 일: 위 머리(이름·카톡) + 메뉴 9칸 + 아래 탭 5개(홈·차종·재고·가격·상담)를 모든 장에 같이 넣고, 데이터 읽기·색 동그라미·재고 카드(★대수 없음)·할인 표·버튼 세기 자리를 한 곳에 둔다.
   데이터 파일(전부 프로그램이 만듦): stock.json 재고 · prices.json 정가 · posts.json 블로그 글 · videos.json 유튜브 · promo.json 이달 조건(월초 1번 채우는 표) · mou.json 제휴 목록(있으면)
   연락처는 블로그에 이미 공개된 것만. 손님 정보·내부 정보 없음. */
(function () {
  var S = window.SITE = {
    name: '유현종 차장', org: '메르세데스-벤츠 서초',
    tel: '010-3820-8633', kakao: 'https://open.kakao.com/o/szY84nJi', blog: 'https://blog.naver.com/guswhd82',
    menu: [['index.html', '홈'], ['new.html', '신차·사전예약'], ['models.html', '차종 가이드'], ['price.html', '가격·조건'], ['stock.html', '재고'], ['drive.html', '시승 신청'], ['report.html', '이달 리포트'], ['cards.html', '카드혜택'], ['mou.html', '제휴 확인'], ['about.html', '상담']],
    tabs: [['index.html', '홈', 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'], ['models.html', '차종', 'M3 13l2-5h14l2 5v6H3zM6 17h.01M18 17h.01M5 13h14'], ['stock.html', '재고', 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10'], ['price.html', '가격', 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'], ['about.html', '상담', 'M4 5h16v11H8l-4 4z']]
  };
  var $ = S.$ = function (id) { return document.getElementById(id); };
  var el = S.el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  S.a = function (href, cls, txt, kind) { var a = el('a', cls, txt); a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } if (kind) a.setAttribute('data-track', kind); return a; };
  S.norm = function (s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); };
  S.man = function (n) { var m = Math.floor(n / 10000), e = Math.floor(m / 10000), r = m % 10000; return e ? (r ? e + '억 ' + r.toLocaleString('ko-KR') + '만원' : e + '억원') : m.toLocaleString('ko-KR') + '만원'; };   // 만 원 아래 절삭 · 1억 4,000만원 식
  S.getJSON = function (u) { return fetch(u + '?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
  S.sms = function (text) { return 'sms:' + S.tel.replace(/-/g, '') + '?&body=' + encodeURIComponent(text); };
  S.param = function (k) { return new URLSearchParams(location.search).get(k) || ''; };
  S.ym = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); };
  S.famKey = function (s) { return S.norm(s).replace('클래스', '').replace('mercedes-', '').replace('amg', ''); };

  // 버튼 누른 수 세기 자리(올린 뒤 GA 붙임): window.TRACK_HOOK = function (kind, where) {…} — kind = kakao·tel·sms·blog·post·video, where = header·body·footer
  function track(kind, where) { try { if (typeof window.TRACK_HOOK === 'function') window.TRACK_HOOK(kind, where); } catch (e) {} }
  S.track = track;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-track]') : null; if (!a) return;
    track(a.getAttribute('data-track'), a.closest('.top') ? 'header' : a.closest('.tabs,footer') ? 'footer' : 'body');
  }, true);

  S.chipBar = function (box, items, getVal, setVal, render, allowNone) {
    box.textContent = '';
    items.forEach(function (it) {
      var b = el('button', 'chip', it[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(getVal() === it[0]));
      if (it[2] != null) b.appendChild(el('small', '', it[2]));
      b.addEventListener('click', function () { setVal(getVal() === it[0] && allowNone ? '' : it[0]); S.chipBar(box, items, getVal, setVal, render, allowNone); render(); });
      box.appendChild(b);
    });
  };

  // 색 이름 → 동그라미 색(글자로 찾음 · 투톤 'A/B'는 반반)
  var COLORS = [['화이트', '#f2f2f0'], ['실버', '#b0b3b5'], ['그레이', '#6b6f73'], ['블랙', '#0c0c0c'], ['블루', '#1e3a5f'], ['브라운', '#5c3a1e'], ['베이지', '#d4c4a8'], ['레드', '#8b1a1a'], ['그린', '#2d5a3d'], ['자바', '#3c2a1e'], ['골드', '#b8955a'], ['오렌지', '#c8641e'], ['옐로', '#d8b833']];
  function one(name) { var n = String(name || ''); for (var i = 0; i < COLORS.length; i++) if (n.indexOf(COLORS[i][0]) >= 0) return COLORS[i][1]; return '#4a4a46'; }
  S.color = function (name) { var p = String(name || '').split('/'); return p.length >= 2 ? 'linear-gradient(135deg,' + one(p[0]) + ' 50%,' + one(p[1]) + ' 50%)' : one(name); };
  S.swatch = function (name, small) { var s = el('span', 'sw' + (small ? ' s' : '')); s.style.background = S.color(name); return s; };
  // (10/29 두 사이트 개선 7번) 전산 원문이 영어인 색·소재 이름 → 한글: 같은 재고 자료의 한글 이름에 이미 있는 말만 바꿈(아티코 인조 가죽·나파 가죽·가죽 · 마키아토 베이지·베이지·블랙)
  //   모르는 색 이름(예 hazelnut brown · elbaite green)은 임의 번역하지 않고 원문 그대로
  var KO_M = [['artico man-made leather', '아티코 인조 가죽'], ['nappa leather', '나파 가죽'], ['leather', '가죽']], KO_C = { 'macchiato beige': '마키아토 베이지', 'beige': '베이지', 'black': '블랙' };
  S.ko = function (s) {
    s = String(s || '').replace(/^ARTICO\s+(?=[가-힣])/, '아티코 ').replace(/^아티코\s+아티코\s+/, '아티코 ').trim();
    if (/[가-힣]/.test(s)) return s;
    var low = s.toLowerCase(), mat = '';
    KO_M.some(function (p) { var i = low.indexOf(p[0]); if (i < 0) return false; mat = p[1]; low = low.slice(0, i) + ' ' + low.slice(i + p[0].length); return true; });
    if (!mat) return s;
    if (!low.trim()) return mat;
    var col = low.split('/').map(function (x) { return KO_C[x.trim().replace(/\s+/g, ' ')] || null; });
    return col.indexOf(null) >= 0 ? s : mat + ', ' + col.join('/');
  };
  S.cleanInt = function (s) { s = S.ko(s); return String(s || '').replace(/^(MANUFAKTUR|MAYBACH|AMG|마이바흐|익스클루시브|나파|아티코|인조|투톤|가죽|레더|다이나미카|,|\.|\s)+/g, '').trim() || String(s || ''); };
  // 시트색 순서: 블랙 → 브라운 → 베이지 → 그 밖 특수색(차장님 10/28) · 투톤은 앞에 나온 색 기준 · 같은 칸이면 단색 먼저, 나머지는 원래 순서
  var INT_RANK = [[/블랙|black/i, 0], [/브라운|brown|통카|시에나|트러플|바히아|바이아|발라오|토바코|헤이즐넛|에스프레소|코냑/i, 1], [/베이지|beige|마키아토|macchiato|아이보리|실크/i, 2], [/레드|red|그레이|gr[ae]y|화이트|white|실버|블루|blue|자바|헬리오스|그린|오렌지|옐로/i, 3]];
  S.intRank = function (s) { var t = String(s || ''), best = 3, at = Infinity; INT_RANK.forEach(function (p) { var m = t.search(p[0]); if (m >= 0 && m < at) { at = m; best = p[1]; } }); return best; };
  S.intSort = function (list, key) { var k = key || function (x) { return x; }; return list.map(function (x, i) { return [x, i]; }).sort(function (a, b) { var A = k(a[0]), B = k(b[0]); return (S.intRank(A) - S.intRank(B)) || ((/\//.test(A) ? 1 : 0) - (/\//.test(B) ? 1 : 0)) || (a[1] - b[1]); }).map(function (p) { return p[0]; }); };

  // 재고: 줄 목록 → 모델별 묶음 (★대수·합계는 쓰지 않는다)
  S.stockModels = function (d, fam, text) {
    var models = {}, q = S.norm(text);
    (d.목록 || []).forEach(function (r) {
      if (fam && r.계열 !== fam) return;
      if (q && S.norm([r.계열, r.차종, r.외장, r.내장, r.연식].join(' ')).indexOf(q) < 0) return;
      var m = models[r.차종] = models[r.차종] || { 계열: r.계열, 차종: r.차종, years: {}, pdd: {}, imm: false, rows: [] };
      m.rows.push(r); if (r.연식) m.years[r.연식] = 1;
      m.imm = true;   // 10/29 차장님: 재고 목록에 있으면 '재고 있음' 하나(출고 달 판단 없음)
    });
    return Object.keys(models).sort().map(function (k) { return models[k]; });
  };
  // 출고예정: {"YYYY-MM": 대수} 또는 ["YYYY-MM", …] 둘 다 받음 · (10/29 차장님) 화면에는 출고 달을 안 씀 — 재고 있음 하나
  S.pddMonths = function (r) { var p = r.출고예정; if (!p) return []; return Array.isArray(p) ? p.slice() : Object.keys(p); };
  S.etaLater = function (r) { var ref = S.ym(); return S.pddMonths(r).filter(function (k) { return String(k) > ref; }).sort(); };
  S.fams = function (d) { var f = {}; (d && d.목록 || []).forEach(function (r) { f[r.계열] = (f[r.계열] || 0) + 1; }); return f; };
  S.pddBadges = function (m) {
    var now = new Date(), ref = now.getFullYear() * 100 + (now.getMonth() + 1), box = el('span', 'meta'), ys = Object.keys(m.years).sort();
    if (ys.length > 1) ys.forEach(function (y) { box.appendChild(el('span', 'badge', 'MY' + String(y).slice(-2))); });
    if (m.imm) box.appendChild(el('span', 'badge b-imm', '재고 있음'));
    return box;
  };
  function extGroups(rows) {
    var ext = {}, order = ['화이트', '실버', '그레이', '블랙', '블루', '브라운', '그린', '레드'];
    rows.forEach(function (r) { (ext[r.외장] = ext[r.외장] || []); var i = S.cleanInt(r.내장); if (i && ext[r.외장].indexOf(i) < 0) ext[r.외장].push(i); });
    function rank(s) { for (var i = 0; i < order.length; i++) if (s.indexOf(order[i]) >= 0) return i; return 9; }
    var box = document.createDocumentFragment();
    Object.keys(ext).sort(function (a, b) { return rank(a) - rank(b); }).forEach(function (e) {
      var g = el('div', 'ext'), h = el('div', 'ext-h'); h.appendChild(S.swatch(e)); h.appendChild(el('span', '', e)); g.appendChild(h);
      var ints = el('div', 'ints'); S.intSort(ext[e]).forEach(function (i) { var t = el('span', 'int'); t.appendChild(S.swatch(i, true)); t.appendChild(el('span', '', '내장 ' + i)); ints.appendChild(t); });
      g.appendChild(ints); box.appendChild(g);
    });
    return box;
  }
  S.modelCard = function (m, open) {
    var box = el('div', 'model' + (open ? ' open' : '')), btn = el('button'); btn.type = 'button'; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.appendChild(el('span', 'mname', m.차종)); var meta = S.pddBadges(m); meta.appendChild(el('span', 'arrow')); btn.appendChild(meta);
    var body = el('div', 'combos'), ys = Object.keys(m.years).sort();
    if (ys.length > 1) ys.forEach(function (y) { var g = el('div', 'ygrp'), h = el('h4', '', 'MY' + String(y).slice(-2)); h.appendChild(el('small', '', y + '년식')); g.appendChild(h); g.appendChild(extGroups(m.rows.filter(function (r) { return r.연식 === y; }))); body.appendChild(g); });
    else body.appendChild(extGroups(m.rows));
    btn.addEventListener('click', function () { var o = box.classList.toggle('open'); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    box.appendChild(btn); box.appendChild(body); return box;
  };
  S.stale = function (asof) {
    var t = new Date(String(asof || '').replace(' ', 'T') + ':00').getTime(); if (!t) return '';
    var days = (Date.now() - t) / 86400000, wd = new Date().getDay(), lim = (wd === 0 || wd === 6 || wd === 1) ? 3.5 : 1.5;
    return days > lim ? '※ ' + asof + ' 기준입니다(갱신이 늦어지고 있어요). 최신 현황은 문의해 주세요.' : '';
  };

  // 이달 조건(promo.json): {월:"2026-10", 기준:"…", 목록:[{계열, 모델(비우면 계열 전체), 연식, 할인율, 조건}]} — 월이 이번 달이 아니면 '확인 필요'
  // 이달 조건이 '지금' 유효한가 — 브라우저 시계 기준: 월이 이번 달이어야 하고, (있으면) 유효기간(YYYY-MM-DD)도 안 지났어야 함 → 아니면 할인·최종가를 숨기고 '확인 중'(틀린 가격이 손님에게 가지 않게)
  S.promoOK = function (p) { if (!(p && p.월 === S.ym() && p.목록 && p.목록.length)) return false; if (p.유효기간) { var d = new Date(); var today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); if (today > p.유효기간) return false; } return true; };
  S.promoFor = function (p, row) {   // row = prices 줄 → 맞는 할인 줄(모델 이름 우선 · 없으면 계열 전체)
    if (!S.promoOK(p)) return null; var best = null;
    p.목록.forEach(function (x) { if (x.계열 !== row.계열) return; if (x.연식 && x.연식 !== row.연식) return; if (x.모델) { if (S.norm(x.모델) === S.norm(row.모델)) best = x; } else if (!best) best = x; });
    return best;
  };
  S.priceRow = function (r, promo) {   // 정가 줄 + (있으면) 이달 조건 → .row
    var row = el('div', 'row'), c = el('div', 'c', r.모델), n = el('div', 'n', S.man(r.가격)), x = S.promoFor(promo, r);
    if (x && x.할인율) { c.appendChild(el('span', 's', '이달 ' + x.할인율 + '%' + (x.조건 ? ' · ' + x.조건 : ''))); n.textContent = S.man(Math.floor(r.가격 * (1 - x.할인율 / 100) / 10000) * 10000); n.appendChild(el('small', '', '정가 ' + S.man(r.가격))); }
    row.appendChild(c); row.appendChild(n); return row;
  };

  // 블로그 글
  S.allPosts = function (d) { var out = [], seen = {}; (d.차종 || []).forEach(function (c) { (c.글 || []).forEach(function (p) { if (!seen[p.주소]) { seen[p.주소] = 1; out.push(p); } }); }); (d.소식 || []).forEach(function (p) { if (!seen[p.주소]) { seen[p.주소] = 1; out.push(p); } }); return out.sort(function (a, b) { return a.날짜 < b.날짜 ? 1 : -1; }); };
  S.news = function (d, n) { var list = d.소식 && d.소식.length ? d.소식 : S.allPosts(d).filter(function (p) { return /신차|사전계약|사전예약|출시|런칭|신형|페이스리프트/.test(p.제목); }); return list.slice(0, n || 6); };
  S.monthly = function (d) { return S.allPosts(d).filter(function (p) { return /이달|이번 달|월 구매|구매 가이드|구매 전략/.test(p.제목); }); };
  S.postCard = function (p, kind) { var a = S.a(p.주소, 'post', null, kind || 'post'); a.appendChild(el('b', '', p.제목)); a.appendChild(el('span', '', p.날짜)); return a; };
  S.famPosts = function (d, fam) { var k = S.famKey(fam); return (d.차종 || []).filter(function (c) { var n = S.famKey(c.이름); return n === k || n.indexOf(k) === 0; }); };

  // 공통 틀: 위 머리 + 메뉴 + 아래 탭 + '다음에 볼 것' + 바닥
  S.chrome = function (current) {
    var app = document.querySelector('.app') || document.body;
    var top = el('div', 'top'), bar = el('div', 'bar'); bar.appendChild(S.a('index.html', 'nm', S.name + ' · ' + S.org)); bar.appendChild(S.a(S.kakao, 'k', '카톡 상담', 'kakao')); top.appendChild(bar);
    var menu = el('nav', 'menu'); menu.setAttribute('aria-label', '메뉴'); S.menu.forEach(function (p) { var a = S.a(p[0], '', p[1]); if (p[0] === current) a.setAttribute('aria-current', 'page'); menu.appendChild(a); }); top.appendChild(menu);
    app.insertBefore(top, app.firstChild);
    var cur = menu.querySelector('[aria-current]'); if (cur) menu.scrollLeft = Math.max(0, cur.offsetLeft - 60);
    var bottom = $('bottom') || app.appendChild(el('div'));
    var nx = el('div', 'wrap next'); nx.appendChild(el('p', '', 'Next')); var nd = el('div'); S.menu.forEach(function (p) { if (p[0] !== current) nd.appendChild(S.a(p[0], '', p[1])); }); nx.appendChild(nd); bottom.appendChild(nx);
    var ft = el('footer', 'wrap'); ft.textContent = S.name + ' · ' + S.org + ' · 개인 영업 상담 페이지이며 회사 공식 사이트가 아닙니다 · 재고·가격은 기준 시각의 확인된 값 · 실제 배정·이달 조건은 상담으로'; bottom.appendChild(ft);
    var tabs = el('nav', 'tabs'), tin = el('div'); tabs.setAttribute('aria-label', '아래 탭');
    S.tabs.forEach(function (t) {
      var a = S.a(t[0], '', null); if (t[0] === current) a.setAttribute('aria-current', 'page');
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', t[2]); svg.appendChild(p);
      a.appendChild(svg); a.appendChild(el('span', '', t[1])); tin.appendChild(a);
    });
    tabs.appendChild(tin); document.body.appendChild(tabs);
  };
})();
