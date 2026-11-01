// Product image + USD currency overrides for 雪域瑰宝
(function () {
  var RATE = 7; // CNY per USD (approx)
  function toUSD(n) {
    var usd = Number(n) / RATE;
    if (usd >= 100) return Math.round(usd / 5) * 5;
    if (usd >= 20) return Math.round(usd);
    if (usd >= 5) return Math.round(usd * 2) / 2;
    return Math.round(usd * 10) / 10;
  }

  // --- Image path overrides ---
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
      // Convert specs prices CNY -> USD if still large (looks like CNY)
      if (p.specs && p.specs.length) {
        p.specs.forEach(function (s) {
          if (typeof s.price === 'number' && s.price >= 40) {
            s.price = toUSD(s.price);
          }
        });
      }
    });
  }

  // --- Force $ currency in DOM display helpers ---
  // Patch common ¥ → $ on textContent setters if page already loaded patterns
  function swapYenInTree(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf('¥') !== -1) {
        node.nodeValue = node.nodeValue.split('¥').join('$');
      }
    }
  }

  // Replace ¥ in template-rendered areas after brief delay
  function applyCurrency() {
    swapYenInTree(document.body);
    var ids = ['cartTotal', 'payAmount', 'modalPrice'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.textContent) el.textContent = el.textContent.split('¥').join('$');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyCurrency, 50);
      setTimeout(applyCurrency, 400);
    });
  } else {
    setTimeout(applyCurrency, 50);
    setTimeout(applyCurrency, 400);
  }

  // Monkey-patch textContent assignment for cart total if functions exist later
  var _orig = Element.prototype;
  // Safer: observe mutations for ¥
  try {
    var obs = new MutationObserver(function () { applyCurrency(); });
    obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  if (typeof renderProducts === 'function') {
    try { renderProducts(typeof currentFilter !== 'undefined' ? currentFilter : 'all'); } catch (e) {}
  }
})();
