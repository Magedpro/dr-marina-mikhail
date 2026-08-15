// ============================================
//  د. مارينا ميخائيل - Main JS
// ============================================

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNav();
});

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── Active nav link on scroll ── */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + h);
  });
}

/* ── Hero Particles ── */
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const sizes = [4, 6, 8, 10, 14];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      animation-delay:${Math.random() * 4}s;
      animation-duration:${3 + Math.random() * 4}s;
      opacity:${0.08 + Math.random() * 0.15};
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ── Intersection Observer (reveal animations) ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stagger children if they have delay style
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ── Counter Animation ── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ── Testimonials Slider ── */
(function initTestimonials() {
  const track  = document.getElementById('testimonial-track');
  const dotsEl = document.getElementById('testimonial-dots');
  if (!track || !dotsEl) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let timer;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('testimonial-dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `تقييم ${i + 1}`);
    if (i === 0) { dot.classList.add('active'); dot.setAttribute('aria-selected', 'true'); }
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    cards[current].removeAttribute('aria-current');
    dotsEl.children[current].classList.remove('active');
    dotsEl.children[current].setAttribute('aria-selected', 'false');
    current = index;
    track.style.transform = `translateX(${current * 100}%)`;
    dotsEl.children[current].classList.add('active');
    dotsEl.children[current].setAttribute('aria-selected', 'true');
    cards[current].setAttribute('aria-current', 'true');
    resetTimer();
  }

  function nextSlide() { goTo((current + 1) % cards.length); }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 4500);
  }

  resetTimer();
  cards[0].setAttribute('aria-current', 'true');
})();

/* ── Load Clinics ── */
function loadClinics() {
  const grid = document.getElementById('clinics-grid');
  if (!grid) return;

  // Default clinic (always shown)
  const defaultClinic = {
    id: 'default',
    name: 'عيادة جرجا الرئيسية',
    address: 'جرجا، شارع المحطة، أعلى برج كشري البهيجي، الدور السادس',
    city: 'جرجا - سوهاج',
    phone: '01281440083',
    whatsapp: '201281440083',
    hours: 'السبت – الخميس: ١٠ص – ١٠م'
  };

  // Extra clinics from dashboard (localStorage)
  let extra = [];
  try {
    extra = JSON.parse(localStorage.getItem('dr_marina_clinics') || '[]');
  } catch (e) { extra = []; }

  const clinics = [defaultClinic, ...extra];

  grid.innerHTML = clinics.map((c, i) => `
    <div class="clinic-card reveal-up" style="animation-delay:${i * 0.15}s">
      <div class="clinic-header">
        <div class="clinic-number">عيادة ${i + 1}</div>
        <div class="clinic-name">${escapeHTML(c.name)}</div>
      </div>
      <div class="clinic-body">
        <div class="clinic-info">
          <div class="clinic-info-row">
            <i class="fas fa-map-marker-alt"></i>
            <span>${escapeHTML(c.address)}</span>
          </div>
          ${c.city ? `<div class="clinic-info-row"><i class="fas fa-city"></i><span>${escapeHTML(c.city)}</span></div>` : ''}
          ${c.hours ? `<div class="clinic-info-row"><i class="fas fa-clock"></i><span>${escapeHTML(c.hours)}</span></div>` : ''}
          <div class="clinic-info-row">
            <i class="fas fa-phone-alt"></i>
            <span>${escapeHTML(c.phone)}</span>
          </div>
        </div>
        <div class="clinic-btns">
          <a href="tel:+2${c.phone}" class="clinic-btn clinic-btn-call" aria-label="اتصل بعيادة ${escapeHTML(c.name)}">
            <i class="fas fa-phone-alt"></i> اتصل
          </a>
          <a href="https://wa.me/${c.whatsapp}?text=السلام%20عليكم%20د.%20مارينا%2C%20أريد%20حجز%20موعد"
             target="_blank" rel="noopener"
             class="clinic-btn clinic-btn-wa" aria-label="واتساب عيادة ${escapeHTML(c.name)}">
            <i class="fab fa-whatsapp"></i> واتساب
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Re-observe new cards
  grid.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
}

loadClinics();

/* ── Utility ── */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Floating buttons show/hide ── */
const floatingBtns = document.getElementById('floating-btns');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > 300) {
    floatingBtns.style.opacity = '1';
    floatingBtns.style.pointerEvents = 'all';
  } else {
    floatingBtns.style.opacity = '0';
    floatingBtns.style.pointerEvents = 'none';
  }
  lastScroll = current;
}, { passive: true });

// Initial state
floatingBtns.style.transition = 'opacity 0.4s ease';
floatingBtns.style.opacity = '0';
floatingBtns.style.pointerEvents = 'none';

/* ── Preloader ── */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hide');
      setTimeout(() => preloader.remove(), 600);
    }, 400);
  }
});
// Fallback in case load event already fired
setTimeout(() => {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hide')) {
    preloader.classList.add('hide');
    setTimeout(() => preloader.remove(), 600);
  }
}, 2500);

/* ── FAQ Accordion ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all items
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      const b = i.querySelector('.faq-q');
      if (b) b.setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── Booking Form Submission (WhatsApp) ── */
function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById('bf-name')?.value.trim();
  const phone = document.getElementById('bf-phone')?.value.trim();
  const reason = document.getElementById('bf-reason')?.value || 'استشارة / كشف';
  const notes = document.getElementById('bf-msg')?.value.trim();

  if (!name || !phone) {
    alert('يرجى كتابة الاسم ورقم الهاتف للمتابعة');
    return;
  }

  let text = `السلام عليكم د. مارينا ميخائيل،\nأرغب في حجز موعد بعيادة الأسنان:\n👤 *الاسم:* ${name}\n📱 *الهاتف:* ${phone}\n🦷 *الخدمة المطلوبة:* ${reason}`;
  if (notes) {
    text += `\n📝 *ملاحظات:* ${notes}`;
  }

  const encoded = encodeURIComponent(text);
  const waUrl = `https://wa.me/201281440083?text=${encoded}`;
  window.open(waUrl, '_blank', 'noopener');
}
window.submitForm = submitForm;

/* ── Load Site Settings (Social & Google Maps) ── */
function loadSiteSettingsOnPage() {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('dr_marina_site_settings') || '{}');
  } catch {
    settings = {};
  }

  // Social Links in Footer
  const fbBtn = document.getElementById('social-fb');
  const igBtn = document.getElementById('social-ig');
  const ttBtn = document.getElementById('social-tt');
  const ytBtn = document.getElementById('social-yt');

  if (fbBtn) {
    if (settings.fb) { fbBtn.href = settings.fb; fbBtn.style.display = 'inline-flex'; }
    else { fbBtn.style.display = 'none'; }
  }
  if (igBtn) {
    if (settings.ig) { igBtn.href = settings.ig; igBtn.style.display = 'inline-flex'; }
    else { igBtn.style.display = 'none'; }
  }
  if (ttBtn) {
    if (settings.tt) { ttBtn.href = settings.tt; ttBtn.style.display = 'inline-flex'; }
    else { ttBtn.style.display = 'none'; }
  }
  if (ytBtn) {
    if (settings.yt) { ytBtn.href = settings.yt; ytBtn.style.display = 'inline-flex'; }
    else { ytBtn.style.display = 'none'; }
  }

  // Google Maps Embed & Directions
  if (settings.mapsEmbed) {
    const mapIframe = document.querySelector('#map-embed iframe');
    if (mapIframe) {
      mapIframe.src = settings.mapsEmbed;
    }
  }

  if (settings.mapsDir) {
    const dirBtn = document.getElementById('map-directions-link');
    if (dirBtn) {
      dirBtn.href = settings.mapsDir;
    }
  }
}

loadSiteSettingsOnPage();


/* ── Hero Video Handler ── */
(function initHeroVideo() {
  const video  = document.getElementById('hero-video');
  const bgImg  = document.getElementById('hero-bg-img');
  if (!video) return;

  // When video can play — fade it in, hide fallback image
  video.addEventListener('canplay', () => {
    video.style.opacity = '1';
    if (bgImg) bgImg.style.opacity = '0';
  });

  // If video fails to load — keep image visible, hide broken video
  video.addEventListener('error', () => {
    video.style.display = 'none';
    if (bgImg) bgImg.style.opacity = '1';
  });

  // Force load
  video.load();
  video.play().catch(() => {
    // Autoplay blocked — show image fallback
    video.style.display = 'none';
    if (bgImg) bgImg.style.opacity = '1';
  });
})();

