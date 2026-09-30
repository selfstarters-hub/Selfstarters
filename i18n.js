/* ============================================================
   Selfstarters — English / French translations
   - Static text: elements with data-i18n, data-i18n-html,
     data-i18n-ph (placeholder) or data-i18n-aria (aria-label).
   - Dynamic text (built in JS): use t('key', { var: value }).
   - The chosen language is remembered in localStorage.
   ============================================================ */

const GRADE_FR = {
  7: "1ère année collège",
  8: "2ème année collège",
  9: "3ème année collège",
  10: "Tronc commun",
  11: "1ère année bac",
  12: "2ème année bac"
};

const STR = {
  en: {
    "meta.title": "Selfstarters — Find your team",
    "lang.aria": "Switch language",

    "nav.goal": "Our goal", "nav.clubs": "Clubs", "nav.events": "Events", "nav.how": "How it works", "nav.social": "Social",
    "nav.start": "Start a club", "nav.login": "Log in", "nav.logout": "Log out", "nav.admin": "Admin",
    "nav.profileAria": "Open your profile", "nav.myclubs": "My clubs",

    "hero.eyebrow": "Built by students for students",
    "hero.title": 'Find your<br>team.<span class="hl"> Not<br>just your<br>club.</span>',
    "hero.sub": "Selfstarters is where GDGSR Ben Guerir students go to see every team worth joining in one place — tech, math, chess, sports, and everything in between — and actually apply, not just wonder.",
    "hero.browse": "Browse open teams", "hero.seeEvents": "See upcoming events",
    "hero.cardMeta": "{filled}/{total} filled",
    "stat.teams": "Active teams", "stat.spots": "Open spots",

    "goal.title": "Our Goal",
    "goal.body": "Selfstarters is a community built for students who have ideas but lack the space to pursue them. Too often, students face a shortage of clubs, few chances to show what they can do, and limited access to the resources needed to turn an idea into something real. We started Selfstarters because we lived that problem ourselves, and instead of waiting for someone else to fix it, we decided to take action. Our goal is to give every student a place to start clubs, share their talents, and bring their ideas to life.",
    "goal.close": "Because great things begin when someone decides to start.",

    "clubs.title": "Every team,<br>one roster.",
    "clubs.desc": "Filter by what you're into. Every card shows exactly how many spots are open, when they meet, and lets you apply on the spot.",
    "clubs.empty": "No teams here yet.",
    "ticker.empty": "No teams listed yet — check back soon.",
    "filters.all": "All",
    "card.meets": "MEETS", "card.tbd": "TBD", "card.full": "FULL — WAITLIST OPEN", "card.spots": "{n} SPOTS OPEN", "card.view": "View & apply",

    "m.meets": "Meets", "m.location": "Location", "m.roster": "Roster", "m.status": "Status",
    "m.filled": "{filled} / {total} filled", "m.waitlist": "Waitlist", "m.open": "Open",
    "form.fullName": "Full name", "form.yourName": "Your name", "form.grade": "Grade", "form.selectGrade": "Select grade",
    "form.why": "Why do you want to join?", "form.whyPh": "A sentence or two is plenty.",
    "form.note": "Your application goes to the {club} lead and to the site admin.",
    "form.submitApp": "Submit application",
    "app.done": "Application received", "app.doneP": "The {club} lead will follow up by email with next steps.",
    "rev.title": "Reviews", "rev.loading": "Loading reviews…", "rev.none": "No reviews yet — be the first.",
    "rev.rating": "Your rating", "rev.your": "Your review", "rev.ph": "What's it actually like being in this club?",
    "rev.post": "Post review", "rev.pickStar": "Pick a star rating first.",

    "ev.title": "Events portal",
    "ev.desc": "Scrimmages, tournaments, competitions, and info sessions — RSVP so clubs know who's coming.",
    "ev.upcoming": "Upcoming", "ev.past": "Past", "ev.rsvp": "RSVP", "ev.going": "✓ Going", "ev.pastTag": "Past",
    "ev.count": "{n} going", "ev.none": "Nothing here yet.",

    "how.title": "How joining<br>actually works",
    "how.desc": "No mystery sign-up sheets taped to a door. Three steps, all online.",
    "s1.num": "01 / BROWSE", "s1.h": "Find a team that fits",
    "s1.p": "Filter by category, check meeting times against your schedule, and see how many spots are actually left before you commit.",
    "s2.num": "02 / APPLY", "s2.h": "Tell them why you're in",
    "s2.p": "A short form goes straight to the club's student lead — your name, grade, and a couple sentences on why you want in.",
    "s3.num": "03 / SHOW UP", "s3.h": "Get confirmed & go",
    "s3.p": "The lead follows up with next steps — tryout, intro meeting, or just \"see you Tuesday.\" Then you're on the roster.",

    "start.eyebrow": "Don't see your thing?", "start.title": "Start your own club at GDGSR Ben Guerir.",
    "start.p": "If you've got five people and an idea, Selfstarters will list it, run applications for it, and put your first meeting on the events portal.",
    "start.btn": "Pitch a new club",

    "pitch.title": "Pitch a new club", "pitch.p": "Have an idea? Send it to the Selfstarters admin team for review.",
    "pitch.name": "Club name", "pitch.cat": "Category", "pitch.choose": "Choose", "pitch.desc": "Description", "pitch.send": "Send club pitch",
    "pitch.done": "Pitch sent", "pitch.doneP": "An admin will review it and follow up by email.",

    "evp.title": "Propose an event", "evp.p": "Have an event idea? Send it to the admin team. It will only appear publicly after approval.",
    "evp.name": "Event title", "evp.namePh": "Math competition, workshop, meetup...",
    "evp.club": "Club / organizer", "evp.clubPh": "Math Club",
    "evp.date": "Date", "evp.time": "Time", "evp.timePh": "4:00 PM",
    "evp.loc": "Location", "evp.locPh": "Room 204",
    "evp.desc": "Description", "evp.descPh": "What will happen at this event?",
    "evp.send": "Submit event proposal",
    "evp.done": "Event proposal sent", "evp.doneP": "An admin will review your event and publish it if approved.",

    "ct.title": "Contact Selfstarters", "ct.p": "Questions, suggestions, or something we should fix? Send us a message.",
    "ct.msg": "Message", "ct.ph": "Write your message...", "ct.send": "Send message",
    "ct.done": "Message sent", "ct.doneP": "Thanks — we'll get back to you by email.",

    "soc.eyebrow": "Stay connected", "soc.title": "Follow us on Instagram",
    "soc.p": "See updates, announcements, events, and what the Selfstarters community is building at GDGSR Ben Guerir.",
    "soc.aria": "Open GDGSR Clubs Instagram",

    "ft.about": "A student-built platform for finding, joining, and running clubs at GDGSR Ben Guerir. No teachers required to get started.",
    "ft.explore": "Explore", "ft.teams": "All teams", "ft.events": "Events portal", "ft.how": "How it works",
    "ft.forclubs": "For clubs", "ft.start": "Start a club", "ft.post": "Post an event", "ft.contact": "Contact",
    "ft.credit": "© 2026 Selfstarters. Built by Ilyass Hachadi.",

    "au.title": "Join the community",
    "au.sub": "Browse as a guest. Sign in when you want to join, RSVP, review, pitch a club, or contact us.",
    "au.tabLogin": "Log in", "au.tabSignup": "Create account", "au.email": "Email", "au.password": "Password",
    "au.forgot": "Forgot password?", "au.loginBtn": "Log in", "au.signupBtn": "Create account",
    "au.loggingIn": "Logging in…", "au.creating": "Creating account…", "au.done": "Done, you are logged in",
    "au.needEmail": "Enter your email first, then try again.", "au.resetSent": "Password reset email sent. Check your inbox.",
    "err.exists": "That email already has an account — try logging in instead.",
    "err.email": "That email address doesn't look right.",
    "err.weak": "Password should be at least 6 characters.",
    "err.cred": "Email or password is incorrect.",
    "err.generic": "Something went wrong. Please try again.",

    "cat.Tech": "Tech", "cat.Academic": "Academic", "cat.Sports": "Sports", "cat.Games": "Games", "cat.Arts": "Arts",
    "cat.Social": "Social", "cat.Community": "Community", "cat.Culture": "Culture", "cat.Volunteering": "Volunteering",
    "cat.Leadership": "Leadership", "cat.Entrepreneurship": "Entrepreneurship", "cat.Science": "Science", "cat.Other": "Other"
  },

  fr: {
    "meta.title": "Selfstarters — Trouve ton équipe",
    "lang.aria": "Changer de langue",

    "nav.goal": "Notre objectif", "nav.clubs": "Clubs", "nav.events": "Événements", "nav.how": "Comment ça marche", "nav.social": "Réseaux",
    "nav.start": "Créer un club", "nav.login": "Se connecter", "nav.logout": "Se déconnecter", "nav.admin": "Admin",
    "nav.profileAria": "Ouvrir ton profil", "nav.myclubs": "Mes clubs",

    "hero.eyebrow": "Fait par des élèves, pour des élèves",
    "hero.title": 'Trouve ton<br>équipe.<span class="hl"> Pas<br>seulement<br>un club.</span>',
    "hero.sub": "Sur Selfstarters, les élèves du GDGSR Ben Guerir découvrent au même endroit toutes les équipes qui valent le coup — technologie, maths, échecs, sport et tout ce qu'il y a entre les deux — et candidatent pour de bon, au lieu de rester dans le doute.",
    "hero.browse": "Voir les équipes ouvertes", "hero.seeEvents": "Voir les événements à venir",
    "hero.cardMeta": "{filled}/{total} places occupées",
    "stat.teams": "Équipes actives", "stat.spots": "Places disponibles",

    "goal.title": "Notre objectif",
    "goal.body": "Selfstarters est une communauté pensée pour les élèves qui ont des idées, mais pas l'espace pour les réaliser. Trop souvent, ils manquent de clubs, ont peu d'occasions de montrer ce dont ils sont capables et un accès limité aux ressources qui permettent de transformer une idée en projet concret. Nous avons créé Selfstarters parce que nous avons vécu ce problème nous-mêmes, et plutôt que d'attendre que quelqu'un d'autre le règle, nous avons décidé d'agir. Notre objectif : donner à chaque élève un endroit où créer des clubs, partager ses talents et faire vivre ses idées.",
    "goal.close": "Parce que les grandes choses commencent le jour où quelqu'un décide de se lancer.",

    "clubs.title": "Toutes les équipes,<br>une seule liste.",
    "clubs.desc": "Filtre selon tes centres d'intérêt. Chaque carte indique combien de places restent, quand l'équipe se réunit, et te permet de postuler sur-le-champ.",
    "clubs.empty": "Aucune équipe ici pour le moment.",
    "ticker.empty": "Aucune équipe pour l'instant — reviens bientôt.",
    "filters.all": "Tous",
    "card.meets": "RÉUNION", "card.tbd": "À définir", "card.full": "COMPLET — LISTE D'ATTENTE OUVERTE", "card.spots": "{n} PLACES DISPONIBLES", "card.view": "Voir et postuler",

    "m.meets": "Réunions", "m.location": "Lieu", "m.roster": "Effectif", "m.status": "Statut",
    "m.filled": "{filled} / {total} places occupées", "m.waitlist": "Liste d'attente", "m.open": "Ouvert",
    "form.fullName": "Nom complet", "form.yourName": "Ton nom", "form.grade": "Niveau", "form.selectGrade": "Choisis ton niveau",
    "form.why": "Pourquoi veux-tu rejoindre ce club ?", "form.whyPh": "Une ou deux phrases suffisent.",
    "form.note": "Ta candidature est envoyée au responsable de {club} et à l'administrateur du site.",
    "form.submitApp": "Envoyer ma candidature",
    "app.done": "Candidature reçue", "app.doneP": "Le responsable de {club} te recontactera par e-mail pour la suite.",
    "rev.title": "Avis", "rev.loading": "Chargement des avis…", "rev.none": "Pas encore d'avis — sois le premier.",
    "rev.rating": "Ta note", "rev.your": "Ton avis", "rev.ph": "Comment est-ce vraiment de faire partie de ce club ?",
    "rev.post": "Publier l'avis", "rev.pickStar": "Choisis d'abord une note en étoiles.",

    "ev.title": "Portail des événements",
    "ev.desc": "Matchs amicaux, tournois, compétitions et séances d'information — confirme ta présence pour que les clubs sachent qui vient.",
    "ev.upcoming": "À venir", "ev.past": "Passés", "ev.rsvp": "Je m'inscris", "ev.going": "✓ Inscrit", "ev.pastTag": "Passé",
    "ev.count": "{n} inscrits", "ev.none": "Rien ici pour le moment.",

    "how.title": "Comment rejoindre<br>un club, concrètement",
    "how.desc": "Fini les feuilles d'inscription collées sur une porte. Trois étapes, tout en ligne.",
    "s1.num": "01 / EXPLORER", "s1.h": "Trouve l'équipe qui te correspond",
    "s1.p": "Filtre par catégorie, compare les horaires de réunion avec ton emploi du temps et vois combien de places restent réellement avant de t'engager.",
    "s2.num": "02 / POSTULER", "s2.h": "Dis-leur pourquoi tu veux en être",
    "s2.p": "Un court formulaire est envoyé directement au responsable élève du club : ton nom, ton niveau et quelques phrases pour expliquer ta motivation.",
    "s3.num": "03 / SE LANCER", "s3.h": "Reçois ta confirmation et c'est parti",
    "s3.p": "Le responsable te recontacte avec la suite : sélection, réunion d'accueil, ou simplement « à mardi ». Et te voilà dans l'équipe.",

    "start.eyebrow": "Tu ne trouves pas ton bonheur ?", "start.title": "Crée ton propre club au GDGSR Ben Guerir.",
    "start.p": "Si tu as cinq personnes et une idée, Selfstarters référence ton club, gère les candidatures et affiche ta première réunion sur le portail des événements.",
    "start.btn": "Proposer un nouveau club",

    "pitch.title": "Proposer un nouveau club", "pitch.p": "Une idée ? Envoie-la à l'équipe d'administration de Selfstarters pour examen.",
    "pitch.name": "Nom du club", "pitch.cat": "Catégorie", "pitch.choose": "Choisir", "pitch.desc": "Description", "pitch.send": "Envoyer ma proposition",
    "pitch.done": "Proposition envoyée", "pitch.doneP": "Un administrateur l'examinera et te recontactera par e-mail.",

    "evp.title": "Proposer un événement", "evp.p": "Une idée d'événement ? Envoie-la à l'équipe d'administration. Elle ne sera visible publiquement qu'après validation.",
    "evp.name": "Titre de l'événement", "evp.namePh": "Compétition de maths, atelier, rencontre...",
    "evp.club": "Club / organisateur", "evp.clubPh": "Club de maths",
    "evp.date": "Date", "evp.time": "Heure", "evp.timePh": "16 h 00",
    "evp.loc": "Lieu", "evp.locPh": "Salle 204",
    "evp.desc": "Description", "evp.descPh": "Que va-t-il se passer lors de cet événement ?",
    "evp.send": "Envoyer ma proposition d'événement",
    "evp.done": "Proposition d'événement envoyée", "evp.doneP": "Un administrateur examinera ton événement et le publiera s'il est validé.",

    "ct.title": "Contacter Selfstarters", "ct.p": "Une question, une suggestion, ou quelque chose à corriger ? Écris-nous.",
    "ct.msg": "Message", "ct.ph": "Écris ton message...", "ct.send": "Envoyer le message",
    "ct.done": "Message envoyé", "ct.doneP": "Merci — nous te répondrons par e-mail.",

    "soc.eyebrow": "Restons en contact", "soc.title": "Suis-nous sur Instagram",
    "soc.p": "Retrouve les actualités, les annonces, les événements et tout ce que la communauté Selfstarters construit au GDGSR Ben Guerir.",
    "soc.aria": "Ouvrir l'Instagram de GDGSR Clubs",

    "ft.about": "Une plateforme créée par des élèves pour trouver, rejoindre et gérer des clubs au GDGSR Ben Guerir. Pas besoin de professeur pour se lancer.",
    "ft.explore": "Explorer", "ft.teams": "Toutes les équipes", "ft.events": "Portail des événements", "ft.how": "Comment ça marche",
    "ft.forclubs": "Pour les clubs", "ft.start": "Créer un club", "ft.post": "Publier un événement", "ft.contact": "Contact",
    "ft.credit": "© 2026 Selfstarters. Créé par Ilyass Hachadi.",

    "au.title": "Rejoins la communauté",
    "au.sub": "Explore en simple visiteur. Connecte-toi quand tu veux rejoindre un club, confirmer ta présence, donner ton avis, proposer un club ou nous écrire.",
    "au.tabLogin": "Connexion", "au.tabSignup": "Créer un compte", "au.email": "E-mail", "au.password": "Mot de passe",
    "au.forgot": "Mot de passe oublié ?", "au.loginBtn": "Se connecter", "au.signupBtn": "Créer mon compte",
    "au.loggingIn": "Connexion…", "au.creating": "Création du compte…", "au.done": "C'est fait, tu es connecté",
    "au.needEmail": "Saisis d'abord ton e-mail, puis réessaie.", "au.resetSent": "E-mail de réinitialisation envoyé. Vérifie ta boîte de réception.",
    "err.exists": "Cet e-mail a déjà un compte — essaie plutôt de te connecter.",
    "err.email": "Cette adresse e-mail ne semble pas valide.",
    "err.weak": "Le mot de passe doit contenir au moins 6 caractères.",
    "err.cred": "E-mail ou mot de passe incorrect.",
    "err.generic": "Une erreur est survenue. Réessaie.",

    "cat.Tech": "Technologie", "cat.Academic": "Académique", "cat.Sports": "Sport", "cat.Games": "Jeux", "cat.Arts": "Arts",
    "cat.Social": "Vie sociale", "cat.Community": "Communauté", "cat.Culture": "Culture", "cat.Volunteering": "Bénévolat",
    "cat.Leadership": "Leadership", "cat.Entrepreneurship": "Entrepreneuriat", "cat.Science": "Sciences", "cat.Other": "Autre"
  }
};

// Grade labels: each grade shown next to its Moroccan-system equivalent.
for (const n of [7, 8, 9, 10, 11, 12]) {
  STR.en["grade." + n] = `${n}th grade — ${GRADE_FR[n]}`;
  STR.fr["grade." + n] = `${GRADE_FR[n]} — ${n}th grade`;
}

let lang = "en";
try { if (localStorage.getItem("ss_lang") === "fr") lang = "fr"; } catch (e) {}
const listeners = [];
let animTimer = null;

export const getLang = () => lang;
export const onLangChange = (cb) => { listeners.push(cb); };

export function t(key, vars) {
  let s = (STR[lang] && STR[lang][key]) ?? STR.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

export function catLabel(cat) {
  const k = "cat." + cat;
  return (STR[lang] && STR[lang][k]) ?? cat;
}

/** "9th" / "9" / "Grade 9" -> "Grade 9" (EN) or "3ème année collège" (FR). Other values are returned as-is. */
export function gradeText(g) {
  const n = parseInt(String(g || "").replace(/\D/g, ""), 10);
  if (n >= 7 && n <= 12) return lang === "fr" ? GRADE_FR[n] : "Grade " + n;
  return g ? String(g) : "—";
}

/** <option> list for grade selects (values stay "7th" … "12th" so existing data keeps working). */
export function gradeOptionsHtml() {
  return `<option value="">${t("form.selectGrade")}</option>` +
    [7, 8, 9, 10, 11, 12].map((n) => `<option value="${n}th">${t("grade." + n)}</option>`).join("");
}

export function applyStatic(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = t(el.dataset.i18nAria);
    el.setAttribute("aria-label", v);
    if (el.hasAttribute("title")) el.setAttribute("title", v);
  });
  const sw = document.getElementById("langSwitch");
  if (sw) sw.setAttribute("aria-checked", String(lang === "fr"));
}

function paint() {
  const html = document.documentElement;
  html.dataset.lang = lang;
  html.lang = lang;
  html.style.setProperty("--sd", lang === "fr" ? "22px" : "-22px");
  document.title = t("meta.title");
  applyStatic();
}

export function setLang(next) {
  if (next !== "en" && next !== "fr") return;
  lang = next;
  try { localStorage.setItem("ss_lang", lang); } catch (e) {}
  paint();
  listeners.forEach((cb) => cb(lang));
  // Slide the new text in from the side the switch moved towards.
  document.body.classList.remove("lang-anim");
  void document.body.offsetWidth;
  document.body.classList.add("lang-anim");
  clearTimeout(animTimer);
  animTimer = setTimeout(() => document.body.classList.remove("lang-anim"), 500);
}

paint();
document.getElementById("langSwitch")?.addEventListener("click", () => setLang(lang === "en" ? "fr" : "en"));
