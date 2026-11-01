// Product image + USD overrides; also loads currency-fix.js
(function () {
  // load currency-fix.js once
  if (!document.querySelector('script[src="currency-fix.js"]')) {
    var s = document.createElement('script');
    s.src = 'currency-fix.js';
    document.head.appendChild(s);
  }

  var RATE = 7;
  function toUSD(n) {
    var usd = Number(n) / RATE;
    if (usd >= 100) return Math.round(usd / 5) * 5;
    if (usd >= 20) return Math.round(usd);
    if (usd >= 5) return Math.round(usd * 2) / 2;
    return Math.round(usd * 10) / 10;
  }

  if (typeof products !== 'undefined') {
    var map = {
      3: { img: 'images/butter-tea-pot.jpg' },
      10: { img: 'images/pastry-dates.jpg', img2: 'images/pastry-knot.jpg', placeholder: false },
      13: { img: 'images/honey-plateau.jpg', img2: 'images/honey-plateau.jpg', placeholder: false }
    };
    products.forEach(function (p) {
      var o = map[p.id];
      if (o) {
        if (o.img) p.img = o.img;
        if (o.img2) p.img2 = o.img2;
        if (o.placeholder === false) delete p.placeholder;
      }
      if (p.specs && p.specs.length) {
        p.specs.forEach(function (s) {
          if (typeof s.price === 'number' && s.price >= 40) s.price = toUSD(s.price);
        });
      }
    });
  }

  function applyCurrency() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf('\u00a5') !== -1) {
        node.nodeValue = node.nodeValue.split('\u00a5').join('$');
      }
      if (node.nodeValue && node.nodeValue.indexOf('¥') !== -1) {
        node.nodeValue = node.nodeValue.split('¥').join('$');
      }
    }
    ['cartTotal', 'payAmount', 'modalPrice'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.textContent) {
        el.textContent = el.textContent.split('\u00a5').join('$').split('¥').join('$');
      }
    });
  }

  function boot() {
    if (typeof renderProducts === 'function') {
      try { renderProducts(typeof currentFilter !== 'undefined' ? currentFilter : 'all'); } catch (e) {}
    }
    applyCurrency();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50);
      setTimeout(boot, 400);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 400);
  }
  try {
    new MutationObserver(function () { applyCurrency(); }).observe(document.documentElement, {
      childList: true, subtree: true, characterData: true
    });
  } catch (e) {}
})();
