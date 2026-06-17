/* =========================================================================
   DONNÉES DE LA CHANSON
   Chaque ligne est un objet : { text, curve, time }.
     - text  : le texte affiché ("" = espace entre couplets, non minutable)
     - curve : animation du remplissage de la couleur pendant le chant
               ("linear", "easeIn", "easeOut", "easeInOut", "steps")
     - time  : moment (en secondes) où la ligne commence ; null = non défini

   Tu peux remplir les "time" à la main, OU les caler dans l'application
   (mode Réglage) puis télécharger ce fichier mis à jour pour le remplacer.
   ========================================================================= */
const SONG = [
  { text: "Ok, j'ai décidé de m'inspirer d'une chanson simple", curve: "easeInOut", time: null },
  { text: "Parce que j'vais dire des trucs simples", curve: "easeIn", time: null },
  { text: "Parce que vous êtes trop cons", curve: "easeInOut", time: null },
  { text: "Okay, simple, basique", curve: "steps", time: null },
  { text: "Basique, okay", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Tout partager en couple c'est beau sauf quand c'est la couette - simple", curve: "linear", time: null },
  { text: "Romain voulait que Laurie pète devant lui, maintenant il regrette - basique", curve: "linear", time: null },
  { text: "Il repère un sniper à 300 mètres sur Call of mais pas la vaisselle - simple", curve: "linear", time: null },
  { text: "S'il y a des cheveux dans la douche, ça ne vient pas de Romain – basique", curve: "linear", time: null },
  { text: "Quand on dit n'oublie pas, c'est pourtant ce que vous faites – simple", curve: "linear", time: null },
  { text: "Si elle attend qu'il fasse à manger, elle va bouffer ses mains - basique", curve: "linear", time: null },
  { text: "Il dit qu'il a raison même quand toutes les preuves disent le contraire – simple", curve: "linear", time: null },
  { text: 'Quand il dit "tkt je gère", généralement c\'est dans 6 mois - basique', curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Avant c'était boîte et vodka, maintenant c'est notice Ikea – simple", curve: "linear", time: null },
  { text: "Quand elle te dit fais comme tu veux, surtout ne le fais pas - basique", curve: "linear", time: null },
  { text: "Pendant une semaine par mois, crois-moi, tais-toi, ça vaut mieux - simple", curve: "linear", time: null },
  { text: "Même quand c'est elle qui a tort, c'est quand même elle qui a raison - basique", curve: "linear", time: null },
  { text: "Si elle te demande comment tu la trouves, surtout ne réfléchis pas - simple", curve: "linear", time: null },
  { text: "Maintenant quand ils font du kayak c'est surtout sans lunettes - basique", curve: "linear", time: null },
  { text: "Son armoire déborde de vêtements, mais elle dit qu'elle n'a rien à mettre - basique", curve: "linear", time: null },
  { text: "Tous les témoins font des discours émouvants - cliché,", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Vous n'avez pas les bases", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "Basique, simple, vous n'avez pas les bases", curve: "linear", time: null },
  { text: "", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, basique", curve: "linear", time: null },
  { text: "Basique, simple, simple, vous n'avez pas les bases", curve: "linear", time: null },
];
