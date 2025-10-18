// assets/js/counter.js
(function () {
  function init(el) {
    if (!window.Waypoint) return; // waypoints not loaded
    if (el.__counterWaypointInitialized) return;
    el.__counterWaypointInitialized = true;

    var contextEl = document.querySelector(".content-wrapper") || window;

    new Waypoint({
      element: el,
      handler: function () {
        // jQuery counter anim
        window.$ &&
          $(".counter-value").each(function () {
            var $this = $(this);
            var countTo = parseInt($this.attr("data-count"), 10) || 0;
            var startVal = parseInt($this.text(), 10) || 0;
            $({ countNum: startVal }).animate(
              { countNum: countTo },
              {
                duration: 2000,
                easing: "swing",
                step: function (now) {
                  $this.text(Math.floor(now));
                },
                complete: function () {
                  $this.text(countTo);
                },
              }
            );
          });
        this.destroy();
      },
      offset: "70%",
      context: contextEl,
    });
  }

  function tryInit() {
    var el = document.getElementById("counter");
    if (el) {
      init(el);
      return true;
    }
    return false;
  }

  // Run on load
  window.addEventListener("load", function () {
    if (tryInit()) return;

    // If not present yet (SPA), observe DOM for it
    var mo = new MutationObserver(function () {
      if (tryInit()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Optional: also listen to SPA route events if you emit one
    window.addEventListener("spa:navigated", tryInit);
  });
})();
