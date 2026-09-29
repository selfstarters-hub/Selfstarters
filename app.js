import { db, SITE } from './firebase-init.js';
import { requireAuth, getUser, getProfile, onReady } from './auth.js';
import { t, catLabel, gradeOptionsHtml, getLang, onLangChange } from './i18n.js';
import {
  collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, getDoc,
  getDocs, query, where, updateDoc, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORY_COLORS = {
  "Tech": "#E8543E", "Academic": "#142B4F", "Sports": "#2F8F5B",
  "Games": "#8A4FB8", "Arts": "#D98A1E", "Social": "#C94F8A",
  "Community": "#3C7A89", "Culture": "#9A6A3A", "Volunteering": "#4E8B57",
  "Leadership": "#6A5ACD", "Entrepreneurship": "#B06A2B", "Science": "#2878A8",
  "Other": "#6B6456"
};
const CATEGORY_ICONS = {
  "Tech": "◆", "Academic": "∑", "Sports": "●", "Games": "♞", "Arts": "✎",
  "Social": "♥", "Community": "◎", "Culture": "◈", "Volunteering": "✦",
  "Leadership": "★", "Entrepreneurship": "$", "Science": "⚗", "Other": "★"
};
const colorFor = (cat) => CATEGORY_COLORS[cat] || '#6B6456';
const iconFor  = (cat) => CATEGORY_ICONS[cat] || '★';

let CLUBS = [];
let EVENTS = [];
let activeCategory = "All";
let activeEventsTab = "upcoming";
let myRsvps = new Set(); // eventIds the current user has RSVP'd to

document.getElementById('siteName') && (document.getElementById('siteName').textContent = SITE.name);
document.getElementById('siteFounder') && (document.getElementById('siteFounder').textContent = SITE.founder);
document.getElementById('siteSchool') && (document.getElementById('siteSchool').textContent = SITE.school);
document.getElementById('siteContactEmail') && (document.getElementById('siteContactEmail').textContent = SITE.contactEmail);

/* ============ LIVE DATA ============ */
onSnapshot(collection(db, 'clubs'), (snap) => {
  CLUBS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderTicker(); renderStats(); renderHeroCards(); renderFilters(); renderClubs();
});
onSnapshot(collection(db, 'events'), (snap) => {
  EVENTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderEvents();
});

onReady(async (user) => {
  if(user){
    const snap = await getDocs(query(collection(db, 'rsvps'), where('userId', '==', user.uid)));
    myRsvps = new Set(snap.docs.map(d => d.data().eventId));
  } else {
    myRsvps = new Set();
  }
  renderEvents();
});

/* ============ TICKER / STATS ============ */
function renderTicker(){
  const track = document.getElementById('tickerTrack');
  if(!track) return;
  if(CLUBS.length === 0){ track.innerHTML = `<span>${t('ticker.empty')}</span>`; return; }
  const items = CLUBS.map(c => `<span><b>${catLabel(c.category)}</b> — ${c.name}</span>`);
  track.innerHTML = items.concat(items).join('');
}
function animateCount(el, target){
  if(!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 24));
  const t = setInterval(() => { cur += step; if(cur >= target){ cur = target; clearInterval(t); } el.textContent = cur; }, 20);
}
function renderStats(){
  const totalOpen = CLUBS.reduce((s, c) => s + Math.max(0, (c.total || 0) - (c.filled || 0)), 0);
  animateCount(document.getElementById('statClubs'), CLUBS.length);
  animateCount(document.getElementById('statSpots'), totalOpen);
}

/* ============ HERO CLUB CARDS (real clubs, most-filled first) ============ */
function renderHeroCards(){
  const el = document.getElementById('heroCards');
  if(!el) return;
  const top = [...CLUBS].sort((a, b) => (b.filled || 0) - (a.filled || 0)).slice(0, 3);
  el.innerHTML = top.map((c, i) => `
    <div class="float-card fc${i + 1}" data-hero-club="${c.id}" role="button" tabindex="0">
      <div class="patch" style="background:${colorFor(c.category)}">${iconFor(c.category)}</div>
      <h4>${escapeHtml(c.name)}</h4>
      <p>${t('hero.cardMeta', { filled: c.filled || 0, total: c.total || 0 })}${c.meets ? ' · ' + escapeHtml(c.meets) : ''}</p>
    </div>`).join('');
  el.querySelectorAll('[data-hero-club]').forEach(card => {
    const open = () => openClubModal(card.dataset.heroClub);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
  });
}

/* ============ FILTERS / CLUBS ============ */
function renderFilters(){
  const el = document.getElementById('filters');
  if(!el) return;
  const cats = ["All", ...new Set(CLUBS.map(c => c.category))];
  el.innerHTML = cats.map(c => `<button class="chip ${c === activeCategory ? 'active' : ''}" data-cat="${c}">${c === 'All' ? t('filters.all') : catLabel(c)}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; renderFilters(); renderClubs(); });
  });
}
function renderClubs(){
  const grid = document.getElementById('clubGrid');
  if(!grid) return;
  const list = activeCategory === "All" ? CLUBS : CLUBS.filter(c => c.category === activeCategory);
  if(list.length === 0){
    grid.innerHTML = `<p class="empty-note">${t('clubs.empty')}</p>`;
    return;
  }
  grid.innerHTML = list.map(c => {
    const color = colorFor(c.category);
    const total = c.total || 0, filled = c.filled || 0;
    const pct = total ? Math.round((filled / total) * 100) : 0;
    const full = filled >= total && total > 0;
    const avg = c.ratingCount ? (c.ratingSum / c.ratingCount) : 0;
    return `
    <div class="club-card" style="--accent:${color}">
      <div class="card-top">
        <div class="patch" style="background:${color}">${iconFor(c.category)}</div>
        <div class="jersey">#${String(c.number || '00').padStart(2,'0')}</div>
      </div>
      <div>
        <span class="cat" style="color:${color}">${catLabel(c.category)}</span>
        <h3>${escapeHtml(c.name)}</h3>
      </div>
      <p class="desc">${escapeHtml(c.desc || '')}</p>
      ${c.ratingCount ? `<div class="rating-line"><span class="stars">${starString(avg)}</span> ${avg.toFixed(1)} (${c.ratingCount})</div>` : ''}
      <div class="meta-row">
        <span>${t('card.meets')} · ${escapeHtml(c.meets || t('card.tbd'))}</span>
        <span>${full ? t('card.full') : t('card.spots', { n: total - filled })}</span>
        <div class="spots-bar ${full ? 'full' : ''}"><i style="width:${pct}%"></i></div>
      </div>
      <div class="card-actions">
        <button class="btn btn-solid btn-sm" style="flex:1; background:${color}; border-color:${color};" data-view="${c.id}">${t('card.view')}</button>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => openClubModal(btn.dataset.view)));
}
function starString(avg){
  const full = Math.round(avg);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ============ CLUB MODAL: details, apply, reviews ============ */
async function openClubModal(id){
  const c = CLUBS.find(x => x.id === id);
  if(!c) return;
  const color = colorFor(c.category);
  const overlay = document.getElementById('clubOverlay');
  const modal = document.getElementById('clubModalContent');
  const total = c.total || 0, filled = c.filled || 0;

  modal.innerHTML = `
    <button class="modal-close" id="clubModalClose">✕</button>
    <div class="patch" style="background:${color}">${iconFor(c.category)}</div>
    <span class="cat" style="color:${color}">${catLabel(c.category)}</span>
    <h3>${escapeHtml(c.name)}</h3>
    <p class="full-desc">${escapeHtml(c.full || c.desc || '')}</p>
    <div class="meta-grid">
      <div><div class="k">${t('m.meets')}</div><div class="v">${escapeHtml(c.meets || t('card.tbd'))}</div></div>
      <div><div class="k">${t('m.location')}</div><div class="v">${escapeHtml(c.room || t('card.tbd'))}</div></div>
      <div><div class="k">${t('m.roster')}</div><div class="v">${t('m.filled', { filled, total })}</div></div>
      <div><div class="k">${t('m.status')}</div><div class="v">${filled >= total && total > 0 ? t('m.waitlist') : t('m.open')}</div></div>
    </div>
    <form class="stack-form" id="applyForm">
      <label>${t('form.fullName')}<input type="text" id="appName" required placeholder="${t('form.yourName')}"></label>
      <label>${t('form.grade')}
        <select id="appGrade" required>${gradeOptionsHtml()}</select>
      </label>
      <label>${t('form.why')}<textarea id="appReason" required placeholder="${t('form.whyPh')}"></textarea></label>
      <span class="form-note">${t('form.note', { club: escapeHtml(c.name) })}</span>
      <button type="submit" class="btn btn-solid" style="background:${color}; border-color:${color}; margin-top:6px;">${t('form.submitApp')}</button>
    </form>
    <div class="reviews-block" id="reviewsBlock">
      <h4>${t('rev.title')}</h4>
      <div id="reviewsList"><p class="empty-note">${t('rev.loading')}</p></div>
      <form class="stack-form" id="reviewForm" style="margin-top:16px;">
        <label>${t('rev.rating')}
          <div class="star-input" id="starInput">
            ${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}">★</button>`).join('')}
          </div>
        </label>
        <label>${t('rev.your')}<textarea id="reviewText" required placeholder="${t('rev.ph')}"></textarea></label>
        <button type="submit" class="btn btn-sm" style="align-self:flex-start;">${t('rev.post')}</button>
      </form>
    </div>
  `;
  overlay.classList.add('open');
  document.getElementById('clubModalClose').addEventListener('click', () => overlay.classList.remove('open'));

  // Prefill name/grade if logged in
  const profile = getProfile();
  if(profile){
    document.getElementById('appName').value = profile.name || '';
    if(profile.grade) document.getElementById('appGrade').value = profile.grade;
  }

  // Apply form — gated
  document.getElementById('applyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('appName').value.trim();
    const grade = document.getElementById('appGrade').value;
    const reason = document.getElementById('appReason').value.trim();
    requireAuth(async () => {
      const user = getUser();
      await addDoc(collection(db, 'applications'), {
        clubId: c.id, clubName: c.name, userId: user.uid,
        name, grade, email: user.email, reason,
        status: 'pending', createdAt: serverTimestamp()
      });
      modal.innerHTML = `
        <button class="modal-close" id="clubModalClose2">✕</button>
        <div class="success-box">
          <div class="icon">✓</div>
          <h3>${t('app.done')}</h3>
          <p>${t('app.doneP', { club: escapeHtml(c.name) })}</p>
        </div>`;
      document.getElementById('clubModalClose2').addEventListener('click', () => overlay.classList.remove('open'));
    });
  });

  // Star rating input
  let chosenStar = 0;
  const starBtns = document.querySelectorAll('#starInput [data-star]');
  starBtns.forEach(b => b.addEventListener('click', () => {
    chosenStar = parseInt(b.dataset.star);
    starBtns.forEach(x => x.classList.toggle('on', parseInt(x.dataset.star) <= chosenStar));
  }));

  // Review form — gated
  document.getElementById('reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('reviewText').value.trim();
    if(chosenStar === 0){ alert(t('rev.pickStar')); return; }
    requireAuth(async () => {
      const user = getUser();
      const p = getProfile();
      await addDoc(collection(db, 'reviews'), {
        clubId: c.id, userId: user.uid, userName: p?.name || 'Student',
        rating: chosenStar, text, createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'clubs', c.id), {
        ratingSum: increment(chosenStar), ratingCount: increment(1)
      });
      loadReviews(c.id);
      document.getElementById('reviewForm').reset();
      chosenStar = 0; starBtns.forEach(x => x.classList.remove('on'));
    });
  });

  loadReviews(c.id);
}

async function loadReviews(clubId){
  const listEl = document.getElementById('reviewsList');
  if(!listEl) return;
  const snap = await getDocs(query(collection(db, 'reviews'), where('clubId', '==', clubId)));
  const reviews = snap.docs.map(d => d.data()).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  if(reviews.length === 0){ listEl.innerHTML = `<p class="empty-note">${t('rev.none')}</p>`; return; }
  listEl.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-head"><span class="name">${escapeHtml(r.userName)}</span><span class="stars">${starString(r.rating)}</span></div>
      <p>${escapeHtml(r.text)}</p>
    </div>`).join('');
}

const clubOverlay = document.getElementById('clubOverlay');
clubOverlay?.addEventListener('click', (e) => { if(e.target === clubOverlay) clubOverlay.classList.remove('open'); });

/* ============ EVENTS ============ */
function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return { day: d.getDate(), mon: d.toLocaleString(getLang() === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }).toUpperCase() };
}
function renderEvents(){
  const el = document.getElementById('eventsList');
  if(!el) return;
  const list = EVENTS.filter(e => e.status === activeEventsTab)
    .sort((a, b) => activeEventsTab === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
  el.className = 'events-list ' + (activeEventsTab === 'past' ? 'past' : '');
  if(list.length === 0){ el.innerHTML = `<p class="empty-note">${t('ev.none')}</p>`; return; }
  el.innerHTML = list.map(e => {
    const { day, mon } = formatDate(e.date);
    const going = myRsvps.has(e.id);
    const count = (e.rsvpCount || 0);
    return `
    <div class="event-row">
      <div class="date-block"><div class="day">${day}</div><div class="mon">${mon}</div></div>
      <div class="event-info">
        <h4>${escapeHtml(e.title)}</h4>
        <div class="tags"><span class="tag-pill">${escapeHtml(e.club)}</span><span class="tag-pill">${escapeHtml(e.time)}</span></div>
        <div class="where">${escapeHtml(e.location)} — ${escapeHtml(e.desc || '')}</div>
      </div>
      <div>
        ${activeEventsTab === 'upcoming' ? `<button class="rsvp-btn ${going ? 'going' : ''}" data-rsvp="${e.id}">${going ? t('ev.going') : t('ev.rsvp')}</button>` : `<span class="tag-pill">${t('ev.pastTag')}</span>`}
        <div class="attendee-count">${t('ev.count', { n: count })}</div>
      </div>
    </div>`;
  }).join('');
  el.querySelectorAll('[data-rsvp]').forEach(btn => {
    btn.addEventListener('click', () => toggleRsvp(btn.dataset.rsvp));
  });
}
async function toggleRsvp(eventId){
  requireAuth(async () => {
    const user = getUser();
    const rsvpId = `${eventId}_${user.uid}`;
    const ref = doc(db, 'rsvps', rsvpId);
    const eventRef = doc(db, 'events', eventId);
    if(myRsvps.has(eventId)){
      await deleteDoc(ref);
      await updateDoc(eventRef, { rsvpCount: increment(-1) });
      myRsvps.delete(eventId);
    } else {
      await setDoc(ref, { eventId, userId: user.uid, createdAt: serverTimestamp() });
      await updateDoc(eventRef, { rsvpCount: increment(1) });
      myRsvps.add(eventId);
    }
    renderEvents();
  });
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEventsTab = btn.dataset.tab;
    renderEvents();
  });
});

/* ============ PITCH A CLUB (gated "create") ============ */
document.getElementById('pitchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const clubName = document.getElementById('pitchName').value.trim();
  const category = document.getElementById('pitchCategory').value;
  const description = document.getElementById('pitchDesc').value.trim();
  requireAuth(async () => {
    const user = getUser();
    const p = getProfile();
    await addDoc(collection(db, 'clubPitches'), {
      userId: user.uid, name: p?.name || '', email: user.email,
      clubName, category, description, status: 'pending', createdAt: serverTimestamp()
    });
    showPitchSuccess();
  });
});
function showPitchSuccess(){
  const box = document.getElementById('pitchFormBox');
  if(!box) return;
  box.innerHTML = `<div class="success-box"><div class="icon">✓</div><h3>${t('pitch.done')}</h3><p>${t('pitch.doneP')}</p></div>`;
}

/* ============ PROPOSE AN EVENT (gated) ============ */
document.getElementById('eventPitchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('eventPitchTitle').value.trim();
  const club = document.getElementById('eventPitchClub').value.trim();
  const date = document.getElementById('eventPitchDate').value;
  const time = document.getElementById('eventPitchTime').value.trim();
  const location = document.getElementById('eventPitchLocation').value.trim();
  const description = document.getElementById('eventPitchDesc').value.trim();

  requireAuth(async () => {
    const user = getUser();
    const p = getProfile();

    await addDoc(collection(db, 'eventPitches'), {
      userId: user.uid,
      name: p?.name || user.email || 'Student',
      email: user.email || '',
      title,
      club,
      date,
      time,
      location,
      description,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    const box = document.getElementById('eventPitchFormBox');
    if(box){
      box.innerHTML = `<div class="success-box">
        <div class="icon">✓</div>
        <h3>${t('evp.done')}</h3>
        <p>${t('evp.doneP')}</p>
      </div>`;
    }
  });
});

/* ============ CONTACT (gated) ============ */
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.getElementById('contactMessage').value.trim();
  requireAuth(async () => {
    const user = getUser();
    const p = getProfile();
    await addDoc(collection(db, 'contactMessages'), {
      userId: user.uid, name: p?.name || '', email: user.email,
      message, createdAt: serverTimestamp()
    });
    const box = document.getElementById('contactFormBox');
    if(box) box.innerHTML = `<div class="success-box"><div class="icon">✓</div><h3>${t('ct.done')}</h3><p>${t('ct.doneP')}</p></div>`;
  });
});

/* ============ SCROLL EFFECTS / MOBILE NAV ============ */
window.addEventListener('scroll', () => {
  document.getElementById('siteHeader')?.classList.toggle('scrolled', window.scrollY > 10);
});
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

/* ============ LANGUAGE CHANGE: re-render dynamic content ============ */
onLangChange(() => { renderTicker(); renderHeroCards(); renderFilters(); renderClubs(); renderEvents(); });
