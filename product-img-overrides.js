// Product image overrides for 雪域瑰宝
(function () {
  if (typeof products === 'undefined') return;
  var map = {
    3: { img: 'images/butter-tea-pot.jpg' },
    10: { img: 'images/pastry-dates.jpg', img2: 'images/pastry-knot.jpg', placeholder: false },
    13: { img: 'images/honey-plateau.jpg', img2: 'images/honey-plateau.jpg', placeholder: false }
  };
  products.forEach(function (p) {
    var o = map[p.id];
    if (!o) return;
    if (o.img) p.img = o.img;
    if (o.img2) p.img2 = o.img2;
    if (o.placeholder === false) delete p.placeholder;
  });
})();
