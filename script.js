"use strict";

/* =========================================================================
   PAROLES
   Chaque ligne est un objet : { text, curve }.
     - text  : le texte affiché ("" = espace entre couplets, non minutable)
     - curve : la façon dont la couleur remplit la ligne pendant le chant.

   Courbes possibles :
     "linear"    → vitesse constante
     "easeIn"    → lent au début, rapide à la fin
     "easeOut"   → rapide au début, lent à la fin
     "easeInOut" → lent au début ET à la fin, rapide au milieu
     "steps"     → saccadé (avance par à-coups)

   Toutes les lignes sont en "linear" : modifie seulement celles que tu veux.
   ========================================================================= */
const LYRICS = [
  { text: "Ok, on a décidé de s'inspirer d'une chanson simple", curve: "linear" },
  { text: "Parce qu'on va dire des trucs simples", curve: "linear" },
  { text: "Parce que vous êtes trop cons", curve: "linear" },
  { text: "Okay, simple, basique", curve: "linear" },
  { text: "Basique, okay", curve: "linear" },
  { text: "", curve: "linear" },
  {
    text: "Tout partager en couple c'est beau sauf quand c'est la couette - simple",
    curve: "linear",
  },
  {
    text: "Romain voulait que Laurie pète devant lui, maintenant il regrette - basique",
    curve: "linear",
  },
  {
    text: "Il repère un sniper à 300 mètres sur Call of mais pas la vaisselle - simple",
    curve: "linear",
  },
  {
    text: "S'il y a des cheveux dans la douche, ça ne vient pas de Romain – basique",
    curve: "linear",
  },
  {
    text: "Quand on dit n'oublie pas, c'est pourtant ce que vous faites – simple",
    curve: "linear",
  },
  {
    text: "Si elle attend qu'il fasse à manger, elle va bouffer ses mains - basique",
    curve: "linear",
  },
  {
    text: "Il dit qu'il a raison même quand toutes les preuves disent le contraire – simple",
    curve: "linear",
  },
  {
    text: 'Quand il dit "tkt je gère", généralement c\'est dans 6 mois - basique',
    curve: "linear",
  },
  { text: "", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Vous n'avez pas les bases, vous n'avez pas les bases", curve: "linear" },
  { text: "Vous n'avez pas les bases, vous n'avez pas les bases", curve: "linear" },
  { text: "", curve: "linear" },
  {
    text: "Avant c'était boîte et vodka, maintenant c'est notice Ikea – simple",
    curve: "linear",
  },
  {
    text: "Quand elle te dit fais comme tu veux, surtout ne le fais pas - basique",
    curve: "linear",
  },
  {
    text: "Pendant une semaine par mois, crois-moi, tais-toi, ça vaut mieux - simple",
    curve: "linear",
  },
  {
    text: "Même quand c'est elle qui a tort, c'est quand même elle qui a raison - basique",
    curve: "linear",
  },
  {
    text: "Si elle te demande comment tu la trouves, surtout ne réfléchis pas - simple",
    curve: "linear",
  },
  {
    text: "Maintenant quand ils font du kayak c'est surtout sans lunettes - basique",
    curve: "linear",
  },
  {
    text: "Son armoire déborde de vêtements, mais elle dit qu'elle n'a rien à mettre - basique",
    curve: "linear",
  },
  { text: "Tous les témoins font des discours émouvants - cliché,", curve: "linear" },
  { text: "", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "", curve: "linear" },
  { text: "Vous n'avez pas les bases", curve: "linear" },
  { text: "Vous n'avez pas les bases", curve: "linear" },
  { text: "Vous n'avez pas les bases", curve: "linear" },
  { text: "Vous n'avez pas les bases", curve: "linear" },
  { text: "", curve: "linear" },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear" },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear" },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear" },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear" },
  { text: "", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, basique", curve: "linear" },
  { text: "Basique, simple, simple, vous n'avez pas les bases", curve: "linear" },
];

/* =========================================================================
   ÉTAT GLOBAL
   ========================================================================= */
const audio = document.getElementById("audio");
const lyricsEl = document.getElementById("lyrics");
const hintEl = document.getElementById("hint");
const syncTools = document.getElementById("sync-tools");

let mode = "play"; // "play" | "sync"
let lineEls = []; // éléments <p> de chaque ligne (paroles non vides incluses)
let lineCurves = []; // courbe d'animation de chaque ligne (aligné sur lineEls)
let timings = []; // timings[i] = temps en secondes de la ligne i, ou null
let syncIndex = 0; // prochaine ligne à minuter en mode réglage
let activeIndex = -1; // ligne actuellement surlignée en mode karaoké

/* Nom logique de la chanson courante : sert de clé de stockage pour
   garder un minutage différent par chanson. */
let currentName = (audio.getAttribute("src") || "default").split("/").pop();

function storageKey() {
  return "karaoke-timings:" + currentName;
}

/* =========================================================================
   RENDU DES PAROLES
   On ne crée un index "minutable" que pour les lignes non vides.
   ========================================================================= */
function render() {
  lyricsEl.innerHTML = "";
  lineEls = [];
  lineCurves = [];

  LYRICS.forEach((line) => {
    const p = document.createElement("p");
    p.className = "line";

    if (line.text.trim() === "") {
      // Ligne vide = simple espacement, non minutable.
      p.innerHTML = "&nbsp;";
      p.style.cursor = "default";
      lyricsEl.appendChild(p);
      return;
    }

    const index = lineEls.length;
    p.textContent = line.text;
    p.dataset.index = String(index);

    // Clic sur une ligne = sauter à son temps (karaoké) ou la sélectionner (réglage).
    p.addEventListener("click", () => onLineClick(index));

    lyricsEl.appendChild(p);
    lineEls.push(p);
    // Récupère la courbe définie pour cette ligne (sinon "linear").
    lineCurves.push(line.curve || "linear");
  });
}

/* Applique une courbe d'interpolation à une progression p (0 → 1).
   Renvoie la fraction de remplissage (toujours entre 0 et 1). */
function applyEasing(p, curve) {
  switch (curve) {
    case "easeIn":
      return p * p; // lent au début
    case "easeOut":
      return 1 - (1 - p) * (1 - p); // lent à la fin
    case "easeInOut":
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    case "steps": {
      const n = 8; // nombre de paliers (plus grand = moins saccadé)
      return Math.floor(p * n) / n;
    }
    case "linear":
    default:
      return p;
  }
}

/* =========================================================================
   PERSISTANCE DU MINUTAGE (localStorage)
   ========================================================================= */
function loadTimings() {
  const raw = localStorage.getItem(storageKey());
  if (raw) {
    try {
      timings = JSON.parse(raw);
    } catch {
      timings = [];
    }
  }
  // Initialise / complète le tableau à la bonne longueur.
  while (timings.length < lineEls.length) timings.push(null);
}

function saveTimings() {
  localStorage.setItem(storageKey(), JSON.stringify(timings));
}

/* =========================================================================
   MODE KARAOKÉ : surlignage progressif et défilement automatique
   ========================================================================= */
let rafId = null; // identifiant de la boucle d'animation

/* Indice de la dernière ligne dont le temps est déjà passé. */
function findCurrentIndex() {
  let current = -1;
  for (let i = 0; i < timings.length; i++) {
    if (timings[i] != null && audio.currentTime >= timings[i]) current = i;
  }
  return current;
}

/* Temps de fin d'une ligne = début de la ligne suivante minutée.
   Pour la dernière ligne, on retombe sur la fin de l'audio. */
function lineEndTime(index) {
  for (let i = index + 1; i < timings.length; i++) {
    if (timings[i] != null) return timings[i];
  }
  return audio.duration || timings[index] + 4;
}

/* Met à jour la ligne active, son défilement et son remplissage. */
function renderPlayback() {
  const current = findCurrentIndex();

  // Changement de ligne : on bascule les classes et on recentre l'écran.
  if (current !== activeIndex) {
    activeIndex = current;
    lineEls.forEach((el, i) => {
      el.classList.toggle("active", i === current);
      el.classList.toggle("done", current >= 0 && i < current);
      if (i !== current) el.style.removeProperty("--fill");
    });
    if (current >= 0) {
      lineEls[current].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Remplissage progressif (0% → 100%) de la ligne active,
  // déformé par la courbe d'animation choisie pour cette ligne.
  if (current >= 0) {
    const start = timings[current];
    const end = lineEndTime(current);
    const ratio = end > start ? (audio.currentTime - start) / (end - start) : 1;
    const p = Math.max(0, Math.min(1, ratio));
    const fill = applyEasing(p, lineCurves[current]) * 100;
    lineEls[current].style.setProperty("--fill", fill.toFixed(2) + "%");
  }
}

/* Boucle d'animation : ~60 images/sec pour un balayage fluide. */
function startLoop() {
  cancelAnimationFrame(rafId);
  const step = () => {
    renderPlayback();
    rafId = requestAnimationFrame(step);
  };
  step();
}

function stopLoop() {
  cancelAnimationFrame(rafId);
  rafId = null;
}

/* =========================================================================
   MODE RÉGLAGE : marquer le temps de chaque ligne
   ========================================================================= */
function markLine() {
  if (syncIndex >= lineEls.length) return;

  timings[syncIndex] = audio.currentTime;
  lineEls[syncIndex].classList.add("timed");
  lineEls[syncIndex].classList.add("active");
  if (syncIndex > 0) lineEls[syncIndex - 1].classList.remove("active");

  lineEls[syncIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  syncIndex++;
  updateHint();
}

function undoLine() {
  if (syncIndex === 0) return;
  syncIndex--;
  timings[syncIndex] = null;
  lineEls[syncIndex].classList.remove("timed", "active");
  if (syncIndex > 0) lineEls[syncIndex - 1].classList.add("active");
  lineEls[syncIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  updateHint();
}

function resetTimings() {
  timings = lineEls.map(() => null);
  syncIndex = 0;
  lineEls.forEach((el) => el.classList.remove("timed", "active", "done"));
  localStorage.removeItem(storageKey());
  updateHint();
}

/* Exporte le minutage au format .lrc (standard des paroles synchronisées). */
function exportLrc() {
  let lrc = "";
  let li = 0;
  LYRICS.forEach((line) => {
    if (line.text.trim() === "") {
      lrc += "\n";
      return;
    }
    const t = timings[li];
    if (t != null) {
      const m = String(Math.floor(t / 60)).padStart(2, "0");
      const s = (t % 60).toFixed(2).padStart(5, "0");
      lrc += `[${m}:${s}]${line.text}\n`;
    } else {
      lrc += line.text + "\n";
    }
    li++;
  });

  downloadFile(lrc, "paroles.lrc", "text/plain");
}

/* Télécharge le minutage en .json (sauvegarde fidèle et réimportable).
   On inclut les paroles pour pouvoir vérifier la cohérence à l'import. */
function downloadTimings() {
  const data = {
    song: currentName,
    lyrics: LYRICS,
    timings: timings,
  };
  const name = currentName.replace(/\.[^.]+$/, "") + "-minutage.json";
  downloadFile(JSON.stringify(data, null, 2), name, "application/json");
}

/* Recharge un minutage depuis un fichier .json précédemment téléchargé. */
function importTimings(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch {
      hintEl.textContent = "❌ Fichier illisible : ce n'est pas un .json valide.";
      return;
    }

    // Accepte soit { timings: [...] }, soit directement un tableau.
    const incoming = Array.isArray(parsed) ? parsed : parsed.timings;
    if (!Array.isArray(incoming)) {
      hintEl.textContent = "❌ Aucun minutage trouvé dans ce fichier.";
      return;
    }

    if (incoming.length !== lineEls.length) {
      hintEl.textContent =
        `⚠️ Le fichier contient ${incoming.length} temps pour ${lineEls.length} lignes : ` +
        "les paroles ont peut-être changé. Vérifie le résultat.";
    } else {
      hintEl.textContent = "✅ Minutage importé et sauvegardé.";
    }

    // Aligne sur le nombre de lignes courant, puis sauvegarde.
    timings = lineEls.map((_, i) => (incoming[i] != null ? incoming[i] : null));
    saveTimings();
    setMode(mode); // rafraîchit l'affichage avec le nouveau minutage
  };
  reader.readAsText(file);
}

/* Petit utilitaire : déclenche le téléchargement d'un texte. */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================================================================
   INTERACTIONS
   ========================================================================= */
function onLineClick(index) {
  if (mode === "play") {
    // Sauter directement au moment de cette ligne, si connu.
    if (timings[index] != null) audio.currentTime = timings[index];
  } else {
    // En réglage : repositionner le pointeur sur cette ligne.
    syncIndex = index;
    lineEls.forEach((el, i) => el.classList.toggle("active", i === index));
    updateHint();
  }
}

function setMode(next) {
  mode = next;
  document.getElementById("mode-play").classList.toggle("active", next === "play");
  document.getElementById("mode-sync").classList.toggle("active", next === "sync");
  syncTools.classList.toggle("hidden", next === "play");

  // La classe sur <body> active (ou non) l'effet de remplissage en CSS.
  document.body.classList.toggle("mode-play", next === "play");
  document.body.classList.toggle("mode-sync", next === "sync");

  lineEls.forEach((el) => {
    el.classList.remove("active", "done");
    el.style.removeProperty("--fill");
  });
  activeIndex = -1;
  stopLoop();

  if (next === "sync") {
    // Reprend au premier temps non encore défini.
    syncIndex = timings.findIndex((t) => t == null);
    if (syncIndex === -1) syncIndex = 0;
  } else if (!audio.paused) {
    // Si la musique joue déjà, on relance l'animation.
    startLoop();
  }
  updateHint();
}

function updateHint() {
  if (mode === "play") {
    const hasTimings = timings.some((t) => t != null);
    hintEl.textContent = hasTimings
      ? "Lance la musique : les paroles suivent toutes seules. Clique une ligne pour y sauter."
      : "Aucun minutage trouvé. Passe en mode « Réglage » pour le créer.";
  } else {
    const remaining = lineEls.length - syncIndex;
    hintEl.textContent =
      `Réglage — ligne ${Math.min(syncIndex + 1, lineEls.length)}/${lineEls.length}. ` +
      `Lance la musique et appuie sur Espace au début de chaque ligne (${remaining} restantes). ` +
      `N'oublie pas de Sauvegarder.`;
  }
}

/* =========================================================================
   ÉVÉNEMENTS
   ========================================================================= */
// Pendant la lecture : boucle d'animation fluide.
audio.addEventListener("play", () => {
  if (mode === "play") startLoop();
});
audio.addEventListener("pause", stopLoop);
audio.addEventListener("ended", stopLoop);

// En pause ou après un déplacement, on rafraîchit une fois l'affichage.
audio.addEventListener("timeupdate", () => {
  if (mode === "play" && audio.paused) renderPlayback();
});
audio.addEventListener("seeked", () => {
  if (mode === "play") renderPlayback();
});

document.getElementById("mode-play").addEventListener("click", () => setMode("play"));
document.getElementById("mode-sync").addEventListener("click", () => setMode("sync"));

document.getElementById("btn-tap").addEventListener("click", markLine);
document.getElementById("btn-undo").addEventListener("click", undoLine);
document.getElementById("btn-save").addEventListener("click", () => {
  saveTimings();
  hintEl.textContent =
    "✅ Minutage sauvegardé. Repasse en mode « Karaoké » pour l'utiliser.";
});
document.getElementById("btn-export").addEventListener("click", exportLrc);
document.getElementById("btn-download").addEventListener("click", downloadTimings);
document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) importTimings(file);
  e.target.value = ""; // permet de réimporter le même fichier ensuite
});
document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Effacer tout le minutage de cette chanson ?")) resetTimings();
});

// Raccourcis clavier :
//   Q       = lecture / pause (dans tous les modes)
//   M / Espace = marquer une ligne (en mode réglage)
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === "q") {
    e.preventDefault();
    if (audio.paused) audio.play();
    else audio.pause();
    return;
  }

  if ((key === "m" || e.code === "Space") && mode === "sync") {
    e.preventDefault(); // empêche le scroll de la page
    markLine();
  }
});

// Chargement d'un autre fichier audio depuis l'ordinateur.
document.getElementById("audio-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  audio.src = URL.createObjectURL(file);
  currentName = file.name; // pour la clé de stockage
  audio.load();
  // Recharge le minutage propre à ce fichier.
  timings = [];
  loadTimings();
  setMode(mode);
});

/* =========================================================================
   INITIALISATION
   ========================================================================= */
render();
loadTimings();
setMode("play");
