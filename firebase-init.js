/* ============================================================
   FIREBASE SETUP — read this before anything else works
   ============================================================
   1. Go to https://console.firebase.google.com → "Add project" (it's free).
   2. Inside your project: Build > Authentication > Get started >
      enable the "Email/Password" sign-in provider.
   3. Build > Firestore Database > Create database > start in
      "production mode" (we provide security rules in README.md —
      paste those into the Rules tab before you go live).
   4. Project settings (gear icon) > General > "Your apps" >
      click the </> (web) icon > register the app > copy the
      firebaseConfig object it gives you and paste it below,
      replacing the placeholder values.
   5. Add your own email address to ADMIN_EMAILS below — the first
      time you log in with that email, you become an admin and can
      open admin.html.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_vY8jcmPT9YQ_VqTI-nP4VVGLknRMfd4",
  authDomain: "selfstarters-6cf59.firebaseapp.com",
  projectId: "selfstarters-6cf59",
  storageBucket: "selfstarters-6cf59.firebasestorage.app",
  messagingSenderId: "682501966902",
  appId: "1:682501966902:web:2d11672d5b27882a445c97"
};

// Anyone who signs up/logs in with one of these emails automatically
// becomes an admin (can open admin.html and manage the whole site).
export const ADMIN_EMAILS = [
  "selfstarters.admin@gmail.com"   // <-- replace with the founder's real email
];

export const SITE = {
  name: "Selfstarters",
  school: "GDGSR Ben Guerir",
  founder: "Ilyass Hachadi",
  contactEmail: "selfstarters.admin@gmail.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
