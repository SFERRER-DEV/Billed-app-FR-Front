# Projet Billed

## Présentation

Débuggez et testez un SaaS RH pour la formation Openclassrooms de développeur d'application JS React. 
Billed est le projet numéro 9 de la formation.

## L'architecture du projet :
Ce repo est un fork du **frontend** du projet Billed d'OpenClassrooms.
Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.

- Les TO DO liés aux bugs découverts ont été traités : [kaban](https://www.notion.so/36c580c2017a4b46b89aa946e79a81d9?v=c12e4226628e4735a9e59be68e01abe7)
- Le support du justificatif au format PDF a été ajouté aux notes de frais.
- Tous les tests sont contenus dans le dossier __tests__ et il y a en tout 63 tests qui passent au vert.
- Les tests Jest décrits en français sont ceux ajoutés au projet pour tester le parcours employé. 
- 10 tests ont été ajoutés à __tests__\Bills.js
-  9 tests ont été ajoutés à __tests__\NewBill.js
-  2 tests ont été ajoutés à __tests__\Dashboard.js
- La fonction Create du controleur Bill a été modifiée dans le **backend** pour autoriser le justifcatif au format PDF.
- Un test du **backend** a été modifié pour vérifier la création d'une note de frais avec un justifcatif "non image". 
- Mon fork du [backend de Billed](https://github.com/SFERRER-DEV/Billed-app-FR-Back)     
- Deux branches Git ont été utilisées. La branche **main** est rebasée à partir de la branche **dev**. 
- La branche **dev** contient tous les commits de progression pour réaliser ce projet.

## Liens
- [**Rapport** de test Jest ](https://github.com/SFERRER-DEV/Billed-app-FR-Front/blob/main/docs/screenshot_rapport_jest.png)
- [**Couverture** de test](https://github.com/SFERRER-DEV/Billed-app-FR-Front/blob/main/docs/screenshot_cover.png)
- [**Plan de test E2E** parcours employé](https://github.com/SFERRER-DEV/Billed-app-FR-Front/blob/main/docs/Plan%20de%20test%20E2E%20pour%20l'utilisateur.docx)
- La librairie [**PDF.js**](https://github.com/mozilla/pdf.js) est utilisée dans le projet via l'hébergement [cdnjs](https://cdnjs.com/libraries/pdf.js)
- La librairie [**FileSaver.js**](https://github.com/eligrey/FileSaver.js) est utilisée dans le projet via l'hébergement [cdnjs](https://cdnjs.com/libraries/FileSaver.js)

### Organiser son espace de travail: [Voir readme OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front#organiser-son-espace-de-travail-)

### Comment lancer l'application en local ? [Voir readme OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front#comment-lancer-lapplication-en-local-)

### Comment lancer les tests en local avec Jest et comment voir la couverture de test ? [Voir readme OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front#comment-lancer-tous-les-tests-en-local-avec-jest-)

### Comptes et utilisateurs: [Voir readme OC](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front#comptes-et-utilisateurs-)