(function(){
  // Guess-the-number mini-game: builds its own modal UI and runs entirely client-side
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }

  function createModal() {
    var existing = qs('#gn-modal'); if (existing) return existing;
    var overlay = document.createElement('div');
    overlay.id = 'gn-modal';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2400';
    overlay.style.background = 'rgba(0,0,0,0.45)';

    var box = document.createElement('div');
    box.style.width = 'min(720px, 96%)';
    box.style.background = 'var(--card-bg, #fff)';
    box.style.color = 'var(--text-color, #222)';
    box.style.borderRadius = '10px';
    box.style.padding = '1rem';
    box.style.boxShadow = '0 16px 44px rgba(0,0,0,0.28)';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
  box.setAttribute('aria-label','Guess the Number');

    box.innerHTML = '' +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:1rem">' +
        '<h3 style="margin:0; color:var(--primary-color)">Guess the Number</h3>' +
        '<div>' +
          '<button id="gn-close" class="btn btn-sm btn-secondary" type="button">Close</button>' +
        '</div>' +
      '</div>' +
      '<p style="margin:.5rem 0 1rem 0;">Think of a number between <strong id="gn-range">1 and 100</strong>. Click <em>New game</em> to generate the secret number and start guessing.</p>' +
      '<div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap">' +
    '<button id="gn-new" class="btn btn-primary btn-sm" type="button">New game</button>' +
    '<label style="margin:0 0.25rem 0 0;">Max:</label>' +
        '<select id="gn-max" class="form-select form-select-sm" style="width:110px; display:inline-block;">' +
          '<option value="50">50</option>' +
          '<option value="100" selected>100</option>' +
          '<option value="200">200</option>' +
        '</select>' +
      '</div>' +
      '<hr>' +
      '<div style="display:flex; gap:1rem; align-items:center; margin-bottom:.5rem; flex-wrap:wrap">' +
    '<input id="gn-guess" class="form-control form-control-sm" type="number" placeholder="Enter a number" style="width:160px; display:inline-block;">' +
  '<button id="gn-submit" class="btn btn-success btn-sm" type="button">Guess</button>' +
  '<button id="gn-reset" class="btn btn-outline-secondary btn-sm" type="button">Reset history</button>' +
      '</div>' +
      '<div id="gn-msg" style="min-height:1.25rem; margin-bottom:.5rem; color:var(--primary-color)"></div>' +
      '<div style="display:flex; gap:1rem; flex-wrap:wrap">' +
        '<div style="flex:1 1 240px">' +
          '<h5 style="margin:0 0 .35rem 0; font-size:0.95rem">Log</h5>' +
          '<div id="gn-log" style="max-height:160px; overflow:auto; padding:.5rem; background:rgba(0,0,0,0.03); border-radius:6px;"></div>' +
        '</div>' +
        '<div style="width:160px">' +
            '<h5 style="margin:0 0 .35rem 0; font-size:0.95rem">Attempts</h5>' +
          '<div id="gn-stats" style="padding:.5rem; background:rgba(0,0,0,0.03); border-radius:6px;"></div>' +
        '</div>' +
      '</div>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    return overlay;
  }

  function startGame(state){
    state.max = parseInt(qs('#gn-max').value, 10) || 100;
    state.secret = Math.floor(Math.random() * state.max) + 1;
    state.attempts = [];
    state.guessed = new Set();
    qs('#gn-range').textContent = '1 and ' + state.max;
    qs('#gn-msg').textContent = 'Game started — good luck!';
    updateUI(state);
  }

  function updateUI(state){
    var stats = qs('#gn-stats');
    var log = qs('#gn-log');
    stats.innerHTML = '<strong>Total:</strong> ' + state.attempts.length ;
    log.innerHTML = state.attempts.map(function(a,i){
      var cls = a.result === 'ok' ? 'color:var(--primary-color)' : 'color:#333';
      return '<div style="font-size:.95rem; margin-bottom:.25rem; '+cls+'">' + (i+1) + '. ' + a.value + ' — ' + a.resultText + '</div>';
    }).join('');
  }

  function addLog(state, value, result, resultText){
    state.attempts.push({value: value, result: result, resultText: resultText});
    state.guessed.add(value);
    updateUI(state);
  }

  function openGame(){
    var modal = createModal();
    modal.style.display = 'flex';
    var state = {secret: null, max: 100, attempts: [], guessed: new Set()};

    // elements
    var btnNew = qs('#gn-new');
    var btnClose = qs('#gn-close');
    var btnSubmit = qs('#gn-submit');
    var btnReset = qs('#gn-reset');
    var input = qs('#gn-guess');
    var selMax = qs('#gn-max');

    // wire
    btnNew.addEventListener('click', function(){
      startGame(state);
      input.disabled = false; input.focus();
    });
    btnClose.addEventListener('click', function(){ modal.style.display = 'none'; });
    btnReset.addEventListener('click', function(){ state.attempts = []; state.guessed = new Set(); updateUI(state); qs('#gn-msg').textContent = 'History cleared.'; });

    function submitGuess(){
    var raw = input.value; if (!raw) return; var v = parseInt(raw,10); if (isNaN(v)) { qs('#gn-msg').textContent = 'Please enter a valid number.'; return; }
    if (v < 1 || v > state.max){ qs('#gn-msg').textContent = 'Enter a number between 1 and ' + state.max; return; }
    if (state.guessed.has(v)) { qs('#gn-msg').textContent = 'You already tried ' + v + '. Try another one.'; return; }
    if (state.secret === null){ qs('#gn-msg').textContent = 'Click "New game" to generate the secret number.'; return; }

      if (v === state.secret){
    addLog(state, v, 'ok', 'Correct ✅');
    qs('#gn-msg').textContent = 'Correct! You guessed it in ' + state.attempts.length + ' attempt(s).';
        input.disabled = true;
      } else if (v < state.secret){
      addLog(state, v, 'low', 'Too low ↑');
      qs('#gn-msg').textContent = 'Too low.';
      } else {
      addLog(state, v, 'high', 'Too high ↓');
      qs('#gn-msg').textContent = 'Too high.';
      }
      input.value = '';
      input.focus();
    }

    btnSubmit.addEventListener('click', submitGuess);
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); submitGuess(); } });

    // start default game so user can play immediately
    startGame(state);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // attach click to the gallery SVG launcher if present
    var launcher = qs('#guess-number-launcher');
    if (launcher){ launcher.addEventListener('click', function(e){ e.preventDefault(); openGame(); }); launcher.style.cursor='pointer'; }
  });
})();
