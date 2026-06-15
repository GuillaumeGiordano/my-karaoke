# 🎤 Prompteur Karaoké

Un prompteur de chanson en HTML / CSS / JavaScript pur (aucune installation, aucun serveur). Les paroles défilent automatiquement et se remplissent de couleur **de gauche à droite**, calées sur la musique.

## Lancer l'application

Double-cliquez sur **`index.html`** : il s'ouvre dans votre navigateur (Chrome conseillé). C'est tout.

## Fichiers du projet

| Fichier | Rôle |
|---------|------|
| `index.html` | La page (structure) |
| `style.css` | L'apparence (thème sombre, couleur de surlignage) |
| `script.js` | La logique + **les paroles** (tout en haut du fichier) |
| `videoplayback.m4a` | La musique chargée par défaut |

## Les deux modes

L'application a deux modes, sélectionnables avec les boutons en haut à gauche.

### 1. Mode « Réglage » — à faire une seule fois par chanson

C'est ici qu'on indique au programme **à quel moment commence chaque ligne**. Cette liste de temps s'appelle le *minutage*.

1. Cliquez sur **Réglage**.
2. Lancez la musique (bouton ▶ du lecteur).
3. Au **début de chaque ligne chantée**, appuyez sur la touche **`M`** (ou `Espace`, ou le bouton « ⏱️ Marquer la ligne »). Le temps de la ligne est enregistré et la ligne suivante devient à régler.
4. Erreur ? **`↩️ Annuler la dernière`** revient en arrière. Vous pouvez aussi **cliquer sur une ligne** pour repositionner le curseur dessus.
5. À la fin, cliquez sur **`💾 Sauvegarder le minutage`**.
6. (Conseillé) Cliquez sur **`⬇️ Télécharger le minutage`** pour en garder une copie sur votre disque (voir « Sauvegarder et réutiliser le minutage » plus bas).

> Le compteur dans la barre d'aide (« ligne 5/47 ») vous indique où vous en êtes. Sur les refrains très répétitifs, surveillez-le pour ne pas vous décaler.

### 2. Mode « Karaoké » — pour chanter

1. Cliquez sur **Karaoké**.
2. Lancez la musique.
3. La ligne en cours s'illumine et **se remplit de couleur de gauche à droite** au fil du chant ; l'écran défile tout seul pour la garder au centre.
4. Vous pouvez **cliquer sur n'importe quelle ligne** pour sauter directement à son passage.

## Changer les paroles

Ouvrez **`script.js`** et modifiez le tableau **`LYRICS`** tout en haut :

```js
const LYRICS = [
  "Première ligne de la chanson",
  "Deuxième ligne",
  "",                       // une chaîne vide = espace entre deux couplets
  "Début du refrain",
];
```

- Une chaîne `"..."` = une ligne affichée.
- Une chaîne vide `""` = un espacement (couplet/refrain), elle n'est pas minutable.
- Si une ligne contient une apostrophe, entourez-la de guillemets doubles : `"c'est"`.

> ⚠️ Si vous modifiez les paroles après avoir fait le réglage, le minutage peut se décaler : refaites un passage en mode Réglage.

## Changer la musique

- **Solution rapide** : remplacez le fichier `videoplayback.m4a` par le vôtre (en gardant le même nom).
- **Solution souple** : utilisez le bouton **« Charger un audio »** en haut à droite pour choisir un fichier depuis votre ordinateur. Chaque chanson garde son propre minutage.

## Sauvegarder et réutiliser le minutage

Par défaut, le minutage est gardé dans le navigateur (`localStorage`), **par chanson** : il revient tout seul à la prochaine ouverture, mais **uniquement sur le même navigateur et le même ordinateur**. Pour ne pas le perdre (changement de PC, vidage du cache), utilisez les boutons du mode Réglage :

| Bouton | Effet |
|--------|-------|
| **⬇️ Télécharger le minutage** | Enregistre un fichier `.json` (chanson + paroles + temps) sur votre disque. C'est votre sauvegarde. |
| **⬆️ Importer un minutage** | Recharge un fichier `.json` précédemment téléchargé (sur n'importe quel ordinateur). Le minutage est aussitôt appliqué et re-sauvegardé dans le navigateur. |
| **⬇️ Exporter (.lrc)** | Exporte au format standard `.lrc` (paroles synchronisées), pour réutiliser ailleurs. ⚠️ Ce format n'est **pas** réimportable ici. |

> Si vous importez un minutage alors que les paroles ont changé (nombre de lignes différent), un message d'avertissement s'affiche et vous demande de vérifier le résultat.

## Bon à savoir

- **Remplissage par ligne (pas par mot)** : la couleur avance à vitesse constante sur la ligne, calée sur sa durée (du début de la ligne au début de la suivante). Ce n'est pas un karaoké mot-à-mot, mais c'est le fonctionnement de la grande majorité des karaokés.
- **`🗑️ Effacer`** supprime tout le minutage de la chanson en cours.

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| `Q` | Lecture / pause de la musique (dans les deux modes) |
| `M` ou `Espace` | Marquer la ligne courante (en mode Réglage uniquement) |
