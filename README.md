[README.md](https://github.com/user-attachments/files/30929441/README.md)
# app-entrepreneurs-# V-Problèmes

PWA simple pour mesurer les problèmes les plus fréquents rencontrés par des entrepreneurs.

## Fonctionnalités

- 7 catégories de problèmes préconfigurées
- compteur d'entrepreneurs par catégorie
- ajout d'un entrepreneur avec nom + note
- importance du problème
- temps perdu estimé par semaine
- classement automatique des problèmes
- historique de toutes les observations
- recherche
- stockage local dans le navigateur
- fonctionnement hors ligne après le premier chargement
- installation comme PWA quand le navigateur le permet

## Lancer localement

Le service worker nécessite généralement un serveur local.

Avec Python :

```bash
python3 -m http.server 8000
```

Puis ouvrir :

http://localhost:8000

## GitHub Pages

1. Créer un dépôt GitHub, par exemple `v-problemes`.
2. Ajouter tous les fichiers du dossier.
3. Dans Settings → Pages, choisir la branche `main` et le dossier `/root`.
4. GitHub générera l'URL de la PWA.

## Important

Cette V1 stocke les données dans `localStorage`.

Cela signifie que les données sont liées au navigateur/appareil utilisé. Elles ne sont pas encore synchronisées entre ton Mac et ton iPhone.

Pour une vraie utilisation multi-appareils, la V2 pourra utiliser une base de données + authentification.
