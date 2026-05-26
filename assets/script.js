/* X11 Supplements Theme — Interactive JS */

/* ── HIGH-CONVERSION PRODUCT PAGE ───────────────────────── */
(function initProductPage() {

  /* Mark body so CSS can add bottom padding for sticky bar */
  if (document.querySelector('.pp-main')) {
    document.body.classList.add('pp-on-product');
  }

  /* Gallery thumbnails */
  document.querySelectorAll('.pp-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const mainImg = document.getElementById('pp-main-img');
      if (mainImg && thumb.dataset.ppSrc) {
        mainImg.src = thumb.dataset.ppSrc;
        mainImg.alt = thumb.dataset.ppAlt || '';
      }
      document.querySelectorAll('.pp-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  /* Load product variants for price matching */
  let ppVariants = [];
  try {
    const variantsEl = document.getElementById('pp-variants-json');
    if (variantsEl) ppVariants = JSON.parse(variantsEl.textContent);
  } catch(e) {}

  function ppFormatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function ppGetSelectedOptions() {
    const sel = {};
    document.querySelectorAll('.pp-opt-btn.active').forEach(b => {
      sel[b.dataset.option] = b.dataset.value;
    });
    return sel;
  }

  function ppFindVariant(selected) {
    return ppVariants.find(v =>
      v.options.every((opt, i) => selected[String(i + 1)] === opt)
    );
  }

  function ppUpdatePricing(variant) {
    if (!variant) return;
    const priceEl   = document.getElementById('pp-price');
    const compareEl = document.getElementById('pp-compare');
    const saveEl    = document.getElementById('pp-save-chip');
    const atcBtn    = document.getElementById('pi-atc-btn');
    const vidEl     = document.getElementById('variant-id');
    const perSrv    = document.getElementById('pp-per-serving');

    if (vidEl) vidEl.value = variant.id;
    if (priceEl) priceEl.textContent = ppFormatMoney(variant.price);

    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (compareEl) { compareEl.textContent = ppFormatMoney(variant.compare_at_price); compareEl.style.display = ''; }
      if (saveEl) {
        const pct = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
        saveEl.textContent = `SAVE ${pct}%`;
        saveEl.style.display = '';
      }
    } else {
      if (compareEl) compareEl.style.display = 'none';
      if (saveEl) saveEl.style.display = 'none';
    }

    if (perSrv) {
      const perServingCents = Math.round(variant.price / 30);
      perSrv.innerHTML = `Only <strong>${ppFormatMoney(perServingCents)}</strong>/serving — less than a cup of coffee ☕`;
    }

    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      atcBtn.innerHTML = variant.available
        ? `🛒 &nbsp;Add to Cart — ${ppFormatMoney(variant.price)}`
        : 'Sold Out';
    }
  }

  /* Variant option buttons */
  document.querySelectorAll('.pp-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.pp-option-btns');
      if (group) group.querySelectorAll('.pp-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const opt = btn.dataset.option;
      const selectedEl = document.querySelector(`.pp-option-selected[data-pp-opt="${opt}"]`);
      if (selectedEl) selectedEl.textContent = btn.dataset.value;

      /* Update price for matched variant */
      const variant = ppFindVariant(ppGetSelectedOptions());
      if (variant) ppUpdatePricing(variant);
    });
  });

  /* Qty +/- */
  const ppQtyInput    = document.getElementById('qty-input');
  const ppQtyDecrease = document.getElementById('qty-decrease');
  const ppQtyIncrease = document.getElementById('qty-increase');
  if (ppQtyInput && ppQtyDecrease && ppQtyIncrease) {
    ppQtyDecrease.addEventListener('click', () => {
      const v = parseInt(ppQtyInput.value);
      if (v > 1) ppQtyInput.value = v - 1;
    });
    ppQtyIncrease.addEventListener('click', () => {
      const v = parseInt(ppQtyInput.value);
      if (v < 99) ppQtyInput.value = v + 1;
    });
  }

  /* Sticky buy bar — show after buy box scrolls out of view */
  const ppStickyBar = document.getElementById('pp-sticky-bar');
  const ppBuyBox    = document.querySelector('.pp-buy-box');
  if (ppStickyBar && ppBuyBox) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting;
        ppStickyBar.style.display = show ? 'flex' : 'none';
        ppStickyBar.setAttribute('aria-hidden', !show);
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );
    obs.observe(ppBuyBox);
  }

  /* Sticky bar "Add to Cart" — scroll to buy box on desktop, submit form on mobile */
  const ppSbAtc = document.getElementById('pp-sb-atc');
  if (ppSbAtc) {
    ppSbAtc.addEventListener('click', () => {
      const form = document.getElementById('product-form');
      if (window.innerWidth < 640 && form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } else {
        const box = document.querySelector('.pp-buy-box');
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.pp-faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.closest('.pp-faq-item');
      const answer = item.querySelector('.pp-faq-a');
      const isOpen = q.getAttribute('aria-expanded') === 'true';

      /* Close all */
      document.querySelectorAll('.pp-faq-item').forEach(other => {
        other.classList.remove('pp-faq-open');
        other.querySelector('.pp-faq-q').setAttribute('aria-expanded', 'false');
        const a = other.querySelector('.pp-faq-a');
        if (a) a.hidden = true;
      });

      if (!isOpen) {
        item.classList.add('pp-faq-open');
        q.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  /* Final CTA scroll button */
  document.querySelectorAll('.pp-fcta-cta-btn, .pp-reviews-btn').forEach(btn => {
    if (btn.tagName === 'A' && btn.getAttribute('href') === '#top') {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const box = document.querySelector('.pp-buy-box');
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  });

})();

/* ── PRODUCT PAGE COUNTDOWN (multi-element) ──────────────── */
(function initPPCountdown() {
  const DURATION_MS = 14 * 60 * 60 * 1000;
  const KEY = 'x11_pp_cd_end';
  let endTime = parseInt(localStorage.getItem(KEY) || '0');
  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + DURATION_MS;
    localStorage.setItem(KEY, endTime);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = Math.max(0, endTime - Date.now());
    if (diff === 0) {
      endTime = Date.now() + DURATION_MS;
      localStorage.setItem(KEY, endTime);
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.querySelectorAll('[data-pp-cd-h]').forEach(el => { el.textContent = pad(h); });
    document.querySelectorAll('[data-pp-cd-m]').forEach(el => { el.textContent = pad(m); });
    document.querySelectorAll('[data-pp-cd-s]').forEach(el => { el.textContent = pad(s); });
  }

  if (document.querySelector('[data-pp-cd-h]')) {
    tick();
    setInterval(tick, 1000);
  }
})();


/* ── Announcement bar close ─────────────────────────────── */
const annClose = document.getElementById('ann-close');
const annBar   = document.getElementById('announcement-bar');
const header   = document.getElementById('site-header');
if (annClose && annBar) {
  annClose.addEventListener('click', () => {
    annBar.style.display = 'none';
    if (header) { header.style.top = '0'; header.classList.add('ann-gone'); }
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
document.querySelectorAll('.fcta-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.fcta-option').forEach(o => o.classList.remove('fcta-active'));
    opt.classList.add('fcta-active');
  });
});

/* ── FAQ accordion ────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = q.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      const a = other.closest('.faq-item').querySelector('.faq-a');
      a.classList.remove('open');
      a.hidden = true;
    });

    if (!isOpen) {
      q.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
      answer.hidden = false;
    }
  });
});

/* ── UGC Video play/pause ─────────────────────────────────── */
function initVideoCard(card) {
  const video   = card.querySelector('.ugc-video');
  const playBtn = card.querySelector('.ugc-play-btn');
  if (!video || !playBtn) return;

  playBtn.addEventListener('click', () => {
    if (video.paused) {
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
    if (!video.paused) { video.pause(); playBtn.classList.remove('hidden'); }
  });
  video.addEventListener('ended', () => { playBtn.classList.remove('hidden'); });
}
document.querySelectorAll('.ugc-card, .ugc-strip-card').forEach(initVideoCard);

/* ── Sticky buy bar ───────────────────────────────────────── */
const stickyBar = document.getElementById('sticky-buy-bar');
const heroEl    = document.getElementById('hero');
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
    const hH = header?.offsetHeight || 68;
    const aH = annBar?.style.display === 'none' ? 0 : (annBar?.offsetHeight || 44);
    const y  = target.getBoundingClientRect().top + window.scrollY - hH - aH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ── Countdown timer ──────────────────────────────────────── */
(function initCountdown() {
  const DURATION_MS = 14 * 60 * 60 * 1000; // 14 hours
  const KEY = 'x11_cd_end';
  let endTime = parseInt(localStorage.getItem(KEY) || '0');
  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + DURATION_MS;
    localStorage.setItem(KEY, endTime);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      endTime = Date.now() + DURATION_MS;
      localStorage.setItem(KEY, endTime);
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.querySelectorAll('[data-cd-h]').forEach(el => el.textContent = pad(h));
    document.querySelectorAll('[data-cd-m]').forEach(el => el.textContent = pad(m));
    document.querySelectorAll('[data-cd-s]').forEach(el => el.textContent = pad(s));
  }

  if (document.querySelector('[data-cd-h]')) {
    tick();
    setInterval(tick, 1000);
  }
})();

/* ── Social proof notifications ───────────────────────────── */
(function initSocialProof() {
  const notif = document.getElementById('sp-notif');
  if (!notif) return;

  const proofData = [
    { initials: 'SR', name: 'Sarah R.', action: 'just ordered <strong>3 bottles</strong>', time: '2 min ago · Los Angeles, CA' },
    { initials: 'JD', name: 'James D.', action: 'just ordered <strong>2 bottles</strong>', time: '4 min ago · Chicago, IL' },
    { initials: 'MK', name: 'Maria K.', action: 'just ordered <strong>1 bottle</strong>',  time: '7 min ago · New York, NY' },
    { initials: 'TW', name: 'Tyler W.', action: 'just ordered <strong>3 bottles</strong>', time: '11 min ago · Austin, TX' },
    { initials: 'AL', name: 'Aisha L.', action: 'just ordered <strong>3 bottles</strong>', time: '15 min ago · Miami, FL' },
    { initials: 'BP', name: 'Ben P.',   action: 'just ordered <strong>2 bottles</strong>', time: '18 min ago · Seattle, WA' },
    { initials: 'CG', name: 'Chris G.', action: 'just ordered <strong>3 bottles</strong>', time: '22 min ago · Denver, CO' },
    { initials: 'NK', name: 'Nina K.',  action: 'just ordered <strong>2 bottles</strong>', time: '26 min ago · Boston, MA' },
  ];

  const spAvatar = document.getElementById('sp-avatar');
  const spName   = document.getElementById('sp-name');
  const spAction = document.getElementById('sp-action');
  const spTime   = document.getElementById('sp-time');
  const spClose  = document.getElementById('sp-close');

  let current = 0;
  let hideTimer;

  function showNotif(index) {
    const d = proofData[index % proofData.length];
    if (spAvatar) spAvatar.textContent = d.initials;
    if (spName)   spName.textContent   = d.name;
    if (spAction) spAction.innerHTML   = d.action;
    if (spTime)   spTime.textContent   = d.time;
    notif.classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => notif.classList.remove('visible'), 5000);
  }

  if (spClose) {
    spClose.addEventListener('click', () => {
      notif.classList.remove('visible');
      clearTimeout(hideTimer);
    });
  }

  // Show first after 4 seconds, then every 12 seconds
  setTimeout(() => {
    showNotif(current);
    setInterval(() => { current++; showNotif(current); }, 12000);
  }, 4000);
})();

/* ── Scroll-reveal animations ─────────────────────────────── */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const els = document.querySelectorAll(
    '.benefit-card, .review-card, .ugc-card, .step, .science-point, .faq-item, .gallery-item, .fcta-option, .product-card, .bv-card, .pp-benefit-card, .pp-review-card, .pp-video-card, .pp-step, .pp-sci-pt, .pp-faq-item'
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

/* ── Cart drawer ──────────────────────────────────────────── */
const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-drawer-overlay');
const cartClose   = document.getElementById('cart-drawer-close');
const cartIconBtn = document.getElementById('cart-icon-btn');

function openCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  cartDrawer.focus();
}
function closeCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (cartIconBtn) {
  cartIconBtn.addEventListener('click', e => {
    e.preventDefault();
    openCartDrawer();
  });
}
if (cartClose)   cartClose.addEventListener('click', closeCartDrawer);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartDrawer(); });

/* ── Update cart count in header ─────────────────────────── */
function updateCartCount(count) {
  const el = document.getElementById('cart-count');
  if (!el) return;
  el.textContent = count;
  el.classList.toggle('cart-count-hidden', count === 0);
}

/* ── AJAX add to cart (product page form) ────────────────── */
const productForm = document.getElementById('product-form');
if (productForm) {
  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = productForm.querySelector('#pi-atc-btn');
    const feedback = document.getElementById('pi-atc-feedback');
    const variantId = document.getElementById('variant-id')?.value;
    const qty       = parseInt(document.getElementById('qty-input')?.value) || 1;

    if (!variantId) return;

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Adding…';
    if (feedback) { feedback.textContent = ''; feedback.className = 'pp-atc-feedback'; }

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: qty })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.description || errData.message || `Error ${res.status}`);
      }

      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();
      updateCartCount(cartData.item_count);

      if (feedback) {
        feedback.textContent = '✓ Added to cart!';
        feedback.className = 'pp-atc-feedback';
        setTimeout(() => { feedback.textContent = ''; }, 3000);
      }

      openCartDrawer();
    } catch (err) {
      if (feedback) {
        feedback.textContent = err.message || 'Could not add to cart. Please try again.';
        feedback.className = 'pp-atc-feedback error';
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
}

/* ── Cart drawer quantity update ─────────────────────────── */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.qty-btn[data-action][data-key]');
  if (!btn) return;

  const key    = btn.dataset.key;
  const action = btn.dataset.action;
  const qty    = parseInt(btn.dataset.qty);
  const newQty = action === 'increase' ? qty + 1 : Math.max(0, qty - 1);

  try {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: newQty })
    });
    const cartData = await res.json();
    updateCartCount(cartData.item_count);
    // Reload page to reflect cart changes (simple approach)
    window.location.reload();
  } catch (err) { /* silent */ }
});

/* ── Cart page qty buttons ────────────────────────────────── */
document.querySelectorAll('.cp-qty-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const key    = btn.dataset.key;
    const action = btn.dataset.action;
    const qty    = parseInt(btn.dataset.qty);
    const newQty = action === 'increase' ? qty + 1 : Math.max(0, qty - 1);

    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: newQty })
      });
      window.location.reload();
    } catch (err) { /* silent */ }
  });
});

/* ── Cart page remove ─────────────────────────────────────── */
document.querySelectorAll('.cp-remove').forEach(btn => {
  btn.addEventListener('click', async () => {
    const key = btn.dataset.key;
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      });
      window.location.reload();
    } catch (err) { /* silent */ }
  });
});

