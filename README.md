# Selfstarters — launch checklist

Selfstarters is now structured as a real Firebase-backed site: public visitors can browse clubs/events, while account-only actions include applications, reviews, RSVPs, club pitches and contact messages. The admin dashboard is `admin.html`.

## 1. Firebase setup

1. Create a Firebase project.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a Firestore database.
4. In Firebase Project Settings → Your apps → Web app, copy the Firebase config into `firebase-init.js`.
5. Replace `ilyass@example.com` in BOTH `firebase-init.js` and `firestore.rules` with the founder/admin email.
6. Publish the rules from `firestore.rules` in Firestore → Rules.
7. Create the founder account from the site's Create account screen using that exact email. The first profile created with that configured email receives the admin role.

## 2. Run locally

Because the site uses JavaScript modules, do not open `index.html` directly with `file://`.

Use a local server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## 3. Admin dashboard

Open `/admin.html` after logging in with the configured founder/admin email.

The dashboard can:
- add/edit/delete clubs
- add/edit/delete events
- accept/reject applications
- approve/reject club pitches
- read/delete contact messages
- moderate reviews while keeping club rating aggregates correct
- view student profiles

For real Firebase Authentication account deletion, use Firebase Console or a trusted Admin SDK backend. The dashboard intentionally does not pretend that deleting a Firestore profile deletes the Auth account.

## 4. How to change the public site later

- Club/event content: normally edit it from `admin.html`, not from `index.html`.
- Site name/founder/school/contact email: edit `SITE` in `firebase-init.js`.
- Colors and layout: edit `styles.css`.
- Public sections/text: edit `index.html`.
- Database behavior: edit `app.js`.
- Login/signup behavior: edit `auth.js`.
- Admin controls: edit `admin.html` and `admin.js`.
- Security: edit `firestore.rules` and republish the rules.

## 5. Important production notes

- Firebase web config is not a password; Firestore Security Rules are what protect your data.
- Never put a Firebase Admin SDK service-account private key in this frontend project.
- The admin email check appears in the Firestore rules, so keep that email private and replace the placeholder before launch.
- If you later want multiple administrators, extend the `admin()` rule deliberately rather than allowing users to change their own role.
- The current review system allows one review per user per club.
- RSVP counts are updated transactionally so two quick clicks are much less likely to corrupt the counter.
