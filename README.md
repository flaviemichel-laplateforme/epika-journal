# Journal d'Epika

Le journal de bord du développement d'Epika (plateforme de découverte d'événements locaux, dépôt privé), issue par issue : ce qui a été construit, comment, et pourquoi.

Un site statique en HTML et CSS, sans dépendance ni étape de build.

## Structure

- `index.html` : l'accueil, la liste des issues terminées par lot
- `issues/<numéro>-<nom>.html` : une page par issue
- `styles.css` : le style commun, aux couleurs d'Epika

## Voir le site en local

Ouvrir `index.html` dans un navigateur, ou lancer un petit serveur :

```
npx serve .
```

## Les captures d'écran d'une issue

Prises par Playwright, contre la **fausse API** d'Epika (données fictives uniquement : ce site est public), en téléphone (360 px) et en ordinateur (1280 px).

1. Dans le dépôt Epika, dossier `frontend`, lancer la fausse API puis Epika en production :
   ```
   node e2e/mock-api.mjs
   $env:API_URL="http://127.0.0.1:4010"; npm run build; npm run start -- -p 3100
   ```
2. Ici, une fois (`npm install`), puis pour chaque issue qui a un fichier `tools/scenes/<numéro>.mjs` :
   ```
   npm run captures -- 73
   ```
   Les images vont dans `images/<numéro>/`, et `tools/out/<numéro>.html` reçoit les diapositives à coller dans la page.

Une scène = un nom, une légende, un texte alternatif, et `play(page, context)` qui amène la page dans l'état à photographier (voir `tools/scenes/73.mjs`).

### La galerie dans une page

`gallery.css` dans le `<head>`, `gallery.js` avant `</body>`, puis ce bloc avec les diapositives de `tools/out/<numéro>.html` :

```html
<div class="gallery" data-gallery role="region" aria-roledescription="carrousel" aria-label="Captures d'écran de l'issue #73">
  <div class="gallery-controls" hidden>
    <button type="button" class="gallery-button" data-gallery-previous aria-label="Capture précédente">←</button>
    <span class="gallery-count" aria-live="polite"></span>
    <button type="button" class="gallery-button" data-gallery-next aria-label="Capture suivante">→</button>
  </div>
  <ul class="gallery-track" tabindex="0" aria-label="Captures, défilement horizontal">
    <!-- les <li class="slide"> -->
  </ul>
</div>
```

Pas de défilement automatique ; sans JavaScript, les captures défilent en largeur.

## Déploiement

Vercel, projet relié à ce dépôt : chaque push sur `main` met le site à jour.
Réglages : Framework Preset « Other », aucune commande de build, dossier de sortie = la racine.
