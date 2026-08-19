/**
 * Salesforce Data Cloud Web SDK - Sitemap Configuration
 * MINI Demo Website
 *
 * Implements the Marketing Cloud Personalization (MCP) Web SDK following best practices:
 * - SalesforceInteractions.init() with cookieDomain and consents
 * - Page type matching with catalog object tracking
 * - Content zones for personalization campaigns
 * - Anonymous ID logging for RTDG Visualizer integration
 *
 * The anonymous ID printed to console can be used in the RTDG Visualizer
 * (https://bizcuit.github.io/rtdg_visualizer/) to look up the unified profile
 * via IndividualIdentityLink__dlm.SourceRecordId__c
 */
(function() {
  if (typeof SalesforceInteractions === 'undefined') {
    console.warn('[MINI Personalization] SalesforceInteractions SDK not loaded');
    return;
  }

  SalesforceInteractions.init({
    cookieDomain: 'jonjakk.github.io',
    consents: [{
      provider: 'MINI Demo',
      purpose: 'Tracking',
      status: SalesforceInteractions.ConsentStatus.OptIn
    }]
  }).then(function() {

    // Log session ID to console (same pattern as abc-demo.cloud)
    function logSessionId(id) {
      console.log('%c Data Cloud Session ID: ' + id + ' ', 'background: #032d60; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 13px;');
      console.log('Paste this ID into the RTDG Visualizer → IndividualIdentityLink__dlm.SourceRecordId__c=' + id);
    }

    document.addEventListener(SalesforceInteractions.CustomEvents.OnSetAnonymousId, function(event) {
      logSessionId(event.detail.newAnonymousId);
    });

    var anonId = SalesforceInteractions.getAnonymousId ? SalesforceInteractions.getAnonymousId() : null;
    if (anonId) {
      logSessionId(anonId);
    }

    var defined = SalesforceInteractions.CatalogObjectInteractionName;

    var sitemapConfig = {
      global: {
        contentZones: [
          { name: "homepage_hero", selector: ".hero-banner" },
          { name: "homepage_models", selector: ".model-selection-grid" },
          { name: "global_header", selector: "header.main-nav" }
        ],
        listeners: [
          SalesforceInteractions.listener("click", "a.btn-primary", function() {
            SalesforceInteractions.sendEvent({
              interaction: { name: "CTAClick" }
            });
          })
        ]
      },
      pageTypes: [
        {
          name: "Homepage",
          isMatch: function() {
            return /index\.html$|\/$|\/mini-personalization-demo\/?$/.test(window.location.pathname);
          },
          contentZones: [
            { name: "homepage_hero", selector: ".hero-banner" }
          ]
        },
        {
          name: "Model Overview",
          isMatch: function() {
            return /modelle\/?$|modelle\/index\.html$/.test(window.location.pathname);
          },
          contentZones: [
            { name: "model_grid", selector: ".model-selection-grid" }
          ]
        },
        {
          name: "Model Detail",
          isMatch: function() {
            return /modelle\/[^/]+\.html$/.test(window.location.pathname);
          },
          interaction: {
            name: defined ? defined.ViewCatalogObject : "ViewCatalogObject",
            catalogObject: {
              type: "Product",
              id: (document.querySelector('[data-model-id]') || {}).dataset ? document.querySelector('[data-model-id]').dataset.modelId : '',
              attributes: {
                name: (document.querySelector('[data-model-name]') || {}).dataset ? document.querySelector('[data-model-name]').dataset.modelName : '',
                price: (document.querySelector('[data-model-price]') || {}).dataset ? document.querySelector('[data-model-price]').dataset.modelPrice : '',
                drivetrain: (document.querySelector('[data-model-drivetrain]') || {}).dataset ? document.querySelector('[data-model-drivetrain]').dataset.modelDrivetrain : '',
                category: (document.querySelector('[data-model-drivetrain]') || {}).dataset ? document.querySelector('[data-model-drivetrain]').dataset.modelDrivetrain : ''
              },
              relatedCatalogObjects: {
                Category: [(document.querySelector('[data-model-drivetrain]') || {}).dataset ? document.querySelector('[data-model-drivetrain]').dataset.modelDrivetrain : '']
              }
            }
          },
          contentZones: [
            { name: "model_cta", selector: ".cta-section" },
            { name: "model_sidebar", selector: ".model-sidebar" }
          ]
        },
        {
          name: "Test Drive",
          isMatch: function() {
            return /test-drive\.html$/.test(window.location.pathname);
          },
          contentZones: [
            { name: "testdrive_form", selector: ".form-container" }
          ]
        }
      ]
    };

    SalesforceInteractions.initSitemap(sitemapConfig);

    console.log('%c Salesforce Data Cloud Web SDK initialized ✓ ', 'background: #2e844a; color: #fff; padding: 3px 8px; border-radius: 4px;');

  }).catch(function(err) {
    console.error('[Data Cloud] SDK initialization failed:', err);
  });
})();
