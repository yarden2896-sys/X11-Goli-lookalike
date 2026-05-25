/* X11 Landing Page — Interactive JS */

/* ── Announcement bar close ──────────────────────────────── */
const annClose = document.getElementById('ann-close');
const annBar   = document.getElementById('announcement-bar');
const header   = document.getElementById('site-header');
if (annClose && annBar) {
  annClose.addEventListener('click', () => {
    annBar.style.display = 'none';
    header.style.top = '0';
    header.classList.add('ann-gone');
    document.documentElement.style.setProperty('--announce-h', '0px');
  });
}

/* ── Hamburger / mobile menu ─────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });
  mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ── Variant selector ────────────────────────────────────── */
document.querySelectorAll('.variant-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ── Final CTA offer selector ────────────────────────────── */
const fctaBtn = document.getElementById('fcta-cta-btn');
document.querySelectorAll('.fcta-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.fcta-option').forEach(o => o.classList.remove('fcta-active'));
    opt.classList.add('fcta-active');
  });
});

/* ── FAQ accordion (accessible) ──────────────────────────── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = q.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
      other.closest('.faq-item').querySelector('.faq-a').hidden = true;
    });

    if (!isOpen) {
      q.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
      answer.hidden = false;
    }
  });
});

/* ── UGC Video play/pause toggle ─────────────────────────── */
function initVideoCard(card) {
  const video   = card.querySelector('.ugc-video');
  const playBtn = card.querySelector('.ugc-play-btn');
  if (!video || !playBtn) return;

  playBtn.addEventListener('click', () => {
    if (video.paused) {
      // Pause all other videos first
      document.querySelectorAll('.ugc-video').forEach(v => {
        if (v !== video) {
          v.pause();
          const btn = v.closest('[class*="ugc-card"], [class*="ugc-strip-card"]')?.querySelector('.ugc-play-btn');
          if (btn) btn.classList.remove('hidden');
        }
      });
      video.play();
      playBtn.classList.add('hidden');
    } else {
      video.pause();
      playBtn.classList.remove('hidden');
    }
  });

  video.addEventListener('click', () => {
    if (!video.paused) {
      video.pause();
      playBtn.classList.remove('hidden');
    }
  });

  video.addEventListener('ended', () => {
    playBtn.classList.remove('hidden');
  });
}

document.querySelectorAll('.ugc-card, .ugc-strip-card').forEach(initVideoCard);

/* ── Sticky buy bar (show after hero leaves viewport) ─────── */
const stickyBar  = document.getElementById('sticky-buy-bar');
const heroEl     = document.getElementById('hero');
if (stickyBar && heroEl) {
  const obs = new IntersectionObserver(
    ([entry]) => {
      const show = !entry.isIntersecting;
      stickyBar.style.display = show ? 'flex' : 'none';
      stickyBar.setAttribute('aria-hidden', !show);
    },
    { threshold: 0 }
  );
  obs.observe(heroEl);
}

/* ── Smooth scroll for anchors ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const hH = document.getElementById('site-header')?.offsetHeight || 68;
    const aH = annBar?.style.display === 'none' ? 0 : (annBar?.offsetHeight || 44);
    const y  = target.getBoundingClientRect().top + window.scrollY - hH - aH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ── Scroll-reveal animations ─────────────────────────────── */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const els = document.querySelectorAll(
    '.benefit-card, .review-card, .ugc-card, .step, .science-point, .faq-item, .gallery-item, .fcta-option'
  );
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
    io.observe(el);
  });
}
