# IMDS School Manager v4.5 — Synchronisation multi-appareils

Cette version conserve le fonctionnement hors connexion de la v4.4 et ajoute une couche de synchronisation cloud optionnelle.

## Architecture
- Application PWA/offline : les données continuent d'être stockées localement.
- Supabase Auth : connexion du compte cloud.
- PostgreSQL/Supabase : un snapshot des données de l'école.
- RLS activé sur la table de synchronisation.
- Synchronisation manuelle et automatique après une modification lorsque l'appareil est en ligne.

## Installation du cloud
1. Créer un projet Supabase.
2. Ouvrir **SQL Editor**.
3. Exécuter `supabase_schema.sql`.
4. Dans Supabase Auth, créer le ou les comptes de connexion de l'école.
5. Dans IMDS School Manager > **☁️ Synchronisation**, saisir :
   - URL du projet Supabase
   - clé **publishable** (ou ancienne clé anon si le projet l'utilise encore)
   - identifiant d'école : `IMDS`
   - email et mot de passe du compte cloud
6. Enregistrer la configuration, se connecter, puis synchroniser.
7. Installer la même version sur les autres téléphones et utiliser le même projet/identifiant d'école.

## Sécurité
Ne jamais mettre une clé `service_role` ou une clé `secret` dans l'application. Les clés côté navigateur doivent être des clés publishable/anon et les tables exposées doivent être protégées par RLS.

## Limite actuelle de la v4.5
La synchronisation utilise un snapshot de l'école avec contrôle de date/révision. Si deux appareils modifient simultanément les mêmes données, l'application avertit lorsqu'une version cloud plus récente existe afin d'éviter un écrasement silencieux. Une prochaine version pourra ajouter une vraie synchronisation par enregistrements avec gestion fine des conflits et des suppressions.
