function stewardshipPage() {
  return head('Data Stewardship & Governance', 'Review and approve dataset access requests, glossary terms, and metadata classification.', '<button class=\"btn primary\" data-action=\"refresh-stewardship\">↻ Refresh Queue</button>') +
    notice('Governance & Stewardship Hub.', 'Stewards can review requests for sensitive assets (like PII tables) and approve or reject access in real time.') +
    '<div class=\"stat-grid\" id=\"stewardshipStats\">' +
      card('Pending Requests', '1', '!', 'Needs review') +
      card('Approved (24h)', '12', '✓', 'Active grants') +
      card('Glossary Terms', '48', '📖', 'Managed definitions') +
      card('Compliance SLA', '100%', '🛡️', 'On track') +
    '</div>' +
    '<div class=\"grid-2\" style=\"margin-top:20px;\">' +
      '<section class=\"panel\">' +
        '<div class=\"panel-head\"><div><h2>Dataset Access Requests</h2><p>Requests for restricted schemas and tables.</p></div><span class=\"pill amber\">LIVE API</span></div>' +
        '<div class=\"panel-body\" id=\"accessRequestsContainer\">' +
          '<div class=\"empty-state\"><strong>Loading requests...</strong></div>' +
        '</div>' +
      '</section>' +
      '<section class=\"panel\">' +
        '<div class=\"panel-head\"><div><h2>Glossary Term Proposals</h2><p>Proposed definitions from data domain owners.</p></div><span class=\"pill mint\">CURATED</span></div>' +
        '<div class=\"panel-body\">' +
          table(['Term', 'Domain', 'Proposer', 'Status', 'Actions'], [
            '<tr><td><strong>Net Revenue</strong><div class=\"subline\">Gross revenue minus refunds and discounts</div></td><td>Finance</td><td>Sarah J.</td><td>'+pill('PENDING')+'</td><td><button class=\"btn small primary\" onclick=\"toast(\'Glossary term approved!\')\">Approve</button></td></tr>',
            '<tr><td><strong>Active Customer</strong><div class=\"subline\">User with >= 1 order in trailing 30 days</div></td><td>Growth</td><td>Alex C.</td><td>'+pill('APPROVED')+'</td><td><button class=\"btn small\" disabled>Approved</button></td></tr>'
          ]) +
        '</div>' +
      '</section>' +
    '</div>';
}

async function loadAccessRequests() {
  const container = $('#accessRequestsContainer');
  if(!container) return;
  try {
    const res = await fetch('/api/v1/requests', { credentials: 'same-origin' });
    const json = await res.json();
    const reqs = json.requests || [];
    if(reqs.length === 0) {
      container.innerHTML = '<div class=\"empty-state\"><strong>No pending access requests</strong><p>All dataset access requests have been resolved.</p></div>';
      return;
    }
    container.innerHTML = table(['Asset', 'Requester', 'Reason', 'Status', 'Action'], reqs.map(r => 
      '<tr><td><strong>'+esc(r.asset_name)+'</strong></td><td>'+esc(r.requester)+'</td><td>'+esc(r.reason)+'</td><td>'+pill(r.status)+'</td><td>'+(r.status === 'pending' ? '<button class=\"btn small primary\" onclick=\"approveAccessRequest(\''+r.id+'\')\">Approve</button> <button class=\"btn small\" onclick=\"rejectAccessRequest(\''+r.id+'\')\">Reject</button>' : '<span class=\"small-note\">Done</span>')+'</td></tr>'
    ));
  } catch(err) {
    container.innerHTML = '<div class=\"empty-state\"><strong>Failed to load access requests</strong><p>'+esc(err.message)+'</p></div>';
  }
}

window.approveAccessRequest = async function(id) {
  try {
    await fetch('/api/v1/requests', { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, status: 'approved' }) });
    toast('Access request approved!');
    loadAccessRequests();
  } catch(e) {
    toast('Failed to approve request', true);
  }
};

window.rejectAccessRequest = async function(id) {
  try {
    await fetch('/api/v1/requests', { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, status: 'rejected' }) });
    toast('Access request rejected.');
    loadAccessRequests();
  } catch(e) {
    toast('Failed to reject request', true);
  }
};