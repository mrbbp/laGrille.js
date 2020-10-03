 /**
  * premier test lib de dessin d'un laGrille sur le fond
  * ou le premier plan
  *
  * v.2.0 - 191101
  * mis en code par mrbbp.com
  *
  * 1.1: changement des noms des settings et noms des variables
  * 1.2: ajout de la définition des marges
  * 1.3: ajout couleur du tracé
  * 1.4: ajoute les styles height: 100% à <html> et <body>
  *      correction prise en compte de margin dans parametres directes
  *      arrondi inférieur de position du trait (flou)
  * 2.0: dessine des blocs colorés [fillRect] (bleu pour les gouttières, rose pour les marges) plutot que des traits verts
  *      si la gouttière est à 0, il dessine les blocs en alternace colorée (bleu)
  * 2.1: accepte les vw comme unité
  *      gère une colonne partagée à droite et à gauche (private ref: laGrille RTS)
  * 2.2: correction erreur de calcul qd demi + gutter
  *      ajout gestion des écrans retina @x2
  *      changement de nom de la méthode dessine() -> draw() (standardisation avec laLigneDeBase.js)
  *
  *
  *
  *   laGrille.draw(nombreDeColonnes(3 par défaut), gouttiere(px)(16px par défaut), margeExterieure(px ou vw ou vh)(32px par défaut), niveau 'up'|'down'(par défaut));
  *
  * pex: laGrille.draw(8,10,20,"up");
  * pex: laGrille.draw(8) -> gouttiere 16px, marge: 32px, en dessous
  *
  * ou passage d'un objet contenant un ou plusieurs paramètres
  * ('color': couleur du dessin, paramètrable uniquement de cette façon)
  *
  * pex: laGrille.draw({'column':5, 'gutter':20, 'margin': 10, 'color':'nom ou valeur hexa ou rgb()' 'level':"up"});
  *
  *
  * pex: laGrille.draw({'column':8.5, 'gutter':0, 'margin': 0, 'level':"down"});
  * si column est un nombre à virgule, il considère que la colonne supplémentaire (Math.ceil) est partagée équitablement à droite et à gauche
  *
  * si margin n'est pas définit, elle sera 2 fois la gouttiere (2*gutter)
  *
  */
(function(root){ 
  'use strict';

  // settings
	const settings = {
		'column': 3,
    'gutter': 16,
    'margin': 16,
    'level': "down",
    'color': 'rgba(0,176,228,.66)',
    'colorM': 'rgba(255, 100, 217,.33)',
    'demi': false,
    'debug':""
	};
  function laGrille(){
    const _colonnageObject = {};
    // initialise le timer du resize
    window.resizeTimer;
    let marge, unit;

    _colonnageObject.draw = function(c=3, g=16, m=32, l="down"){
      //console.log(m);
      settings.margin = m;
      settings.column = c;
      settings.gutter = g;
      settings.level = l;

      // si c'est un objet (correctement formaté) il remplit les valeurs
      // sinon les valeurs par défaut sont écrites en premier
      if (typeof(c) === 'object') {
        for (const i in c) {
          settings[i] = c[i];
        }
      }
      settings['debug'] = typeof(c['gutter']);
      // mets à jour m en fonction du settings.margin
      m = settings.margin;
      // si m n'est pas un nombre
      if (!Number.isFinite(m)) {
        // récupère l'unité et la valeur
        const marge = parseInt(settings.margin.replace(/[a-z]+/g,""));
        const unit = settings.margin.replace(/\d+/g,"");
        // calcule la marge en fonction de l'unité
        if (unit == "vw") {
          settings.margin = Math.round(document.body.clientWidth/100*marge);
        } else if (unit == "vh") {
          settings.margin = Math.round(document.body.clientHeight/100*marge);
        } else if (unit == "px") {
          settings.margin = marge;
        } else if (unit =="rem" || unit  =="em") {
          settings.margin = Math.round(marge*16);
        }
      }
      // si g n'est pas un nombre
      if (!Number.isFinite(settings.gutter)) {
        // récupère l'unité et la valeur
        const gutter = parseInt(settings.gutter.replace(/[a-z]+/g,""));
        const unit = settings.gutter.replace(/\d+/g,"");
        // calcule la marge en fonction de l'unité
        if (unit == "vw") {
          settings.gutter = Math.round(document.body.clientWidth/100*gutter);
        } else if (unit == "vh") {
          settings.gutter = Math.round(document.body.clientHeight/100*gutter);
        } else if (unit == "px") {
          settings.gutter = gutter;
        } else if (unit =="rem" || unit  =="em") {
          settings.gutter = Math.round(gutter*16);
        }
        if (settings.demi) settings.margin ="0";
      } else {
        if (settings.gutter) settings.margin ="0";
        settings.debug= "gutter: "+settings.gutter;
      }

      // si column est à virgule
      if (!Number.isInteger(settings.column)) {
        settings.column = Math.ceil(settings.column);
        settings.demi = true;
      }

      if (settings.margin==32) {
        settings.margin = settings.gutter*2;
      }
      dc();
      return console.log('settings', settings);
    };

    function dc() {
      // ajoute les styles pour avoir une hauteur de body
      document.querySelector("html").style.height = "100vh";
      document.body.style.height = "100vh";

      let c;
      root.largeur = document.body.clientWidth;
      root.hauteur = document.body.clientHeight;

      let mDemi = 0;
      // si le nbr de col est à virgule
      if (settings.demi) {
        mDemi = (largeur/settings.column)/2;
      }
      const largeurInt = largeur - 2*settings.margin;
      const HauteurInt = hauteur - 2*settings.margin;
      const largeurDemi = largeur + (settings.gutter);

      // si #laGrille (canvas) existe, il le sélectionne, sinon l'ajoute au DOM
      if (document.querySelector("#laGrille")) {
        c = document.querySelector("#laGrille");
      } else {
        c = document.createElement("canvas");
        c.setAttribute("id", "laGrille");
        c.setAttribute("style", "position: absolute; top:0; left:0;opacity:.5");
        document.body.insertBefore(c, document.body.firstChild);
        // en fonction de settings.level, place devant ou derrère
        if (settings.level == "down") {
          c.style.zIndex = -100;
        } else {
          c.style.zIndex = 100;
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

      // efface le canvas
      ctx.clearRect(0, 0, largeur, hauteur);
      ctx.fillStyle = settings.colorM;
      // dessine les traits
      ctx.beginPath();
      // trait exterieur gauche
      ctx.fillRect(0, settings.margin,settings.margin, hauteur - settings.margin*2);
      // trait exterieur droit
      ctx.fillRect(largeur-settings.margin, settings.margin,settings.margin,hauteur - settings.margin*2);
      // desine les repères horizontaux
      ctx.fillRect(0,0,largeur,settings.margin);
      ctx.fillRect(0,hauteur-settings.margin,largeur, settings.margin);

      if (settings.demi) {
        // trait exterieur gauche
        ctx.fillRect(0, 0, mDemi, hauteur);
        // trait exterieur droit
        ctx.fillRect(largeur-mDemi, 0, mDemi ,hauteur);
      }
      // change la couleur des gouttieres
      ctx.fillStyle = settings.color;
      if (settings.gutter == 0) {
        for (let i = 1; i<settings.column; i+=2) {
          ctx.fillRect(mDemi+settings.margin+Math.floor(i*largeurInt/settings.column), settings.margin, Math.ceil(largeurInt/settings.column), hauteur - (settings.margin*2));
          settings.debug="NO gutter";
        }
      } else {// gutter
        if (settings.demi) {// si demi le calcul se fait avec un gutter de moins, une col gutter de moins
          for (let i = 1; i<settings.column-1; i++) {
            ctx.fillRect(Math.ceil(mDemi+(i*(largeurDemi/settings.column))-(settings.gutter)), settings.margin, settings.gutter, hauteur - (settings.margin*2));
            settings.debug="gutter + demi";
          }
        } else {
          for (let i = 1; i<settings.column; i++) {
            ctx.fillRect(settings.margin+Math.floor(i*(largeurInt+settings.gutter)/settings.column)-settings.gutter, settings.margin, settings.gutter, hauteur - (settings.margin*2));
            settings.debug="gutter + NO demi";
          }
        }

      }
    }
    window.addEventListener('resize', (e) => {
      clearTimeout(window.resizeTimer2);
      window.resizeTimer2 = setTimeout(() => {
        dc();
      }, 240);
    });
    return _colonnageObject;
  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.laGrille) === 'undefined'){
    window.laGrille = laGrille();
  }
})(window); // We send the window variable withing our function
