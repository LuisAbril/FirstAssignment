(function(){
  // Settings panel: night mode, primary color, font size
  var LS_KEY = 'siteSettings_v1';

  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  
  function loadSettings(){
    try{ var s = localStorage.getItem(LS_KEY); return s? JSON.parse(s): {}; }catch(e){ return {}; }
  }
  function saveSettings(obj){ try{ localStorage.setItem(LS_KEY, JSON.stringify(obj)); }catch(e){ /* ignore */ } }

  function applySettings(s){
    s = s || {};
    var root = document.documentElement;
    // Primary color
    if (s.primaryColor) root.style.setProperty('--primary-color', s.primaryColor);
    // Night mode
    if (s.night){
      root.style.setProperty('--bg-color', '#0b1220');
      root.style.setProperty('--text-color', '#e6eef8');
      root.style.setProperty('--card-bg', '#0f1724');
      root.style.setProperty('--footer-bg', '#071020');
      root.style.setProperty('--menu-bg', '#07102f');
    } else {
      // reset to defaults defined in CSS by removing inline props for these variables
      root.style.removeProperty('--bg-color');
      root.style.removeProperty('--text-color');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--footer-bg');
      root.style.removeProperty('--menu-bg');
    }
    // Font size (px)
    if (s.fontSize) document.body.style.fontSize = s.fontSize + 'px';
    else document.body.style.fontSize = '';
  }

  function createButton(){
    var header = qs('header');
    if (!header) return;
    var btn = document.createElement('button');
    btn.id = 'settings-toggle';
    btn.type = 'button';
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.textContent = 'Settings';
    btn.style.position = 'absolute';
    btn.style.left = '1rem';
    btn.style.top = '0.6rem';
    btn.setAttribute('aria-haspopup','dialog');
    btn.setAttribute('aria-controls','settings-panel');
    // insert at the start of the header so it appears on the left and avoids overlapping the hamburger
    header.insertBefore(btn, header.firstChild);
    return btn;
  }

  function buildPanel(){
    var overlay = document.createElement('div');
    overlay.id = 'settings-panel';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 2200;

    var backdrop = document.createElement('div');
    backdrop.style.position = 'absolute';
    backdrop.style.inset = '0';
    backdrop.style.background = 'rgba(0,0,0,0.45)';
    overlay.appendChild(backdrop);

    var panel = document.createElement('div');
    panel.style.position = 'relative';
    panel.style.maxWidth = '560px';
    panel.style.width = '92%';
    panel.style.background = 'white';
    panel.style.borderRadius = '10px';
    panel.style.padding = '1rem 1.25rem';
    panel.style.boxShadow = '0 14px 40px rgba(0,0,0,0.25)';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','Settings');

    var title = document.createElement('h3');
    title.textContent = 'Settings';
    title.style.marginTop = '0';
    title.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#1565c0';
    panel.appendChild(title);

    var form = document.createElement('form');
    form.id = 'settings-form';
    form.style.display = 'grid';
    form.style.gap = '0.6rem';

    // Night mode
    var nightRow = document.createElement('div');
    nightRow.style.display = 'flex';
    nightRow.style.justifyContent = 'space-between';
    nightRow.style.alignItems = 'center';
    var nightLabel = document.createElement('label');
    nightLabel.textContent = 'Night mode';
    var nightInput = document.createElement('input');
    nightInput.type = 'checkbox';
    nightInput.id = 'settings-night';
    nightRow.appendChild(nightLabel);
    nightRow.appendChild(nightInput);
    form.appendChild(nightRow);

    // Primary color
    var colorRow = document.createElement('div');
    colorRow.style.display = 'flex';
    colorRow.style.justifyContent = 'space-between';
    colorRow.style.alignItems = 'center';
    var colorLabel = document.createElement('label');
    colorLabel.textContent = 'Primary color';
    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'settings-color';
    colorRow.appendChild(colorLabel);
    colorRow.appendChild(colorInput);
    form.appendChild(colorRow);

    // Font size
    var sizeRow = document.createElement('div');
    sizeRow.style.display = 'flex';
    sizeRow.style.justifyContent = 'space-between';
    sizeRow.style.alignItems = 'center';
    var sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Font size';
    var sizeSelect = document.createElement('select');
    sizeSelect.id = 'settings-font';
    ['14','16','18','20'].forEach(function(v){
      var o = document.createElement('option'); o.value = v; o.textContent = v + ' px'; sizeSelect.appendChild(o);
    });
    sizeRow.appendChild(sizeLabel);
    sizeRow.appendChild(sizeSelect);
    form.appendChild(sizeRow);

    panel.appendChild(form);

    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '0.5rem';
    footer.style.marginTop = '0.75rem';

    var btnReset = document.createElement('button'); btnReset.type='button'; btnReset.className='btn btn-outline-secondary'; btnReset.textContent='Reset';
    var btnCancel = document.createElement('button'); btnCancel.type='button'; btnCancel.className='btn btn-secondary'; btnCancel.textContent='Close';
    var btnSave = document.createElement('button'); btnSave.type='button'; btnSave.className='btn btn-primary'; btnSave.textContent='Save';

    footer.appendChild(btnReset); footer.appendChild(btnCancel); footer.appendChild(btnSave);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // wire actions
    function close(){ overlay.style.display='none'; }
    function open(){ overlay.style.display='flex';
      // focus first control
      window.setTimeout(function(){ nightInput.focus(); }, 40);
    }

    btnCancel.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    btnReset.addEventListener('click', function(){
      localStorage.removeItem(LS_KEY);
      // reset inline styles
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--bg-color');
      document.documentElement.style.removeProperty('--text-color');
      document.documentElement.style.removeProperty('--card-bg');
      document.documentElement.style.removeProperty('--footer-bg');
      document.documentElement.style.removeProperty('--menu-bg');
      document.body.style.fontSize = '';
      // update controls
      nightInput.checked = false; colorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#1565c0';
      sizeSelect.value = '16';
      close();
    });

    btnSave.addEventListener('click', function(){
      var s = { night: !!nightInput.checked, primaryColor: colorInput.value, fontSize: parseInt(sizeSelect.value,10) };
      saveSettings(s); applySettings(s); close();
    });

    // expose open/close and elements for initialization
    return {open:open, close:close, elements:{night:nightInput,color:colorInput,size:sizeSelect}};
  }

  // init
  document.addEventListener('DOMContentLoaded', function(){
    var btn = createButton();
    var panel = buildPanel();
    if (btn) btn.addEventListener('click', panel.open);
    // populate from storage
    var s = loadSettings();
    applySettings(s);
    // set controls values after a short tick so computed styles available
    window.setTimeout(function(){
      var el = panel.elements;
      if (!el) return;
      el.night.checked = !!s.night;
      var currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#1565c0';
      try{ if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(currentPrimary)) el.color.value = currentPrimary; else el.color.value = '#1565c0'; }catch(e){ el.color.value = '#1565c0'; }
      el.size.value = s.fontSize? String(s.fontSize) : '16';
    },50);
  });
})();
