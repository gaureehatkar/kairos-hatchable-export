function stewardshipPage() {
  return head('Data Stewardship & Governance', 'Review persisted dataset access requests and glossary proposals.', '<button class="btn primary" data-action="refresh-stewardship">↻ Refresh Queue</button>') +
    notice('Governance & Stewardship Hub.', 'Counts and queues below are loaded from PostgreSQL. An empty queue means no records were returned; decisions require an authorized admin session.') +
    '<div class="stat-grid" id="stewardshipStats">' +
      card('Pending Requests', '—', '…', 'Loading persisted records') +
      card('Approved Requests', '—', '…', 'Persisted decisions') +
      card('Glossary Proposals', '—', '…', 'Persisted proposals') +
      card('Governance Data', 'PostgreSQL', 'DB', 'No synthetic counts') +
    '</div>' +
    '<div class="grid-2" style="margin-top:20px;">' +
      '<section class="panel"><div class="panel-head"><div><h2>Dataset Access Requests</h2><p>Persisted requests for restricted schemas and tables.</p></div><span class="pill">DATABASE</span></div><div class="panel-body" id="accessRequestsContainer"><div class="empty-state"><strong>Loading requests...</strong></div></div></section>' +
      '<section class="panel"><div class="panel-head"><div><h2>Glossary Term Proposals</h2><p>Persisted proposed definitions awaiting review.</p></div><span class="pill">DATABASE</span></div><div class="panel-body" id="glossaryProposalsContainer"><div class="empty-state"><strong>Loading proposals...</strong></div></div></section>' +
    '</div>';
}

async function loadAccessRequests() {
  const container = $('#accessRequestsContainer');
  if (!container) return;
  try {
    const res = await fetch('/api/v1/requests', { credentials: 'same-origin' });
    const json = await res.json();
    if (!res.ok || json.ok === false) throw new Error(json.message || 'Could not load persisted requests.');
    const reqs = json.requests || [];
    if (!reqs.length) {
      container.innerHTML = '<div class="empty-state"><strong>No persisted access requests</strong><p>No request records were returned from PostgreSQL. No sample requests are being substituted.</p></div>';
      updateStewardshipStats(reqs, null);
      return;
    }
    container.innerHTML = table(['Asset', 'Requester', 'Reason', 'Status', 'Action'], reqs.map(r =>
      '<tr><td><strong>'+esc(r.asset_name)+'</strong></td><td>'+esc(r.requester)+'</td><td>'+esc(r.reason)+'</td><td>'+pill(r.status)+'</td><td>'+(r.status === 'pending' ? '<button class="btn small primary" onclick="decideAccessRequest(\''+esc(String(r.id))+'\',\'approved\')">Approve</button> <button class="btn small" onclick="decideAccessRequest(\''+esc(String(r.id))+'\',\'rejected\')">Reject</button>' : '<span class="small-note">Decision recorded</span>')+'</td></tr>'
    ));
    updateStewardshipStats(reqs, null);
  } catch(err) {
    container.innerHTML = '<div class="empty-state"><strong>Failed to load access requests</strong><p>'+esc(err.message)+'</p></div>';
  }
}

async function loadGlossaryProposals() {
  const container = $('#glossaryProposalsContainer');
  if (!container) return;
  try {
    const res = await fetch('/api/v1/proposals', { credentials: 'same-origin' });
    const json = await res.json();
    if (!res.ok || json.ok === false) throw new Error(json.message || 'Could not load persisted proposals.');
    const rows = json.proposals || [];
    if (!rows.length) {
      container.innerHTML = '<div class="empty-state"><strong>No persisted glossary proposals</strong><p>Submit a proposal before reviewing it. Example terms are not shown as real governance records.</p></div>';
    } else {
      container.innerHTML = table(['Term', 'Definition', 'Proposer', 'Status', 'Action'], rows.map(p =>
        '<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(p.definition)+'</td><td>'+esc(p.proposer)+'</td><td>'+pill(p.status)+'</td><td>'+(p.status === 'pending' ? '<button class="btn small primary" onclick="decideGlossaryProposal(\''+esc(String(p.id))+'\',\'approved\')">Approve</button> <button class="btn small" onclick="decideGlossaryProposal(\''+esc(String(p.id))+'\',\'rejected\')">Reject</button>' : '<span class="small-note">Decision recorded</span>')+'</td></tr>'
      ));
    }
    const stats = $('#stewardshipStats');
    if (stats) {
      const requestJson = await (await fetch('/api/v1/requests', { credentials: 'same-origin' })).json();
      updateStewardshipStats(requestJson.requests || [], rows);
    }
  } catch(err) {
    container.innerHTML = '<div class="empty-state"><strong>Failed to load glossary proposals</strong><p>'+esc(err.message)+'</p></div>';
  }
}

function updateStewardshipStats(requests, proposals) {
  const stats = $('#stewardshipStats');
  if (!stats) return;
  if (proposals === null) {
    const current = stats.dataset.proposals ? JSON.parse(stats.dataset.proposals) : null;
    proposals = current;
  } else {
    stats.dataset.proposals = JSON.stringify(proposals);
  }
  const reqs = requests || [];
  const terms = proposals || [];
  stats.innerHTML =
    card('Pending Requests', String(reqs.filter(r => r.status === 'pending').length), '!', 'Persisted request records') +
    card('Approved Requests', String(reqs.filter(r => r.status === 'approved').length), '✓', 'Persisted decisions') +
    card('Glossary Proposals', String(terms.length), 'G', 'Persisted proposals') +
    card('Pending Proposals', String(terms.filter(p => p.status === 'pending').length), '…', 'Awaiting review');
}

async function postGovernanceDecision(url, body, successMessage) {
  try {
    const res = await fetch(url, { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok || json.ok === false) throw new Error(json.message || json.error || 'Decision failed.');
    toast(successMessage);
    await Promise.all([loadAccessRequests(), loadGlossaryProposals()]);
  } catch(e) {
    toast(e.message || 'Governance action failed.', true);
  }
}

window.decideAccessRequest = (id, status) => postGovernanceDecision('/api/v1/request-decision', { id, status }, status === 'approved' ? 'Access request decision recorded.' : 'Access request rejection recorded.');
window.decideGlossaryProposal = (id, status) => postGovernanceDecision('/api/v1/proposal-decision', { id, status }, status === 'approved' ? 'Glossary proposal decision recorded.' : 'Glossary proposal rejection recorded.');

window.approveAccessRequest = id => window.decideAccessRequest(id, 'approved');
window.rejectAccessRequest = id => window.decideAccessRequest(id, 'rejected');

function refreshStewardship() {
  Promise.all([loadAccessRequests(), loadGlossaryProposals()]);
}