import { auth, db, ADMIN_EMAILS } from './firebase-init.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let currentProfile = null;
let ready = false;
let pendingAction = null;
const readyListeners = [];

/** Register a callback that fires once auth state is known, and again on every change. */
export function onReady(cb){
  readyListeners.push(cb);
  if(ready) cb(currentUser, currentProfile);
}
export function getUser(){ return currentUser; }
export function getProfile(){ return currentProfile; }
export function isAdmin(){ return !!currentProfile && currentProfile.role === 'admin'; }

async function ensureProfile(user, extra = {}){
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const isConfiguredAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
  if(snap.exists()){
    const data = snap.data();
    if(isConfiguredAdmin && data.role !== 'admin'){
      await setDoc(ref, { role: 'admin' }, { merge: true });
      data.role = 'admin';
    }
    return { id: user.uid, ...data };
  }
  const role = isConfiguredAdmin ? 'admin' : 'student';
  const profile = {
    name: extra.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Student'),
    email: user.email,
    grade: extra.grade || '',
    role,
    createdAt: serverTimestamp()
  };
  await setDoc(ref, profile);
  return { id: user.uid, ...profile };
}

onAuthStateChanged(auth, async (user) => {
  if(user){
    currentUser = user;
    try{ currentProfile = await ensureProfile(user); }
    catch(e){ console.error('Could not load profile', e); currentProfile = null; }
  } else {
    currentUser = null;
    currentProfile = null;
  }
  ready = true;
  updateNavUI();
  readyListeners.forEach(cb => cb(currentUser, currentProfile));

  if(currentUser && pendingAction){
    const fn = pendingAction;
    pendingAction = null;
    closeAuthModal();
    fn();
  }
});

/** Call requireAuth(fn) anywhere a guest needs to log in before doing something.
 *  If already logged in, fn() runs immediately. Otherwise the login modal opens
 *  and fn() automatically runs right after a successful login. */
export function requireAuth(action){
  if(currentUser){ action(); return; }
  pendingAction = action;
  setAuthError('');
  openAuthModal();
}

export async function doSignUp(name, email, password, grade){
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await ensureProfile(cred.user, { name, grade });
}
export async function doSignIn(email, password){
  await signInWithEmailAndPassword(auth, email, password);
}
export async function doSignOut(){
  await signOut(auth);
}

export async function sendResetEmail(email){
  await sendPasswordResetEmail(auth, email);
}

function friendlyError(err){
  const code = err && err.code || '';
  if(code.includes('email-already-in-use')) return 'That email already has an account — try logging in instead.';
  if(code.includes('invalid-email')) return 'That email address doesn\'t look right.';
  if(code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if(code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Email or password is incorrect.';
  return 'Something went wrong. Please try again.';
}

/* ---------------- Modal wiring (index.html and admin.html both include the same markup) ---------------- */
export function openAuthModal(){
  const overlay = document.getElementById('authOverlay');
  if(overlay) overlay.classList.add('open');
}
export function closeAuthModal(){
  const overlay = document.getElementById('authOverlay');
  if(overlay) overlay.classList.remove('open');
  pendingAction = null;
  setAuthError('');
}
function setAuthError(msg){
  const el = document.getElementById('authError');
  if(!el) return;
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

function updateNavUI(){
  const guestEl = document.getElementById('navGuest');
  const userEl = document.getElementById('navUserBox');
  if(!guestEl || !userEl) return;
  if(currentUser && currentProfile){
    guestEl.style.display = 'none';
    userEl.style.display = 'flex';
    const initials = (currentProfile.name || 'S').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const avatarEl = document.getElementById('navAvatar');
    const nameEl = document.getElementById('navUserName');
    const roleEl = document.getElementById('navUserRole');
    if(avatarEl) avatarEl.textContent = initials;
    if(nameEl) nameEl.textContent = currentProfile.name;
    if(roleEl) roleEl.textContent = currentProfile.role === 'admin' ? 'Admin' : `Grade ${currentProfile.grade || '—'}`;
  } else {
    guestEl.style.display = 'flex';
    userEl.style.display = 'none';
  }
}

function wireAuthModal(){
  const overlay = document.getElementById('authOverlay');
  if(!overlay) return; // page doesn't include the auth modal

  document.getElementById('authClose')?.addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeAuthModal(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeAuthModal(); });

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel)?.classList.add('active');
      setAuthError('');
    });
  });

  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setAuthError('');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Logging in…';
    try{ await doSignIn(email, password); }
    catch(err){ setAuthError(friendlyError(err)); }
    finally{ btn.disabled = false; btn.textContent = 'Log in'; }
  });

  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setAuthError('');
    const name = document.getElementById('signupName').value.trim();
    const grade = document.getElementById('signupGrade').value;
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Creating account…';
    try{ await doSignUp(name, email, password, grade); }
    catch(err){ setAuthError(friendlyError(err)); }
    finally{ btn.disabled = false; btn.textContent = 'Create account'; }
  });

  document.getElementById('forgotPasswordBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value.trim();
    if(!email){ setAuthError('Enter your email first, then try again.'); return; }
    try{
      await sendResetEmail(email);
      setAuthError('Password reset email sent. Check your inbox.');
    }catch(err){ setAuthError(friendlyError(err)); }
  });

  document.getElementById('navLoginBtn')?.addEventListener('click', () => { pendingAction = null; openAuthModal(); });
  document.getElementById('navLogoutBtn')?.addEventListener('click', () => doSignOut());
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', wireAuthModal);
} else {
  wireAuthModal();
}
