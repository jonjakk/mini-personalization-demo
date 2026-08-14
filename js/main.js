/**
 * MINI Demo Site - Main JavaScript
 * Handles navigation toggle, client-side personalization, and test drive form identity event.
 */

document.addEventListener('DOMContentLoaded', function () {

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }

  // --- Client-Side Personalization Engine ---
  // Tracks browsing behavior and personalizes content in real-time
  // This works independently of server-side Personalization campaigns

  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  if (!affinity.electric) affinity.electric = 0;
  if (!affinity.combustion) affinity.combustion = 0;
  if (!affinity.pageViews) affinity.pageViews = 0;
  if (!affinity.visits) affinity.visits = 0;

  // Track page views on model pages
  var path = window.location.pathname;
  if (path.includes('cooper-se') || path.includes('aceman') || path.includes('countryman-se')) {
    affinity.electric += 1;
    affinity.pageViews += 1;
    affinity.lastElectricView = Date.now();
  } else if (path.includes('cooper.html') || path.includes('cooper-s.html') || path.includes('countryman.html')) {
    affinity.combustion += 1;
    affinity.pageViews += 1;
  }

  // Track visits (new session = 30min gap)
  var lastVisit = affinity.lastVisitTime || 0;
  if (Date.now() - lastVisit > 1800000) {
    affinity.visits += 1;
  }
  affinity.lastVisitTime = Date.now();

  localStorage.setItem('mini_affinity', JSON.stringify(affinity));

  // Calculate electric affinity score (0-100)
  var totalModelViews = affinity.electric + affinity.combustion;
  var electricScore = totalModelViews > 0 ? Math.round((affinity.electric / totalModelViews) * 100) : 0;

  // --- Personalize Homepage ---
  if (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('/mini-personalization-demo/')) {
    var heroBanner = document.querySelector('.hero-banner');
    var heroContent = document.querySelector('.hero-content');

    // If user has viewed 3+ electric model pages, personalize the homepage
    if (affinity.electric >= 3 && heroContent) {
      heroContent.querySelector('h1').textContent = '100% Electric.';
      heroContent.querySelector('p').textContent = 'Sie interessieren sich fuer elektrische Mobilitaet? Entdecken Sie den MINI Cooper SE — 100% elektrisch, 100% Fahrspass.';
      // Swap hero SVG to electric-focused with green accents
      var heroImage = heroContent.querySelector('.hero-image');
      if (heroImage) {
        heroImage.innerHTML = '<svg viewBox="0 0 700 350" xmlns="http://www.w3.org/2000/svg">' +
          '<defs><linearGradient id="elecGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#001a00"/><stop offset="100%" style="stop-color:#003300"/></linearGradient></defs>' +
          '<rect width="700" height="350" fill="url(#elecGrad)"/>' +
          '<rect x="150" y="180" width="400" height="100" rx="50" fill="#2a2a2a"/>' +
          '<circle cx="250" cy="280" r="35" fill="#444"/><circle cx="250" cy="280" r="20" fill="#111"/>' +
          '<circle cx="450" cy="280" r="35" fill="#444"/><circle cx="450" cy="280" r="20" fill="#111"/>' +
          '<rect x="200" y="150" width="300" height="60" rx="20" fill="#333"/>' +
          '<rect x="220" y="160" width="100" height="35" rx="5" fill="#00ff88" opacity="0.7"/>' +
          '<rect x="380" y="160" width="100" height="35" rx="5" fill="#00ff88" opacity="0.7"/>' +
          '<circle cx="350" cy="120" r="10" fill="#00ff88"/>' +
          '<text x="350" y="330" text-anchor="middle" fill="#00ff88" font-family="Helvetica Neue, Arial" font-size="16" font-weight="bold">MINI COOPER SE — JETZT PROBEFAHRT BUCHEN</text>' +
          '<text x="350" y="30" text-anchor="middle" fill="#b6ff00" font-family="Helvetica Neue, Arial" font-size="12">PERSONALISIERT FUER SIE</text>' +
          '</svg>';
      }
      // Update CTA buttons
      var ctaButtons = heroContent.querySelector('.cta-buttons');
      if (ctaButtons) {
        ctaButtons.innerHTML = '<a href="modelle/cooper-se.html" class="btn btn-primary">MINI Cooper SE entdecken</a>' +
          '<a href="test-drive.html" class="btn btn-outline">Probefahrt buchen</a>';
      }
      // Add personalization indicator
      if (heroBanner && !document.querySelector('.personalization-badge')) {
        var badge = document.createElement('div');
        badge.className = 'personalization-badge';
        badge.style.cssText = 'position:absolute;top:12px;right:12px;background:#b6ff00;color:#000;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:bold;letter-spacing:1px;z-index:10;';
        badge.textContent = 'PERSONALISIERT';
        heroBanner.style.position = 'relative';
        heroBanner.appendChild(badge);
      }
    }

    // Personalize model grid — move electric models to front if high affinity
    if (electricScore >= 60) {
      var grid = document.querySelector('.model-selection-grid');
      if (grid) {
        var cards = Array.from(grid.children);
        cards.sort(function(a, b) {
          var aElec = a.querySelector('.badge-electric') ? 0 : 1;
          var bElec = b.querySelector('.badge-electric') ? 0 : 1;
          return aElec - bElec;
        });
        cards.forEach(function(card) { grid.appendChild(card); });
      }
    }
  }

  // --- Personalize Model Selection Page ---
  if (path.includes('modelle/index') || path.endsWith('modelle/')) {
    if (electricScore >= 60) {
      var grid = document.querySelector('.model-selection-grid');
      if (grid) {
        var cards = Array.from(grid.children);
        cards.sort(function(a, b) {
          var aElec = a.querySelector('.badge-electric') ? 0 : 1;
          var bElec = b.querySelector('.badge-electric') ? 0 : 1;
          return aElec - bElec;
        });
        cards.forEach(function(card) { grid.appendChild(card); });
      }
    }
  }

  // --- Affinity Display (Profile Lookup simulation) ---
  // Show a floating panel with live affinity scores (visible during demo)
  function showAffinityPanel() {
    if (document.getElementById('affinity-panel')) return; // already showing
    var panel = document.createElement('div');
    panel.id = 'affinity-panel';
    panel.style.cssText = 'position:fixed;bottom:20px;right:20px;width:280px;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;z-index:9999;font-family:Helvetica Neue,Arial,sans-serif;color:#fff;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<strong style="color:#b6ff00;font-size:11px;letter-spacing:1px;">LIVE AFFINITIES</strong>' +
      '<span style="cursor:pointer;color:#666;" onclick="this.parentElement.parentElement.remove()">&#10005;</span></div>' +
      '<div style="margin-bottom:8px;">Electric Affinity: <strong style="color:#00ff88;">' + electricScore + '%</strong></div>' +
      '<div style="margin-bottom:8px;"><div style="height:6px;background:#333;border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + electricScore + '%;background:linear-gradient(90deg,#00ff88,#b6ff00);border-radius:3px;transition:width 0.5s;"></div></div></div>' +
      '<div style="margin-bottom:4px;color:#999;">Electric Views: ' + affinity.electric + '</div>' +
      '<div style="margin-bottom:4px;color:#999;">Combustion Views: ' + affinity.combustion + '</div>' +
      '<div style="margin-bottom:4px;color:#999;">Total Page Views: ' + affinity.pageViews + '</div>' +
      '<div style="margin-bottom:4px;color:#999;">Sessions: ' + affinity.visits + '</div>' +
      '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;color:#666;font-size:10px;">Profile Lookup &bull; Real-time</div>';
    document.body.appendChild(panel);
  }

  function shouldShowAffinity() {
    return localStorage.getItem('mini_show_affinity') === 'true' ||
           window.location.hash === '#affinity' ||
           window.location.href.indexOf('#affinity') !== -1;
  }

  if (shouldShowAffinity()) {
    showAffinityPanel();
  }

  // Also check after a short delay (handles race condition with hash on GitHub Pages)
  setTimeout(function() {
    if (shouldShowAffinity()) {
      showAffinityPanel();
    }
  }, 100);

  // Handle hash change (e.g., user adds #affinity to URL while on page)
  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#affinity') {
      showAffinityPanel();
    }
  });

  // Enable affinity panel via keyboard shortcut (Shift+A)
  document.addEventListener('keydown', function(e) {
    if (e.shiftKey && e.key === 'A') {
      localStorage.setItem('mini_show_affinity', 'true');
      window.location.reload();
    }
  });

  // Test Drive form - fire identity event on submit
  var form = document.querySelector('form[action*="WebToLead"]');
  if (form) {
    form.addEventListener('submit', function () {
      var email = document.querySelector('[name="email"]')?.value;
      var firstName = document.querySelector('[name="first_name"]')?.value;
      var lastName = document.querySelector('[name="last_name"]')?.value;

      // Mark test drive signup in affinity
      affinity.testDriveSignup = true;
      affinity.testDriveDate = Date.now();
      localStorage.setItem('mini_affinity', JSON.stringify(affinity));

      if (email && window.SalesforceInteractions) {
        SalesforceInteractions.sendEvent({
          interaction: { name: "TestDriveSignup", eventType: "identity" },
          user: {
            id: email,
            attributes: {
              emailAddress: email,
              firstName: firstName,
              lastName: lastName
            }
          }
        });
      }
    });
  }
});
