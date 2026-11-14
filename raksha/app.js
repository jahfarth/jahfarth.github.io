/* Raksha app wiring: language switching, analysis, voice in/out,
 * WhatsApp sharing and the live self-test. All client-side. */
(function () {
  'use strict';
  var I18N = window.RAKSHA_I18N, REASONS = window.RAKSHA_REASONS;
  var SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN', ml: 'ml-IN' };
  var lang = localStorage.getItem('raksha-lang') || 'en';
  var lastResult = null, lastText = '';

  var EXAMPLES = [
    window.RAKSHA_CORPUS[0].text,  // digital arrest call
    window.RAKSHA_CORPUS[4].text,  // KBC lottery
    window.RAKSHA_CORPUS[14].text  // genuine bank SMS
  ];

  function $(id) { return document.getElementById(id); }
  function t() { return I18N[lang]; }

  function setLang(l) {
    lang = l;
    localStorage.setItem('raksha-lang', l);
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === l);
    });
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t()[key]) el.textContent = t()[key];
    });
    $('inputText').placeholder = t().placeholder;
    // example chips
    document.querySelectorAll('.chip').forEach(function (chip, i) {
      chip.textContent = t().examples[i];
    });
    // stats
    $('stats').innerHTML = t().stats.map(function (s) {
      return '<div class="stat"><b>' + s.n + '</b><span>' + s.t + '</span></div>';
    }).join('');
    // action steps
    $('actionsList').innerHTML = t().actions.map(function (a) {
      return '<li>' + a + '</li>';
    }).join('');
    if (lastResult) renderResult(lastResult);
  }

  function renderResult(r) {
    var s = t();
    var banner = $('verdictBanner'), word = $('verdictWord'), sub = $('verdictSub');
    var cls = r.verdict === 'SCAM' ? 'scam' : r.verdict === 'SUSPICIOUS' ? 'suspicious' : 'safe';
    banner.className = 'verdict ' + cls;
    word.textContent = r.verdict === 'SCAM' ? s.verdictSCAM : r.verdict === 'SUSPICIOUS' ? s.verdictSUSPICIOUS : s.verdictSAFE;
    sub.textContent = r.verdict === 'SCAM' ? s.verdictSubSCAM : r.verdict === 'SUSPICIOUS' ? s.verdictSubSUSPICIOUS : s.verdictSubSAFE;
    var fill = $('meterFill');
    fill.className = 'meter-fill ' + cls;
    fill.style.width = Math.min(100, r.score) + '%';
    $('daAlert').hidden = !r.digitalArrest;
    var reasons = r.hits.map(function (h) { return REASONS[lang][h]; }).filter(Boolean);
    if (!reasons.length && r.verdict === 'SAFE') reasons = [s.verdictSubSAFE];
    $('reasonsList').innerHTML = reasons.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $('result').hidden = false;
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function runCheck() {
    var text = $('inputText').value.trim();
    if (!text) {
      $('inputMsg').textContent = t().emptyInput;
      $('inputMsg').hidden = false;
      return;
    }
    $('inputMsg').hidden = true;
    lastText = text;
    lastResult = window.RakshaEngine.analyze(text);
    renderResult(lastResult);
  }

  // Voice input (Web Speech API — runs in the browser, nothing uploaded)
  var recog = null;
  function toggleMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      $('inputMsg').textContent = t().noSpeech;
      $('inputMsg').hidden = false;
      return;
    }
    if (recog) { recog.stop(); return; }
    recog = new SR();
    recog.lang = SPEECH_LANG[lang];
    recog.interimResults = true;
    recog.continuous = false;
    var base = $('inputText').value;
    $('micBtn').textContent = t().micListening;
    recog.onresult = function (e) {
      var out = '';
      for (var i = 0; i < e.results.length; i++) out += e.results[i][0].transcript;
      $('inputText').value = (base ? base + ' ' : '') + out;
    };
    recog.onend = recog.onerror = function () {
      recog = null;
      $('micBtn').textContent = t().micBtn;
    };
    recog.start();
  }

  // Spoken verdict — for users who cannot read the result comfortably.
  function speakVerdict() {
    if (!lastResult || !('speechSynthesis' in window)) return;
    var s = t();
    var word = lastResult.verdict === 'SCAM' ? s.verdictSCAM : lastResult.verdict === 'SUSPICIOUS' ? s.verdictSUSPICIOUS : s.verdictSAFE;
    var sub = lastResult.verdict === 'SCAM' ? s.verdictSubSCAM : lastResult.verdict === 'SUSPICIOUS' ? s.verdictSubSUSPICIOUS : s.verdictSubSAFE;
    var text = word + '. ' + sub + (lastResult.digitalArrest ? ' ' + s.digitalArrestBody : '') + ' ' + s.actions[2];
    var u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[lang];
    var voices = speechSynthesis.getVoices();
    var v = voices.find(function (x) { return x.lang === SPEECH_LANG[lang]; }) ||
            voices.find(function (x) { return x.lang && x.lang.indexOf(lang) === 0; });
    if (v) u.voice = v;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  // Family share: one tap sends the verdict to a family WhatsApp chat —
  // the person most likely to stop a scam in progress is a family member.
  function shareVerdict() {
    if (!lastResult) return;
    var s = t();
    var word = lastResult.verdict === 'SCAM' ? s.verdictSCAM : lastResult.verdict === 'SUSPICIOUS' ? s.verdictSUSPICIOUS : s.verdictSAFE;
    var reasons = lastResult.hits.slice(0, 3).map(function (h) { return REASONS[lang][h]; }).filter(Boolean);
    var msg = s.shareText + word + '\n' + reasons.join('\n') + '\n' + s.actions[2] + '\n' + location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }

  // Live self-test: the same corpus the Node test uses.
  function runSelfTest() {
    var corpus = window.RAKSHA_CORPUS;
    var pass = 0, scamTotal = 0, scamCaught = 0, safeTotal = 0, safeOk = 0;
    var rows = corpus.map(function (c) {
      var r = window.RakshaEngine.analyze(c.text);
      var ok = r.verdict === c.expect;
      if (ok) pass++;
      if (c.expect === 'SCAM') { scamTotal++; if (r.verdict === 'SCAM') scamCaught++; }
      if (c.expect === 'SAFE') { safeTotal++; if (r.verdict === 'SAFE') safeOk++; }
      return '<div class="st-row"><span>' + c.label + ' → ' + r.verdict + '</span><span class="' +
        (ok ? 'st-pass">✓ PASS' : 'st-fail">✗ FAIL') + '</span></div>';
    }).join('');
    $('selfTestOut').innerHTML =
      '<p class="st-summary">' + pass + '/' + corpus.length + ' correct · Scams caught: ' +
      scamCaught + '/' + scamTotal + ' · False alarms on genuine messages: ' +
      (safeTotal - safeOk) + '/' + safeTotal + '</p>' + rows;
  }

  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $('inputText').value = EXAMPLES[Number(chip.getAttribute('data-example'))];
      runCheck();
    });
  });
  $('checkBtn').addEventListener('click', runCheck);
  $('micBtn').addEventListener('click', toggleMic);
  $('speakBtn').addEventListener('click', speakVerdict);
  $('shareBtn').addEventListener('click', shareVerdict);
  $('selfTestBtn').addEventListener('click', runSelfTest);

  setLang(lang);
})();
