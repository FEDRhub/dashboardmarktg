# Radar — Dashboard de veille marketing

Version déployable du dashboard, avec une vraie base de données (Supabase)
et un vrai système de connexion par email (au lieu du stockage temporaire
de l'artifact Claude).

## 1. Créer la base de données (Supabase — gratuit)

1. Va sur [supabase.com](https://supabase.com), crée un compte, puis un nouveau projet (plan gratuit).
2. Une fois le projet créé, ouvre **SQL Editor** dans le menu de gauche.
3. Colle le contenu du fichier `supabase/schema.sql` de ce dossier, puis clique **Run**.
   → Ça crée la table qui stockera toutes les données du dashboard, avec la sécurité activée.
4. Va dans **Authentication → Providers**, vérifie que **Email** est activé (c'est le cas par défaut).
5. (Recommandé pour un usage d'équipe) Dans **Authentication → Settings**, désactive
   **"Allow new users to sign up"**. Ensuite, invite chaque personne manuellement depuis
   **Authentication → Users → Invite user**. Comme ça, seules les personnes que tu as
   explicitement invitées peuvent se connecter — pas n'importe qui qui tomberait sur le lien.
6. Va dans **Project Settings → API** : note l'**URL** du projet et la clé **anon public**.
   Tu en auras besoin à l'étape 3.

## 2. Mettre le code sur GitHub

1. Crée un nouveau dépôt GitHub (public ou privé, les deux fonctionnent).
2. Pousse tout le contenu de ce dossier dedans :
   ```bash
   git init
   git add .
   git commit -m "Dashboard de veille marketing"
   git remote add origin <url-de-ton-repo>
   git push -u origin main
   ```

## 3. Déployer sur Vercel (gratuit)

1. Va sur [vercel.com](https://vercel.com), connecte-toi avec ton compte GitHub.
2. Clique **Add New → Project**, sélectionne ton dépôt.
3. Dans **Environment Variables**, ajoute les deux variables notées à l'étape 1.6 :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique **Deploy**. Après 1-2 minutes, ton dashboard est en ligne sur une URL du type
   `https://ton-projet.vercel.app`.

## 4. Partager avec ton équipe

Envoie simplement l'URL Vercel à tes collègues (déjà invités à l'étape 1.5).
Ils se connectent avec leur email : ils reçoivent un lien magique, cliquent dessus,
et arrivent directement sur le dashboard partagé — mêmes données pour tout le monde.

## Ce que ça change par rapport à la version artifact Claude

| | Artifact Claude | Cette version |
|---|---|---|
| Stockage | Éphémère, propre à l'artifact | Vraie base Postgres (Supabase), à toi |
| Accès | N'importe qui avec le lien | Email + lien magique, invitations contrôlables |
| Limite de taille | 5 Mo par clé | Limite Supabase gratuite : 500 Mo de base |
| Coût | Gratuit | Gratuit (Vercel + Supabase, plans gratuits) tant que l'usage reste modeste |

## Développement local

```bash
npm install
cp .env.local.example .env.local   # puis renseigne tes vraies valeurs Supabase
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Prochaines automatisations possibles

Le composant `components/DashboardCore.jsx` contient toute la logique du dashboard
(canaux, indicateurs, graphiques, import CSV/PDF/image). Si tu veux automatiser la
récupération de certaines données (Google Analytics, HubSpot, YouTube...), le plus
simple est d'ajouter une route API Next.js (`app/api/.../route.js`) qui interroge
l'API du service concerné et écrit directement dans `dashboard_store` via Supabase —
on peut construire ça ensemble quand tu seras prêt.
