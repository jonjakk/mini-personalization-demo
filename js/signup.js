/**
 * Mein MINI Sign-Up / Account Creation
 * Fires Salesforce Personalization identity event to link anonymous browsing
 * behavior to the known user profile. This connects the c360a behavioral data
 * (page views, electric affinity, time on site) to the user's identity.
 */

(function() {
  // Check if user is already signed in
  function isSignedIn() {
    return !!localStorage.getItem('mini_user');
  }

  function getUser() {
    return JSON.parse(localStorage.getItem('mini_user') || 'null');
  }

  // Attach click handler to the account icon in navigation
  document.addEventListener('DOMContentLoaded', function() {
    var accountLink = document.querySelector('a[aria-label="Konto"]');
    if (accountLink) {
      accountLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (isSignedIn()) {
          showAccountPanel();
        } else {
          showSignupModal();
        }
      });

      // Update icon if signed in
      if (isSignedIn()) {
        accountLink.style.position = 'relative';
        var dot = document.createElement('span');
        dot.style.cssText = 'position:absolute;top:2px;right:2px;width:8px;height:8px;background:#10b981;border-radius:50%;border:1.5px solid white;';
        accountLink.appendChild(dot);
      }
    }
  });

  function showSignupModal() {
    if (document.getElementById('mini-signup-modal')) return;

    var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
    var totalViews = (affinity.electric || 0) + (affinity.combustion || 0);
    var electricPct = totalViews > 0 ? Math.round((affinity.electric / totalViews) * 100) : 0;

    var modal = document.createElement('div');
    modal.id = 'mini-signup-modal';
    modal.innerHTML = '<div class="msu-overlay" onclick="closeSignupModal()"></div>' +
      '<div class="msu-dialog">' +
      '<div class="msu-header">' +
      '<div class="msu-logo">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1c0-3.31 3.58-6 8-6s8 2.69 8 6v1"/></svg>' +
      '</div>' +
      '<h3>Mein MINI Konto erstellen</h3>' +
      '<p>Erstellen Sie ein Konto, um Fahrzeuge zu speichern und personalisierte Empfehlungen zu erhalten.</p>' +
      '<button onclick="closeSignupModal()" class="msu-close">&times;</button>' +
      '</div>' +
      '<div class="msu-body">' +
      '<div class="msu-form">' +
      '<div class="msu-row">' +
      '<input type="text" id="msu-firstname" placeholder="Vorname *" required>' +
      '<input type="text" id="msu-lastname" placeholder="Nachname *" required>' +
      '</div>' +
      '<input type="email" id="msu-email" placeholder="E-Mail-Adresse *" required>' +
      '<input type="tel" id="msu-phone" placeholder="Telefonnummer *" required>' +
      '<div class="msu-consent">' +
      '<label><input type="checkbox" id="msu-consent" checked> Ich stimme der Verarbeitung meiner Daten zur Personalisierung meines MINI Erlebnisses zu.</label>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="msu-footer">' +
      '<button onclick="closeSignupModal()" class="msu-btn-cancel">Abbrechen</button>' +
      '<button onclick="handleSignup()" class="msu-btn-signup">Konto erstellen</button>' +
      '</div>' +
      (totalViews > 0 ? '<div class="msu-behavioral-note">Ihre bisherigen ' + totalViews + ' Seitenaufrufe werden mit Ihrem Konto verkn&uuml;pft.</div>' : '') +
      '</div>';

    addSignupStyles();
    document.body.appendChild(modal);
    setTimeout(function() { modal.classList.add('visible'); }, 10);
  }

  function showAccountPanel() {
    var user = getUser();
    if (!user) return;

    if (document.getElementById('mini-signup-modal')) return;

    var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
    var totalViews = (affinity.electric || 0) + (affinity.combustion || 0);
    var electricPct = totalViews > 0 ? Math.round((affinity.electric / totalViews) * 100) : 0;

    var modal = document.createElement('div');
    modal.id = 'mini-signup-modal';
    modal.innerHTML = '<div class="msu-overlay" onclick="closeSignupModal()"></div>' +
      '<div class="msu-dialog">' +
      '<div class="msu-header">' +
      '<div class="msu-logo" style="background:#10b981;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="24" height="24"><path d="M20 6L9 17l-5-5"/></svg>' +
      '</div>' +
      '<h3>Mein MINI</h3>' +
      '<p>Willkommen zur&uuml;ck, ' + user.firstName + '!</p>' +
      '<button onclick="closeSignupModal()" class="msu-close">&times;</button>' +
      '</div>' +
      '<div class="msu-body">' +
      '<div class="msu-profile-info">' +
      '<div class="msu-profile-row"><span class="msu-label">Name</span><span>' + user.firstName + ' ' + user.lastName + '</span></div>' +
      '<div class="msu-profile-row"><span class="msu-label">E-Mail</span><span>' + user.email + '</span></div>' +
      '<div class="msu-profile-row"><span class="msu-label">Telefon</span><span>' + user.phone + '</span></div>' +
      '</div>' +
      '<div class="msu-behavioral-data">' +
      '<h4>Ihr Profil (Data Cloud)</h4>' +
      '<div class="msu-profile-row"><span class="msu-label">Seitenaufrufe</span><span>' + (affinity.pageViews || 0) + '</span></div>' +
      '<div class="msu-profile-row"><span class="msu-label">Elektro-Affinit&auml;t</span><span>' + electricPct + '%</span></div>' +
      '<div class="msu-profile-row"><span class="msu-label">Besuche</span><span>' + (affinity.visits || 0) + '</span></div>' +
      '<div class="msu-profile-row"><span class="msu-label">Status</span><span style="color:#10b981;font-weight:600;">Verknuepft mit Salesforce</span></div>' +
      '</div>' +
      '</div>' +
      '<div class="msu-footer">' +
      '<button onclick="closeSignupModal()" class="msu-btn-cancel">Schliessen</button>' +
      '<button onclick="signOut()" class="msu-btn-signout">Abmelden</button>' +
      '</div>' +
      '</div>';

    addSignupStyles();
    document.body.appendChild(modal);
    setTimeout(function() { modal.classList.add('visible'); }, 10);
  }

  window.handleSignup = function() {
    var firstName = document.getElementById('msu-firstname').value.trim();
    var lastName = document.getElementById('msu-lastname').value.trim();
    var email = document.getElementById('msu-email').value.trim();
    var phone = document.getElementById('msu-phone').value.trim();

    if (!firstName || !lastName || !email || !phone) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    var userData = { firstName: firstName, lastName: lastName, email: email, phone: phone, signupDate: new Date().toISOString() };
    localStorage.setItem('mini_user', JSON.stringify(userData));

    // Fire Salesforce Personalization identity event
    // This links all anonymous browsing behavior to this known user
    if (window.SalesforceInteractions) {
      SalesforceInteractions.sendEvent({
        interaction: { name: 'AccountCreated', eventType: 'identity' },
        user: {
          id: email,
          attributes: {
            emailAddress: email,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phone
          }
        }
      });
      console.log('[MINI Signup] Identity event fired - behavioral data linked to:', email);
    }

    // Show success state
    var dialog = document.querySelector('.msu-dialog');
    if (dialog) {
      dialog.innerHTML = '<div class="msu-success">' +
        '<div class="msu-success-icon">&#10003;</div>' +
        '<h3>Konto erstellt!</h3>' +
        '<p>' + firstName + ', Ihr Mein MINI Konto ist aktiv.</p>' +
        '<p class="msu-success-detail">Ihre bisherigen Browsing-Daten wurden mit Ihrem Profil in Salesforce Data Cloud verkn&uuml;pft.</p>' +
        '<button onclick="closeSignupModal()" class="msu-btn-signup" style="margin-top:16px;">Weiter einkaufen</button>' +
        '</div>';
    }

    // Update nav icon
    var accountLink = document.querySelector('a[aria-label="Konto"]');
    if (accountLink) {
      accountLink.style.position = 'relative';
      var dot = document.createElement('span');
      dot.style.cssText = 'position:absolute;top:2px;right:2px;width:8px;height:8px;background:#10b981;border-radius:50%;border:1.5px solid white;';
      accountLink.appendChild(dot);
    }
  };

  window.signOut = function() {
    localStorage.removeItem('mini_user');
    closeSignupModal();
    window.location.reload();
  };

  window.closeSignupModal = function() {
    var modal = document.getElementById('mini-signup-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(function() { modal.remove(); }, 200);
    }
  };

  window.showSignupModal = showSignupModal;

  function addSignupStyles() {
    if (document.getElementById('msu-styles')) return;
    var style = document.createElement('style');
    style.id = 'msu-styles';
    style.textContent =
      '.msu-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;opacity:0;transition:opacity .2s}' +
      '#mini-signup-modal.visible .msu-overlay{opacity:1}' +
      '.msu-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);background:#fff;border-radius:16px;width:440px;max-width:92vw;z-index:10001;box-shadow:0 25px 60px rgba(0,0,0,0.3);opacity:0;transition:all .25s ease-out;overflow:hidden}' +
      '#mini-signup-modal.visible .msu-dialog{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
      '.msu-header{padding:28px 28px 16px;text-align:center}' +
      '.msu-header h3{font-size:20px;font-weight:700;margin:12px 0 4px;color:#000}' +
      '.msu-header p{font-size:13px;color:#666;margin:0;line-height:1.5}' +
      '.msu-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#999;padding:0 4px}' +
      '.msu-logo{width:48px;height:48px;background:#000;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#b6ff00}' +
      '.msu-body{padding:0 28px 16px}' +
      '.msu-form{display:flex;flex-direction:column;gap:12px}' +
      '.msu-row{display:flex;gap:12px}' +
      '.msu-row input{flex:1}' +
      '.msu-form input[type="text"],.msu-form input[type="email"],.msu-form input[type="tel"]{padding:11px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s}' +
      '.msu-form input:focus{border-color:#000}' +
      '.msu-consent{font-size:12px;color:#666}' +
      '.msu-consent label{display:flex;align-items:flex-start;gap:8px;cursor:pointer}' +
      '.msu-consent input{margin-top:2px}' +
      '.msu-footer{display:flex;justify-content:flex-end;gap:12px;padding:16px 28px;border-top:1px solid #f0f0f0}' +
      '.msu-btn-cancel{padding:10px 18px;background:none;border:1px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;font-weight:500}' +
      '.msu-btn-signup{padding:10px 18px;background:#000;color:#b6ff00;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}' +
      '.msu-btn-signup:hover{background:#1a1a1a}' +
      '.msu-btn-signout{padding:10px 18px;background:#f3f4f6;color:#666;border:none;border-radius:8px;font-size:14px;cursor:pointer}' +
      '.msu-behavioral-note{text-align:center;padding:12px 28px 20px;font-size:11px;color:#999;border-top:1px solid #f0f0f0;margin-top:0}' +
      '.msu-profile-info,.msu-behavioral-data{margin-bottom:16px}' +
      '.msu-behavioral-data h4{font-size:13px;font-weight:600;color:#000;margin:0 0 8px;padding-top:12px;border-top:1px solid #f0f0f0}' +
      '.msu-profile-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}' +
      '.msu-label{color:#666}' +
      '.msu-success{text-align:center;padding:40px 28px}' +
      '.msu-success-icon{width:56px;height:56px;background:#10b981;color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px}' +
      '.msu-success h3{font-size:20px;margin:0 0 8px}' +
      '.msu-success p{font-size:14px;color:#666;margin:4px 0}' +
      '.msu-success-detail{font-size:12px;color:#999;margin-top:8px!important}';
    document.head.appendChild(style);
  }
})();
