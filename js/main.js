(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- theme ---------- */
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('bh-theme', t); } catch (e) {}
  };
  const toggleTheme = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  /* ---------- typed tagline ---------- */
  const phrases = [
    'backend systems that scale.',
    'distributed cloud services.',
    'automation > repetition.',
    'while(!dead) Code();'
  ];
  const typed = document.getElementById('typed');
  if (reduce) {
    typed.textContent = phrases[0];
  } else {
    let p = 0, i = 0, del = false;
    const tick = () => {
      const word = phrases[p];
      i += del ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let wait = del ? 35 : 70;
      if (!del && i === word.length) { del = true; wait = 1800; }
      else if (del && i === 0) { del = false; p = (p + 1) % phrases.length; wait = 400; }
      setTimeout(tick, wait);
    };
    tick();
  }

  /* ---------- background: drifting constellation ---------- */
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const n = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.4 + 0.6) * dpr
    }));
    cv.dpr = dpr;
  };
  addEventListener('resize', resize);
  addEventListener('mousemove', (e) => { mouse.x = e.clientX * cv.dpr; mouse.y = e.clientY * cv.dpr; });
  resize();
  const color = () => getComputedStyle(root).getPropertyValue('--purple').trim();
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const c = color(), d = cv.dpr, link = 130 * d;
    ctx.fillStyle = c; ctx.strokeStyle = c;
    for (const a of pts) {
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.hypot(mx, my);
        if (md < 120 * d && md > 0) { a.x += (mx / md) * 0.8 * d; a.y += (my / md) * 0.8 * d; }
      }
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < link) {
          ctx.globalAlpha = (1 - dist / link) * 0.22;
          ctx.lineWidth = d;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  };
  draw();

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- card tilt + glow ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (!reduce && card.classList.contains('tilt')) {
        const rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- terminal ---------- */
  const out = document.getElementById('term-out');
  const input = document.getElementById('term-in');
  const body = document.getElementById('term-body');
  const form = document.getElementById('term-form');
  const PROMPT = '~/bluehazard$';
  const history = [];
  let hIdx = 0;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const print = (html, cls = 'o-block') => {
    const div = document.createElement('div');
    div.className = cls; div.innerHTML = html;
    out.appendChild(div); body.scrollTop = body.scrollHeight;
  };
  const echo = (cmd) => print(`<span class="prompt">${PROMPT}</span>${esc(cmd)}`, 'o-cmd');
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const go = (id) => document.getElementById(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

  const cmds = {
    help: () => [
      '<span class="o-y">available commands</span>',
      ...[
        ['whoami', 'who is this guy'],
        ['about', 'a short intro'],
        ['skills', 'languages, cloud, areas'],
        ['projects', 'things I have built'],
        ['education', 'where I studied'],
        ['achievements', 'a few highlights'],
        ['contact', 'say hi'],
        ['theme', 'toggle light / dark'],
        ['clear', 'clear the screen (or Ctrl+L)']
      ].map(([c, d]) => `  <span class="o-k">${c.padEnd(13)}</span><span class="o-m">${d}</span>`)
    ].join('\n'),
    whoami: () => '<span class="o-g">Pritam Ghosh</span> · Software Engineer @ <span class="o-y">Amazon Web Services</span>\nLondon, UK · 5+ years building backend systems',
    about: () => { setTimeout(() => go('about'), 400); return 'I build scalable backend systems, distributed cloud\nservices and test automation frameworks.\n<span class="o-m">→ scrolling to about…</span>'; },
    skills: () => [
      '<span class="o-k">languages</span>  C++, C, Python, TypeScript, Java, R, SQL',
      '<span class="o-k">cloud</span>      ECS, Fargate, EC2, S3, DynamoDB, RDS, CloudWatch, Athena',
      '<span class="o-k">areas</span>      distributed systems, microservices, networking, OS'
    ].join('\n'),
    projects: () => [
      `<span class="o-v">craterfall/</span>  2D artillery game · TS + Phaser  ${link('https://github.com/blueRonyHazard/craterfall-the-game', 'open ↗')}`,
      `<span class="o-v">page-rank/</span>   PageRank in C++, 3 variants     ${link('https://github.com/blueRonyHazard/Page-Rank', 'open ↗')}`
    ].join('\n'),
    ls: () => cmds.projects(),
    education: () => '<span class="o-g">B.Tech, Computer Science and Engineering</span>\nIIT (Indian School of Mines) Dhanbad · 2019',
    achievements: () => [
      '<span class="o-y">★</span> Winner, Samsung Bixby Hackathon @ IIT Dhanbad (2018)',
      '<span class="o-y">★</span> JEE Advanced AIR 4159 · KVPY AIR 908 · WBJEE Rank 43',
      '<span class="o-y">★</span> HRD Ministry commendation for academic excellence'
    ].join('\n'),
    contact: () => [
      `<span class="o-k">email</span>     ${link('mailto:pritam.ghosh2411@gmail.com', 'pritam.ghosh2411@gmail.com')}`,
      `<span class="o-k">github</span>    ${link('https://github.com/blueRonyHazard', 'github.com/blueRonyHazard')}`,
      `<span class="o-k">linkedin</span>  ${link('https://www.linkedin.com/in/bluehazard-ghosh', 'linkedin.com/in/bluehazard-ghosh')}`
    ].join('\n'),
    theme: () => { toggleTheme(); return `theme set to <span class="o-g">${root.dataset.theme}</span>`; },
    clear: () => { out.innerHTML = ''; return null; },
    sudo: () => '<span class="o-r">nice try.</span> this incident will be reported.',
    exit: () => 'there is no escape. try <span class="o-k">help</span>.',
    date: () => new Date().toString(),
    echo: (args) => esc(args.join(' ')),
    pwd: () => '/home/bluehazard'
  };

  const run = (raw) => {
    const line = raw.trim();
    echo(line);
    if (!line) return;
    history.push(line); hIdx = history.length;
    const [name, ...args] = line.split(/\s+/);
    const fn = cmds[name.toLowerCase()];
    if (!fn) {
      print(`<span class="o-r">command not found:</span> ${esc(name)}. type <span class="o-k">help</span>`);
      return;
    }
    const res = fn(args);
    if (res) print(res);
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) { hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const m = Object.keys(cmds).filter((c) => c.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
      else if (m.length > 1) { echo(input.value); print(m.join('  '), 'o-block o-m'); }
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  body.addEventListener('click', () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });

  /* intro: auto-type a couple of commands */
  const auto = async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    print('<span class="o-m">Last login: ' + new Date().toDateString() + ' on ttys001</span>', 'o-block');
    for (const c of ['whoami', 'projects']) {
      if (!reduce) {
        await sleep(500);
        for (const ch of c) { input.value += ch; await sleep(80); }
        await sleep(250);
      }
      input.value = '';
      run(c);
    }
    print('type <span class="o-k">help</span> to see what else I can do.', 'o-block o-m');
  };
  auto();
})();
