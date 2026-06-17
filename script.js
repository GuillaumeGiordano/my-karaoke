"use strict";

/* =========================================================================
   MODÈLE DE DONNÉES
   Une chanson est un tableau d'objets { text, curve, time } :
     - text  : le texte affiché ("" = espace entre couplets, non minutable)
     - curve : la façon dont la couleur remplit la ligne pendant le chant
               ("linear", "easeIn", "easeOut", "easeInOut", "steps")
     - time  : moment (en secondes) où la ligne commence ; null = non défini

   Rien n'est embarqué dans le projet : au lancement, l'app est vide.
   1) On IMPORTE un fichier song.js (paroles + courbes + temps).
   2) On cale les temps en mode Réglage (auto-sauvegardé dans le navigateur).
   3) On EXPORTE le song.js mis à jour : c'est la seule sauvegarde durable.

   Le navigateur garde un brouillon auto pour reprendre après un reload ;
   il est écrasé dès qu'on importe un nouveau fichier (le fichier fait foi).
   ========================================================================= */

/* =========================================================================
   ÉTAT GLOBAL
   ========================================================================= */
const audio = document.getElementById("audio");
const lyricsEl = document.getElementById("lyrics");
const hintEl = document.getElementById("hint");
const syncTools = document.getElementById("sync-tools");

let SONG = []; // paroles courantes ; rempli uniquement à l'import
let mode = "play"; // "play" | "sync"
let lineEls = []; // éléments <p> de chaque ligne (paroles non vides incluses)
let lineCurves = []; // courbe d'animation de chaque ligne (aligné sur lineEls)
let timings = []; // timings[i] = temps en secondes de la ligne i, ou null
let syncIndex = 0; // prochaine ligne à minuter en mode réglage
let activeIndex = -1; // ligne actuellement surlignée en mode karaoké
let hasUnsavedWork = false; // un calage modifié n'a pas encore été exporté

/* Clé unique du brouillon de reprise dans le navigateur (localStorage). */
function storageKey() {
  return "karaoke-draft";
}

/* =========================================================================
   RENDU DES PAROLES
   On ne crée un index "minutable" que pour les lignes non vides.
   ========================================================================= */
function render() {
  lyricsEl.innerHTML = "";
  lineEls = [];
  lineCurves = [];

  if (SONG.length === 0) {
    const p = document.createElement("p");
    p.className = "line placeholder";
    p.textContent = "Importe un fichier song.js pour afficher les paroles.";
    p.style.cursor = "default";
    lyricsEl.appendChild(p);
    return;
  }

  SONG.forEach((line) => {
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
   DONNÉES COURANTES & BROUILLON DE REPRISE (localStorage)
   ========================================================================= */
/* Construit le tableau de la chanson courante : paroles + courbes + temps
   réinjectés depuis timings[]. Sert à l'export ET à l'auto-sauvegarde. */
function buildSong() {
  let li = 0; // index dans timings[] : avance seulement sur les lignes non vides
  return SONG.map((line) => {
    let time = null;
    if (line.text.trim() !== "") {
      const t = timings[li];
      if (t != null) time = Number(t.toFixed(2));
      li++;
    }
    return { text: line.text, curve: line.curve || "linear", time };
  });
}

/* Extrait les temps des seules lignes non vides (aligné sur lineEls/timings). */
function timingsFromSong(song) {
  return song
    .filter((line) => line && typeof line.text === "string" && line.text.trim() !== "")
    .map((line) => (typeof line.time === "number" ? line.time : null));
}

/* Sauvegarde automatique : permet de reprendre le travail après un reload,
   sans avoir à réimporter. Le brouillon contient paroles ET temps. */
function autoSaveDraft() {
  localStorage.setItem(storageKey(), JSON.stringify(buildSong()));
}

/* Restaure le brouillon au démarrage. Renvoie true si une reprise a eu lieu. */
function restoreDraft() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length === 0) return false;
    SONG = saved;
    timings = timingsFromSong(SONG);
    return true;
  } catch {
    return false; // brouillon illisible : on repart à vide
  }
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
  markDirty();
  updateHint();
}

function undoLine() {
  if (syncIndex === 0) return;
  syncIndex--;
  timings[syncIndex] = null;
  lineEls[syncIndex].classList.remove("timed", "active");
  if (syncIndex > 0) lineEls[syncIndex - 1].classList.add("active");
  lineEls[syncIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  markDirty();
  updateHint();
}

function resetTimings() {
  timings = lineEls.map(() => null);
  syncIndex = 0;
  lineEls.forEach((el) => el.classList.remove("timed", "active", "done"));
  markDirty();
  updateHint();
}

/* Marque un calage modifié mais pas encore exporté, et le persiste pour
   la reprise après reload. */
function markDirty() {
  hasUnsavedWork = true;
  autoSaveDraft();
}

/* Exporte le minutage au format .lrc (standard des paroles synchronisées). */
function exportLrc() {
  let lrc = "";
  let li = 0;
  SONG.forEach((line) => {
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

/* En-tête du fichier song.js régénéré (identique à celui d'origine). */
const SONG_FILE_HEADER = `/* =========================================================================
   DONNÉES DE LA CHANSON
   Chaque ligne est un objet : { text, curve, time }.
     - text  : le texte affiché ("" = espace entre couplets, non minutable)
     - curve : animation du remplissage de la couleur pendant le chant
               ("linear", "easeIn", "easeOut", "easeInOut", "steps")
     - time  : moment (en secondes) où la ligne commence ; null = non défini

   Tu peux remplir les "time" à la main, OU les caler dans l'application
   (mode Réglage) puis télécharger ce fichier mis à jour pour le remplacer.
   ========================================================================= */
`;

/* Régénère le fichier song.js avec le minutage courant. C'est la seule
   sauvegarde durable : on garde ce fichier pour le réimporter plus tard. */
function downloadSong() {
  if (SONG.length === 0) {
    hintEl.textContent = "❌ Rien à exporter : importe d'abord un song.js.";
    return;
  }
  // JSON.stringify gère l'échappement des guillemets/apostrophes du texte.
  const lines = buildSong()
    .map(
      (line) =>
        `  { text: ${JSON.stringify(line.text)}, curve: ${JSON.stringify(line.curve)}, time: ${line.time} },`
    )
    .join("\n");
  const body = `const SONG = [\n${lines}\n];\n`;

  downloadFile(SONG_FILE_HEADER + body, "song.js", "application/javascript");
  hasUnsavedWork = false; // le travail est désormais figé dans le fichier exporté
  hintEl.textContent = "✅ song.js exporté.";
}

/* Extrait le tableau SONG du texte d'un fichier song.js.
   On exécute le fichier dans une fonction isolée et on récupère SONG.
   (Fichier choisi localement par l'utilisateur = même confiance que le projet.) */
function parseSongFile(text) {
  const factory = new Function(
    text + "\n;return typeof SONG !== 'undefined' ? SONG : null;"
  );
  return factory();
}

/* Charge une chanson depuis un fichier song.js : paroles, courbes ET temps.
   Le fichier fait foi (il remplace tout). Garde-fou si un calage non exporté
   risquerait d'être écrasé. */
function importSong(file) {
  if (
    hasUnsavedWork &&
    !confirm(
      "Tu as un calage non exporté. Importer un autre fichier l'écrasera.\n" +
        "Exporte-le d'abord si tu veux le garder. Continuer quand même ?"
    )
  ) {
    return; // l'utilisateur annule : on ne touche à rien
  }

  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = parseSongFile(reader.result);
    } catch {
      hintEl.textContent = "❌ Fichier illisible : ce n'est pas un song.js valide.";
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      hintEl.textContent = "❌ Aucun tableau SONG trouvé dans ce fichier.";
      return;
    }

    // Le fichier importé remplace paroles, courbes et temps.
    SONG = parsed;
    timings = timingsFromSong(SONG);
    render();

    hasUnsavedWork = false; // l'affichage correspond exactement au fichier
    autoSaveDraft(); // permet la reprise après un reload
    setMode(mode);

    hintEl.textContent =
      "✅ song.js importé. Passe en « Réglage » pour caler ou ajuster les temps.";
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
  if (lineEls.length === 0) {
    hintEl.textContent =
      "Aucune chanson chargée. Clique « Importer song.js » (en haut) pour commencer.";
    return;
  }
  if (mode === "play") {
    const hasTimings = timings.some((t) => t != null);
    hintEl.textContent = hasTimings
      ? "Lance la musique : les paroles suivent toutes seules. Clique une ligne pour y sauter."
      : "Aucun minutage. Passe en mode « Réglage » pour caler les temps.";
  } else {
    const remaining = lineEls.length - syncIndex;
    hintEl.textContent =
      `Réglage — ligne ${Math.min(syncIndex + 1, lineEls.length)}/${lineEls.length}. ` +
      `Lance la musique et appuie sur Espace au début de chaque ligne (${remaining} restantes). ` +
      `N'oublie pas d'exporter song.js à la fin.`;
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
document.getElementById("btn-export").addEventListener("click", exportLrc);
document.getElementById("btn-download").addEventListener("click", downloadSong);
document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) importSong(file);
  e.target.value = ""; // permet de réimporter le même fichier ensuite
});
document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Effacer tous les temps de la chanson en cours ?")) resetTimings();
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
// L'audio est indépendant des paroles : on ne touche ni à SONG ni aux temps.
document.getElementById("audio-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  audio.src = URL.createObjectURL(file);
  audio.load();
});

/* =========================================================================
   INITIALISATION
   ========================================================================= */
// Reprise auto : si un brouillon existe, on restaure paroles + temps.
const restored = restoreDraft();
render();
setMode("play");
// Un travail repris n'a pas (re)été exporté : on protège contre l'écrasement.
hasUnsavedWork = restored;
