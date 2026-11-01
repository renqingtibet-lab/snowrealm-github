// International market USD prices for Qinghai-Tibet specialty products
// Sources: online retail (eBay/Etsy/specialty), wholesale refs, US yak farms. Uncertain = red label.
(function () {
  // id -> { prices: [s1,s2,s3], uncertain: bool }
  var PRICE_MAP = {
    1:  { prices: [280, 650, 1200], uncertain: false }, // Cordyceps ~$28/g mid retail international
    2:  { prices: [48, 88, 195], uncertain: true },     // Beimu - limited int'l quotes
    3:  { prices: [22, 38, 68], uncertain: false },     // Yak butter specialty
    4:  { prices: [16, 28, 48], uncertain: true },      // Curla/curd snack
    5:  { prices: [18, 32, 68], uncertain: false },     // Dried yak meat / jerky class
    6:  { prices: [28, 52, 110], uncertain: true },     // Yellow mushroom wild
    7:  { prices: [9, 16, 32], uncertain: false },      // Fennel / spice
    8:  { prices: [12, 20, 36], uncertain: false },     // Tsampa specialty retail
    9:  { prices: [14, 26, 55], uncertain: true },      // Potentilla / ginseng fruit
    10: { prices: [18, 32, 55], uncertain: true },      // Dairy pastry
    11: { prices: [28, 48, 110], uncertain: false },    // Brick tea specialty
    12: { prices: [24, 42, 72], uncertain: true },      // Barley wine
    13: { prices: [18, 32, 58], uncertain: false },     // Plateau honey
    14: { prices: [16, 32, 55], uncertain: false }      // Tibetan incense
  };

  var SHIP = {
    zh: '\u8fd0\u8d39\u7b49\u522b\u7684\u8d39\u7528\u65e0\u6cd5\u627f\u62c5',
    en: 'We are unable to cover shipping fees and other miscellaneous costs.',
    bo: '\u0f66\u0f90\u0f74\u0f62\u0f0b\u0f42\u0fb3\u0f0b\u0f66\u0f7c\u0f42\u0f66\u0f0b\u0f42\u0f44\u0f0b\u0f63\u0f60\u0f44\u0f0b\u0f60\u0f42\u0f53\u0f0b\u0f58\u0f72\u0f0b\u0f41\u0f74\u0f62\u0f0d'
  };
  var UNCERTAIN = {
    zh: '\u53c2\u8003\u4ef7\uff08\u56fd\u9645\u62a5\u4ef7\u6709\u9650\uff09',
    en: 'Reference price (limited international quotes)',
    bo: '\u0f62\u0f72\u0f53\u0f0b\u0f42\u0f7c\u0f44\u0f0b\u0f61\u0f72\u0f53\u0f0b\u0f58\u0f7a\u0f0d'
  };

  function yenToDollar(s) {
    return String(s).replace(/\u00a5/g, '$').replace(/¥/g, '$');
  }

  function applyPrices() {
    if (typeof products === 'undefined') return;
    products.forEach(function (p) {
      var cfg = PRICE_MAP[p.id];
      if (!cfg || !p.specs) return;
      p.priceUncertain = !!cfg.uncertain;
      p.specs.forEach(function (s, i) {
        if (cfg.prices[i] != null) s.price = cfg.prices[i];
      });
    });
  }

  function fixDom() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && (node.nodeValue.indexOf('\u00a5') >= 0 || node.nodeValue.indexOf('¥') >= 0)) {
        node.nodeValue = yenToDollar(node.nodeValue);
      }
    }
    ['cartTotal', 'payAmount', 'modalPrice'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.textContent) el.textContent = yenToDollar(el.textContent);
    });
    // red labels for uncertain products on cards
    if (typeof products !== 'undefined') {
      products.forEach(function (p) {
        if (!p.priceUncertain) return;
        var cards = document.querySelectorAll('[onclick*="openDetail(' + p.id + ')"]');
        // price spans near product
      });
    }
    document.querySelectorAll('.product-card').forEach(function (card) {
      var onclick = card.innerHTML || '';
      // mark red on price if product uncertain
    });
  }

  function markUncertainRed() {
    if (typeof products === 'undefined') return;
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var label = UNCERTAIN[lang] || UNCERTAIN.zh;
    products.forEach(function (p) {
      if (!p.priceUncertain) return;
      // Find min price display in grid - look for openDetail(id)
      document.querySelectorAll('button, div, span').forEach(function (el) {
        var oc = el.getAttribute && el.getAttribute('onclick');
        if (oc && oc.indexOf('openDetail(' + p.id + ')') >= 0) {
          var card = el.closest('.product-card') || el.closest('[class*="card"]') || el.parentElement;
          if (!card) return;
          if (card.querySelector('.price-uncertain-badge')) return;
          var badge = document.createElement('span');
          badge.className = 'price-uncertain-badge absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full z-10';
          badge.textContent = label;
          var rel = card.querySelector('.relative') || card;
          if (rel && getComputedStyle(rel).position === 'static') rel.style.position = 'relative';
          (card.querySelector('.relative') || card).appendChild(badge);
          // turn price text red
          card.querySelectorAll('.text-gold-600, .font-extrabold').forEach(function (pe) {
            if (pe.textContent && (pe.textContent.indexOf('$') >= 0 || /\d/.test(pe.textContent))) {
              pe.classList.remove('text-gold-600');
              pe.classList.add('text-red-600');
            }
          });
        }
      });
    });
  }

  function ensureShippingNote() {
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    var text = SHIP[lang] || SHIP.zh;
    var cart = document.getElementById('cartSidebar');
    if (cart && !document.getElementById('shipNoteCart')) {
      var box = document.createElement('div');
      box.id = 'shipNoteCart';
      box.className = 'px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 mb-3 mx-5';
      box.textContent = text;
      var totalRow = cart.querySelector('[data-i18n="cart_total"]');
      if (totalRow && totalRow.parentElement && totalRow.parentElement.parentElement) {
        totalRow.parentElement.parentElement.insertBefore(box, totalRow.parentElement);
      }
    } else {
      var el = document.getElementById('shipNoteCart');
      if (el) el.textContent = text;
    }
    if (!document.getElementById('shipNotePage')) {
      var section = document.querySelector('[data-i18n="shopping_notes"]');
      if (section && section.parentElement) {
        var box2 = document.createElement('div');
        box2.id = 'shipNotePage';
        box2.className = 'mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900';
        box2.textContent = text;
        section.parentElement.appendChild(box2);
      }
    } else {
      document.getElementById('shipNotePage').textContent = text;
    }
  }

  var _setLang = window.setLang;
  if (typeof _setLang === 'function') {
    window.setLang = function (lang) {
      _setLang(lang);
      setTimeout(function () { fixDom(); markUncertainRed(); ensureShippingNote(); }, 40);
    };
  }

  function boot() {
    applyPrices();
    if (typeof renderProducts === 'function') {
      try { renderProducts(typeof currentFilter !== 'undefined' ? currentFilter : 'all'); } catch (e) {}
    }
    fixDom();
    markUncertainRed();
    ensureShippingNote();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 0); setTimeout(boot, 250); setTimeout(boot, 700);
    });
  } else {
    setTimeout(boot, 0); setTimeout(boot, 250);
  }
  setInterval(function () { fixDom(); }, 1000);
})();
