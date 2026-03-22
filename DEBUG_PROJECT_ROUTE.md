# Debug: /project/3 ne charge pas les données

## 1. Vérifications dans l’onglet Network (F12)

### À faire
1. Ouvrir `https://votre-site.vercel.app/project/3`
2. F12 → onglet **Network**
3. Recharger la page (Ctrl+R ou Cmd+R)

### Requêtes à contrôler

| Requête | Statut attendu | Si problème |
|---------|----------------|-------------|
| `project/3` (ou `project`) | 200 | 404/500 → routing Vercel |
| `projects/3` (API) | 200 | 404 → projet inexistant, 500 → erreur DB, timeout → cold start |

### Filtrage
- Filtrer par **Fetch/XHR** pour ne voir que les appels API
- Cliquer sur la requête `projects/3` pour voir :
  - **Headers** : URL complète, méthode
  - **Response** : contenu JSON ou message d’erreur
  - **Preview** : aperçu du JSON

### Interprétation des statuts

- **200** : OK
- **404** : projet inexistant ou route non trouvée
- **500** : erreur serveur (regarder les logs Vercel)
- **Timeout** (requête en attente) : cold start trop long

---

## 2. Test direct de l’API

Ouvrir dans le navigateur :

```
https://votre-site.vercel.app/api/projects/3
```

- **200 + JSON** : l’API fonctionne
- **404** : projet 3 absent ou route incorrecte
- **500** : erreur Flask (DB, seed, etc.)

---

## 3. Configuration Vercel

### Fichier `vercel.json` actuel

- `rewrites` : toutes les requêtes sont renvoyées vers `/api/index`
- `functions` : timeout 30 s, mémoire 1024 Mo

### Si les routes ne marchent pas

Tester l’ancienne config avec `routes` :

```json
{
  "version": 2,
  "buildCommand": "python build_seed_db.py",
  "builds": [{ "src": "api/index.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index" }]
}
```

Ou destination `/api` :

```json
"rewrites": [{ "source": "/(.*)", "destination": "/api" }]
```

---

## 4. SQLite et base de données sur Vercel

### Problème
- Sur Vercel, seules les écritures dans `/tmp` sont autorisées
- À chaque cold start, la DB dans `/tmp` peut être vide
- Le fichier seed `data/itnord-seed.db` doit être copié au démarrage

### Vérifications

1. Le build exécute bien : `python build_seed_db.py`
2. Le fichier `data/itnord-seed.db` est bien créé et inclus (vérifier `.gitignore`)
3. `.gitignore` contient : `!data/itnord-seed.db` pour garder le seed

### Logs Vercel

Dans Vercel Dashboard : Project → **Logs** ou **Functions**

- `VERCEL DB: No seed found` : seed introuvable
- `VERCEL DB: Seed copy failed` : échec de copie du seed
- `API get_project error` : erreur lors de la requête projet

---

## 5. Modifications déjà faites

### `vercel.json`
- `routes` remplacé par `rewrites`
- Destination : `/api/index`
- `functions` : `maxDuration: 30`, `memory: 1024`

### `project.html`
- Timeout de 15 s sur le `fetch`
- Meilleurs messages d’erreur
- Logs console (`[IT NORD]`) pour le debug

### `app.py`
- Recherche du seed dans plusieurs chemins
- Logs si le seed est introuvable ou si la copie échoue
- Gestion des erreurs sur `/api/projects/<id>` avec retour 500 en JSON

---

## 6. Checklist rapide

- [ ] Ouvrir `/api/projects/3` dans le navigateur
- [ ] Vérifier Network : statut et contenu de la requête API
- [ ] Consulter les logs Vercel pour les erreurs
- [ ] Vérifier que `data/itnord-seed.db` existe après le build
- [ ] Tester en local : `python app.py` puis `http://127.0.0.1:5000/project/3`
