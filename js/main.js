/**
 * MINI Demo Site - Main JavaScript
 * Handles navigation toggle and test drive form identity event.
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

  // Test Drive form - fire identity event on submit
  const form = document.querySelector('form[action*="WebToLead"]');
  if (form) {
    form.addEventListener('submit', function () {
      const email = document.querySelector('[name="email"]')?.value;
      const firstName = document.querySelector('[name="first_name"]')?.value;
      const lastName = document.querySelector('[name="last_name"]')?.value;

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
