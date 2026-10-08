// Subtle scroll reveal. No libraries, no fuss.
(function () {
  var els = document.querySelectorAll('.feature, .beta .betacopy');
  if (!('IntersectionObserver' in window)) return;
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
})();
