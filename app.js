// Subtle scroll reveal. No libraries, no fuss.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Top bar contracts into a floating pill on scroll.
  var bar = document.querySelector('.topbar');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      bar.classList.toggle('scrolled', window.scrollY > 48);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Single-page site: highlight the section in the middle of the screen,
  // and scroll section links to the centre instead of the top.
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.topbar nav a'));
    var byHash = {};
    links.forEach(function (a) { byHash[a.getAttribute('href')] = a; });
    // Sliding highlight: glides to the active link with a squash.
    var nav = document.querySelector('.topbar nav');
    var hi = document.createElement('span');
    hi.className = 'navhi';
    hi.style.width = '0';
    nav.appendChild(hi);
    function moveHi(a) {
      if (!a || !a.offsetWidth) { hi.style.width = '0'; return; }
      hi.style.left = (a.offsetLeft - 7) + 'px';
      hi.style.width = (a.offsetWidth + 14) + 'px';
      hi.classList.remove('squash');
      void hi.offsetWidth;
      hi.classList.add('squash');
    }
    window.addEventListener('resize', function () {
      moveHi(document.querySelector('.topbar nav a.on'));
    });
    window.addEventListener('load', function () {
      moveHi(document.querySelector('.topbar nav a.on'));
    });
    Array.prototype.slice.call(document.querySelectorAll('.topbar nav a, .ghostlink')).forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      });
    });
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            links.forEach(function (x) { x.classList.remove('on'); });
            var a = byHash['#' + e.target.id];
            if (a) {
              a.classList.add('on');
              moveHi(a);
            }
          });
        },
        { rootMargin: '-42% 0px -42% 0px' }
      );
      document.querySelectorAll('main section[id], .hero').forEach(function (s) { sio.observe(s); });
    }
  })();

  var els = document.querySelectorAll('.hero, .feature, .beta .betacopy, .indexsec, .minicta, .pager');
  function dropKids(el) {
    var kids = el.querySelectorAll(
      '.herocopy > *, .heromock > *, .fcopy > *, .fmock > *, .betacopy > *, .minicta > *, .indexcard'
    );
    kids.forEach(function (k, i) {
      if (reduce) return;
      k.classList.add('drop');
      setTimeout(function () { k.classList.add('in'); }, 90 * Math.min(i, 8));
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            dropKids(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
    // Safety net: never leave content hidden if observation misbehaves.
    setTimeout(function () {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('in');
        el.querySelectorAll('.drop').forEach(function (k) { k.classList.add('in'); });
      });
    }, 2500);
  }

  // Count-up numbers when they scroll into view.
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    if (reduce) {
      el.textContent = el.getAttribute('data-count');
      return;
    }
    var target = Number(el.getAttribute('data-count'));
    var t0 = performance.now();
    var dur = 1100;
    function frame(t) {
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countUp(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  // Quest bars fill when visible.
  document.querySelectorAll('.questbar span[data-w]').forEach(function (el) {
    function fill() { el.style.width = el.getAttribute('data-w') + '%'; }
    if (reduce || !('IntersectionObserver' in window)) { fill(); return; }
    var qio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fill(); qio.disconnect(); }
      });
    }, { threshold: 0.4 });
    qio.observe(el);
  });

  // Quiz mock: options and grades respond to taps.
  document.querySelectorAll('.flash .opts span, .flash .grade span').forEach(function (el) {
    el.addEventListener('click', function () {
      var sibs = el.parentElement.querySelectorAll('span');
      sibs.forEach(function (s) { s.classList.remove('sel'); });
      el.classList.add('sel');
    });
  });

  // Live chat demo: typing dots, then the message. Loops quietly.
  var demo = document.getElementById('chatdemo');
  if (demo) {
    var log = demo.querySelector('.chatlog');
    var typing = demo.querySelector('.chattyping');
    var script = [
      { who: 'them', text: 'did you review yet?' },
      { who: 'me', text: 'just finished. your turn' },
      { who: 'them', text: 'on it, streak saved' },
      { who: 'me', text: 'see you tomorrow' }
    ];
    function bubble(who, text) {
      var p = document.createElement('p');
      p.className = 'bubble ' + who;
      p.textContent = text;
      return p;
    }
    if (reduce) {
      script.forEach(function (line) { log.appendChild(bubble(line.who, line.text)); });
    } else {
      var i = 0;
      function step() {
        if (i >= script.length) {
          setTimeout(function () { log.innerHTML = ''; i = 0; step(); }, 3600);
          return;
        }
        typing.classList.add('show');
        setTimeout(function () {
          typing.classList.remove('show');
          log.appendChild(bubble(script[i].who, script[i].text));
          while (log.children.length > 4) log.removeChild(log.firstChild);
          i++;
          setTimeout(step, 1300);
        }, 900);
      }
      var dio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { step(); dio.disconnect(); }
        });
      }, { threshold: 0.3 });
      dio.observe(demo);
    }
  }
})();
