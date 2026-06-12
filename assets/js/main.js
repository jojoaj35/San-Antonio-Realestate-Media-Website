// San Antonio Real Estate Media — Site JS

// Mark JS as available so CSS can keep content visible if JS fails to run.
document.documentElement.classList.add('js');

const BOOKING_URL = 'https://portal.spiro.media/order/sarep/1234';

/* ---------- Lenis smooth scroll (desktop) ---------- */
let lenis;
if (window.Lenis && window.matchMedia('(min-width: 1025px)').matches) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* ---------- Nav scroll state + FAB ---------- */
const nav = document.querySelector('.nav');
const fab = document.querySelector('.fab');
const onScroll = () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
  if (fab) fab.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile drawer ---------- */
const toggle = document.querySelector('.nav-toggle');
const drawer = document.querySelector('.drawer');
const setDrawer = (open) => {
  if (!toggle || !drawer) return;
  toggle.classList.toggle('open', open);
  drawer.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
if (toggle && drawer) {
  toggle.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
}

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(el => io.observe(el));
}
// Safety net: never leave reveal content hidden if something fails
setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 1600);

/* ---------- FAQ ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if (!q || !a) return;
  q.addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      const aa = i.querySelector('.faq-a'); if (aa) aa.style.maxHeight = 0;
    });
    if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

/* ---------- Portfolio filters ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.showcase .shot[data-cat]').forEach(item => {
      const tags = (item.dataset.cat || '').split(' ');
      item.style.display = (cat === 'all' || tags.includes(cat)) ? '' : 'none';
    });
  });
});

/* ---------- Custom cursor (desktop, hover-capable only) ---------- */
if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 1024) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  window.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
  document.querySelectorAll('a, button, .price-card, .blog-card, .shot, .faq-q').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

/* ---------- GSAP enhancements ---------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(window.ScrollTrigger);
  // NOTE: The hero (h1, lead, CTA) is intentionally animated via the CSS
  // `.reveal` system below — NOT GSAP. Using gsap.from() on .reveal elements
  // pinned an inline opacity:0 that left the hero permanently invisible.
  gsap.utils.toArray('.section-head').forEach(head => {
    gsap.from(head.querySelectorAll('h2, .meta, .eyebrow'), {
      y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: head, start: 'top 80%' }
    });
  });
  document.querySelectorAll('.stat-block .num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString() + suffix; } })
    });
  });
}

/* ---------- Booking sheet ---------- */
const scrim = document.querySelector('.sheet-scrim');
const sheet = document.querySelector('.sheet');
const openSheet = () => {
  if (!sheet) return;
  scrim.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
};
const closeSheet = () => {
  if (!sheet) return;
  scrim.classList.remove('open');
  sheet.classList.remove('open');
  document.body.style.overflow = '';
};
// Any [data-book] trigger goes straight to the live booking portal
document.querySelectorAll('[data-book]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    setDrawer(false);
    window.location.href = BOOKING_URL;
  });
});
if (scrim) scrim.addEventListener('click', closeSheet);
document.querySelector('.sheet-x')?.addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

// Package + slot selection
function selectPkg(name) {
  document.querySelectorAll('.pkg').forEach(p => p.classList.toggle('sel', p.dataset.pkg === name));
}
document.querySelectorAll('.pkg').forEach(p => p.addEventListener('click', () => selectPkg(p.dataset.pkg)));
document.querySelectorAll('.slot').forEach(s => s.addEventListener('click', () => {
  document.querySelectorAll('.slot').forEach(x => x.classList.remove('sel'));
  s.classList.add('sel');
}));

// Confirm → forward to Spiro with chosen package
const confirmBtn = document.querySelector('.sheet-confirm');
if (confirmBtn) {
  confirmBtn.addEventListener('click', () => {
    const body = document.querySelector('.sheet-body');
    const confirm = document.querySelector('.sheet-confirm-state');
    if (body && confirm) { body.style.display = 'none'; confirm.style.display = 'flex'; }
    setTimeout(() => { window.open(BOOKING_URL, '_blank', 'noopener'); }, 1100);
  });
}

/* ---------- Year ---------- */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
