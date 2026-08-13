import { db, SITE } from './firebase-init.js';
import { onReady, isAdmin, getProfile, doSignOut } from './auth.js';
import {
  collection, onSnapshot, addDoc, setDoc, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp, runTransaction, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const state = { clubs: [], events: [], applications: [], pitches: [], messages: [], reviews: [], users: [] };
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const stamp = value => value?.toDate ? value.toDate().toLocaleString() : '—';
const statusClass = s => s === 'accepted' ? 'status-accepted' : s === 'rejected' ? 'status-rejected' : 'status-pending';
const emptyRow = (cols, text='Nothing here yet.') => `<tr><td colspan="${cols}" class="empty-state">${text}</td></tr>`;

onReady((user) => {
  if(!user || !isAdmin()) {
    $('gate').innerHTML = `<h2>Admin access required</h2><p>Log in with the founder/admin account to manage Selfstarters.</p><a class="btn btn-solid" href="./index.html">Back to site</a>`;
    return;
  }
  $('gate').style.display = 'none';
  $('adminApp').style.display = 'grid';
  $('adminIdentity').textContent = `${getProfile()?.name || user.email} · Admin`;
  startListeners();
});

$('adminLogout')?.addEventListener('click', () => doSignOut());

document.querySelectorAll('.admin-nav-btn[data-panel]').forEach(btn => btn.addEventListener('click', () => switchPanel(btn.dataset.panel)));
function switchPanel(name){
  document.querySelectorAll('.admin-nav-btn[data-panel]').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
  $('panelTitle').textContent = ({dashboard:'Dashboard',clubs:'Clubs',events:'Events',applications:'Applications',pitches:'Club pitches',messages:'Contact messages',reviews:'Reviews',users:'Users'})[name] || 'Dashboard';
}

function startListeners(){
  const configs = [
    ['clubs','clubs'],['events','events'],['applications','applications'],['pitches','clubPitches'],['messages','contactMessages'],['reviews','reviews'],['users','users']
  ];
  for(const [key, coll] of configs){
    onSnapshot(collection(db, coll), snap => { state[key] = snap.docs.map(d => ({id:d.id,...d.data()})); renderAll(); }, err => console.error(coll, err));
  }
}
function renderAll(){
  $('countClubs').textContent = state.clubs.length;
  $('countEvents').textContent = state.events.length;
  $('countApplications').textContent = state.applications.filter(x => x.status === 'pending').length;
  $('countUsers').textContent = state.users.length;
  renderClubs(); renderEvents(); renderApplications(); renderPitches(); renderMessages(); renderReviews(); renderUsers();
}

$('newClubBtn').addEventListener('click', () => openClubEditor());
$('newEventBtn').addEventListener('click', () => openEventEditor());

function openClubEditor(club=null){
  const c = club || {name:'',category:'Tech',desc:'',full:'',meets:'',room:'',filled:0,total:20,number:'',ratingSum:0,ratingCount:0};
  const box = $('clubEditor'); box.style.display='block';
  box.innerHTML = `<h3>${club ? 'Edit club' : 'Add club'}</h3><form class="stack-form" id="clubEditForm"><div class="grid-2"><label>Name<input id="ceName" value="${esc(c.name)}" required></label><label>Category<select id="ceCategory"><option>Tech</option><option>Academic</option><option>Sports</option><option>Games</option><option>Arts</option><option>Other</option></select></label><label>Short description<input id="ceDesc" value="${esc(c.desc)}" required></label><label>Meeting time<input id="ceMeets" value="${esc(c.meets)}" required></label><label>Location<input id="ceRoom" value="${esc(c.room)}"></label><label>Roster capacity<input id="ceTotal" type="number" min="1" value="${Number(c.total)||20}" required></label><label>Filled<input id="ceFilled" type="number" min="0" value="${Number(c.filled)||0}" required></label><label>Display number<input id="ceNumber" value="${esc(c.number || '')}"></label></div><label>Full description<textarea id="ceFull" required>${esc(c.full)}</textarea></label><div class="admin-form-actions"><button class="btn btn-solid" type="submit">${club?'Save changes':'Create club'}</button><button class="btn" type="button" id="cancelClub">Cancel</button></div></form>`;
  $('ceCategory').value = c.category || 'Tech';
  $('cancelClub').onclick=()=>box.style.display='none';
  $('clubEditForm').onsubmit=async e=>{e.preventDefault(); const data={name:$('ceName').value.trim(),category:$('ceCategory').value,desc:$('ceDesc').value.trim(),full:$('ceFull').value.trim(),meets:$('ceMeets').value.trim(),room:$('ceRoom').value.trim(),total:Math.max(1,Number($('ceTotal').value)),filled:Math.max(0,Number($('ceFilled').value)),number:$('ceNumber').value.trim()}; if(data.filled>data.total)data.filled=data.total; if(club) await updateDoc(doc(db,'clubs',club.id),data); else await addDoc(collection(db,'clubs'),{...data,ratingSum:0,ratingCount:0,createdAt:serverTimestamp()}); box.style.display='none';};
}
function renderClubs(){
  $('clubsTable').innerHTML = state.clubs.length ? state.clubs.map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><span class="small-muted">${esc(c.desc)}</span></td><td>${esc(c.category)}</td><td>${esc(c.meets)}<br><span class="small-muted">${esc(c.room)}</span></td><td>${Number(c.filled)||0}/${Number(c.total)||0}</td><td class="actions"><button class="btn btn-sm" data-edit-club="${c.id}">Edit</button><button class="btn btn-danger btn-sm" data-delete-club="${c.id}">Delete</button></td></tr>`).join('') : emptyRow(5);
  document.querySelectorAll('[data-edit-club]').forEach(b=>b.onclick=()=>openClubEditor(state.clubs.find(x=>x.id===b.dataset.editClub)));
  document.querySelectorAll('[data-delete-club]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this club? Existing applications and reviews will remain, but the club disappears from the public site.')) await deleteDoc(doc(db,'clubs',b.dataset.deleteClub));});
}

function openEventEditor(event=null){
  const e = event || {title:'',club:'',date:'',time:'',location:'',desc:'',status:'upcoming',rsvpCount:0};
  const box=$('eventEditor'); box.style.display='block';
  box.innerHTML=`<h3>${event?'Edit event':'Add event'}</h3><form class="stack-form" id="eventEditForm"><div class="grid-2"><label>Title<input id="eeTitle" value="${esc(e.title)}" required></label><label>Club<input id="eeClub" value="${esc(e.club)}" required></label><label>Date<input id="eeDate" type="date" value="${esc(e.date)}" required></label><label>Time<input id="eeTime" value="${esc(e.time)}" required></label><label>Location<input id="eeLocation" value="${esc(e.location)}" required></label><label>Status<select id="eeStatus"><option value="upcoming">Upcoming</option><option value="past">Past</option></select></label></div><label>Description<textarea id="eeDesc" required>${esc(e.desc)}</textarea><div class="admin-form-actions"><button class="btn btn-solid" type="submit">${event?'Save changes':'Create event'}</button><button class="btn" type="button" id="cancelEvent">Cancel</button></div></form>`;
  $('eeStatus').value=e.status||'upcoming'; $('cancelEvent').onclick=()=>box.style.display='none';
  $('eventEditForm').onsubmit=async ev=>{ev.preventDefault(); const data={title:$('eeTitle').value.trim(),club:$('eeClub').value.trim(),date:$('eeDate').value,time:$('eeTime').value.trim(),location:$('eeLocation').value.trim(),desc:$('eeDesc').value.trim(),status:$('eeStatus').value}; if(event) await updateDoc(doc(db,'events',event.id),data); else await addDoc(collection(db,'events'),{...data,rsvpCount:0,createdAt:serverTimestamp()}); box.style.display='none';};
}
function renderEvents(){
  $('eventsTable').innerHTML=state.events.length?state.events.sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(e=>`<tr><td><strong>${esc(e.title)}</strong><br><span class="small-muted">${esc(e.location)}</span></td><td>${esc(e.date)}<br>${esc(e.time)}</td><td>${esc(e.club)}</td><td>${Number(e.rsvpCount)||0}</td><td class="actions"><button class="btn btn-sm" data-edit-event="${e.id}">Edit</button><button class="btn btn-danger btn-sm" data-delete-event="${e.id}">Delete</button></td></tr>`).join(''):emptyRow(5);
  document.querySelectorAll('[data-edit-event]').forEach(b=>b.onclick=()=>openEventEditor(state.events.find(x=>x.id===b.dataset.editEvent)));
  document.querySelectorAll('[data-delete-event]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this event? Its RSVP records will remain unless you remove them separately.')) await deleteDoc(doc(db,'events',b.dataset.deleteEvent));});
}

function renderApplications(){
  const list=[...state.applications].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $('applicationsTable').innerHTML=list.length?list.map(a=>`<tr><td><strong>${esc(a.name)}</strong><br><span class="small-muted">${esc(a.email)}</span></td><td>${esc(a.clubName)}</td><td>${esc(a.grade)}</td><td><span class="status-pill ${statusClass(a.status)}">${esc(a.status)}</span></td><td>${esc(a.reason)}</td><td class="actions"><button class="btn btn-sm" data-app-status="accepted" data-id="${a.id}">Accept</button><button class="btn btn-sm btn-danger" data-app-status="rejected" data-id="${a.id}">Reject</button></td></tr>`).join(''):emptyRow(6);
  document.querySelectorAll('[data-app-status]').forEach(b=>b.onclick=async()=>updateDoc(doc(db,'applications',b.dataset.id),{status:b.dataset.appStatus,reviewedAt:serverTimestamp()}));
}

function renderPitches(){
  const list=[...state.pitches].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $('pitchesTable').innerHTML=list.length?list.map(p=>`<tr><td>${esc(p.name)}<br><span class="small-muted">${esc(p.email)}</span></td><td><strong>${esc(p.clubName)}</strong></td><td>${esc(p.category)}</td><td>${esc(p.description)}</td><td><span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span></td><td class="actions">${p.status==='pending'?`<button class="btn btn-sm" data-approve-pitch="${p.id}">Approve</button><button class="btn btn-danger btn-sm" data-reject-pitch="${p.id}">Reject</button>`:`<button class="btn btn-danger btn-sm" data-delete-pitch="${p.id}">Delete</button>`}</td></tr>`).join(''):emptyRow(6);
  document.querySelectorAll('[data-approve-pitch]').forEach(b=>b.onclick=()=>approvePitch(b.dataset.approvePitch));
  document.querySelectorAll('[data-reject-pitch]').forEach(b=>b.onclick=async()=>updateDoc(doc(db,'clubPitches',b.dataset.rejectPitch),{status:'rejected',reviewedAt:serverTimestamp()}));
  document.querySelectorAll('[data-delete-pitch]').forEach(b=>b.onclick=async()=>deleteDoc(doc(db,'clubPitches',b.dataset.deletePitch)));
}
async function approvePitch(id){
  const p=state.pitches.find(x=>x.id===id); if(!p)return;
  const exists=state.clubs.some(c=>c.name.toLowerCase()===String(p.clubName).toLowerCase());
  if(exists){alert('A club with this name already exists.');return;}
  await addDoc(collection(db,'clubs'),{name:p.clubName,category:p.category,desc:p.description,full:p.description,meets:'TBD',room:'TBD',filled:0,total:20,number:'',ratingSum:0,ratingCount:0,createdAt:serverTimestamp()});
  await updateDoc(doc(db,'clubPitches',id),{status:'accepted',reviewedAt:serverTimestamp()});
}

function renderMessages(){
  const list=[...state.messages].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $('messagesTable').innerHTML=list.length?list.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.message)}</td><td>${stamp(m.createdAt)}</td><td class="actions"><button class="btn btn-danger btn-sm" data-delete-message="${m.id}">Delete</button></td></tr>`).join(''):emptyRow(5);
  document.querySelectorAll('[data-delete-message]').forEach(b=>b.onclick=async()=>deleteDoc(doc(db,'contactMessages',b.dataset.deleteMessage)));
}

function renderReviews(){
  const list=[...state.reviews].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $('reviewsTable').innerHTML=list.length?list.map(r=>`<tr><td>${esc(state.clubs.find(c=>c.id===r.clubId)?.name || r.clubId)}</td><td>${esc(r.userName)}</td><td>${'★'.repeat(Number(r.rating)||0)}</td><td>${esc(r.text)}</td><td class="actions"><button class="btn btn-danger btn-sm" data-delete-review="${r.id}">Delete</button></td></tr>`).join(''):emptyRow(5);
  document.querySelectorAll('[data-delete-review]').forEach(b=>b.onclick=()=>deleteReview(b.dataset.deleteReview));
}
async function deleteReview(id){
  const review=state.reviews.find(r=>r.id===id); if(!review)return;
  if(!confirm('Delete this review and remove it from the club rating?'))return;
  const clubRef=doc(db,'clubs',review.clubId), reviewRef=doc(db,'reviews',id);
  await runTransaction(db,async tx=>{
    const clubSnap=await tx.get(clubRef); const d=clubSnap.exists()?clubSnap.data():{};
    tx.delete(reviewRef);
    if(clubSnap.exists()) tx.update(clubRef,{ratingSum:Math.max(0,(d.ratingSum||0)-Number(review.rating||0)),ratingCount:Math.max(0,(d.ratingCount||0)-1)});
  });
}

function renderUsers(){
  const list=[...state.users].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  $('usersTable').innerHTML=list.length?list.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.grade)}</td><td><span class="status-pill ${u.role==='admin'?'role-admin':'role-student'}">${esc(u.role)}</span></td><td>${stamp(u.createdAt)}</td></tr>`).join(''):emptyRow(5);
}
