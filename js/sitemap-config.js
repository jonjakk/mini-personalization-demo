/**
 * Salesforce Interactions SDK - Sitemap Configuration
 * MINI Demo Website
 *
 * This file configures page types, content zones, and catalog object tracking
 * for the Salesforce Personalization (Interactions SDK) beacon.
 */
SalesforceInteractions.init().then(() => {
  const config = {
    global: {
      contentZones: [
        { name: "homepage_hero", selector: ".hero-banner" },
        { name: "model_grid", selector: ".model-selection-grid" }
      ]
    },
    pageTypes: [
      {
        name: "Homepage",
        isMatch: () => /index\.html$|\/website\/$|\/website$/.test(window.location.href),
        contentZones: [
          { name: "homepage_hero", selector: ".hero-banner" }
        ]
      },
      {
        name: "ModelSelection",
        isMatch: () => /modelle\/index\.html|modelle\/$/.test(window.location.href),
        contentZones: [
          { name: "model_grid", selector: ".model-selection-grid" }
        ]
      },
      {
        name: "ModelDetail",
        isMatch: () => /modelle\/[^/]+\.html/.test(window.location.href),
        interaction: {
          name: "ViewCatalogObject",
          catalogObject: {
            type: "Product",
            id: document.querySelector('[data-model-id]')?.dataset.modelId || '',
            attributes: {
              name: document.querySelector('[data-model-name]')?.dataset.modelName || '',
              price: document.querySelector('[data-model-price]')?.dataset.modelPrice || '',
              drivetrain: document.querySelector('[data-model-drivetrain]')?.dataset.modelDrivetrain || ''
            },
            relatedCatalogObjects: {
              Category: [document.querySelector('[data-model-drivetrain]')?.dataset.modelDrivetrain || '']
            }
          }
        },
        contentZones: [
          { name: "model_cta", selector: ".cta-section" }
        ]
      },
      {
        name: "TestDriveForm",
        isMatch: () => /test-drive\.html/.test(window.location.href)
      }
    ]
  };
  SalesforceInteractions.initSitemap(config);
});
