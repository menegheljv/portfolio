// The original browser script is intentionally kept imperative to preserve its animation timing.
// @ts-nocheck
(function(){
  var btns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  function activate(name){
    btns.forEach(function(b){
      var on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function(p){
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      activate(b.dataset.tab);
      history.replaceState(null, '', '#' + b.dataset.tab);
      // re-trigger reveal for whatever just became visible in the new panel
      requestAnimationFrame(revealCheck);
    });
  });
  var initial = (location.hash || '').replace('#','');
  if(initial && document.getElementById('tab-' + initial)){
    activate(initial);
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero background: intro burst of M's (several textures) resolving into
     the real logo, then a discreet vertical code rain (0/1 + the M mark) underneath ---------- */
  (function(){
    var canvas = document.getElementById('heroCanvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var hero = canvas.closest('.hero');
    var COLORS = ['96,181,255', '61,214,140']; // tech blue, matrix green (rgb triples)
    var COLUMN_COUNT = 30, GLYPHS_PER_COLUMN = 7;
    var drops = [], w = 0, h = 0, markX = 0, markY = 0;

    function pickChar(){ return Math.random() < 0.5 ? '0' : '1'; } // background stays pure 1s and 0s

    function setupDrops(){
      drops = [];
      for(var i = 0; i < COLUMN_COUNT; i++){
        var x = (w / (COLUMN_COUNT + 1)) * (i + 1) + (Math.random() * 20 - 10);
        for(var j = 0; j < GLYPHS_PER_COLUMN; j++){
          drops.push({
            x: x,
            t: Math.random(),
            speed: 0.00004 + Math.random() * 0.00003,
            ch: pickChar(),
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }
      }
    }

    function resize(){
      var rect = hero.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      setupDrops();
      var markEl = hero.querySelector('.hero-mark');
      if(markEl){
        var mr = markEl.getBoundingClientRect();
        markX = mr.left - rect.left + mr.width / 2;
        markY = mr.top - rect.top + mr.height / 2;
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function drawRain(dt){
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var top = -20, bottom = h + 20;
      drops.forEach(function(d){
        d.t += d.speed * dt;
        if(d.t > 1){ d.t = 0; d.ch = pickChar(); d.color = COLORS[Math.floor(Math.random() * COLORS.length)]; }
        var y = top + (bottom - top) * d.t;
        // fade in near the top, fade out near the bottom -- keeps the edges soft
        var edge = Math.min(d.t * 4, (1 - d.t) * 4, 1);
        var alpha = 0.22 * edge;
        ctx.save();
        ctx.translate(d.x, y);
        ctx.fillStyle = 'rgba(' + d.color + ',' + alpha + ')';
        ctx.font = '13px "IBM Plex Mono", ui-monospace, monospace';
        ctx.fillText(d.ch, 0, 0);
        ctx.restore();
      });
    }

    /* ---- intro: several different TYPEFACES for "M"/"m", each rendered in a different
       MATERIAL/CONTEXT (grass, fire, water, metal, stone, chalk...), all stacked in the
       SAME spot -- right where the real logo sits -- taking turns, some pasted onto a
       little paper card behind them like a cut-out -- before the one real logo resolves
       there. The rain behind stays pure 1s and 0s, everywhere else. ---- */
    var burst = [
      // dropped the flattest ones (solid, outline, neon had no real surface texture) --
      // every M left here has actual material detail
      { ch: 'M', font: '900 78px Anton',                             style: 'fire',    dx: 0, dy: 0,  rot: 0,  delay: 0    },
      { ch: 'M', font: 'italic 300 68px "Bricolage Grotesque"',       style: 'water',   dx: 0, dy: 0,  rot: 0,  delay: 220  },
      { ch: 'm', font: '700 50px "IBM Plex Mono"',                    style: 'metal',   dx: 0, dy: 0,  rot: 0,  delay: 440,
        paper: { color: '#dfe6ea', w: 66, h: 78, rot: 0 } },
      { ch: 'M', font: '400 72px Georgia, "Times New Roman", serif',  style: 'grass',   dx: 0, dy: 0,  rot: 0,  delay: 660  },
      { ch: 'M', font: '900 56px Impact, "Arial Narrow", sans-serif', style: 'stone',   dx: 0, dy: 0,  rot: 0,  delay: 880,
        paper: { color: '#d9c9a8', w: 60, h: 72, rot: 0 } },
      { ch: 'M', font: '700 60px Bricolage Grotesque',                style: 'chalk',   dx: 0, dy: 0,  rot: 0,  delay: 1100,
        paper: { color: '#2a3630', w: 74, h: 84, rot: 0 } },
      { ch: 'M', font: '400 66px "Trebuchet MS", sans-serif',         style: 'wood',    dx: 0, dy: 0,  rot: 0,  delay: 1320,
        paper: { color: '#c9b591', w: 64, h: 76, rot: 0 } },
      { ch: 'm', font: 'italic 400 50px Georgia, serif',              style: 'ice',     dx: 0, dy: 0,  rot: 0,  delay: 1540 },
      { ch: 'M', font: 'italic 900 64px "Trebuchet MS", sans-serif',  style: 'graffiti',dx: 0, dy: 0,  rot: 0,  delay: 1760 },
      { ch: 'M', font: '700 60px "Bricolage Grotesque"',              style: 'painted', dx: 0, dy: 0,  rot: 0,  delay: 1980 },
      { ch: 'M', font: '400 62px Georgia, serif',                     style: 'statue',  dx: 0, dy: 0,  rot: 0,  delay: 2200 },
      { ch: 'M', font: 'italic 400 76px "Brush Script MT", cursive',  style: 'gold',    dx: 0, dy: 0,  rot: 0,  delay: 2420 },
      { ch: 'M', font: '200 78px "Bricolage Grotesque"',              style: 'glass',   dx: 0, dy: 0,  rot: 0,  delay: 2640 },
      { ch: 'M', font: '900 60px "Arial Black", sans-serif',          style: 'lava',    dx: 0, dy: 0,  rot: 0,  delay: 2860 },
      { ch: 'M', font: '400 64px "Palatino Linotype", Palatino, serif', style: 'rust',  dx: 0, dy: 0,  rot: 0,  delay: 3080 },
      { ch: 'M', font: '700 50px Consolas, "Lucida Console", monospace', style: 'led',  dx: 0, dy: 0,  rot: 0,  delay: 3300 },
      { ch: 'M', font: 'italic 300 74px "Bricolage Grotesque"',       style: 'galaxy',  dx: 0, dy: 0,  rot: 0,  delay: 3520 },
      { ch: 'M', font: '500 54px "IBM Plex Mono"',                    style: 'circuit', dx: 0, dy: 0,  rot: 0,  delay: 3740 },
      { ch: 'M', font: 'italic 900 62px Anton',                       style: 'lightning', dx: 0, dy: 0, rot: 0, delay: 3960 },
      { ch: 'M', font: '300 70px Verdana, sans-serif',                style: 'crystal', dx: 0, dy: 0,  rot: 0,  delay: 4180 },
      { ch: 'M', font: '700 60px fantasy',                            style: 'holo',    dx: 0, dy: 0,  rot: 0,  delay: 4400 }
    ];
    var SLOT = 245; // measured, calm rhythm between each M's entrance
    // Each M gets a complete entrance and exit before the next one arrives. The longer
    // overlap-free rhythm keeps the material changes legible without visual noise.
    var FADE_IN = 115, HOLD = 70, FADE_OUT = 115, ITEM_LIFE = FADE_IN + HOLD + FADE_OUT;
    var INTRO_DURATION = (burst.length - 1) * SLOT + ITEM_LIFE + 80;

    function easeOutCubic(value){
      return 1 - Math.pow(1 - value, 3);
    }

    function easeInOutSine(value){
      return -(Math.cos(Math.PI * value) - 1) / 2;
    }

    // paints one letterform (varies by font/ch) in one material (varies by style),
    // masked to that letterform's own silhouette via 'source-atop' compositing
    function paintGlyphTexture(ch, font, style, alpha, t){
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if(style === 'outline'){
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(245,245,245,' + (0.9 * alpha) + ')';
        ctx.strokeText(ch, 0, 0);
        return;
      }
      if(style === 'solid'){
        ctx.fillStyle = 'rgba(245,245,245,' + alpha + ')';
        ctx.fillText(ch, 0, 0);
        return;
      }
      if(style === 'neon'){
        ctx.save();
        ctx.shadowColor = 'rgba(120,220,255,' + alpha + ')';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(150,235,255,' + alpha + ')';
        ctx.fillText(ch, 0, 0);
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        return;
      }

      // pseudo-3D: a stepped dark shadow (extrusion) plus an offset light highlight
      // (top-left catching the light) reads as a proper embossed/beveled letter
      for(var stp = 7; stp >= 1; stp--){
        ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 0.11) + ')';
        ctx.fillText(ch, stp * 1.7, stp * 1.7);
      }
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.35) + ')';
      ctx.fillText(ch, -1.6, -1.6);

      if(style === 'grass'){
        var g = ctx.createLinearGradient(0, -36, 0, 36);
        g.addColorStop(0, 'rgba(95,205,115,' + alpha + ')');
        g.addColorStop(1, 'rgba(28,105,52,' + alpha + ')');
        ctx.fillStyle = g;
      } else if(style === 'fire'){
        var fg = ctx.createLinearGradient(0, 36, 0, -36);
        fg.addColorStop(0, 'rgba(255,236,130,' + alpha + ')');
        fg.addColorStop(0.5, 'rgba(255,138,38,' + alpha + ')');
        fg.addColorStop(1, 'rgba(195,28,18,' + alpha + ')');
        ctx.fillStyle = fg;
      } else if(style === 'water'){
        var wg = ctx.createLinearGradient(0, -36, 0, 36);
        wg.addColorStop(0, 'rgba(70,150,225,' + alpha + ')');
        wg.addColorStop(1, 'rgba(18,55,115,' + alpha + ')');
        ctx.fillStyle = wg;
      } else if(style === 'metal'){
        var mg = ctx.createLinearGradient(-40, -30, 40, 30);
        mg.addColorStop(0, 'rgba(150,155,160,' + alpha + ')');
        mg.addColorStop(0.42, 'rgba(235,237,240,' + alpha + ')');
        mg.addColorStop(0.55, 'rgba(110,114,118,' + alpha + ')');
        mg.addColorStop(1, 'rgba(185,190,195,' + alpha + ')');
        ctx.fillStyle = mg;
      } else if(style === 'stone'){
        ctx.fillStyle = 'rgba(150,150,148,' + alpha + ')';
      } else if(style === 'wood'){
        var wdg = ctx.createLinearGradient(0, -36, 0, 36);
        wdg.addColorStop(0, 'rgba(168,120,72,' + alpha + ')');
        wdg.addColorStop(1, 'rgba(96,62,32,' + alpha + ')');
        ctx.fillStyle = wdg;
      } else if(style === 'ice'){
        var ig = ctx.createLinearGradient(0, -36, 0, 36);
        ig.addColorStop(0, 'rgba(225,245,255,' + alpha + ')');
        ig.addColorStop(1, 'rgba(150,205,230,' + alpha + ')');
        ctx.fillStyle = ig;
      } else if(style === 'graffiti'){
        var gr = ctx.createLinearGradient(-40, -36, 40, 36);
        gr.addColorStop(0, 'rgba(255,70,160,' + alpha + ')');
        gr.addColorStop(0.55, 'rgba(255,130,60,' + alpha + ')');
        gr.addColorStop(1, 'rgba(255,210,60,' + alpha + ')');
        ctx.fillStyle = gr;
      } else if(style === 'painted'){
        var pg = ctx.createLinearGradient(-30, -30, 30, 30);
        pg.addColorStop(0, 'rgba(120,190,255,' + alpha + ')');
        pg.addColorStop(1, 'rgba(40,100,180,' + alpha + ')');
        ctx.fillStyle = pg;
      } else if(style === 'statue'){
        var sg = ctx.createLinearGradient(-36, -34, 36, 34);
        sg.addColorStop(0, 'rgba(214,186,140,' + alpha + ')');
        sg.addColorStop(0.5, 'rgba(140,112,70,' + alpha + ')');
        sg.addColorStop(1, 'rgba(70,96,80,' + alpha + ')');
        ctx.fillStyle = sg;
      } else if(style === 'gold'){
        var gd = ctx.createLinearGradient(-36, -34, 36, 34);
        gd.addColorStop(0, 'rgba(255,240,180,' + alpha + ')');
        gd.addColorStop(0.5, 'rgba(215,168,58,' + alpha + ')');
        gd.addColorStop(1, 'rgba(140,102,30,' + alpha + ')');
        ctx.fillStyle = gd;
      } else if(style === 'glass'){
        var gl = ctx.createLinearGradient(0, -36, 0, 36);
        gl.addColorStop(0, 'rgba(225,248,255,' + (alpha * 0.75) + ')');
        gl.addColorStop(1, 'rgba(150,210,230,' + (alpha * 0.55) + ')');
        ctx.fillStyle = gl;
      } else if(style === 'lava'){
        var lv = ctx.createLinearGradient(0, -36, 0, 36);
        lv.addColorStop(0, 'rgba(40,14,10,' + alpha + ')');
        lv.addColorStop(1, 'rgba(20,6,4,' + alpha + ')');
        ctx.fillStyle = lv;
      } else if(style === 'rust'){
        var ru = ctx.createLinearGradient(0, -36, 0, 36);
        ru.addColorStop(0, 'rgba(200,110,55,' + alpha + ')');
        ru.addColorStop(1, 'rgba(110,55,25,' + alpha + ')');
        ctx.fillStyle = ru;
      } else if(style === 'led'){
        ctx.fillStyle = 'rgba(15,30,20,' + alpha + ')';
      } else if(style === 'galaxy'){
        var gx = ctx.createLinearGradient(0, -36, 0, 36);
        gx.addColorStop(0, 'rgba(30,14,60,' + alpha + ')');
        gx.addColorStop(0.5, 'rgba(60,20,90,' + alpha + ')');
        gx.addColorStop(1, 'rgba(10,10,40,' + alpha + ')');
        ctx.fillStyle = gx;
      } else if(style === 'circuit'){
        ctx.fillStyle = 'rgba(8,26,16,' + alpha + ')';
      } else if(style === 'lightning'){
        ctx.fillStyle = 'rgba(10,14,30,' + alpha + ')';
      } else if(style === 'crystal'){
        var cr = ctx.createLinearGradient(-36, -34, 36, 34);
        cr.addColorStop(0, 'rgba(200,170,255,' + alpha + ')');
        cr.addColorStop(0.5, 'rgba(120,110,230,' + alpha + ')');
        cr.addColorStop(1, 'rgba(70,60,170,' + alpha + ')');
        ctx.fillStyle = cr;
      } else if(style === 'holo'){
        var ho = ctx.createLinearGradient(-40, -34, 40, 34);
        ho.addColorStop(0, 'rgba(255,120,200,' + alpha + ')');
        ho.addColorStop(0.33, 'rgba(140,160,255,' + alpha + ')');
        ho.addColorStop(0.66, 'rgba(120,255,220,' + alpha + ')');
        ho.addColorStop(1, 'rgba(255,230,120,' + alpha + ')');
        ctx.fillStyle = ho;
      } else { // chalk
        ctx.fillStyle = 'rgba(225,225,220,' + (alpha * 0.9) + ')';
      }
      ctx.fillText(ch, 0, 0); // base fill establishes the glyph's own alpha mask

      ctx.save();
      ctx.globalCompositeOperation = 'source-atop'; // detail only lands on what's already painted
      if(style === 'grass'){
        ctx.strokeStyle = 'rgba(195,255,205,' + (alpha * 0.55) + ')';
        ctx.lineWidth = 1.2;
        for(var i = 0; i < 14; i++){
          var bx = -40 + Math.random() * 80;
          ctx.beginPath();
          ctx.moveTo(bx, 36);
          ctx.quadraticCurveTo(bx + (Math.random() * 6 - 3), 0, bx + (Math.random() * 8 - 4), -36);
          ctx.stroke();
        }
      } else if(style === 'fire'){
        ctx.fillStyle = 'rgba(255,250,205,' + (alpha * 0.45) + ')';
        for(var j = 0; j < 4; j++){
          var fx = -32 + Math.random() * 64, fy = 8 - Math.random() * 30;
          ctx.beginPath(); ctx.ellipse(fx, fy, 4, 10, 0, 0, Math.PI * 2); ctx.fill();
        }
        // thin upward licking flames on top of the embers
        ctx.strokeStyle = 'rgba(255,220,150,' + (alpha * 0.5) + ')';
        ctx.lineWidth = 1.3;
        for(var lick = 0; lick < 7; lick++){
          var lx0 = -34 + Math.random() * 68, ly0 = 34;
          ctx.beginPath();
          ctx.moveTo(lx0, ly0);
          ctx.quadraticCurveTo(lx0 + (Math.random() * 14 - 7), 0, lx0 + (Math.random() * 10 - 5), -30 - Math.random() * 8);
          ctx.stroke();
        }
      } else if(style === 'water'){
        ctx.strokeStyle = 'rgba(215,240,255,' + (alpha * 0.55) + ')';
        ctx.lineWidth = 1.4;
        for(var yy = -36; yy < 36; yy += 10){
          ctx.beginPath();
          for(var xx = -46; xx <= 46; xx += 8){
            var yOff = Math.sin(xx * 0.09 + t * 0.005 + yy * 0.3) * 2.4;
            if(xx === -46) ctx.moveTo(xx, yy + yOff); else ctx.lineTo(xx, yy + yOff);
          }
          ctx.stroke();
        }
      } else if(style === 'stone'){
        for(var k = 0; k < 30; k++){
          ctx.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '95,95,92' : '205,205,200') + ',' + (alpha * 0.5) + ')';
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, 1.2 + Math.random() * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if(style === 'metal'){
        // brushed-aluminum grain: dozens of fine near-horizontal scratch lines
        for(var mt = 0; mt < 34; mt++){
          var my = -34 + Math.random() * 68;
          ctx.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255' : '60,62,64') + ',' + (alpha * 0.22) + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-42 + Math.random() * 8, my);
          ctx.lineTo(42 - Math.random() * 8, my + (Math.random() * 3 - 1.5));
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.55) + ')';
        ctx.beginPath(); ctx.arc(-18, -14, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(14, 18, 1.4, 0, Math.PI * 2); ctx.fill();
      } else if(style === 'graffiti'){
        // spray mist speckle everywhere + a few paint drips running down
        for(var sp = 0; sp < 60; sp++){
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * (0.15 + Math.random() * 0.25)) + ')';
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, Math.random() * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(180,20,90,' + (alpha * 0.75) + ')';
        ctx.lineWidth = 2.4;
        for(var dr = 0; dr < 3; dr++){
          var dx0 = -24 + dr * 24 + (Math.random() * 10 - 5);
          var dripLen = 10 + Math.random() * 18;
          ctx.beginPath();
          ctx.moveTo(dx0, 10);
          ctx.lineTo(dx0 + (Math.random() * 4 - 2), 10 + dripLen);
          ctx.stroke();
        }
      } else if(style === 'painted'){
        // visible brush bristle strokes, diagonal, plus a glossy highlight
        for(var bs = 0; bs < 9; bs++){
          var by0 = -30 + bs * 7;
          ctx.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '210,235,255' : '15,50,100') + ',' + (alpha * 0.32) + ')';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(-40, by0);
          ctx.lineTo(40, by0 - 10 + Math.random() * 6);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.4) + ')';
        ctx.beginPath(); ctx.ellipse(-10, -12, 10, 5, -0.4, 0, Math.PI * 2); ctx.fill();
      } else if(style === 'statue'){
        // weathered patina blotches + fine age cracks
        for(var pt = 0; pt < 10; pt++){
          ctx.fillStyle = 'rgba(90,120,100,' + (alpha * 0.3) + ')';
          ctx.beginPath();
          ctx.arc(-36 + Math.random() * 72, -32 + Math.random() * 64, 4 + Math.random() * 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(40,32,20,' + (alpha * 0.45) + ')';
        ctx.lineWidth = 1;
        for(var cr2 = 0; cr2 < 4; cr2++){
          var sx = -30 + Math.random() * 60, sy = -28 + Math.random() * 56;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() * 14 - 7), sy + (Math.random() * 14 - 7));
          ctx.stroke();
        }
      } else if(style === 'chalk'){
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
        for(var m = 0; m < 40; m++){
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, 0.5 + Math.random() * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if(style === 'wood'){
        ctx.strokeStyle = 'rgba(60,36,16,' + (alpha * 0.5) + ')';
        ctx.lineWidth = 1.3;
        for(var n = 0; n < 7; n++){
          var gy = -32 + n * 10 + (Math.random() * 4 - 2);
          ctx.beginPath();
          for(var gx = -46; gx <= 46; gx += 8){
            var gyOff = Math.sin(gx * 0.12 + n) * 2.2;
            if(gx === -46) ctx.moveTo(gx, gy + gyOff); else ctx.lineTo(gx, gy + gyOff);
          }
          ctx.stroke();
        }
      } else if(style === 'ice'){
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.6) + ')';
        ctx.lineWidth = 1.2;
        for(var p = 0; p < 5; p++){
          var cx0 = -36 + Math.random() * 72, cy0 = -30 + Math.random() * 60;
          ctx.beginPath();
          ctx.moveTo(cx0, cy0);
          ctx.lineTo(cx0 + (Math.random() * 24 - 12), cy0 + (Math.random() * 24 - 12));
          ctx.stroke();
        }
      } else if(style === 'gold'){
        // hammered/brushed gold: many fine diagonal strokes plus a couple bright sparkles
        for(var hg = 0; hg < 16; hg++){
          var hy = -34 + hg * 4.5;
          ctx.strokeStyle = 'rgba(255,255,235,' + (alpha * 0.3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-40, hy); ctx.lineTo(40, hy + 12);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,245,' + (alpha * 0.8) + ')';
        ctx.beginPath(); ctx.arc(-12, -18, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 10, 1.4, 0, Math.PI * 2); ctx.fill();
      } else if(style === 'glass'){
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-34, -30); ctx.lineTo(-8, 30);
        ctx.stroke();
      } else if(style === 'lava'){
        ctx.strokeStyle = 'rgba(255,150,30,' + (alpha * 0.85) + ')';
        ctx.lineWidth = 2;
        for(var lc = 0; lc < 4; lc++){
          var lx = -36 + Math.random() * 72, ly = -32 + Math.random() * 64;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + (Math.random() * 16 - 8), ly + (Math.random() * 16 - 8));
          ctx.lineTo(lx + (Math.random() * 20 - 10), ly + (Math.random() * 20 - 10));
          ctx.stroke();
        }
      } else if(style === 'rust'){
        for(var rk = 0; rk < 26; rk++){
          ctx.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '70,32,12' : '230,150,90') + ',' + (alpha * 0.45) + ')';
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if(style === 'led'){
        ctx.fillStyle = 'rgba(90,255,140,' + alpha + ')';
        for(var ly2 = -32; ly2 < 32; ly2 += 6){
          for(var lx2 = -44; lx2 < 44; lx2 += 6){
            if(Math.random() < 0.72) ctx.fillRect(lx2, ly2, 3.4, 3.4);
          }
        }
      } else if(style === 'galaxy'){
        for(var st = 0; st < 45; st++){
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * (0.3 + Math.random() * 0.6)) + ')';
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, Math.random() * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,140,220,' + (alpha * 0.35) + ')';
        ctx.beginPath(); ctx.arc(-14, -8, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(120,200,255,' + (alpha * 0.3) + ')';
        ctx.beginPath(); ctx.arc(18, 14, 14, 0, Math.PI * 2); ctx.fill();
      } else if(style === 'circuit'){
        ctx.strokeStyle = 'rgba(90,255,170,' + (alpha * 0.8) + ')';
        ctx.lineWidth = 1.4;
        for(var cc = 0; cc < 7; cc++){
          var cx1 = -40 + Math.random() * 80, cy1 = -34 + Math.random() * 68;
          var midX = cx1 + (Math.random() * 16 - 8);
          ctx.beginPath();
          ctx.moveTo(cx1, cy1);
          ctx.lineTo(midX, cy1);
          ctx.lineTo(midX, cy1 + (Math.random() * 16 - 8));
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,210,90,' + (alpha * 0.9) + ')';
          ctx.beginPath(); ctx.arc(cx1, cy1, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      } else if(style === 'lightning'){
        ctx.save();
        ctx.shadowColor = 'rgba(150,220,255,' + alpha + ')';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(210,240,255,' + alpha + ')';
        ctx.lineWidth = 2.2;
        for(var bolt = 0; bolt < 2; bolt++){
          var bx = -20 + bolt * 34, by = -34;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          for(var seg = 0; seg < 4; seg++){
            bx += Math.random() * 16 - 4;
            by += 18;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if(style === 'crystal'){
        // facet cuts crossing the whole surface, plus several bright facet highlights
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
        ctx.lineWidth = 1.2;
        for(var fc = 0; fc < 9; fc++){
          ctx.beginPath();
          ctx.moveTo(-40 + Math.random() * 80, -36 + Math.random() * 72);
          ctx.lineTo(-40 + Math.random() * 80, -36 + Math.random() * 72);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
        ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(6, -14); ctx.lineTo(-4, 0); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.35) + ')';
        ctx.beginPath(); ctx.moveTo(12, 4); ctx.lineTo(24, 8); ctx.lineTo(14, 18); ctx.fill();
      } else if(style === 'holo'){
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.4) + ')';
        ctx.lineWidth = 3;
        for(var hl = -30; hl < 30; hl += 9){
          ctx.beginPath();
          ctx.moveTo(-44, hl); ctx.lineTo(44, hl + 10);
          ctx.stroke();
        }
        for(var spk = 0; spk < 16; spk++){
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * (0.3 + Math.random() * 0.5)) + ')';
          ctx.beginPath();
          ctx.arc(-40 + Math.random() * 80, -36 + Math.random() * 72, Math.random() * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // a little rounded-rect "paper card" behind a glyph, like a cut-out letter glued on -- rotated
    // slightly independently for that hand-pasted feel
    function drawPaper(paper, alpha){
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.rotate(paper.rot * Math.PI / 180);
      ctx.fillStyle = paper.color;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 3;
      if(ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(-paper.w / 2, -paper.h / 2, paper.w, paper.h, 5);
        ctx.fill();
      } else {
        ctx.fillRect(-paper.w / 2, -paper.h / 2, paper.w, paper.h);
      }
      ctx.restore();
    }

    function drawBurst(elapsed){
      var responsive = Math.min(1, w / 680); // shrink the collage proportionally on narrow viewports
      // hard-clip everything to the logo's own footprint -- no M (or its paper card,
      // whatever its font/rotation) can ever bleed out past this box
      ctx.save();
      var boxW = 176 * responsive, boxH = 116 * responsive;
      ctx.beginPath();
      ctx.rect(markX - boxW / 2, markY - boxH / 2, boxW, boxH);
      ctx.clip();
      burst.forEach(function(item){
        var local = elapsed - item.delay;
        if(local < 0 || local > ITEM_LIFE) return; // not on screen yet, or already gone
        var alpha; // softly fades in, rests, then dissolves
        if(local < FADE_IN) alpha = easeOutCubic(local / FADE_IN);
        else if(local < FADE_IN + HOLD) alpha = 1;
        else alpha = 1 - easeInOutSine(Math.min(1, (local - FADE_IN - HOLD) / FADE_OUT));
        var progress = Math.min(1, local / ITEM_LIFE);
        var arrival = easeOutCubic(Math.min(1, local / FADE_IN));
        var departure = Math.max(0, (local - FADE_IN - HOLD) / FADE_OUT);
        var drift = Math.sin((elapsed + item.delay) * 0.0022) * 3.2;
        var sway = Math.sin((elapsed + item.delay) * 0.0014) * 2.4;
        var rotation = Math.sin((elapsed + item.delay) * 0.0018) * 2.4;
        var scale = 0.82 + arrival * 0.2 - easeInOutSine(Math.min(1, departure)) * 0.06;
        ctx.save();
        ctx.translate(markX + (item.dx + sway) * responsive, markY + (item.dy + drift) * responsive);
        ctx.rotate((item.rot + rotation + Math.sin(progress * Math.PI) * 1.2) * Math.PI / 180);
        ctx.scale(responsive * scale, responsive * scale);
        if(item.paper) drawPaper(item.paper, alpha);
        paintGlyphTexture(item.ch, item.font, item.style, alpha, elapsed);
        ctx.restore();
      });
      ctx.restore();
    }

    function revealHeroMark(){
      var el = document.getElementById('heroMarkReveal');
      if(el) el.classList.add('revealed');
    }

    if(reduceMotion){
      drawRain(16);
      revealHeroMark();
    } else {
      setTimeout(revealHeroMark, INTRO_DURATION);
      var last = null, startTs = null;
      function frame(ts){
        if(startTs === null) startTs = ts;
        if(last === null) last = ts;
        var dt = Math.min(ts - last, 48);
        last = ts;
        var elapsed = ts - startTs;
        ctx.clearRect(0, 0, w, h);
        drawRain(dt);
        if(elapsed < INTRO_DURATION) drawBurst(elapsed);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  })();

  /* ---------- count-up numbers ---------- */
  function animateCount(el){
    var target = parseFloat(el.dataset.countTo);
    var suffix = el.dataset.suffix || '';
    if(reduceMotion){ el.textContent = target + suffix; return; }
    var start = null, duration = 1100;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- scroll reveal (entries, cards, stats) ---------- */
  var revealTargets = document.querySelectorAll('.entry, .proj-card, .reveal');
  var seen = new WeakSet();
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !seen.has(entry.target)){
        seen.add(entry.target);
        entry.target.classList.add('in');
        var num = entry.target.querySelector('[data-count-to]');
        if(num) animateCount(num);
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15 }) : null;

  function revealCheck(){
    revealTargets.forEach(function(el){
      if(io) io.observe(el);
      else el.classList.add('in'); // no IO support: just show it
    });
  }
  revealCheck();
})();
