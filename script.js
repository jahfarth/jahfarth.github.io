// Jahfar T H — portfolio v2 interactions
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  // Mobile nav
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // Nav background on scroll
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll (with a light stagger per parent)
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  revealEls.forEach(function (el) {
    var siblings = Array.prototype.slice.call(el.parentNode.children).filter(function (c) {
      return c.classList && c.classList.contains('reveal');
    });
    var idx = siblings.indexOf(el);
    el.style.transitionDelay = Math.min(idx, 5) * 80 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Animated counters
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  // Drifting ember particles (the reel's signature ambient layer)
  var canvas = document.getElementById('embers');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W, H, parts = [];
    var COUNT = window.innerWidth < 700 ? 34 : 64;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function make(init) {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + 8,
        r: 0.6 + Math.random() * 1.9,
        s: 0.18 + Math.random() * 0.55,
        drift: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        hue: 12 + Math.random() * 22
      };
    }
    function init() {
      resize();
      parts = [];
      for (var i = 0; i < COUNT; i++) parts.push(make(true));
    }
    var running = true;
    function tick() {
      if (running) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.s;
          p.x += p.drift + Math.sin(p.phase += 0.008) * 0.16;
          if (p.y < -10 || p.x < -10 || p.x > W + 10) parts[i] = p = make(false);
          var flicker = 0.35 + 0.3 * Math.sin(p.phase * 2.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 58%, ' + flicker.toFixed(3) + ')';
          ctx.shadowColor = 'rgba(255,70,25,.8)';
          ctx.shadowBlur = 7;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });
    window.addEventListener('resize', init);
    init();
    tick();
  }
})();
