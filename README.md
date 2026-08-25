# Lsahelien-tech — site vitrine

Site vitrine une page, en HTML/CSS/JS natif, sans framework ni étape de build.
Ouvrir `index.html` dans un navigateur suffit ; le déploiement se fait par simple
copie des fichiers (GitHub Pages, Netlify, Vercel, ou n'importe quel hébergeur statique).

```
index.html
assets/
  css/style.css      Feuille de style unique (variables de charte en tête de fichier)
  js/main.js         Année du footer, menu mobile, validation du formulaire
  img/
    hero-sahel.svg           IMG-1 — arrière-plan du hero
    portrait-placeholder.svg IMG-2 — emplacement du portrait (à remplacer)
    bogolan.svg              IMG-4 — motif de fond de la section Méthode
    favicon.svg
README.md
```

## Déploiement

Le site est publié sur GitHub Pages par le workflow `.github/workflows/pages.yml`,
déclenché à chaque push sur `main` (et manuellement via *Actions → Déploiement GitHub
Pages → Run workflow*). La racine du dépôt est publiée telle quelle : aucune étape de
build, aucun dossier `dist`.

**Réglage à faire une fois**, dans l'interface GitHub :
**Settings → Pages → Build and deployment → Source : GitHub Actions**.

Le workflow tente d'activer Pages lui-même (`enablement: true` sur
`actions/configure-pages`), mais le `GITHUB_TOKEN` par défaut n'a pas le droit de créer
un site Pages : l'API répond `Resource not accessible by integration`. L'option est
conservée car elle devient un simple constat une fois Pages activé, et fonctionne sur les
dépôts dont le jeton dispose des droits d'administration. Après le réglage manuel,
relancer le workflow depuis *Actions → Déploiement GitHub Pages → Run workflow*.

Adresse de publication : `https://stoure2022.github.io/site_internet_lsahelien_tech/`

Tous les chemins du site sont relatifs (`assets/...`), il fonctionne donc aussi bien à la
racine d'un domaine qu'en sous-répertoire. Pour un nom de domaine personnalisé, ajouter un
fichier `CNAME` à la racine contenant le domaine, puis le déclarer dans Settings → Pages.

## Charte appliquée

| Rôle | Couleur | Variable CSS |
|---|---|---|
| Indigo profond (header, hero, footer, contact) | `#131E38` | `--indigo` |
| Indigo secondaire (références, cartes) | `#1B2A4A` | `--indigo-2` |
| Sable (services, méthode) | `#EDE0C0` | `--sable` |
| Papier (profil) | `#F7F3EA` | `--papier` |
| Argile (CTA, accents) | `#B8460E` | `--argile` |
| Argile foncée (accents sur fond clair, contraste AA) | `#9A3A0B` | `--argile-dark` |
| Or / ocre (labels techniques) | `#C9962C` | `--or` |
| Encre (texte sur fond clair) | `#221B10` | `--encre` |
| Crème (texte sur fond sombre) | `#F4EFE3` | `--creme` |

Typographies : `Space Grotesk` (titres), `IBM Plex Sans` (corps), `IBM Plex Mono`
(labels, navigation, tags). Chargées via Google Fonts avec `preconnect`.

`--argile-dark` est une variante ajoutée à la palette d'origine : l'argile `#B8460E`
sur sable `#EDE0C0` donne un rapport de contraste de 4,10:1, sous le seuil AA de 4,5:1
pour du texte courant. La variante foncée atteint 5,36:1 et sert aux petits textes sur
fonds clairs ; l'argile d'origine reste utilisée pour les aplats de CTA (4,74:1 avec la crème).

## Images

Le réseau de l'environnement de génération bloque les banques d'images : les visuels
livrés sont donc des **illustrations vectorielles produites pour ce site** (SVG, quelques
kilo-octets, nettes à toutes les résolutions), et non des photographies.

### IMG-1 — arrière-plan du hero (`assets/img/hero-sahel.svg`)

Scène sahélienne stylisée (dunes, architecture en banco avec torons, acacias, motif
bogolan au sol) déjà traitée dans la palette, recouverte d'un voile `rgba(19,30,56,.74)`
défini par `.hero-veil`.

Pour la remplacer par une photographie :

1. déposer le fichier dans `assets/img/` (WebP conseillé, largeur 1920 px, ~200 Ko) ;
2. dans `index.html`, remplacer la valeur `src` de `.hero-bg` et adapter l'attribut `alt` ;
3. ajuster l'opacité du voile dans `style.css` (`.hero-veil`) — viser 70 à 80 % pour
   conserver la lisibilité du titre.

**Trois pistes de sourcing**, toutes en licence libre d'usage commercial sans attribution
obligatoire (vérifier la licence au téléchargement) :

| Banque | Mots-clés de recherche |
|---|---|
| Unsplash | `sahel landscape`, `djenne mosque mud architecture`, `sahara dusk dunes`, `west africa village` |
| Pexels | `burkina faso`, `mali landscape`, `african market street`, `desert horizon golden hour` |
| Wikimedia Commons | `Architecture soudano-sahélienne`, `Grande mosquée de Djenné`, `Paysage sahélien` (vérifier la licence, souvent CC BY-SA avec attribution) |

Critères de choix : plan large, horizon bas, absence de visage identifiable au premier
plan, zone calme dans le tiers gauche pour ne pas concurrencer le titre.

### IMG-2 — portrait (`assets/img/portrait-placeholder.svg`)

Le fichier livré est **volontairement un emplacement réservé**, pas une photographie :
utiliser le portrait d'une autre personne pour représenter Soumailou Touré reviendrait à
publier une fausse image d'une personne réelle. Remplacer par une photo authentique :

1. cadrage 4:5, buste, fond neutre, lumière douce, largeur 800 px ;
2. enregistrer en `assets/img/portrait.jpg` (ou `.webp`) ;
3. dans `index.html`, remplacer le `src` de `.portrait img`, mettre `width="800" height="1000"`
   et un `alt` descriptif ;
4. pour le traitement duotone indigo, ajouter dans `style.css` :

   ```css
   .portrait img { filter: grayscale(1) contrast(1.05); }
   .portrait { background: var(--indigo-2); }
   .portrait img { mix-blend-mode: luminosity; }
   ```

Si une photo de studio n'est pas disponible immédiatement, mots-clés utiles pour un
brief photographe : *portrait corporate sobre, fond uni, lumière latérale douce, cadrage
4:5, regard caméra*.

### IMG-3 — pictogrammes des services

Quatre pictogrammes mono-trait dessinés à la main en SVG, intégrés directement dans
`index.html` (classe `.ico`), dans le même vocabulaire graphique que le diagramme du hero.
Leur couleur suit `--argile-dark`.

### IMG-4 — motif de la section Méthode

`assets/img/bogolan.svg` est un motif carré répétable (carrés, losanges, tirets),
appliqué par `.bogolan` en `background-repeat` à 7 % d'opacité.

## Contenu factuel

Les tags techniques des cartes Services, la carte « status » de la section Profil et le
bandeau Références reprennent la stack et les missions réellement exercées (Spark,
Databricks, Delta Lake, Kafka, Hadoop/Cloudera, Docker, Jenkins, Terraform, Ansible,
Grafana). Toute modification de ces blocs doit rester alignée sur le parcours réel :
ce sont les seuls endroits du site qui portent des affirmations vérifiables.

Le bandeau Références distingue volontairement le contexte des missions (assurance,
banque, streaming) de la société qui les portait (Dcarte Engineering), afin qu'aucune
marque citée ne soit présentée comme un client direct de Lsahelien-tech.

## Formulaire de contact

La validation est intégralement côté front (`assets/js/main.js`) : champs requis, format
d'email, message d'au moins 20 caractères, messages d'erreur reliés aux champs par
`aria-describedby` et `aria-invalid`, focus placé sur le premier champ fautif.

Aucun message n'est envoyé tant qu'un service d'envoi n'est pas branché. Pour l'activer
avec [Formspree](https://formspree.io) :

1. créer un formulaire et récupérer son identifiant ;
2. dans `assets/js/main.js`, renseigner :

   ```js
   var ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ```

Le code d'envoi (`fetch` en `POST` avec `FormData`) est déjà écrit et s'active dès que
`ENDPOINT` est non vide. Tout backend acceptant un `POST multipart` et répondant en 2xx
fonctionne de la même manière.

## Accessibilité et performance

- Hiérarchie de titres continue : un seul `h1`, chaque section ouverte par un `h2`, cartes en `h3`.
- Lien d'évitement, focus visible (`:focus-visible`, contour or), libellés explicites.
- Chaque image porte un `alt` en français ; les éléments décoratifs sont marqués `aria-hidden`.
- Menu mobile en CSS pur (case à cocher), refermé par JavaScript après navigation.
- Animations CSS uniquement, désactivées sous `prefers-reduced-motion: reduce`.
- Aucune dépendance externe hors Google Fonts ; visuels vectoriels de quelques kilo-octets.

## Points à compléter avant mise en ligne

- [ ] Remplacer le portrait par une photographie réelle (IMG-2).
- [ ] Renseigner `ENDPOINT` dans `assets/js/main.js`.
- [ ] Vérifier les mentions de références clients (AXA, Crédit Agricole, BNP Paribas,
      Alchimie) et la mention de Dcarte Engineering au regard des clauses de
      confidentialité et de non-sollicitation des missions concernées.
- [ ] Ajouter mentions légales et politique de confidentialité si le formulaire collecte
      des données personnelles (RGPD).
