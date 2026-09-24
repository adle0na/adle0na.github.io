'use strict';

// Static content stays usable without JavaScript; enhancements are scoped to their sections.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const header = document.querySelector('.site-header');
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 35); }
window.addEventListener('scroll', updateHeader, {passive:true});
updateHeader();
function closeMenu() {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = '메뉴 열기';
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu(); menuToggle.focus();
  }
});
window.matchMedia('(min-width:761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const motion = document.querySelector('.motion-toggle');
motion.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  motion.setAttribute('aria-pressed', String(paused));
  const label = paused ? '배경 움직임 재생하기' : '배경 움직임 멈추기';
  motion.setAttribute('aria-label', label);
  motion.querySelector('.motion-label').textContent = paused ? '움직임 재생하기' : '움직임 멈추기';
  motion.querySelector('[aria-hidden]').textContent = paused ? '▷' : 'Ⅱ';
});

const bosses = {
  shuten: {name:'슈텐도지', english:'SHUTEN DOJI', chapter:'THE FIRST DEMON / CHAPTER 25', src:'pf/boss-shuten.webp', alt:'붉은 술병과 거대한 방망이를 든 슈텐도지', description:'붉은 밤을 거느리는 오니의 왕.\n거대한 방망이 아래, 첫 시련이 시작됩니다.'},
  nura: {name:'누라리횬', english:'NURARIHYON', chapter:'THE SECOND DEMON / CHAPTER 50', src:'pf/boss-nurarihyon.webp', alt:'푸른 기운에 둘러싸인 백귀야행의 주인 누라리횬', description:'푸른 어둠 속, 백귀야행을 이끄는 존재.\n고요한 미소 뒤로 깊은 밤이 다가옵니다.'},
  orochi: {name:'야마타노오로치', english:'YAMATA NO OROCHI', chapter:'THE THIRD DEMON / CHAPTER 75', src:'pf/boss-orochi.webp', alt:'거대한 뱀의 기운을 거느린 야마타노오로치', description:'녹빛 재앙이 지나간 자리에 남은 침묵.\n뒤엉킨 운명의 끝에서 길을 찾아야 합니다.'},
  yeomra: {name:'염라', english:'YEOMRA', chapter:'THE FINAL DEMON / CHAPTER 100', src:'pf/boss-yeomra.webp', alt:'검은 기운과 함께 모습을 드러낸 명계의 왕 염라', description:'백 번째 관문, 명계의 왕이 기다립니다.\n지나온 모든 선택을 마지막 심판 앞에 세우세요.'}
};
const bossButtons = [...document.querySelectorAll('[role=tab][data-boss]')];
const bossArt = document.querySelector('#boss-art');
let bossSelection = 0;
function selectBoss(index, focus = false) {
  const button = bossButtons[index];
  if (!button) return;
  bossSelection = index;
  const key = button.dataset.boss;
  const data = bosses[key];
  bossButtons.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  document.querySelector('.boss-stage').dataset.boss = key;
  document.querySelector('#boss-panel').setAttribute('aria-labelledby', button.id);
  bossArt.classList.remove('switched');
  bossArt.src = data.src; bossArt.alt = data.alt;
  document.querySelector('#boss-name').textContent = data.name;
  document.querySelector('#boss-english').textContent = data.english;
  document.querySelector('#boss-chapter').textContent = data.chapter;
  const description = document.querySelector('#boss-description');
  description.replaceChildren(...data.description.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
  requestAnimationFrame(() => requestAnimationFrame(() => bossArt.classList.add('switched')));
  if (focus) button.focus();
}
bossButtons.forEach((button, index) => button.addEventListener('click', () => selectBoss(index)));
document.querySelector('.boss-tabs').addEventListener('keydown', event => {
  let index = bossSelection;
  if (event.key === 'ArrowRight') index = (index + 1) % bossButtons.length;
  else if (event.key === 'ArrowLeft') index = (index + bossButtons.length - 1) % bossButtons.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = bossButtons.length - 1;
  else return;
  event.preventDefault(); selectBoss(index, true);
});
// Wait until the section is near the viewport before warming the remaining artwork.
if ('IntersectionObserver' in window) {
  const bossObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    Object.values(bosses).slice(1).forEach(data => { const image = new Image(); image.src = data.src; });
    bossObserver.disconnect();
  }, {rootMargin:'300px'});
  bossObserver.observe(document.querySelector('#world'));
}

const gallery = document.querySelector('.gallery-dialog');
const galleryLinks = [...document.querySelectorAll('[data-gallery]')];
let galleryIndex = 0;
let galleryOpener = null;
function showGalleryImage(index) {
  galleryIndex = (index + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[galleryIndex];
  document.querySelector('#gallery-image').src = link.href;
  document.querySelector('#gallery-image').alt = link.querySelector('img').alt;
  document.querySelector('#gallery-caption').textContent = link.dataset.caption;
  document.querySelector('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryLinks.length}`;
}
galleryLinks.forEach((link, index) => link.addEventListener('click', event => {
  if (typeof gallery.showModal !== 'function') return;
  event.preventDefault(); galleryOpener = link;
  showGalleryImage(index); gallery.showModal(); document.body.classList.add('gallery-open');
  document.querySelector('.gallery-close').focus();
}));
document.querySelector('.gallery-close').addEventListener('click', () => gallery.close());
document.querySelector('.gallery-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
document.querySelector('.gallery-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
gallery.addEventListener('click', event => { if (event.target === gallery) { const rect = gallery.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) gallery.close(); }});
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showGalleryImage(galleryIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showGalleryImage(galleryIndex - 1); }
});
gallery.addEventListener('close', () => { document.body.classList.remove('gallery-open'); if (galleryOpener) galleryOpener.focus(); });

document.querySelector('.copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('chopsaltteokgames@gmail.com');
    status.textContent = '이메일 주소를 복사했습니다.';
  } catch {
    status.textContent = '주소를 길게 누르거나 선택해서 복사해 주세요.';
  }
});
