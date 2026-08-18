/**
 * Fahrzeug speichern - Creates a Lead in Salesforce via Web-to-Lead
 * When user clicks "Fahrzeug speichern", a modal captures their info
 * and submits to Salesforce, creating a Lead that becomes an Opportunity.
 */

function saveVehicle(event) {
  event.preventDefault();

  var main = document.querySelector('main');
  var modelName = main ? main.getAttribute('data-model-name') : 'MINI';
  var modelPrice = main ? main.getAttribute('data-model-price') : '';

  // Check if we already have user info saved
  var savedUser = JSON.parse(localStorage.getItem('mini_user') || 'null');
  if (savedUser && savedUser.email) {
    submitWebToLead(savedUser, modelName, modelPrice);
    return;
  }

  showSaveModal(modelName, modelPrice);
}

function showSaveModal(modelName, modelPrice) {
  if (document.getElementById('save-vehicle-modal')) return;

  var modal = document.createElement('div');
  modal.id = 'save-vehicle-modal';
  modal.innerHTML = '<div class="svm-overlay" onclick="closeSaveModal()"></div>' +
    '<div class="svm-dialog">' +
    '<div class="svm-header">' +
    '<h3>Fahrzeug speichern</h3>' +
    '<button onclick="closeSaveModal()" class="svm-close">&times;</button>' +
    '</div>' +
    '<div class="svm-body">' +
    '<p class="svm-subtitle">' + modelName + ' | ' + Number(modelPrice).toLocaleString('de-DE') + ' &euro;</p>' +
    '<p class="svm-text">Speichern Sie dieses Fahrzeug in Ihrer pers&ouml;nlichen Merkliste. Ein MINI Berater wird sich bei Ihnen melden.</p>' +
    '<div class="svm-form">' +
    '<input type="text" id="svm-firstname" placeholder="Vorname" required>' +
    '<input type="text" id="svm-lastname" placeholder="Nachname" required>' +
    '<input type="email" id="svm-email" placeholder="E-Mail-Adresse" required>' +
    '<input type="tel" id="svm-phone" placeholder="Telefonnummer (optional)">' +
    '</div>' +
    '</div>' +
    '<div class="svm-footer">' +
    '<button onclick="closeSaveModal()" class="svm-btn-cancel">Abbrechen</button>' +
    '<button onclick="handleSaveSubmit()" class="svm-btn-save">Fahrzeug speichern</button>' +
    '</div>' +
    '</div>';

  addSaveModalStyles();
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('visible'); }, 10);
}

function closeSaveModal() {
  var modal = document.getElementById('save-vehicle-modal');
  if (modal) {
    modal.classList.remove('visible');
    setTimeout(function() { modal.remove(); }, 200);
  }
}

function handleSaveSubmit() {
  var firstName = document.getElementById('svm-firstname').value.trim();
  var lastName = document.getElementById('svm-lastname').value.trim();
  var email = document.getElementById('svm-email').value.trim();
  var phone = document.getElementById('svm-phone').value.trim();

  if (!firstName || !lastName || !email) {
    alert('Bitte füllen Sie alle Pflichtfelder aus.');
    return;
  }

  var main = document.querySelector('main');
  var modelName = main ? main.getAttribute('data-model-name') : 'MINI';
  var modelPrice = main ? main.getAttribute('data-model-price') : '';

  var userData = { firstName: firstName, lastName: lastName, email: email, phone: phone };
  localStorage.setItem('mini_user', JSON.stringify(userData));

  submitWebToLead(userData, modelName, modelPrice);
  closeSaveModal();
}

function submitWebToLead(userData, modelName, modelPrice) {
  // Salesforce Web-to-Lead OID for storm org
  var oid = '00Dg8000004YllN';

  // Create hidden iframe for form submission
  var iframe = document.createElement('iframe');
  iframe.name = 'w2l_frame';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  var form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
  form.target = 'w2l_frame';

  var fields = {
    'oid': oid,
    'retURL': window.location.href,
    'first_name': userData.firstName,
    'last_name': userData.lastName,
    'email': userData.email,
    'phone': userData.phone || '',
    'company': 'Private',
    'lead_source': 'Web',
    'description': 'Fahrzeug gespeichert: ' + modelName + ' (' + modelPrice + ' EUR)\nElectric Affinity: ' + getElectricAffinity() + '%\nPage Views: ' + getPageViews(),
    '00Ng8000005mVVB': modelName // Custom field: Vehicle_Interest__c (if exists)
  };

  for (var key in fields) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();

  // Fire Salesforce Interactions identity event
  if (window.SalesforceInteractions) {
    SalesforceInteractions.sendEvent({
      interaction: { name: 'VehicleSaved', eventType: 'identity' },
      user: {
        id: userData.email,
        attributes: {
          emailAddress: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      }
    });
  }

  // Show success toast
  showSaveSuccess(modelName);

  // Clean up form/iframe after delay
  setTimeout(function() {
    form.remove();
    iframe.remove();
  }, 5000);
}

function getElectricAffinity() {
  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  var total = (affinity.electric || 0) + (affinity.combustion || 0);
  return total > 0 ? Math.round((affinity.electric / total) * 100) : 0;
}

function getPageViews() {
  var affinity = JSON.parse(localStorage.getItem('mini_affinity') || '{}');
  return affinity.pageViews || 0;
}

function showSaveSuccess(modelName) {
  var toast = document.createElement('div');
  toast.className = 'svm-toast';
  toast.innerHTML = '<div class="svm-toast-icon">&#10003;</div>' +
    '<div class="svm-toast-text">' +
    '<strong>' + modelName + ' gespeichert</strong>' +
    '<span>Ein MINI Berater wird sich in K&uuml;rze bei Ihnen melden.</span>' +
    '</div>';
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('visible'); }, 10);
  setTimeout(function() {
    toast.classList.remove('visible');
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);

  // Update the button to show saved state
  var btn = document.getElementById('saveVehicleBtn');
  if (btn) {
    btn.innerHTML = '&#10003; Fahrzeug gespeichert';
    btn.style.color = '#10b981';
    btn.onclick = null;
  }
}

function addSaveModalStyles() {
  if (document.getElementById('svm-styles')) return;
  var style = document.createElement('style');
  style.id = 'svm-styles';
  style.textContent = '.svm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;opacity:0;transition:opacity .2s}' +
    '#save-vehicle-modal.visible .svm-overlay{opacity:1}' +
    '.svm-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);background:#fff;border-radius:12px;width:400px;max-width:90vw;z-index:10001;box-shadow:0 20px 60px rgba(0,0,0,0.3);opacity:0;transition:all .2s}' +
    '#save-vehicle-modal.visible .svm-dialog{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
    '.svm-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #e5e5e5}' +
    '.svm-header h3{font-size:18px;font-weight:600;margin:0}' +
    '.svm-close{background:none;border:none;font-size:24px;cursor:pointer;color:#666;padding:0 4px}' +
    '.svm-body{padding:20px 24px}' +
    '.svm-subtitle{font-size:14px;font-weight:600;color:#000;margin-bottom:8px}' +
    '.svm-text{font-size:13px;color:#666;margin-bottom:16px;line-height:1.5}' +
    '.svm-form{display:flex;flex-direction:column;gap:12px}' +
    '.svm-form input{padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:none;transition:border-color .2s}' +
    '.svm-form input:focus{border-color:#000}' +
    '.svm-footer{display:flex;justify-content:flex-end;gap:12px;padding:16px 24px;border-top:1px solid #e5e5e5}' +
    '.svm-btn-cancel{padding:8px 16px;background:none;border:1px solid #ddd;border-radius:6px;font-size:14px;cursor:pointer}' +
    '.svm-btn-save{padding:8px 16px;background:#000;color:#b6ff00;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer}' +
    '.svm-btn-save:hover{background:#1a1a1a}' +
    '.svm-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);background:#000;color:#fff;padding:12px 20px;border-radius:8px;display:flex;align-items:center;gap:12px;z-index:10002;opacity:0;transition:all .3s}' +
    '.svm-toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}' +
    '.svm-toast-icon{background:#10b981;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold}' +
    '.svm-toast-text{display:flex;flex-direction:column;gap:2px}' +
    '.svm-toast-text strong{font-size:14px}' +
    '.svm-toast-text span{font-size:12px;color:#aaa}';
  document.head.appendChild(style);
}

window.saveVehicle = saveVehicle;
window.closeSaveModal = closeSaveModal;
window.handleSaveSubmit = handleSaveSubmit;
