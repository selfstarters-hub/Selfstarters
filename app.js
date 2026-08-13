import { db, SITE } from './firebase-init.js';
import { requireAuth, getUser, getProfile, onReady } from './auth.js';
import {
  collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, getDoc,
  getDocs, query, where, updateDoc, increment, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORY_COLORS = { "Tech": "#E8543E", "Academic": "#142B4F", "Sports": "#2F8F5B", "Games": "#8A4FB8", "Arts": "#D98A1E" };
const CATEGORY_ICONS  = { "Tech": "◆", "Academic": "∑", "Sports": "●", "Games": "♞", "Arts": "✎" };
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
  renderTicker(); renderStats(); renderFilters(); renderClubs();
});
onSnapshot(collection(db, 'events'), (snap) => {
  EVENTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderStats(); renderEvents();
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
  if(CLUBS.length === 0){ track.innerHTML = `<span>No teams listed yet — check back soon.</span>`; return; }
  const items = CLUBS.map(c => `<span><b>${c.category}</b> — ${c.name}</span>`);
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
  const upcomingCount = EVENTS.filter(e => e.status === 'upcoming').length;
  animateCount(document.getElementById('statClubs'), CLUBS.length);
  animateCount(document.getElementById('statSpots'), totalOpen);
  animateCount(document.getElementById('statEvents'), upcomingCount);
}

/* ============ FILTERS / CLUBS ============ */
function renderFilters(){
  const el = document.getElementById('filters');
  if(!el) return;
  const cats = ["All", ...new Set(CLUBS.map(c => c.category))];
  el.innerHTML = cats.map(c => `<button class="chip ${c === activeCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; renderFilters(); renderClubs(); });
  });
}
function renderClubs(){
  const grid = document.getElementById('clubGrid');
  if(!grid) return;
  const list = activeCategory === "All" ? CLUBS : CLUBS.filter(c => c.category === activeCategory);
  if(list.length === 0){
    grid.innerHTML = `<p class="empty-note">No teams here yet.</p>`;
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
        <span class="cat" style="color:${color}">${c.category}</span>
        <h3>${escapeHtml(c.name)}</h3>
      </div>
      <p class="desc">${escapeHtml(c.desc || '')}</p>
      ${c.ratingCount ? `<div class="rating-line"><span class="stars">${starString(avg)}</span> ${avg.toFixed(1)} (${c.ratingCount})</div>` : ''}
      <div class="meta-row">
        <span>MEETS · ${escapeHtml(c.meets || 'TBD')}</span>
        <span>${full ? 'FULL — WAITLIST OPEN' : `${total - filled} SPOTS OPEN`}</span>
        <div class="spots-bar ${full ? 'full' : ''}"><i style="width:${pct}%"></i></div>
      </div>
      <div class="card-actions">
        <button class="btn btn-solid btn-sm" style="flex:1; background:${color}; border-color:${color};" data-view="${c.id}">View &amp; apply</button>
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
    <span class="cat" style="color:${color}">${c.category}</span>
    <h3>${escapeHtml(c.name)}</h3>
    <p class="full-desc">${escapeHtml(c.full || c.desc || '')}</p>
    <div class="meta-grid">
      <div><div class="k">Meets</div><div class="v">${escapeHtml(c.meets || 'TBD')}</div></div>
      <div><div class="k">Location</div><div class="v">${escapeHtml(c.room || 'TBD')}</div></div>
      <div><div class="k">Roster</div><div class="v">${filled} / ${total} filled</div></div>
      <div><div class="k">Status</div><div class="v">${filled >= total && total > 0 ? 'Waitlist' : 'Open'}</div></div>
    </div>
    <form class="stack-form" id="applyForm">
      <label>Full name<input type="text" id="appName" required placeholder="Your name"></label>
      <label>Grade
        <select id="appGrade" required>
          <option value="">Select grade</option>
          <option>9th</option><option>10th</option><option>11th</option><option>12th</option>
        </select>
      </label>
      <label>Why do you want to join?<textarea id="appReason" required placeholder="A sentence or two is plenty."></textarea></label>
      <span class="form-note">Your application goes to the ${escapeHtml(c.name)} lead and to the site admin.</span>
      <button type="submit" class="btn btn-solid" style="background:${color}; border-color:${color}; margin-top:6px;">Submit application</button>
    </form>
    <div class="reviews-block" id="reviewsBlock">
      <h4>Reviews</h4>
      <div id="reviewsList"><p class="empty-note">Loading reviews…</p></div>
      <form class="stack-form" id="reviewForm" style="margin-top:16px;">
        <label>Your rating
          <div class="star-input" id="starInput">
            ${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}">★</button>`).join('')}
          </div>
        </label>
        <label>Your review<textarea id="reviewText" required placeholder="What's it actually like being in this club?"></textarea></label>
        <button type="submit" class="btn btn-sm" style="align-self:flex-start;">Post review</button>
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
          <h3>Application received</h3>
          <p>The ${escapeHtml(c.name)} lead will follow up by email with next steps.</p>
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
    if(chosenStar === 0){ alert('Pick a star rating first.'); return; }
    requireAuth(async () => {
      const user = getUser();
      const p = getProfile();
      const reviewRef = doc(db, 'reviews', `${c.id}_${user.uid}`);
      const clubRef = doc(db, 'clubs', c.id);
      await runTransaction(db, async (tx) => {
        const [reviewSnap, clubSnap] = await Promise.all([tx.get(reviewRef), tx.get(clubRef)]);
        if(reviewSnap.exists()) throw new Error('You have already reviewed this club.');
        const d = clubSnap.exists() ? clubSnap.data() : {};
        tx.set(reviewRef, {
          clubId: c.id, userId: user.uid, userName: p?.name || 'Student',
          rating: chosenStar, text, createdAt: serverTimestamp()
        });
        tx.update(clubRef, {
          ratingSum: (d.ratingSum || 0) + chosenStar,
          ratingCount: (d.ratingCount || 0) + 1
        });
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
  if(reviews.length === 0){ listEl.innerHTML = `<p class="empty-note">No reviews yet — be the first.</p>`; return; }
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
  return { day: d.getDate(), mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase() };
}
function renderEvents(){
  const el = document.getElementById('eventsList');
  if(!el) return;
  const list = EVENTS.filter(e => e.status === activeEventsTab)
    .sort((a, b) => activeEventsTab === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
  el.className = 'events-list ' + (activeEventsTab === 'past' ? 'past' : '');
  if(list.length === 0){ el.innerHTML = `<p class="empty-note">Nothing here yet.</p>`; return; }
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
        ${activeEventsTab === 'upcoming' ? `<button class="rsvp-btn ${going ? 'going' : ''}" data-rsvp="${e.id}">${going ? '✓ Going' : 'RSVP'}</button>` : `<span class="tag-pill">Past</span>`}
        <div class="attendee-count">${count} going</div>
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
    await runTransaction(db, async (tx) => {
      const [rsvpSnap, eventSnap] = await Promise.all([tx.get(ref), tx.get(eventRef)]);
      if(!eventSnap.exists()) throw new Error('This event is no longer available.');
      const currentCount = Math.max(0, eventSnap.data().rsvpCount || 0);
      if(rsvpSnap.exists()){
        tx.delete(ref);
        tx.update(eventRef, { rsvpCount: Math.max(0, currentCount - 1) });
        myRsvps.delete(eventId);
      } else {
        tx.set(ref, { eventId, userId: user.uid, createdAt: serverTimestamp() });
        tx.update(eventRef, { rsvpCount: currentCount + 1 });
        myRsvps.add(eventId);
      }
    });
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
  box.innerHTML = `<div class="success-box"><div class="icon">✓</div><h3>Pitch sent</h3><p>An admin will review it and follow up by email.</p></div>`;
}

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
    if(box) box.innerHTML = `<div class="success-box"><div class="icon">✓</div><h3>Message sent</h3><p>Thanks — we'll get back to you by email.</p></div>`;
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
