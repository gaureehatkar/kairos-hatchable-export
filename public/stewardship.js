/* Stewardship page. Its styles live in /stewardship.css, scoped under .stw-page,
   so the shared theme (styles.neo.css) is not touched. */
(function () {
  if (document.getElementById('stwCss')) return;
  const l = document.createElement('link');
  l.id = 'stwCss'; l.rel = 'stylesheet'; l.href = '/stewardship.css?v=1';
  document.head.appendChild(l);
})();

const STW = { rows: [], filter: 'all', sample: false };
const STW_FILTERS = [['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const STW_PILL = { pending: 'amber', approved: 'mint', rejected: 'red' };
// The requests API returns relative strings such as "10 mins ago" for its built-in placeholder rows.
// Real rows carry a database timestamp, so an unparseable time marks a placeholder.
const stwIsSample = (r) => Number.isNaN(Date.parse(r.requested_at));
const stwWhen = (v) => { const t = Date.parse(v); return Number.isNaN(t) ? String(v == null ? '' : v) : new Date(t).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; };

function stwKpis(rows) {
  const n = (s) => (rows ? rows.filter((r) => r.status === s).length : '\u2013');
  const k = (cls, label, val, foot) => '<div class="stat-card stw-k stw-' + cls + '"><div class="stat-top"><span>' + label + '</span></div><div class="stat-value">' + val + '</div><div class="stat-foot">' + foot + '</div></div>';
  return k('pending', 'Pending', n('pending'), 'Waiting for a steward') + k('approved', 'Approved', n('approved'), 'Access granted') + k('rejected', 'Rejected', n('rejected'), 'Access denied') + k('total', 'All requests', rows ? rows.length : '\u2013', 'In this queue');
}

function stewardshipPage() {
  const terms = [
    ['Net revenue', 'Gross revenue minus refunds and discounts.', 'Finance', 'PENDING', 'amber'],
    ['Active customer', 'A customer with at least one order in the trailing 30 days.', 'Growth', 'APPROVED', 'mint']
  ].map((t) => '<div class="stw-term"><div class="stw-term-top"><strong>' + t[0] + '</strong><span class="pill ' + t[4] + '">' + t[3] + '</span></div><p>' + t[1] + '</p><div class="stw-term-foot"><span class="stw-meta"><span>Domain ' + t[2] + '</span></span><button class="btn small" type="button" disabled>Approve</button></div></div>').join('');
  return '<div class="stw-page">' +
    head('Data Stewardship &amp; Governance', 'Review access requests for restricted assets and decide who gets in.', '<button class="btn primary" type="button" onclick="loadAccessRequests()">Refresh queue</button>') +
    '<div id="stwNotice"></div>' +
    '<div class="stat-grid stw-kpis" id="stwKpis">' + stwKpis(null) + '</div>' +
    '<div class="grid-2 stw-layout">' +
      '<section class="panel" aria-labelledby="stwReqTitle">' +
        '<div class="panel-head"><div><h2 id="stwReqTitle">Access requests</h2><p>Requests for restricted schemas and tables.</p></div></div>' +
        '<div class="stw-toolbar" id="stwChips" role="group" aria-label="Filter requests by status"></div>' +
        '<div class="stw-list" id="accessRequestsContainer" aria-live="polite"><div class="empty-state"><strong>Loading requests\u2026</strong></div></div>' +
      '</section>' +
      '<section class="panel" aria-labelledby="stwGlossTitle">' +
        '<div class="panel-head"><div><h2 id="stwGlossTitle">Glossary proposals</h2><p>Proposed definitions from domain owners.</p></div><span class="pill gray">SAMPLE</span></div>' +
        '<div class="stw-terms">' + terms + '</div>' +
        '<p class="small-note stw-foot">Glossary proposals are not stored yet. These two terms are examples, so their actions are disabled.</p>' +
      '</section>' +
    '</div></div>';
}

function stwRender() {
  const rows = STW.rows, f = STW.filter, shown = f === 'all' ? rows : rows.filter((r) => r.status === f);
  const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
  set('#stwKpis', stwKpis(rows));
  set('#stwNotice', STW.sample
    ? '<div class="notice"><span class="notice-icon" aria-hidden="true">!</span><div><strong>Sample rows.</strong> The requests table is empty or unavailable, so the API returned placeholder requests. Approving or rejecting them changes nothing.</div></div>'
    : '<div class="data-source-banner"><div><strong>Live queue.</strong> ' + rows.length + ' request' + (rows.length === 1 ? '' : 's') + ' from the project database.</div></div>');
  set('#stwChips', STW_FILTERS.map(([k, label]) => {
    const n = k === 'all' ? rows.length : rows.filter((r) => r.status === k).length;
    return '<button class="stw-chip" type="button" aria-pressed="' + (f === k) + '" onclick="stwFilter(\'' + k + '\')">' + label + ' <b>' + n + '</b></button>';
  }).join(''));
  set('#accessRequestsContainer', shown.length ? shown.map((r) => {
    const pending = r.status === 'pending', id = esc(r.id);
    return '<article class="stw-req ' + esc(r.status) + '"><div class="stw-req-main">' +
      '<div class="stw-req-top"><strong class="mono stw-asset">' + esc(r.asset_name) + '</strong><span class="pill ' + (STW_PILL[r.status] || 'gray') + '">' + esc(r.status) + '</span></div>' +
      '<p class="stw-reason">' + esc(r.reason) + '</p>' +
      '<p class="stw-meta"><span>' + esc(r.requester) + '</span><span>' + esc(stwWhen(r.requested_at)) + '</span></p></div>' +
      '<div class="stw-actions">' + (pending
        ? '<button class="btn small primary" type="button" onclick="approveAccessRequest(\'' + id + '\')">Approve</button><button class="btn small" type="button" onclick="rejectAccessRequest(\'' + id + '\')">Reject</button>'
        : '<span class="small-note">Decided</span>') + '</div></article>';
  }).join('') : '<div class="empty-state"><strong>' + (rows.length ? 'No ' + f + ' requests' : 'No access requests') + '</strong><p>' + (rows.length ? 'Choose another status to see the rest of the queue.' : 'New requests appear here as soon as someone asks for access.') + '</p></div>');
}

window.stwFilter = function (f) { STW.filter = f; stwRender(); };

async function loadAccessRequests() {
  const box = $('#accessRequestsContainer');
  if (!box) return;
  try {
    const res = await fetch('/api/v1/requests', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    STW.rows = json.requests || [];
    STW.sample = STW.rows.some(stwIsSample);
    stwRender();
  } catch (err) {
    box.innerHTML = '<div class="empty-state"><strong>Could not load access requests</strong><p>' + esc(err.message) + '</p></div>';
  }
}

async function stwDecide(id, status) {
  const row = STW.rows.find((r) => String(r.id) === String(id));
  if (row && stwIsSample(row)) { toast('This is a sample row, so nothing was changed.', true); return; }
  try {
    const res = await fetch('/api/v1/request-decision', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'HTTP ' + res.status);
    toast(status === 'approved' ? 'Access request approved.' : 'Access request rejected.');
    loadAccessRequests();
  } catch (e) {
    toast('Could not update the request: ' + e.message, true);
  }
}
window.approveAccessRequest = (id) => stwDecide(id, 'approved');
window.rejectAccessRequest = (id) => stwDecide(id, 'rejected');