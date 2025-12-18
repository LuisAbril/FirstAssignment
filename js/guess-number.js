(function(){
  // Guess-the-number mini-game: builds its own modal UI and runs entirely client-side
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }

  // Load modal markup from a separate HTML file (keeps HTML out of JS).
  // The modal file is expected to be located next to the HTML pages: "guess-number-modal.html"
  function loadModalHtmlOnce(){
    // if modal already exists, resolve immediately
    if (qs('#gn-modal')) return Promise.resolve(qs('#gn-modal'));
    // fetch the markup relative to the current page
    return fetch('guess-number-modal.html').then(function(res){
      if (!res.ok) throw new Error('Failed to load modal');
      return res.text();
    }).then(function(html){
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      // the file root contains the #gn-modal element; adopt it into the document
      var modal = wrapper.querySelector('#gn-modal');
      if (!modal){
        // fallback: wrap the html
        modal = document.createElement('div');
        modal.id = 'gn-modal';
        modal.innerHTML = html;
      }
      document.body.appendChild(modal);
      return modal;
    }).catch(function(err){
      console.error('Could not load Guess-the-number modal:', err);
      return null;
    });
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
    // ensure modal present (loads html file once) then initialize and open
    loadModalHtmlOnce().then(function(modal){
      if (!modal) return;
      modal.style.display = 'flex';
      var state = {secret: null, max: 100, attempts: [], guessed: new Set()};

      // elements
      var btnNew = qs('#gn-new');
      var btnClose = qs('#gn-close');
      var btnSubmit = qs('#gn-submit');
      var btnReset = qs('#gn-reset');
      var input = qs('#gn-guess');
      var selMax = qs('#gn-max');

      // remove previous listeners if any to avoid duplicates
      // (simple approach: clone nodes and replace)
      function resetListeners(el){
        if (!el) return el;
        var clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        return clone;
      }

      btnNew = resetListeners(btnNew);
      btnClose = resetListeners(btnClose);
      btnSubmit = resetListeners(btnSubmit);
      btnReset = resetListeners(btnReset);
      input = resetListeners(input);

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
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    // attach click to the gallery SVG launcher if present
    var launcher = qs('#guess-number-launcher');
    if (launcher){ launcher.addEventListener('click', function(e){ e.preventDefault(); openGame(); }); launcher.style.cursor='pointer'; }
    // preload modal HTML (non-blocking) so popup opens fast when user clicks
    loadModalHtmlOnce().then(function(){/* preloaded */});
  });
})();
