/* ==========================================================================
   KORI — SHARED BEHAVIOUR
   Constellation canvas, scroll progress, colour rooms, reveals.
   Every piece is optional: a page only gets what its markup asks for.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollP = 0, darkTarget = 0;

  /* ---------------------------------------------------------------- canvas */
  var cv = document.getElementById('net');
  if (cv && !reduced) {
    var ctx = cv.getContext('2d');
    var ACCENTS = ['#F98515', '#F5513E', '#049C9F', '#0590C6'];
    var INK_LIGHT = [28, 27, 27], INK_DARK = [247, 243, 236];
    var W, H, CX, CY, dpr, darkMix = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W / 2; CY = H / 2;
    }
    size();
    addEventListener('resize', size);

    var DEPTH = 4200, F = 430, N = 200, REACH = 190;
    var nodes = Array.from({ length: N }, function () {
      return {
        x: (Math.random() - .5) * 1900,
        y: (Math.random() - .5) * 1200,
        z: Math.random() * DEPTH,
        r: .8 + Math.random() * 1.8,
        c: Math.random() < .3 ? ACCENTS[Math.floor(Math.random() * 4)] : null,
        tw: Math.random() * Math.PI * 2,
        mate: Math.floor(Math.random() * N),
        hx: 0, hy: 0
      };
    });

    var curX = -999, curY = -999, curOn = false;
    var cur = document.getElementById('cur');
    addEventListener('mousemove', function (e) {
      curX = e.clientX; curY = e.clientY; curOn = true;
      if (cur) {
        cur.style.opacity = 1;
        cur.style.left = curX + 'px';
        cur.style.top = curY + 'px';
      }
    });
    document.addEventListener('mouseleave', function () {
      curOn = false;
      if (cur) cur.style.opacity = 0;
    });

    // nodes recycle in both directions so scrolling back up never empties the field
    function project(n, camZ) {
      var zr = n.z - camZ;
      while (zr < 50) { n.z += DEPTH; zr = n.z - camZ; }
      while (zr > DEPTH + 50) { n.z -= DEPTH; zr = n.z - camZ; }
      var s = F / zr;
      return { px: CX + n.x * s + n.hx, py: CY + n.y * s + n.hy, s: s, zr: zr };
    }

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      darkMix += (darkTarget - darkMix) * .04;
      var ink = INK_LIGHT.map(function (v, i) {
        return Math.round(v + (INK_DARK[i] - v) * darkMix);
      });
      var inkStr = 'rgb(' + ink.join(',') + ')';
      var camZ = scrollP * (DEPTH * .8) + Math.sin(t / 2800) * 8;
      var roll = scrollP * .12;

      var cosr = Math.cos(-roll), sinr = Math.sin(-roll);
      var rx = curX - CX, ry = curY - CY;
      var cX = CX + rx * cosr - ry * sinr;
      var cY = CY + rx * sinr + ry * cosr;

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(roll);
      ctx.translate(-CX, -CY);

      var tethers = [];

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var p = project(n, camZ);
        if (p.px < -80 || p.px > W + 80 || p.py < -80 || p.py > H + 80) { n.hx *= .9; n.hy *= .9; continue; }
        var depthFade = Math.max(0, 1 - p.zr / 2400);
        var nearFade = Math.min(1, (p.zr - 60) / 170);
        var a = depthFade * nearFade;
        if (a <= 0.01) { n.hx *= .9; n.hy *= .9; continue; }

        var h = 0;
        if (curOn) {
          var dx = cX - p.px, dy = cY - p.py;
          var d = Math.hypot(dx, dy);
          if (d < REACH) {
            h = 1 - d / REACH;
            h *= h;
            n.hx += ((dx / (d || 1)) * 26 * h - n.hx) * .1;
            n.hy += ((dy / (d || 1)) * 26 * h - n.hy) * .1;
            tethers.push({ px: p.px, py: p.py, d: d, a: a, h: h, c: n.c });
          } else { n.hx *= .92; n.hy *= .92; }
        } else { n.hx *= .92; n.hy *= .92; }

        var m = nodes[n.mate];
        if (m) {
          var q = project(m, camZ);
          if (Math.abs(q.zr - p.zr) < 950 && q.px > -80 && q.px < W + 80) {
            ctx.globalAlpha = a * .08;
            ctx.strokeStyle = inkStr;
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(q.px, q.py); ctx.stroke();
          }
        }

        var pulse = .75 + .25 * Math.sin(t / 950 + n.tw);
        var rad = Math.min(4.2, n.r * p.s * 3) * (1 + h * .5);
        if (n.c) {
          ctx.globalAlpha = Math.min(1, a * .14 * pulse * (1 + h * 2));
          ctx.fillStyle = n.c;
          ctx.beginPath(); ctx.arc(p.px, p.py, rad * 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = Math.min(1, a * .88 * pulse * (1 + h * .4));
          ctx.beginPath(); ctx.arc(p.px, p.py, rad, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = Math.min(1, a * (.45 + h * .35) * pulse);
          ctx.fillStyle = h > .04 ? '#F5513E' : inkStr;
          ctx.beginPath(); ctx.arc(p.px, p.py, rad * .8, 0, Math.PI * 2); ctx.fill();
        }
      }

      tethers.sort(function (u, v) { return u.d - v.d; });
      for (var k = 0; k < Math.min(7, tethers.length); k++) {
        var th = tethers[k];
        ctx.globalAlpha = th.a * th.h * .45;
        ctx.strokeStyle = th.c || inkStr;
        ctx.lineWidth = .9;
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(th.px, th.py);
        ctx.stroke();
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* -------------------------------------------------- scroll progress + art */
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var map01 = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };

  var progress = document.getElementById('progress');
  var ghostc = document.getElementById('ghostc');
  // decorative and hidden under 900px, so phones never fetch it
  if (ghostc && ghostc.dataset.src && innerWidth > 900) ghostc.src = ghostc.dataset.src;

  addEventListener('scroll', function () {
    var doc = document.documentElement;
    var total = doc.scrollHeight - innerHeight;
    scrollP = total ? scrollY / total : 0;
    if (progress) progress.style.transform = 'scaleX(' + scrollP + ')';
    if (ghostc) {
      var cIn = map01(scrollP, .3, .5);
      var cOut = 1 - map01(scrollP, .78, .9);
      ghostc.style.opacity = (.5 * Math.min(cIn, cOut)).toFixed(3);
      ghostc.style.transform = 'translateY(-50%) scale(' + (1.05 - Math.min(cIn, 1) * .05) + ')';
    }
  }, { passive: true });

  /* ------------------------------------------------------- colour rooms */
  // the section whose top has crossed the middle of the viewport owns the
  // background, so the colours reverse correctly when scrolling back up
  var rooms = [].slice.call(document.querySelectorAll('[data-bg]'))
    .filter(function (el) { return el.tagName !== 'BODY'; });

  if (rooms.length) {
    var curBg = null;
    var paintRoom = function () {
      var mid = innerHeight * .5;
      var active = rooms[0];
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].getBoundingClientRect().top <= mid) active = rooms[i]; else break;
      }
      var bg = active.dataset.bg;
      if (bg !== curBg) {
        curBg = bg;
        document.body.style.backgroundColor = bg;
        var dark = active.dataset.dark === '1';
        document.body.classList.toggle('on-dark', dark);
        darkTarget = dark ? 1 : 0;
      }
    };
    addEventListener('scroll', function () { requestAnimationFrame(paintRoom); }, { passive: true });
    addEventListener('resize', paintRoom);
    paintRoom();
  }

  /* ------------------------------------------------------------ reveals */
  var targets = document.querySelectorAll('.anim-text-up');
  if (targets.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: .05, rootMargin: '0px 0px -6% 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }
  }

  /* --------------------------------------------- scroll-drawn SVG paths */
  var drawn = document.querySelectorAll('[data-draw] path');
  if (drawn.length) {
    drawn.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduced ? 0 : len;
    });
    if (!reduced) {
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('path').forEach(function (p, i) {
            p.style.transition = 'stroke-dashoffset 1.6s var(--ease) ' + (i * .18) + 's';
            p.style.strokeDashoffset = 0;
          });
          dio.unobserve(e.target);
        });
      }, { threshold: .3 });
      document.querySelectorAll('[data-draw]').forEach(function (el) { dio.observe(el); });
    }
  }

  /* ------------------------------------------------------ team carousel */
  var teamCarousel = document.querySelector('[data-team-carousel]');
  if (teamCarousel) {
    var teamCards = [].slice.call(teamCarousel.querySelectorAll('.person'));
    var activateTeamCard = function (card) {
      teamCards.forEach(function (item) {
        var active = item === card;
        item.classList.toggle('is-active', active);
        var button = item.querySelector('.person-toggle');
        if (button) button.setAttribute('aria-expanded', String(active));
      });
    };
    teamCards.forEach(function (card) {
      var button = card.querySelector('.person-toggle');
      if (button) button.addEventListener('click', function () { activateTeamCard(card); });
    });
  }

})();
