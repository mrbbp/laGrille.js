/**
 * dessin d'une laLigneDeBase sur le fond ou le premier plan
 *
 * v.1 - 200601
 * mis en code par mrbbp.com
 *
 * 1  : version initiale
 * 1.1: 200930
        - ajout de la gestion des écrans retina (dessin en double taille)
        - ajout d'une propriété debug
        - ajout d'une `margin` `String` en rem ou `Number (px)
        - ajout d'une propriété ùnder`: positionnement sous l'élément désigner
        - la propriété `level`devient obsolète (utilisée en interne)
        - le canvas positionné en 'absolute' et non 'fixed''
 * 1.2: 201003
        - changement de nom liegneDeBase() devient laLigneDeBase()
        - changement de nom de la méthode show() -> draw()
 *
 *  laLigneDeBase.draw(pattern,margin,style);
 *
 * pex: laLigneDeBase.draw(5,20,"dotted");
 *
 *
 * ou passage d'un objet contenant un ou plusieurs paramètres
 * ('color': couleur du dessin, paramètrable uniquement de cette façon)
 *
 *  p.ex.: const ldb = laLigneDeBase.draw({'pattern': 5,'style':'dotted', 'under':"yourElementHTML"});
 *
 *  margin: accepte String "8rem" (en rem) ou Chiffre (px)
 */
(function(root){
  'use strict';
  const settings = {
    'pattern': 5
    ,'size': 0
    ,'margin': 0
    ,'style' : 'solid' // dashed dotted solid
    ,'level': 'up'
    ,'color': 'rgba(0,176,228,.66)'
    ,'colorM': 'rgba(255, 100, 217,.66)'
    ,'debug': null
  };

  function laLigneDeBase(){
    const _ligneDeBaseObject = {};
    // initialise le timer du resize
    window.resizeTimer;

    _ligneDeBaseObject.draw = function(pa=5, ma=0, le="up", st="solid"){
       //console.log(m);

      // si c'est un objet (correctement formaté) il remplit les valeurs
      // sinon les valeurs par défaut sont écrites en premier
      if (typeof(pa) === 'object') {
        for (const i in pa) {
          settings[i] = pa[i];
        }
        settings['debug'] = typeof(pa['margin']);
        //pa['margin'].includes("rem");
        if(typeof(pa['margin']) === 'string') {
          // margin est une chaine -> donc pas en px mais en?
          if (pa['margin'].includes("rem")) {
            settings['margin'] = parseInt(pa['margin'].replace(/rem/g,''))*16;
          }
        }
      } else {
        settings.pattern = pa;
        settings.level = le;
        settings.margin = ma;
        settings.style = st;
      }
      const fs = window.getComputedStyle(document.body, null).fontSize;
      settings.fontSize = parseFloat(fs);
      if (settings.size == 0) {
        settings.size = parseFloat(fs)*1.2;
      }
      const lh = window.getComputedStyle(document.body, null).lineHeight;

      switch (typeof(parseFloat(lh))) {
        case 'string':
          //console.log("lh string",typeof(parseFloat(lh)),parseFloat(lh));
          break;
        case 'number':
          if (isNaN(parseFloat(lh))) {
            settings.lineHeight = parseFloat(fs)*1.2;
            //console.log("lh pas défini, utilise fs", fs, settings.lineHeight);
          } else {
            //console.log("lh Number",typeof(parseFloat(lh)),parseFloat(lh));
            settings.lineHeight = parseFloat(lh);
          }
          break;
      }

      dLdB();
      // renvoie settings pour debug
      return settings;
    };

    function dLdB() {
     // ajoute les styles pour avoir une hauteur de body
      document.querySelector("html").style.minHeight = "100vh";
      document.body.style.minHeight = "100vh";

      let c;
      root.largeur = document.body.clientWidth;
      root.hauteur = document.body.clientHeight;

     // si #laLigneDeBase (canvas) existe, il le sélectionne, sinon l'ajoute au DOM
      if (document.querySelector("#laLigneDeBase")) {
        c = document.querySelector("#laLigneDeBase");
      } else {
        c = document.createElement("canvas");
        c.setAttribute("id", "laLigneDeBase");
        c.setAttribute("style", "position: absolute; top:0; left:0;");
        // postionnement du canvas dans le DOM
        if (settings.under) {
          const repere = document.querySelector(settings.under);
          document.body.insertBefore(c, repere);
          repere.style.position = "relative";
        } else {
          document.body.appendChild(c);
        }
      }
      // taille du canvas
      c.width = largeur;
      c.height = hauteur;

      //sur écran retina
      if (window.devicePixelRatio){
        console.log(window.devicePixelRatio);
        // 1. Ensure the elment size stays the same.
        c.style.width  = c.width + "px";
        c.style.height = c.height + "px";
        // 2. Increase the canvas dimensions by the pixel ratio.
        c.width  *= window.devicePixelRatio;
        c.height *= window.devicePixelRatio;
      }
      const ctx = c.getContext('2d');
      if (window.devicePixelRatio){
        // 3. Scale the context by the pixel ratio.
        ctx.scale(window.devicePixelRatio,window.devicePixelRatio);
      }
      ctx.lineWidth = .5;
      // efface le canvas
      ctx.clearRect(0, 0, largeur, hauteur);
      ctx.fillStyle = settings.colorM;
      // dessine les traits

      // trait exterieur gauche
      let compteur = 0;
      for (let i=settings.size+settings.margin; i< hauteur-settings.margin; i+= settings.size) {
        compteur++;
        // attribue les couleur en fonction du num du trait
        if (compteur%(settings.pattern)===0) {
          ctx.strokeStyle = settings.colorM;//'rgba(0,0,0,.50)';
        } else {
          ctx.strokeStyle = settings.color;//'rgba(0,0,0,.25)';
        }
        // gestion du style du tracé
        if (settings.style == "dashed") {
          ctx.setLineDash([4, 2]);
        } else if (settings.style == "dotted") {
          ctx.setLineDash([1, 2]);
        }
        // trace la ligne (au demi pixel pour avoir trait "crisp")
        ctx.beginPath();
        ctx.moveTo(0, Math.round(i)+.5);
        ctx.lineTo(largeur, Math.round(i)+.5);
        ctx.closePath();
        ctx.stroke();
      }
   }
   // gestion du resize avec délai
    window.addEventListener('resize', (e) => {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(() => dLdB(), 250);
    });

    return _ligneDeBaseObject;
  }
  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.laLigneDeBase) === 'undefined'){
    window.laLigneDeBase = laLigneDeBase();
  }

})(window); // We send the window variable withing our function
