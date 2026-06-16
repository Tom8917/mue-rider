Mue Rider

Jeu 2D de moto wheelie réalisé avec **Phaser 3**, **Vite** et **TypeScript**.

Prérequis

Avant de lancer le projet, il faut installer :

- Node.js
- npm

Vérifier l’installation :

- node -v
- npm -v

Installation

Cloner le projet :

git clone URL_DU_REPO
cd NOM_DU_REPO

Installer les dépendances :

npm install
Lancer le jeu en local
npm run dev

Puis ouvrir l’adresse affichée dans le terminal, généralement :

http://localhost:5173
Commandes du jeu
Z : accélérer / lever la moto
S : frein arrière
Q : toucher le sol avec la main
ESPACE : recommencer après une chute
Build de production

Pour générer une version prête à être mise en ligne :

npm run build

Les fichiers générés se trouvent dans le dossier :

dist/
Prévisualiser le build
npm run preview
Structure principale
public/
  assets/
    backgrounds/
    portugal/
    brazil/
    usa/

src/
  scenes/
  data/
  main.ts
Notes

Les assets du jeu doivent être placés dans le dossier public/assets/.

Les chemins utilisés dans Phaser doivent commencer par /assets/....

Exemple :

this.load.image('suburb', '/assets/backgrounds/suburb.png')
