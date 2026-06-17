# 🎤 Prompteur Karaoké

Un prompteur de chanson en HTML / CSS / JavaScript pur (aucune installation, aucun serveur). Les paroles défilent automatiquement et se remplissent de couleur **de gauche à droite**, calées sur la musique.

## Lancer l'application

Double-cliquez sur **`index.html`** : il s'ouvre dans votre navigateur (Chrome conseillé). Au démarrage l'app est **vide** : commencez par **« ⬆️ Importer song.js »** (bouton en haut) pour charger une chanson.

## Fichiers du projet

| Fichier | Rôle |
|---------|------|
| `index.html` | La page (structure) |
| `style.css` | L'apparence (thème sombre, couleur de surlignage) |
| `script.js` | La logique de l'application |
| `videoplayback.m4a` | La musique chargée par défaut |
| `song.js` *(externe)* | Le fichier de données d'une chanson (paroles + courbes + temps). **Pas embarqué** dans le projet : on l'importe et on l'exporte. |

## Les deux modes

L'application a deux modes, sélectionnables avec les boutons en haut à gauche.

### 1. Mode « Réglage » — à faire une seule fois par chanson

C'est ici qu'on indique au programme **à quel moment commence chaque ligne**. Cette liste de temps s'appelle le *minutage*.

0. Importez d'abord un `song.js` (bouton « ⬆️ Importer song.js » en haut).
1. Cliquez sur **Réglage**.
2. Lancez la musique (bouton ▶ du lecteur).
3. Au **début de chaque ligne chantée**, appuyez sur la touche **`M`** (ou `Espace`, ou le bouton « ⏱️ Marquer la ligne »). Le temps de la ligne est enregistré et la ligne suivante devient à régler.
4. Erreur ? **`↩️ Annuler la dernière`** revient en arrière. Vous pouvez aussi **cliquer sur une ligne** pour repositionner le curseur dessus.
5. À la fin, cliquez sur **`⬇️ Exporter song.js`** pour enregistrer votre travail (voir « Sauvegarder et réutiliser » plus bas). C'est la **seule** sauvegarde durable.

> Le compteur dans la barre d'aide (« ligne 5/47 ») vous indique où vous en êtes. Sur les refrains très répétitifs, surveillez-le pour ne pas vous décaler.

### 2. Mode « Karaoké » — pour chanter

1. Cliquez sur **Karaoké**.
2. Lancez la musique.
3. La ligne en cours s'illumine et **se remplit de couleur de gauche à droite** au fil du chant ; l'écran défile tout seul pour la garder au centre.
4. Vous pouvez **cliquer sur n'importe quelle ligne** pour sauter directement à son passage.

## Changer les paroles

Les paroles vivent dans un fichier **`song.js`** que vous éditez **hors de l'app**, puis que vous **importez**. C'est un tableau **`SONG`** : paroles, animation et minutage y vivent ensemble. Chaque ligne est un objet `{ text, curve, time }` :

```js
const SONG = [
  { text: "Première ligne de la chanson", curve: "linear", time: null },
  { text: "Deuxième ligne", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },              // text vide = espace entre deux couplets
  { text: "Début du refrain", curve: "linear", time: null },
];
```

- `text` = le texte affiché ; `text: ""` = un espacement (non minutable).
- `curve` = l'animation de remplissage (voir section suivante ; laissez `"linear"` si vous ne savez pas).
- `time` = le moment (en secondes) où la ligne commence ; `null` = non encore calé. Vous pouvez le remplir à la main, ou le caler en mode Réglage puis **exporter `song.js`** (voir plus bas).
- Si le texte contient une apostrophe, entourez-le de guillemets doubles : `"c'est"`.

Pour créer une nouvelle chanson, partez d'un `song.js` existant, remplacez les `text`, mettez les `time` à `null`, importez-le, puis calez les temps.

> ⚠️ Si vous changez les paroles, recalez les temps : importez le `song.js` modifié et refaites un passage en mode Réglage.

## Changer la musique

- **Solution rapide** : remplacez le fichier `videoplayback.m4a` par le vôtre (en gardant le même nom).
- **Solution souple** : utilisez le bouton **« Charger un audio »** en haut à droite pour choisir un fichier depuis votre ordinateur. L'audio est indépendant des paroles.

## Sauvegarder et réutiliser

La **seule sauvegarde durable** est le fichier **`song.js` exporté** : gardez-le, c'est lui que vous réimporterez. Pendant que vous travaillez, l'app sauvegarde aussi un **brouillon automatique** dans le navigateur : si vous rechargez la page, votre travail est **restauré tout seul** (même navigateur / même ordinateur uniquement). Ce brouillon est **écrasé dès que vous importez un nouveau fichier** — le fichier importé fait foi.

| Bouton | Effet |
|--------|-------|
| **⬆️ Importer song.js** | Charge une chanson (paroles + courbes + temps) depuis un fichier `song.js`. Remplace tout l'affichage. Si un calage non exporté risque d'être perdu, une confirmation s'affiche. |
| **⬇️ Exporter song.js** | Régénère le fichier `song.js` avec le minutage courant. C'est votre sauvegarde : conservez-le pour le réimporter plus tard. |
| **⬇️ Exporter (.lrc)** | Exporte au format standard `.lrc` (paroles synchronisées), pour réutiliser dans **un autre logiciel**. ⚠️ Ce format n'est **pas** réimportable ici. |

## Animation de remplissage par ligne (optionnel)

Par défaut, la couleur remplit chaque ligne à **vitesse constante**. Vous pouvez donner à chaque ligne une « courbe » différente, directement dans son objet via le champ **`curve`** :

| Valeur | Effet |
|--------|-------|
| `"linear"` | Vitesse constante (défaut) |
| `"easeIn"` | Lent au début, rapide à la fin |
| `"easeOut"` | Rapide au début, lent à la fin |
| `"easeInOut"` | Lent au début et à la fin, rapide au milieu |
| `"steps"` | Saccadé (avance par à-coups) |

Il suffit de changer la valeur de `curve` sur la ligne voulue :

```js
{ text: "Romain voulait que Laurie pète devant lui...", curve: "easeOut" },
{ text: "Il repère un sniper à 300 mètres...", curve: "steps" },
```

> Note : cette animation est purement visuelle ; elle déforme la vitesse de la couleur sans changer le minutage. Pour un effet « collé à la voix », gardez `"linear"`.

## Bon à savoir

- **Remplissage par ligne (pas par mot)** : la couleur avance à vitesse constante sur la ligne, calée sur sa durée (du début de la ligne au début de la suivante). Ce n'est pas un karaoké mot-à-mot, mais c'est le fonctionnement de la grande majorité des karaokés.
- **`🗑️ Effacer`** supprime tout le minutage de la chanson en cours.

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| `Q` | Lecture / pause de la musique (dans les deux modes) |
| `M` ou `Espace` | Marquer la ligne courante (en mode Réglage uniquement) |
