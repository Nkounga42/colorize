# ColorVerse

ColorVerse est une application web interactive pour la création et l'édition d'images. Elle offre une interface utilisateur intuitive avec des outils de dessin avancés basés sur Fabric.js.
# ColorVerse  

![React](https://img.shields.io/badge/React-18.0.0-blue?logo=react&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white) 
![Fabric.js](https://img.shields.io/badge/Fabric.js-Canvas-orange) 
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?logo=tailwindcss&logoColor=white) 
![License](https://img.shields.io/badge/License-MIT-green)



![ColorVerse Interface](https://github.com/Nkounga42/colorize/blob/main/colorize%20screen%20shot.png)

## Fonctionnalités

- Outils de dessin variés (crayon, formes géométriques, texte)
- Importation et manipulation d'images
- Gestion des calques
- Personnalisation des propriétés visuelles (couleur, taille, rotation, etc.)
- Interface réactive et moderne

## Structure du Projet

Le projet est organisé comme suit dans le dossier `src`:

- `components/`: Contient les composants réutilisables de l'interface utilisateur
  - `ImageDropZone.tsx`: Zone de dépôt pour l'importation d'images
  - `SecondaryToolbar.tsx`: Barre d'outils secondaire pour les ajustements fins
- `fabric/`: Contient les fichiers liés à l'intégration de Fabric.js
  - `canvasActions.tsx`: Définit les actions et outils disponibles sur le canvas
- `pages/`: Contient les pages principales de l'application
  - `drawing.tsx`: Page principale de dessin et d'édition

## Technologies Utilisées

- React
- TypeScript
- Fabric.js
- Tailwind CSS (présumé basé sur les classes utilisées)

## Installation

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install`
3. Lancez l'application en mode développement avec `npm run dev`

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Utilisez les outils de la barre latérale pour dessiner ou ajouter des formes
3. Importez des images en les faisant glisser dans la zone de dépôt
4. Ajustez les propriétés des objets sélectionnés avec la barre d'outils secondaire

## Image Description Metadata

This project includes an interactive canvas where users can create and manipulate images. The main visual elements include:

- A drawing canvas powered by Fabric.js
- Toolbars for selecting drawing tools and adjusting object properties
- An image drop zone for importing external images into the canvas

These elements combine to provide a rich user experience for image creation and editing.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

MIT Lisence
