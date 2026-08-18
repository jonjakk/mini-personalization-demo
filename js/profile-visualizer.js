// Profile Visualizer - Real-Time Data Graph Visualization
// Mimics the Salesforce RTDG Visualizer (github.com/Bizcuit/rtdg_visualizer)
// on the public MINI demo website

window.addEventListener('load', function() {
  // Only show after user has some browsing history
  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  if (!affinity.pageViews || affinity.pageViews < 1) return;

  createProfileLookupButton();
});

function createProfileLookupButton() {
  // Create floating button (bottom-left)
  var btn = document.createElement('button');
  btn.id = 'profile-lookup-btn';
  btn.innerHTML = '👤 Profile Lookup';
  btn.style.cssText = 'position:fixed;bottom:20px;left:20px;background:#032d60;color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-family:Salesforce Sans,Arial;font-size:13px;z-index:9998;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
  btn.onclick = openProfilePanel;
  document.body.appendChild(btn);
}

function openProfilePanel() {
  if (document.getElementById('profile-visualizer-panel')) return;

  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  var electricScore = (affinity.electric || 0);
  var combustionScore = (affinity.combustion || 0);
  var total = electricScore + combustionScore;
  var electricPct = total > 0 ? Math.round((electricScore / total) * 100) : 0;

  var panel = document.createElement('div');
  panel.id = 'profile-visualizer-panel';
  panel.style.cssText = 'position:fixed;bottom:60px;left:20px;width:380px;max-height:80vh;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:9999;font-family:Salesforce Sans,-apple-system,Arial,sans-serif;overflow-y:auto;';

  panel.innerHTML = `
    <div style="background:#032d60;color:#fff;padding:14px 16px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-weight:600;font-size:14px;">🔍 Real-Time Profile</span>
      <span style="cursor:pointer;font-size:18px;" onclick="document.getElementById('profile-visualizer-panel').remove()">✕</span>
    </div>

    <!-- ATTRIBUTES SECTION -->
    <div style="padding:16px;">
      <div style="font-size:11px;font-weight:700;color:#706e6b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Customer Profile</div>
      <div style="display:grid;grid-template-columns:120px 1fr;gap:6px 12px;font-size:13px;">
        <span style="color:#706e6b;">Name:</span><span style="font-weight:500;">Lisa Schmidt</span>
        <span style="color:#706e6b;">Title:</span><span>Marketing Director</span>
        <span style="color:#706e6b;">Email:</span><span>lisa.schmidt@mini-demo.de</span>
        <span style="color:#706e6b;">Phone:</span><span>+49 170 1234567</span>
        <span style="color:#706e6b;">Unified ID:</span><span style="font-size:11px;color:#999;">1c8c1b03...8d2a0aed</span>
      </div>
    </div>

    <hr style="margin:0;border:none;border-top:1px solid #e5e5e5;">

    <!-- AFFINITIES SECTION -->
    <div style="padding:16px;">
      <div style="font-size:11px;font-weight:700;color:#706e6b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Category Affinities</div>
      ${renderAffinityBar('Electric Vehicles', electricPct, '#0ea5e9')}
      ${renderAffinityBar('MINI Cooper SE', Math.min(100, electricScore * 25), '#22c55e')}
      ${renderAffinityBar('MINI Aceman', Math.min(100, Math.max(0, electricScore - 1) * 30), '#8b5cf6')}
      ${renderAffinityBar('Combustion', total > 0 ? Math.round((combustionScore / total) * 100) : 0, '#f97316')}
      ${renderAffinityBar('SUV / Countryman', Math.min(100, Math.max(0, electricScore - 2) * 20), '#06b6d4')}
    </div>

    <hr style="margin:0;border:none;border-top:1px solid #e5e5e5;">

    <!-- SEGMENT MEMBERSHIP -->
    <div style="padding:16px;">
      <div style="font-size:11px;font-weight:700;color:#706e6b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Segment Membership</div>
      ${electricPct >= 60 ? renderSegment('Electric Interest', 'Added', 'just now') : ''}
      ${affinity.pageViews >= 3 ? renderSegment('Active Browsers', 'Added', '2 min ago') : ''}
      ${affinity.testDriveSignup ? renderSegment('Test Drive Leads', 'Added', '5 min ago') : ''}
      ${electricPct < 60 && affinity.pageViews < 3 ? '<div style="color:#999;font-size:12px;font-style:italic;">No segments yet — browse more to qualify</div>' : ''}
    </div>

    <hr style="margin:0;border:none;border-top:1px solid #e5e5e5;">

    <!-- ENGAGEMENT TIMELINE -->
    <div style="padding:16px;">
      <div style="font-size:11px;font-weight:700;color:#706e6b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Engagement Timeline</div>
      ${renderEngagementTimeline(affinity)}
    </div>

    <div style="padding:8px 16px;background:#f8f8f8;border-radius:0 0 12px 12px;font-size:10px;color:#999;text-align:center;">
      Powered by Salesforce Data Cloud • Real-Time Data Graph
    </div>
  `;

  document.body.appendChild(panel);
}

function renderAffinityBar(label, value, color) {
  return `<div style="margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
      <span>${label}</span><span style="font-weight:600;">${value}%</span>
    </div>
    <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
      <div style="height:100%;width:${value}%;background:${color};border-radius:4px;transition:width 0.5s ease;"></div>
    </div>
  </div>`;
}

function renderSegment(name, status, time) {
  var color = status === 'Added' ? '#22c55e' : '#ef4444';
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5;">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};"></span>
      <span style="font-size:12px;">${name}</span>
    </div>
    <span style="font-size:10px;color:#999;">${time}</span>
  </div>`;
}

function renderEngagementTimeline(affinity) {
  var events = [];
  if (affinity.electric > 0) {
    for (var i = 0; i < Math.min(affinity.electric, 5); i++) {
      events.push({type: 'View', label: 'Electric Model Page', color: '#0ea5e9', time: (i + 1) + ' min ago'});
    }
  }
  if (affinity.combustion > 0) {
    events.push({type: 'View', label: 'Combustion Model Page', color: '#f97316', time: '3 min ago'});
  }
  if (affinity.testDriveSignup) {
    events.unshift({type: 'Convert', label: 'Test Drive Signup', color: '#22c55e', time: 'just now'});
  }
  if (events.length === 0) {
    return '<div style="color:#999;font-size:12px;font-style:italic;">No engagement events yet</div>';
  }
  return events.map(function(e) {
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid #f8f8f8;">
      <div style="width:3px;height:28px;background:${e.color};border-radius:2px;flex-shrink:0;margin-top:2px;"></div>
      <div style="flex:1;">
        <div style="font-size:12px;font-weight:500;">${e.label}</div>
        <div style="font-size:10px;color:#999;">${e.type} • ${e.time}</div>
      </div>
    </div>`;
  }).join('');
}
