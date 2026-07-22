// 팀 비품 신청 — 로컬 실습용 (책 《팀을 깨우는 바이브코딩 5주》 3주차)
// 저장 키: supplyRequests · 최근 10건 유지 · createdAt 내림차순, 동시각은 id 비교
var KEY = 'supplyRequests';
var MAX = 10;

var $ = function (id) { return document.getElementById(id); };

function loadAll() {
  var raw = localStorage.getItem(KEY);
  if (raw === null) return [];
  try {
    var arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error('not array');
    return arr;
  } catch (e) {
    // 깨진 저장값을 조용히 빈 배열로 덮지 않는다 — 진단값 보존 후 사용자 확인
    setStatus('저장 자료를 읽을 수 없습니다. 초기화 버튼으로 확인 후 지울 수 있습니다.', 'err');
    localStorage.setItem(KEY + '_corrupt_backup', raw);
    return null;
  }
}

function fmt(ts) {
  var d = new Date(ts);
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return String(d.getFullYear()).slice(2) + '. ' + p(d.getMonth() + 1) + '. ' + p(d.getDate()) + '. ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function render() {
  var all = loadAll();
  if (all === null) return;
  all.sort(function (a, b) { return a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : (a.createdAt < b.createdAt ? 1 : -1); });
  var rows = $('rows');
  clearChildren(rows);
  all.slice(0, MAX).forEach(function (r) {
    var tr = document.createElement('tr');
    [fmt(r.createdAt), r.applicant, r.item, r.quantity].forEach(function (v, i) {
      var td = document.createElement('td');
      if (i === 3) td.className = 'num';
      td.textContent = v;
      tr.appendChild(td);
    });
    rows.appendChild(tr);
  });
  $('count').textContent = Math.min(all.length, MAX) + ' / ' + MAX + '건';
}

function setStatus(msg, cls) {
  var el = $('status');
  el.textContent = msg;
  el.className = 'status' + (cls ? ' ' + cls : '');
}

function validate() {
  var ok = true;
  var applicant = $('applicant').value.trim();
  var item = $('item').value.trim();
  var qRaw = $('quantity').value.trim();
  $('err-applicant').textContent = applicant ? '' : '신청자 이름을 입력해 주세요.';
  $('err-item').textContent = item ? '' : '신청할 품목을 입력해 주세요.';
  var q = Number(qRaw);
  var qOk = qRaw !== '' && Number.isInteger(q) && q >= 1;
  $('err-quantity').textContent = qOk ? '' : '수량은 1 이상의 정수로 입력해 주세요.';
  if (!applicant || !item || !qOk) ok = false;
  return ok ? { applicant: applicant, item: item, quantity: q } : null;
}

$('save').addEventListener('click', function () {
  var v = validate();
  if (!v) { setStatus('입력값을 확인해 주세요.', 'err'); return; }
  var btn = $('save');
  btn.disabled = true; // 연속 클릭 방지 — 같은 클릭에서 한 건만 저장
  var all = loadAll();
  if (all === null) { btn.disabled = false; return; }
  var now = Date.now();
  var rec = {
    id: 'req-' + now + '-' + String(all.length + 1),
    applicant: v.applicant,
    item: v.item,
    quantity: v.quantity,
    createdAt: new Date(now).toISOString()
  };
  all.push(rec);
  all.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  var kept = all.slice(0, MAX); // 실습용 보존 규칙: 최근 10건만
  try {
    localStorage.setItem(KEY, JSON.stringify(kept));
    setStatus('저장했습니다. 목록 맨 위에서 확인하세요.', 'ok'); // setItem 성공 후에만 표시
  } catch (e) {
    setStatus('이번 신청을 저장하지 못했습니다. 입력값은 그대로 두었으니 다시 시도해 주세요.', 'err');
    btn.disabled = false;
    return;
  }
  $('applicant').value = ''; $('item').value = ''; $('quantity').value = '';
  render();
  setTimeout(function () { btn.disabled = false; }, 400);
});

$('reset').addEventListener('click', function () {
  var all = loadAll() || [];
  var msg = '실습 데이터 ' + all.length + '건(저장 키 supplyRequests)을 삭제합니다. 다른 브라우저 데이터는 건드리지 않습니다. 계속할까요?';
  if (!window.confirm(msg)) return;
  localStorage.removeItem(KEY);
  render();
  setStatus('실습 데이터를 초기화했습니다. 목록 0건.', 'ok');
});

render();
