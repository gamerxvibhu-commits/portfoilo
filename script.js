/* =========================================
   NIRBHAY PORTFOLIO — script.js
   GSAP + Three.js + Interactions
   ========================================= */

/* ===== GSAP PLUGINS ===== */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* ===== LENIS SMOOTH SCROLL ===== */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
// Sync GSAP ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

/* ===== SCROLL PROGRESS BAR ===== */
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  scrollBar.style.width = pct + '%';
}, { passive: true });

/* ===== CURSOR ===== */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: 'none' });
});

// Trail follows with lag
function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  gsap.set(trail, { x: trailX, y: trailY });
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Hover effect on interactive elements
document.querySelectorAll('a, button, .skill-card, .service-card, .portfolio-item, .contact-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

/* ===== MAGNETIC BUTTONS ===== */
document.querySelectorAll('.mag-btn').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', function() {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  });
  btn.addEventListener('click', function() {
    gsap.timeline()
      .to(btn, { scale: 0.94, duration: 0.1 })
      .to(btn, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.4)' });
  });
});

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

/* ===== HAMBURGER MENU ===== */
const ham = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

ham.addEventListener('click', () => {
  menuOpen = !menuOpen;
  ham.classList.toggle('open', menuOpen);
  if (menuOpen) {
    mobileMenu.style.transform = 'translateX(0)';
    lenis.stop();
  } else {
    mobileMenu.style.transform = 'translateX(100%)';
    lenis.start();
  }
});
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => {
    menuOpen = false;
    ham.classList.remove('open');
    mobileMenu.style.transform = 'translateX(100%)';
    lenis.start();
  });
});

/* ===== LOADING SCREEN ===== */
function runLoader() {
  const bar = document.getElementById('loaderBar');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';
  }, 80);

  gsap.timeline({ delay: 0.2 })
    .from('#loader .loader-content', { opacity: 0, y: 30, duration: 0.6 })
    .to('#loader', {
      opacity: 0,
      duration: 0.7,
      delay: 1.8,
      ease: 'power2.inOut',
      onComplete: () => {
        document.getElementById('loader').style.display = 'none';
        animateHero();
      }
    });
}
runLoader();

/* ===== HERO ANIMATIONS ===== */
function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, delay: 0.1 })
    .to('.hero-name', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.4')
    .to('.hero-line', { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, '-=0.3')
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('.hero-btns', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-tools', {
      opacity: 1, y: 0, duration: 0.8,
      onComplete: () => initThreeJS()
    }, '-=0.4');
}

/* ===== THREE.JS HERO CANVAS ===== */
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  /* -- Particles -- */
  const particleCount = 1500;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    // Mostly dim, some bright neon
    const bright = Math.random() > 0.85;
    colors[i * 3]     = bright ? 0   : 0.05;
    colors[i * 3 + 1] = bright ? 1   : 0.25;
    colors[i * 3 + 2] = bright ? 0.5 : 0.1;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* -- Central floating torus knot -- */
  const knotGeo = new THREE.TorusKnotGeometry(0.9, 0.22, 200, 20, 2, 3);
  const knotMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  /* -- Outer ring -- */
  const ringGeo = new THREE.TorusGeometry(2, 0.006, 8, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.15 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  scene.add(ring);

  /* -- Mouse reactive light plane -- */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * -2;
  });

  /* -- Resize -- */
  window.addEventListener('resize', () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  /* -- Animate loop -- */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    // Particle drift
    particles.rotation.y = t * 0.05;
    particles.rotation.x = t * 0.02;

    // Knot spin
    knot.rotation.x = t * 0.4 + my * 0.3;
    knot.rotation.y = t * 0.6 + mx * 0.3;

    // Ring pulse
    const pulse = 1 + Math.sin(t * 2) * 0.04;
    ring.scale.set(pulse, pulse, pulse);
    ring.rotation.z = t * 0.15;

    // Camera subtle drift following mouse
    camera.position.x += (mx * 0.3 - camera.position.x) * 0.03;
    camera.position.y += (my * 0.2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}

/* ===== COUNTERS ===== */
function startCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    gsap.to({ val: 0 }, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: function() { el.textContent = Math.floor(this.targets()[0].val); },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      }
    });
  });
}
startCounters();

/* ===== SCROLL ANIMATIONS ===== */

// About
gsap.to('.about-left', {
  opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: '#about', start: 'top 75%' }
});
gsap.to('.about-right', {
  opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out',
  scrollTrigger: { trigger: '#about', start: 'top 75%' }
});
gsap.to('.stat-card', {
  opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-right', start: 'top 80%' }
});

// Skills
gsap.to('.skill-card', {
  opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
  scrollTrigger: { trigger: '#skills', start: 'top 75%' }
});

// Services
gsap.to('.service-card', {
  opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
  scrollTrigger: { trigger: '#services', start: 'top 75%' }
});

// Contact
gsap.to('.contact-card', {
  opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
  scrollTrigger: { trigger: '#contact', start: 'top 75%' }
});

/* ===== GOOGLE DRIVE GALLERY ===== */
(function initDriveGallery() {
  const FOLDER_ID = '1kvbXwZgZ0rHE-WntZmGSV-CuSBbZ3TyN';
  // ⚠️ IMPORTANT: Replace with your own Google Drive API key
  // Steps to get API key:
  // 1. Go to: https://console.cloud.google.com/
  // 2. Create a new project or select existing one
  // 3. Enable "Google Drive API"
  // 4. Create an API key (Credentials → Create Credentials → API Key)
  // 5. Restrict it to your domain for security
  // 6. Also make sure your Google Drive folder (id: 1kvbXwZgZ0rHE-WntZmGSV-CuSBbZ3TyN) is SHARED PUBLICLY
  const API_KEY   = 'YOUR_GOOGLE_DRIVE_API_KEY';

  const API_URL   = 'https://www.googleapis.com/drive/v3/files'
    + '?q=' + encodeURIComponent("'" + FOLDER_ID + "' in parents and mimeType contains 'image/' and trashed=false")
    + '&fields=' + encodeURIComponent('files(id,name,mimeType,thumbnailLink)')
    + '&pageSize=100'
    + '&orderBy=name'
    + '&key=' + API_KEY;

  /* -- Auto-detect category from filename keywords -- */
  function detectCat(name) {
    const n = name.toLowerCase();
    if (n.includes('thumbnail') || n.includes('thum')) return 'thumbnail';
    if (n.includes('poster'))                           return 'poster';
    if (n.includes('branding') || n.includes('brand')) return 'branding';
    if (n.includes('ai'))                               return 'ai';
    if (n.includes('cinematic') || n.includes('cine')) return 'cinematic';
    return 'design';
  }

  /* -- Clean filename → display title -- */
  function prettyTitle(name) {
    return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  }

  /* -- Google image CDN URLs (public files, no auth needed) -- */
  function thumbURL(id) { return 'https://lh3.googleusercontent.com/d/' + id + '=s800'; }
  function fullURL(id)  { return 'https://lh3.googleusercontent.com/d/' + id + '=s1600'; }

  const grid = document.getElementById('portfolioGrid');

  /* -- Skeleton placeholders while loading -- */
  function showSkeletons(count) {
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'portfolio-item pi-skeleton';
      sk.style.cssText = 'opacity:1;transform:none;';
      grid.appendChild(sk);
    }
  }

  /* -- Build one portfolio card -- */
  function buildCard(file) {
    const cat   = detectCat(file.name);
    const title = prettyTitle(file.name);
    const id    = file.id;

    const div = document.createElement('div');
    div.className   = 'portfolio-item';
    div.dataset.cat = cat;
    div.style.cssText = 'opacity:0;transform:scale(0.92);';

    div.innerHTML =
      '<div class="pi-bg" style="background:#0d0d0d;display:flex;align-items:center;justify-content:center;overflow:hidden;">'
      + '<img class="pi-img-fade" src="' + thumbURL(id) + '" data-full="' + fullURL(id) + '" alt="' + title + '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;" />'
      + '</div>'
      + '<div class="pi-overlay">'
      + '<p class="pi-cat">' + cat + '</p>'
      + '<p class="pi-title">' + title + '</p>'
      + '</div>'
      + '<div class="pi-expand">+</div>';

    /* Fade image in once loaded */
    const img = div.querySelector('img');
    img.addEventListener('load', function() { img.classList.add('loaded'); });
    img.addEventListener('error', function() {
      if (file.thumbnailLink && img.src !== file.thumbnailLink) {
        img.src = file.thumbnailLink;
      } else {
        img.style.display = 'none';
      }
    });

    /* Open modal with full-size image */
    div.addEventListener('click', function() {
      openModal({ emoji: '🖼️', cat: cat, title: title, desc: '', _img: fullURL(id) });
    });

    return div;
  }

  /* -- Error / empty state -- */
  function showMessage(icon, line1, line2) {
    grid.innerHTML =
      '<div class="portfolio-error">'
      + '<span style="font-size:2.5rem;margin-bottom:14px;">' + icon + '</span>'
      + '<span>' + line1 + '</span>'
      + (line2 ? '<span style="margin-top:8px;color:rgba(0,255,136,0.5);">' + line2 + '</span>' : '')
      + '</div>';
  }

  /* -- Fetch from Drive API -- */
  async function loadGallery() {
    showSkeletons(8);
    let files = [];

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Drive API responded with ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      files = data.files || [];
    } catch (err) {
      console.warn('[Drive Gallery] Fetch failed:', err.message);
      showMessage(
        '📁',
        'Could not load gallery from Google Drive.',
        'Make sure the folder is shared publicly and your API key is set in script.js'
      );
      return;
    }

    grid.innerHTML = '';

    if (!files.length) {
      showMessage('📂', 'No images found in the Drive folder yet.', 'Add images and they will appear here automatically.');
      return;
    }

    files.forEach(function(file) { grid.appendChild(buildCard(file)); });

    /* Re-attach cursor hover for dynamically created cards */
    document.querySelectorAll('.portfolio-item').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursor.classList.add('hovered'); });
      el.addEventListener('mouseleave', function() { cursor.classList.remove('hovered'); });
    });

    animatePortfolioItems();
  }

  loadGallery();
})();

/* ===== PORTFOLIO FILTER REMOVED ===== */

/* ===== MODAL REMOVED ===== */

/* ===== COPY EMAIL BUTTON ===== */
document.getElementById('copyEmail').addEventListener('click', function() {
  navigator.clipboard.writeText('n4nirbhayy077@gmail.com').then(() => {
    const txt = document.getElementById('copyEmailText');
    const orig = txt.textContent;
    txt.textContent = '✓ Copied!';
    gsap.fromTo(this, { scale: 1 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 });
    setTimeout(() => { txt.textContent = orig; }, 2200);
  });
});

/* ===== PARALLAX HERO GLOW ===== */
document.addEventListener('mousemove', (e) => {
  const glow = document.querySelector('.hero-glow');
  if (!glow) return;
  const mx = (e.clientX / window.innerWidth  - 0.5) * 60;
  const my = (e.clientY / window.innerHeight - 0.5) * 60;
  gsap.to(glow, { x: mx, y: my, duration: 1.5, ease: 'power2.out' });
});

/* ===== SECTION HEADING PARALLAX ===== */
gsap.utils.toArray('h2').forEach(h => {
  gsap.from(h, {
    opacity: 0, y: 50, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: h, start: 'top 85%' }
  });
});

/* ===== MOBILE: DISABLE CURSOR ===== */
if ('ontouchstart' in window) {
  cursor.style.display = 'none';
  trail.style.display  = 'none';
  document.body.style.cursor = 'auto';
}

/* ===== PORTFOLIO ITEM TILT (desktop only) ===== */
if (!('ontouchstart' in window)) {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, {
        rotationY: x * 14,
        rotationX: -y * 14,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.5, ease: 'power2.out' });
    });
  });
}

/* ===== FLOATING ANIMATION FOR STAT CARDS ===== */
gsap.to('.stat-card:nth-child(odd)', {
  y: -8, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
});
gsap.to('.stat-card:nth-child(even)', {
  y: 8, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5
});

/* ===== SECTION NAV ACTIVE HIGHLIGHT ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      navLinks.forEach(l => {
        l.classList.toggle('text-neon', l.getAttribute('href') === '#' + en.target.id);
        l.classList.toggle('text-gray-400', l.getAttribute('href') !== '#' + en.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => io.observe(s));

/* ===== LOG ===== */
console.log('%c NIRBHAY PORTFOLIO ', 'background:#00ff88;color:#000;font-weight:900;font-size:18px;padding:8px 16px;border-radius:4px;');
console.log('%c Built with GSAP + Three.js + Lenis ', 'color:#00ff88;font-size:12px;');
