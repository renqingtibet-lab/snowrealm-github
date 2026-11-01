// USD currency + shipping note for products page
(function () {
  var RATE = 7;
  function toUSD(n) {
    var usd = Number(n) / RATE;
    if (usd >= 100) return Math.round(usd / 5) * 5;
    if (usd >= 20) return Math.round(usd);
    if (usd >= 5) return Math.round(usd * 2) / 2;
    return Math.round(usd * 10) / 10;
  }
  var SHIP = {
    zh: '\u8fd0\u8d39\u7b49\u522b\u7684\u8d39\u7528\u65e0\u6cd5\u627f\u62c5',
    en: 'We are unable to cover shipping fees and other miscellaneous costs.',
    bo: '\u0f66\u0f90\u0f74\u0f62\u0f0b\u0f42\u0fb3\u0f0b\u0f66\u0f7c\u0f42\u0f66\u0f0b\u0f42\u0f44\u0f0b\u0f63\u0f60\u0f44\u0f0b\u0f60\u0f42\u0f53\u0f0b\u0f58\u0f72\u0f0b\u0f41\u0f74\u0f62\u0f0d'
  };
  function yenToDollar(s) {
    return String(s).split('\u00a5').join('$').split('\u00a5').join('$').replace(/\u00a5/g,'$').replace(/¥/g,'$');
  }
  function convertProducts() {
    if (typeof products === 'undefined') return;
    products.forEach(function (p) {
      if (p.specs) {
        p.specs.forEach(function (s) {
          if (typeof s.price === 'number' && s.price >= 40) s.price = toUSD(s.price);
        });
      }
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
      setTimeout(function () { fixDom(); ensureShippingNote(); }, 30);
    };
  }
  function boot() {
    convertProducts();
    if (typeof renderProducts === 'function') {
      try { renderProducts(typeof currentFilter !== 'undefined' ? currentFilter : 'all'); } catch (e) {}
    }
    fixDom();
    ensureShippingNote();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 0); setTimeout(boot, 200); setTimeout(boot, 600);
    });
  } else {
    setTimeout(boot, 0); setTimeout(boot, 200);
  }
  setInterval(function () { fixDom(); }, 800);
})();
