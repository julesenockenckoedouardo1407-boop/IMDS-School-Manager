# IMDS School Manager v3.0

Application PWA hors connexion pour la gestion scolaire de l'Institution Mixte Le Domaine du Savoir.

## Fonctionnalités
- Dossiers élèves avec NISU, état civil, parents/responsable, CIN, référé par et photo
- 10 départements d'Haïti et liste des communes avec sélection dépendante Département → Commune
- Tarification : prix normal, bourse, demi-bourse, prix spécial
- Balance antérieure, frais annuels demandés, paiements et solde automatique
- Modes de paiement : espèces, chèque, MonCash, NatCash +509 40409680
- Numérotation automatique des reçus et impression professionnelle
- Recette du jour, du mois, total annuel, montant dû, élèves à jour/en retard
- Historique des paiements, notes et présences
- IMDS Social « Tout moun konekte » en mode local
- Export/import JSON et fonctionnement hors connexion
- Installation comme application PWA

## Déploiement GitHub Pages
1. Décompresser ce ZIP.
2. Mettre les 7 fichiers à la racine du dépôt GitHub.
3. Commit/push.
4. Dans Settings → Pages, choisir la branche publiée et le dossier `/ (root)`.
5. Ouvrir l'URL GitHub Pages puis installer l'application si le navigateur propose « Installer ».

## Données géographiques
La structure département → commune a été préparée à partir de références publiques sur les divisions territoriales haïtiennes. L'IHSI indique les 10 départements et son manuel de codification comme référence pour les libellés/codes territoriaux.

## Sécurité
Cette v3 reste un système local/offline. Pour un déploiement multi-utilisateur réel, ajouter authentification, rôles, chiffrement côté serveur, journal d'audit et synchronisation sécurisée.
