/* TMC Clinic preview: branch data lives in branches.js; service data in services.js. */
const search = document.getElementById('branch-search');
const select = document.getElementById('branch-select');
const result = document.getElementById('branch-result');
const status = document.getElementById('finder-status');
const locate = document.getElementById('location-button');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('site-menu');
let currentBranch = null;
let locationRequest = 0;

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function updateBranchOptions() {
  const query = search.value.trim().toLowerCase();
  const matches = BRANCHES.filter(branch => (branch.name + ' ' + branch.address).toLowerCase().includes(query));
  select.replaceChildren(new Option(matches.length ? 'Select a clinic' : 'No clinics found', ''));
  matches.forEach(branch => select.add(new Option(branch.name, String(branch.id))));
  if (currentBranch && matches.some(branch => branch.id === currentBranch.id)) select.value = String(currentBranch.id);
  else if (query && currentBranch) { currentBranch = null; showEmpty(); }
  status.textContent = query && !matches.length ? 'No clinics found. Try a different search.' : '';
}

function showEmpty() {
  result.innerHTML = '<div class="result-empty"><div class="empty-mark">⌖</div><span class="eyebrow">YOUR CLINIC, YOUR WAY</span><h3>Care is closer than you think.</h3><p>Choose a clinic or use your location to see its details here.</p></div>';
}

function addDetail(parent, icon, text) {
  const row = document.createElement('p');
  row.className = 'result-line';
  addText(row, 'span', '', icon);
  addText(row, 'span', '', text);
  parent.appendChild(row);
}

function showBranch(branch, distance) {
  currentBranch = branch;
  result.replaceChildren();
  const card = document.createElement('div');
  card.className = 'result-content';
  addText(card, 'span', 'eyebrow', distance == null ? 'SELECTED CLINIC' : 'NEAREST AVAILABLE PIN · PRELIMINARY');
  addText(card, 'h3', '', branch.name);
  addDetail(card, '⌖', branch.address || 'Address pending confirmation');
  addDetail(card, '◷', branch.hours ? 'Hours: ' + branch.hours + ' (to confirm)' : 'Opening hours pending confirmation');
  if (distance != null) addText(card, 'p', 'data-note', 'Approx. ' + distance.toFixed(1) + ' km straight-line distance. Available pins are unverified and may not cover all clinics.');
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  if (branch.map && /^https:\/\/maps\.app\.goo\.gl\//.test(branch.map)) {
    const link = addText(actions, 'a', 'button button-primary', 'Get directions ↗');
    // Use the preliminary listing pin as the directions destination.
    link.href = Number.isFinite(branch.lat) && Number.isFinite(branch.lng)
      ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(branch.lat + ',' + branch.lng)
      : branch.map;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Open directions for ' + branch.name + ' in a new tab');
  } else addText(actions, 'span', 'missing-link', 'Map link is pending verification for this clinic.');
  card.appendChild(actions);
  const details = document.createElement('details');
  details.className = 'result-detail';
  addText(details, 'summary', '', 'View contact details & map');
  addDetail(details, '✆', branch.phone || 'Contact information pending confirmation');
  addText(details, 'div', 'map-placeholder', branch.map ? 'Map preview is not integrated in this demo. Use Get directions to open the client-provided listing.' : 'A verified map listing is not available yet.');
  card.appendChild(details);
  result.appendChild(card);
}

// Haversine gives straight-line distance, not driving or travel distance.
function distanceKm(lat1, lng1, lat2, lng2) {
  const radians = degrees => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

search.addEventListener('input', () => { locationRequest++; locate.disabled = false; locate.textContent = '⌖  Use my location'; updateBranchOptions(); });
select.addEventListener('change', () => {
  locationRequest++;
  locate.disabled = false;
  locate.textContent = '⌖  Use my location';
  const branch = BRANCHES.find(item => item.id === Number(select.value));
  status.textContent = '';
  if (branch) showBranch(branch);
  else { currentBranch = null; showEmpty(); }
});

locate.addEventListener('click', () => {
  const request = ++locationRequest;
  if (!navigator.geolocation) { status.textContent = 'Location is not supported here. Please select a clinic manually.'; return; }
  locate.disabled = true;
  locate.textContent = 'Finding a clinic…';
  status.textContent = 'Requesting your location. You can also choose a clinic manually.';
  navigator.geolocation.getCurrentPosition(position => {
    if (request !== locationRequest) return;
    locate.disabled = false;
    locate.textContent = '⌖  Use my location';
    const candidates = BRANCHES.filter(branch => Number.isFinite(branch.lat) && Number.isFinite(branch.lng));
    if (!candidates.length) { status.textContent = 'Clinic coordinates are not available. Please select a clinic manually.'; return; }
    const distances = candidates.map(branch => ({branch, distance: distanceKm(position.coords.latitude, position.coords.longitude, branch.lat, branch.lng)}));
    distances.sort ( (a, b) => a.distance - b.distance );
    search.value = '';
    updateBranchOptions();
    select.value = String(distances[0].branch.id);
    showBranch(distances[0].branch, distances[0].distance);
    status.textContent = 'Nearest available preliminary pin shown. Clinic locations still need confirmation.';
  }, error => {
    if (request !== locationRequest) return;
    locate.disabled = false;
    locate.textContent = '⌖  Use my location';
    status.textContent = error.code === 1 ? 'Location access was denied. Please select a clinic manually.' : 'We could not get your location. Please select a clinic manually.';
  }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000});
});

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const serviceList = document.getElementById('service-list');
SERVICES.forEach((service, index) => {
  const item = document.createElement('details');
  item.className = 'service-item';
  const summary = document.createElement('summary');
  addText(summary, 'span', 'service-index', String(index + 1).padStart(2, '0'));
  const title = document.createElement('span');
  title.className = 'service-title';
  addText(title, 'small', '', service.eyebrow);
  addText(title, 'strong', '', service.name);
  summary.appendChild(title);
  const icon = addText(summary, 'span', 'service-plus', '+');
  icon.setAttribute('aria-hidden', 'true');
  item.appendChild(summary);
  const content = document.createElement('div');
  content.className = 'service-content';
  addText(content, 'p', '', service.description);
  addText(content, 'strong', '', 'Participating clinics');
  const list = document.createElement('ul');
  list.className = 'clinic-list';
  // Only use exact, reviewed branch IDs. These source listings were flagged as duplicates.
  const flaggedListings = [35, 61];
  function appendClinic(parent, branch, label) {
    const row = document.createElement('li');
    const hasLink = branch && branch.map && /^https:\/\/maps\.app\.goo\.gl\//.test(branch.map) && !flaggedListings.includes(branch.id);
    if (hasLink) {
      const link = addText(row, 'a', 'clinic-map-link', label + ' ↗');
      link.href = branch.map;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', label + ' — open Google Maps in a new tab');
    } else {
      addText(row, 'span', '', label);
      addText(row, 'small', 'listing-pending', ' · Map link pending verification');
    }
    parent.appendChild(row);
  }
  service.branches.forEach(entry => {
    if (entry.locations) {
      const group = document.createElement('li');
      addText(group, 'strong', '', entry.label);
      const nested = document.createElement('ul');
      entry.locations.forEach(id => {
        const branch = BRANCHES.find(item => item.id === id);
        appendClinic(nested, branch, branch ? branch.name : 'Clinic pending');
      });
      group.appendChild(nested);
      list.appendChild(group);
    } else {
      const branch = BRANCHES.find(item => item.id === entry.branchId);
      appendClinic(list, branch, entry.label);
    }
  });
  content.appendChild(list);
  const booking = addText(content, 'button', 'button button-primary booking-pending', 'Book Now ↗');
  booking.type = 'button';
  booking.disabled = true;
  booking.setAttribute('aria-describedby', 'booking-note-' + service.id);
  const bookingNote = addText(content, 'p', 'service-disclaimer', 'Messenger link pending. Booking will take place through the client’s existing account.');
  bookingNote.id = 'booking-note-' + service.id;
  item.appendChild(content);
  item.addEventListener('toggle', () => {
    icon.textContent = item.open ? '−' : '+';
    if (item.open) serviceList.querySelectorAll('details').forEach(other => { if (other !== item) other.open = false; });
  });
  serviceList.appendChild(item);
});
updateBranchOptions();

// Reveal content gently as it enters view; never hide it if motion is reduced.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.about-grid, .service-feature, .promo-card').forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

// Reviewer controls are for comparing structures, not part of the client website.
const reviewOptions = document.querySelectorAll('.review-option');
const viewAll = document.getElementById('view-all-promos');
const promoPage = document.getElementById('promo-page');
const mainPage = document.querySelector('main');
let promoMode = 'a';
function closePromoPage() {
  promoPage.hidden = true;
  mainPage.hidden = false;
  document.getElementById('promo').scrollIntoView({ behavior: 'auto' });
}
reviewOptions.forEach(button => button.addEventListener('click', () => {
  promoMode = button.dataset.mode;
  reviewOptions.forEach(option => {
    const selected = option === button;
    option.classList.toggle('active', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  viewAll.hidden = promoMode !== 'b';
  if (!promoPage.hidden) closePromoPage();
}));
viewAll.addEventListener('click', () => {
  mainPage.hidden = true;
  promoPage.hidden = false;
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.getElementById('promo-back').focus({ preventScroll: true });
});
document.getElementById('promo-back').addEventListener('click', closePromoPage);

// Manual carousel; no autoplay. Buttons work with keyboard and mobile swipes.
const slides = Array.from(document.querySelectorAll('.promo-slide'));
const previous = document.getElementById('promo-prev');
const next = document.getElementById('promo-next');
const counter = document.getElementById('promo-counter');
let currentSlide = 0;
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.hidden = i !== currentSlide; });
  counter.textContent = String(currentSlide + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
}
previous.hidden = next.hidden = counter.hidden = slides.length < 2;
previous.addEventListener('click', () => showSlide(currentSlide - 1));
next.addEventListener('click', () => showSlide(currentSlide + 1));
const promoViewport = document.querySelector('.promo-viewport');
let touchStartX = null;
promoViewport.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
promoViewport.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) > 50 && slides.length > 1) showSlide(currentSlide + (delta < 0 ? 1 : -1));
}, { passive: true });
promoViewport.addEventListener('touchcancel', () => { touchStartX = null; }, { passive: true });

// Return from the review-only promo page when a normal site link is used.
document.querySelectorAll('.site-header a[href^="#"], footer a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (!promoPage.hidden) {
      promoPage.hidden = true;
      mainPage.hidden = false;
    }
  });
});
