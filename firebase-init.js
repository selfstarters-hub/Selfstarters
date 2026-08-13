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
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Anyone who signs up/logs in with one of these emails automatically
// becomes an admin (can open admin.html and manage the whole site).
export const ADMIN_EMAILS = [
  "ilyass@example.com"   // <-- replace with the founder's real email
];

export const SITE = {
  name: "Selfstarters",
  school: "GDGSR Ben Guerir",
  founder: "Ilyass Hachadi",
  contactEmail: "hello@selfstarters.club"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
