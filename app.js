// Subtle scroll reveal. No libraries, no fuss.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var els = document.querySelectorAll('.feature, .beta .betacopy');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
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
