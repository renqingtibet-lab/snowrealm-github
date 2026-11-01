// Force USD currency display on products page
(function(){
  function fix(){
    document.querySelectorAll('*').forEach(function(el){
      if(el.childNodes){
        el.childNodes.forEach(function(n){
          if(n.nodeType===3 && n.nodeValue && n.nodeValue.indexOf('\u00a5')>=0){
            n.nodeValue = n.nodeValue.split('\u00a5').join('$');
          }
        });
      }
    });
    ['cartTotal','payAmount','modalPrice'].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&el.textContent) el.textContent=el.textContent.split('\u00a5').join('$');
    });
  }
  if(typeof products!=='undefined'){
    products.forEach(function(p){
      if(p.specs) p.specs.forEach(function(s){
        if(typeof s.price==='number' && s.price>=40) s.price = Math.round(s.price/7*2)/2;
      });
    });
  }
  setInterval(fix, 400);
  document.addEventListener('DOMContentLoaded', fix);
  fix();
})();
