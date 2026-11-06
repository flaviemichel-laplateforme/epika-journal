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

## Déploiement

Vercel, projet relié à ce dépôt : chaque push sur `main` met le site à jour.
Réglages : Framework Preset « Other », aucune commande de build, dossier de sortie = la racine.
