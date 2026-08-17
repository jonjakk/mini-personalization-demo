/**
 * MINI Recommendation Engine
 * Displays personalized Einstein Next Best Action recommendations
 * based on user's electric vehicle affinity score
 */

document.addEventListener('DOMContentLoaded', function () {

  // Get affinity data from localStorage (synchronized with main.js)
  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  var totalModelViews = (affinity.electric || 0) + (affinity.combustion || 0);
  var electricAffinity = totalModelViews > 0 ? (affinity.electric / totalModelViews) : 0;

  // Only show recommendations if user has meaningful browsing history
  if (totalModelViews < 2) {
    return; // Not enough data for personalization
  }

  // Generate client-side recommendations based on affinity
  // In production, this would call the Salesforce REST API:
  // GET /services/apexrest/mini/recommendations?electricAffinity=0.85
  // For demo purposes, we simulate the recommendations

  var recommendations = [];

  // High electric affinity (60%+) — prioritize electric models and incentives
  if (electricAffinity >= 0.6) {
    recommendations.push({
      name: 'MINI Cooper SE Test Drive',
      description: 'Erleben Sie 100% elektrischen Fahrspass. Buchen Sie jetzt eine Probefahrt mit dem MINI Cooper SE.',
      acceptLabel: 'Termin buchen',
      rejectLabel: 'Nicht interessiert',
      url: 'test-drive.html?model=cooper-se',
      score: 95
    });
    recommendations.push({
      name: 'E-Auto Foerderung',
      description: 'Sichern Sie sich bis zu 7.500€ staatliche Foerderung beim Kauf eines Elektrofahrzeugs.',
      acceptLabel: 'Mehr erfahren',
      rejectLabel: 'Spaeter',
      url: 'https://www.bafa.de/DE/Energie/Energieeffizienz/Elektromobilitaet/elektromobilitaet_node.html',
      score: 85
    });
    recommendations.push({
      name: 'Wallbox Installation',
      description: 'Laden Sie Ihren MINI bequem zu Hause. Professionelle Installation inkl. KfW-Foerderung.',
      acceptLabel: 'Angebot anfordern',
      rejectLabel: 'Nein danke',
      url: '#wallbox',
      score: 80
    });
  }
  // Medium electric affinity (30-60%) — show diverse options
  else if (electricAffinity >= 0.3) {
    recommendations.push({
      name: 'MINI Aceman Discovery',
      description: 'Der neue vollelektrische Crossover. Modern, vielseitig, elektrisch.',
      acceptLabel: 'Mehr erfahren',
      rejectLabel: 'Nicht interessiert',
      url: 'modelle/aceman.html',
      score: 75
    });
    recommendations.push({
      name: 'MINI Cooper SE Test Drive',
      description: 'Vergleichen Sie elektrisch vs. Benzin. Probefahrt mit beiden Modellen buchen.',
      acceptLabel: 'Termin buchen',
      rejectLabel: 'Spaeter',
      url: 'test-drive.html',
      score: 70
    });
  }
  // Low electric affinity — show Countryman SE ALL4 (hybrid bridge)
  else {
    recommendations.push({
      name: 'MINI Countryman SE ALL4',
      description: 'Das Beste aus zwei Welten: Plug-in-Hybrid mit Allradantrieb.',
      acceptLabel: 'Entdecken',
      rejectLabel: 'Nicht interessiert',
      url: 'modelle/countryman-se.html',
      score: 65
    });
  }

  // Sort by score and take top 3
  recommendations.sort(function(a, b) { return b.score - a.score; });
  recommendations = recommendations.slice(0, 3);

  // Render recommendation panel
  renderRecommendationPanel(recommendations);

  // Track recommendation impressions in localStorage
  trackRecommendationImpression(recommendations);
});

/**
 * Renders the floating recommendation panel
 */
function renderRecommendationPanel(recommendations) {
  if (recommendations.length === 0) return;

  // Check if panel already exists
  if (document.getElementById('mini-recommendations-panel')) return;

  // Create panel container
  var panel = document.createElement('div');
  panel.id = 'mini-recommendations-panel';
  panel.className = 'recommendations-panel';
  panel.innerHTML = `
    <div class="recommendations-header">
      <div class="recommendations-title">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Empfehlungen fuer Sie</span>
      </div>
      <button class="close-btn" onclick="document.getElementById('mini-recommendations-panel').remove()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="recommendations-list">
      ${recommendations.map(renderRecommendationCard).join('')}
    </div>
    <div class="recommendations-footer">
      <span class="powered-by">Powered by Einstein Next Best Action</span>
    </div>
  `;

  // Add styles
  addRecommendationStyles();

  // Insert panel into page (bottom right corner)
  document.body.appendChild(panel);

  // Fade in animation
  setTimeout(function() {
    panel.classList.add('visible');
  }, 300);
}

/**
 * Renders a single recommendation card
 */
function renderRecommendationCard(rec) {
  return `
    <div class="recommendation-card" data-recommendation="${rec.name}">
      <div class="recommendation-content">
        <h4>${rec.name}</h4>
        <p>${rec.description}</p>
      </div>
      <div class="recommendation-actions">
        <a href="${rec.url}" class="btn btn-accept" onclick="trackRecommendationClick('${rec.name}', 'accept')">
          ${rec.acceptLabel}
        </a>
        <button class="btn btn-reject" onclick="dismissRecommendation(this, '${rec.name}')">
          ${rec.rejectLabel}
        </button>
      </div>
    </div>
  `;
}

/**
 * Add CSS styles for recommendation panel
 */
function addRecommendationStyles() {
  if (document.getElementById('mini-recommendations-styles')) return;

  var style = document.createElement('style');
  style.id = 'mini-recommendations-styles';
  style.textContent = `
    .recommendations-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    .recommendations-panel.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .recommendations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e5e5;
    }

    .recommendations-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
      color: #000000;
    }

    .recommendations-title .icon {
      color: #b6ff00;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #666;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #000;
    }

    .recommendations-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 12px;
    }

    .recommendation-card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .recommendation-card:last-child {
      margin-bottom: 0;
    }

    .recommendation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .recommendation-content h4 {
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 600;
      color: #000000;
    }

    .recommendation-content p {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #444;
    }

    .recommendation-actions {
      display: flex;
      gap: 8px;
    }

    .recommendation-actions .btn {
      flex: 1;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-accept {
      background: #000000;
      color: #b6ff00;
      border: none;
    }

    .btn-accept:hover {
      background: #1a1a1a;
      transform: scale(1.02);
    }

    .btn-reject {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-reject:hover {
      background: #f0f0f0;
      color: #000;
    }

    .recommendations-footer {
      padding: 12px 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }

    .powered-by {
      font-size: 11px;
      color: #999;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .recommendations-panel {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-width: 100%;
        border-radius: 12px 12px 0 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Dismiss a recommendation
 */
function dismissRecommendation(button, recName) {
  var card = button.closest('.recommendation-card');
  card.style.opacity = '0';
  card.style.transform = 'translateX(100px)';

  setTimeout(function() {
    card.remove();
    trackRecommendationClick(recName, 'reject');

    // If no cards left, close panel
    if (document.querySelectorAll('.recommendation-card').length === 0) {
      var panel = document.getElementById('mini-recommendations-panel');
      if (panel) panel.remove();
    }
  }, 300);
}

/**
 * Track recommendation impression
 */
function trackRecommendationImpression(recommendations) {
  var tracking = JSON.parse(localStorage.getItem('mini_rec_tracking') || '{}');
  if (!tracking.impressions) tracking.impressions = [];

  tracking.impressions.push({
    timestamp: Date.now(),
    recommendations: recommendations.map(function(r) { return r.name; })
  });

  localStorage.setItem('mini_rec_tracking', JSON.stringify(tracking));
}

/**
 * Track recommendation click
 */
function trackRecommendationClick(recName, action) {
  var tracking = JSON.parse(localStorage.getItem('mini_rec_tracking') || '{}');
  if (!tracking.clicks) tracking.clicks = [];

  tracking.clicks.push({
    timestamp: Date.now(),
    recommendation: recName,
    action: action
  });

  localStorage.setItem('mini_rec_tracking', JSON.stringify(tracking));

  console.log('[MINI Recommendations] Tracked:', action, recName);
}

// Expose functions globally for onclick handlers
window.dismissRecommendation = dismissRecommendation;
window.trackRecommendationClick = trackRecommendationClick;
