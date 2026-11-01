// International market USD prices + shipping note + WeChat ID (no QR)
(function () {
  var PRICE_MAP = {
    1:  { prices: [280, 650, 1200], uncertain: false },
    2:  { prices: [48, 88, 195], uncertain: true },
    3:  { prices: [22, 38, 68], uncertain: false },
    4:  { prices: [16, 28, 48], uncertain: true },
    5:  { prices: [18, 32, 68], uncertain: false },
    6:  { prices: [28, 52, 110], uncertain: true },
    7:  { prices: [9, 16, 32], uncertain: false },
    8:  { prices: [12, 20, 36], uncertain: false },
    9:  { prices: [14, 26, 55], uncertain: true },
    10: { prices: [18, 32, 55], uncertain: true },
    11: { prices: [28, 48, 110], uncertain: false },
    12: { prices: [24, 42, 72], uncertain: true },
    13: { prices: [18, 32, 58], uncertain: false },
    14: { prices: [16, 32, 55], uncertain: false }
  };

  var WECHAT_ID = 'renqingtibet';

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
  var WECHAT_TIP = {
    zh: '\u8bf7\u6dfb\u52a0\u5fae\u4fe1\u53f7\u8054\u7cfb\u5e76\u5b8c\u6210\u652f\u4ed8',
    en: 'Please add WeChat ID to contact and complete payment',
    bo: '\u0f62\u0f66\u0f0b\u0f66\u0fa4\u0f92\u0fb2\u0f7c\u0f51\u0f0b\u0f66\u0fa4\u0f63\u0f0d'
  };

  function yenToDollar(s) {
    return String(s).replace(/\u00a5/g, '$').replace(/\u00a5/g, '$').replace(/¥/g, '$');
  }

  function lang() {
    return (typeof currentLang !== 'undefined') ? currentLang : 'zh';
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
  }

  function makeShipBox(id) {
    var box = document.createElement('div');
    box.id = id;
    box.className = 'px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900 font-medium';
    box.style.cssText = 'white-space:pre-line;line-height:1.6;';
    box.textContent = SHIP.zh + '\n' + SHIP.en + '\n' + SHIP.bo;
    return box;
  }

  function ensureShippingNote() {
    var text = SHIP.zh + '\n' + SHIP.en + '\n' + SHIP.bo;

    // 1) Cart footer - before total
    var cart = document.getElementById('cartSidebar');
    if (cart) {
      var existing = document.getElementById('shipNoteCart');
      if (!existing) {
        var box = makeShipBox('shipNoteCart');
        box.className += ' mb-3 mx-0';
        var footer = cart.querySelector('.border-t');
        if (footer) {
          footer.insertBefore(box, footer.firstChild);
        } else {
          cart.appendChild(box);
        }
      } else {
        existing.textContent = text;
      }
    }

    // 2) Shopping notes section on page
    var notes = document.querySelector('[data-i18n="shopping_notes"]');
    if (notes && notes.parentElement) {
      var pageNote = document.getElementById('shipNotePage');
      if (!pageNote) {
        var box2 = makeShipBox('shipNotePage');
        box2.className += ' mt-4';
        notes.parentElement.appendChild(box2);
      } else {
        pageNote.textContent = text;
      }
    }

    // 3) Payment modal note
    var payModal = document.getElementById('payModal');
    if (payModal) {
      var payNote = document.getElementById('shipNotePay');
      if (!payNote) {
        var box3 = makeShipBox('shipNotePay');
        box3.className += ' mt-4 mb-2';
        var inner = payModal.querySelector('.p-5');
        if (inner) inner.appendChild(box3);
      } else {
        payNote.textContent = text;
      }
    }

    // 4) Fixed banner under product grid header if still missing on page body
    if (!document.getElementById('shipNoteBanner')) {
      var grid = document.getElementById('productList');
      if (grid && grid.parentElement) {
        var ban = makeShipBox('shipNoteBanner');
        ban.className += ' mb-6';
        grid.parentElement.insertBefore(ban, grid);
      }
    } else {
      document.getElementById('shipNoteBanner').textContent = text;
    }
  }

  function replaceWechatWithId() {
    var panel = document.getElementById('payWechat');
    if (!panel) return;
    // Replace QR image area with WeChat ID card
    if (panel.getAttribute('data-wechat-id-done') === '1') {
      // still update tip language
      var tip = panel.querySelector('[data-i18n="pay_wechat_tip"]');
      if (tip) tip.textContent = WECHAT_TIP[lang()] || WECHAT_TIP.zh;
      return;
    }
    panel.setAttribute('data-wechat-id-done', '1');
    panel.innerHTML =
      '<div class="py-6">' +
        '<div class="w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg">' +
          '<i class="fab fa-weixin text-white text-4xl"></i>' +
        '</div>' +
        '<p class="text-sm text-slate-500 mb-2">' + (lang() === 'en' ? 'WeChat ID' : (lang() === 'bo' ? 'ཝེ་ཆིན་ཁ་བྱང་།' : '\u5fae\u4fe1\u53f7')) + '</p>' +
        '<p id="wechatIdDisplay" class="text-2xl font-bold text-slate-800 tracking-wide select-all">' + WECHAT_ID + '</p>' +
        '<button type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(\'' + WECHAT_ID + '\').then(function(){var t=document.getElementById(\'toast\');var m=document.getElementById(\'toastMsg\');if(m)m.textContent=\'已复制微信号\';if(t){t.classList.remove(\'hidden\');setTimeout(function(){t.classList.add(\'hidden\')},1500)}})" ' +
          'class="mt-4 px-4 py-2 rounded-full bg-green-500 text-white text-sm hover:bg-green-600 transition">' +
          (lang() === 'en' ? 'Copy ID' : '\u590d\u5236\u5fae\u4fe1\u53f7') +
        '</button>' +
        '<p class="mt-3 text-sm text-slate-600" data-i18n="pay_wechat_tip">' + (WECHAT_TIP[lang()] || WECHAT_TIP.zh) + '</p>' +
      '</div>';
  }

  function markUncertainRed() {
    if (typeof products === 'undefined') return;
    var label = UNCERTAIN[lang()] || UNCERTAIN.zh;
    products.forEach(function (p) {
      if (!p.priceUncertain) return;
      document.querySelectorAll('[onclick]').forEach(function (el) {
        var oc = el.getAttribute('onclick') || '';
        if (oc.indexOf('openDetail(' + p.id + ')') < 0) return;
        var card = el.closest('.product-card') || el.closest('[class*="rounded"]');
        if (!card || card.querySelector('.price-uncertain-badge')) return;
        var badge = document.createElement('span');
        badge.className = 'price-uncertain-badge absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full z-10';
        badge.textContent = label;
        var rel = card.querySelector('.relative');
        if (rel) {
          rel.appendChild(badge);
        } else {
          card.style.position = 'relative';
          card.appendChild(badge);
        }
        card.querySelectorAll('.text-gold-600, .font-extrabold').forEach(function (pe) {
          if (pe.textContent && (pe.textContent.indexOf('$') >= 0 || /\d/.test(pe.textContent))) {
            pe.classList.remove('text-gold-600');
            pe.classList.add('text-red-600');
          }
        });
      });
    });
  }

  var _setLang = window.setLang;
  if (typeof _setLang === 'function') {
    window.setLang = function (l) {
      _setLang(l);
      setTimeout(function () {
        fixDom();
        ensureShippingNote();
        replaceWechatWithId();
        markUncertainRed();
      }, 40);
    };
  }

  // Patch checkout to also refresh wechat panel
  var _checkout = window.checkout;
  if (typeof _checkout === 'function') {
    window.checkout = function () {
      _checkout();
      setTimeout(replaceWechatWithId, 50);
      setTimeout(ensureShippingNote, 50);
    };
  }

  function boot() {
    applyPrices();
    if (typeof renderProducts === 'function') {
      try { renderProducts(typeof currentFilter !== 'undefined' ? currentFilter : 'all'); } catch (e) {}
    }
    fixDom();
    ensureShippingNote();
    replaceWechatWithId();
    markUncertainRed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 0);
      setTimeout(boot, 300);
      setTimeout(boot, 800);
    });
  } else {
    setTimeout(boot, 0);
    setTimeout(boot, 300);
  }
  setInterval(function () {
    fixDom();
    ensureShippingNote();
  }, 1200);
})();
