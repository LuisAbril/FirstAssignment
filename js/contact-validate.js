// Client-side validation for contact form
(function(){
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function showError(input, msg){
    input.classList.add('is-invalid');
    var next = input.nextElementSibling;
    if (!next || !next.classList || !next.classList.contains('invalid-feedback')){
      var small = document.createElement('div');
      small.className = 'invalid-feedback';
      small.style.color = '#b00020';
      small.style.fontSize = '0.95rem';
      small.style.marginTop = '0.35rem';
      input.parentNode.insertBefore(small, input.nextSibling);
      next = small;
    }
    next.textContent = msg;
    next.setAttribute('role','alert');
  }
  function clearError(input){
    input.classList.remove('is-invalid');
    var next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains('invalid-feedback')){
      next.parentNode.removeChild(next);
    }
  }
  function isEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var form = qs('#contact-form');
    if (!form) return;

    var fldName = qs('#name', form);
    var fldEmail = qs('#email', form);
    var fldProject = qs('#project-type', form);
    var fldMessage = qs('#message', form);

    // Live validation on input/change
    [fldName, fldEmail, fldProject, fldMessage].forEach(function(f){
      if (!f) return;
      f.addEventListener('input', function(){ clearError(f); });
      f.addEventListener('change', function(){ clearError(f); });
    });

    form.addEventListener('submit', function(e){
      var valid = true;
      // Name: required, min 3
      if (!fldName || !fldName.value || fldName.value.trim().length < 3){
        valid = false;
        if (fldName) showError(fldName, 'Please enter your name (at least 3 characters).');
      }
      // Email: required, simple pattern
      if (!fldEmail || !fldEmail.value || !isEmail(fldEmail.value.trim())){
        valid = false;
        if (fldEmail) showError(fldEmail, 'Please enter a valid email address.');
      }
      // Project type: required (select default is empty)
      if (!fldProject || !fldProject.value){
        valid = false;
        if (fldProject) showError(fldProject, 'Please select a project type.');
      }
      // Message: optional but if present require at least 10 chars
      if (fldMessage && fldMessage.value && fldMessage.value.trim().length > 0 && fldMessage.value.trim().length < 10){
        valid = false;
        showError(fldMessage, 'Message is too short (minimum 10 characters).');
      }

      if (!valid){
        e.preventDefault();
        // focus first invalid
        var first = form.querySelector('.is-invalid');
        if (first) first.focus();
        return;
      }

      // If valid: prevent default submission and show a confirmation box with the data
      e.preventDefault();
      var services = qs('#services', form);
      var newsletter = form.querySelector('input[name="newsletter"]');
      var data = {
        name: fldName ? fldName.value.trim() : '',
        email: fldEmail ? fldEmail.value.trim() : '',
        project: fldProject ? fldProject.value : '',
        services: services ? services.value : '',
        newsletter: newsletter ? (newsletter.checked ? 'Yes' : 'No') : 'No',
        message: fldMessage ? fldMessage.value.trim() : ''
      };

      // build HTML summary
      var html = '<div style="font-family:inherit; color:var(--text-color);">' +
        '<h3 style="margin-top:0; color:var(--primary-color);">Confirm submission</h3>' +
        '<dl style="margin:0;">' +
          '<dt style="font-weight:700; margin-top:0.5rem;">Name</dt><dd>' + escapeHtml(data.name) + '</dd>' +
        '<dt style="font-weight:700; margin-top:0.5rem;">Email</dt><dd>' + escapeHtml(data.email) + '</dd>' +
        '<dt style="font-weight:700; margin-top:0.5rem;">Project</dt><dd>' + escapeHtml(data.project) + '</dd>' +
        '<dt style="font-weight:700; margin-top:0.5rem;">Services</dt><dd>' + escapeHtml(data.services) + '</dd>' +
        '<dt style="font-weight:700; margin-top:0.5rem;">Newsletter</dt><dd>' + escapeHtml(data.newsletter) + '</dd>' +
        '<dt style="font-weight:700; margin-top:0.5rem;">Message</dt><dd>' + (data.message ? escapeHtml(data.message) : '<em>No message</em>') + '</dd>' +
        '</dl>' +
        '</div>';

      showModal(html, function onConfirm(){
        // After user confirms, submit the form (if action exists) or reset and show a tiny success note
        if (form.getAttribute('action')){
          form.submit();
        } else {
          // show a short success notification inside the modal replacement
          showModal('<div style="font-family:inherit; color:var(--text-color);"><h3 style="color:var(--primary-color)">Sent</h3><p>Your information has been recorded (demo).</p></div>', function(){ form.reset(); });
        }
      });
    });
  });
})();

// Utility: escape HTML to avoid injection when inserting strings
function escapeHtml(str){
  if (!str) return '';
  return String(str).replace(/[&<>"'\/]/g, function(s){
    var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/':'&#x2F;' };
    return entityMap[s];
  });
}

// Simple modal implementation (no external deps). showModal(contentHTML, onConfirm)
function showModal(contentHTML, onConfirm){
  // remove existing modal if present
  var existing = document.getElementById('__simple_modal');
  if (existing) existing.parentNode.removeChild(existing);

  var overlay = document.createElement('div');
  overlay.id = '__simple_modal';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.45)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 2100;

  var box = document.createElement('div');
  box.style.maxWidth = '680px';
  box.style.width = '94%';
  box.style.background = 'white';
  box.style.borderRadius = '10px';
  box.style.padding = '1rem 1.25rem';
  box.style.boxShadow = '0 12px 36px rgba(0,0,0,0.28)';
  box.style.boxSizing = 'border-box';
  box.innerHTML = contentHTML;

  var footer = document.createElement('div');
  footer.style.textAlign = 'right';
  footer.style.marginTop = '1rem';

  var btnCancel = document.createElement('button');
  btnCancel.type = 'button';
  btnCancel.textContent = 'Close';
  btnCancel.style.marginRight = '0.5rem';
  btnCancel.className = 'btn btn-secondary';
  btnCancel.addEventListener('click', function(){ document.body.removeChild(overlay); });

  var btnOk = document.createElement('button');
  btnOk.type = 'button';
  btnOk.textContent = 'Confirm';
  btnOk.className = 'btn btn-primary';
  btnOk.addEventListener('click', function(){
    document.body.removeChild(overlay);
    if (typeof onConfirm === 'function') onConfirm();
  });

  footer.appendChild(btnCancel);
  footer.appendChild(btnOk);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
