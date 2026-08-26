# Lsahelien-tech — site vitrine

Site vitrine une page, en HTML/CSS/JS natif, sans framework ni étape de build.
Ouvrir `index.html` dans un navigateur suffit ; le déploiement se fait par simple
copie des fichiers (GitHub Pages, Netlify, Vercel, ou n'importe quel hébergeur statique).

```
public/                Racine publiée — rien d'autre n'est servi
  index.html
  assets/
    css/style.css      Feuille de style unique (variables de charte en tête de fichier)
    js/main.js         Année du footer, menu mobile, validation du formulaire
    img/
      hero-sahel.svg           IMG-1 — arrière-plan du hero
      portrait-placeholder.svg IMG-2 — emplacement du portrait (à remplacer)
      bogolan.svg              IMG-4 — motif de fond de la section Méthode
      favicon.svg
wrangler.toml          Configuration Cloudflare Workers
.github/workflows/     Déploiement automatique
README.md
```

Le site vit dans `public/` et non à la racine : l'action GitHub installe Wrangler dans
`node_modules/` au sein du dépôt, et publier la racine reviendrait à téléverser ce
dossier — le binaire `workerd` pèse 145 Mio, très au-delà de la limite de 25 Mio par
fichier de Workers.

## Déploiement

Le site est déployé automatiquement sur **Cloudflare Workers** par le workflow
`.github/workflows/deploy.yml`, à chaque push sur `main` et manuellement via
*Actions → Déploiement Cloudflare Workers → Run workflow*.

Adresse de publication :
`https://site-internet-lsahelien-tech.touresoumailou19.workers.dev/`

### Fonctionnement

`wrangler.toml` déclare un Worker servi uniquement par Workers Static Assets : pas de
script Worker, pas d'étape de build. Seul le contenu de `public/` est publié.

Le nom du Worker (`site-internet-lsahelien-tech`) détermine l'URL `workers.dev` : le
modifier change l'adresse du site.

### Secrets à renseigner une fois

Dans *Settings → Secrets and variables → Actions* du dépôt :

| Secret | Obligatoire | Où le trouver |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | oui | Cloudflare → My Profile → API Tokens → Create Token → modèle **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | en pratique oui | Cloudflare → Workers & Pages → panneau de droite, *Account ID* |

Sans `CLOUDFLARE_ACCOUNT_ID`, Wrangler appelle `/memberships` pour retrouver le compte à
utiliser. Les jetons restreints — dont ceux issus du modèle *Edit Cloudflare Workers* —
n'ont pas ce droit et le déploiement échoue sur `Authentication error [code: 10000]`.
Renseigner l'identifiant de compte évite complètement cet appel.

Le workflow échoue avec un message explicite si `CLOUDFLARE_API_TOKEN` est absent, plutôt
que de laisser Wrangler produire une erreur d'authentification obscure.

### Métadonnées de partage

`public/index.html` déclare une URL canonique et des balises Open Graph pointant vers l'adresse
`workers.dev`. En cas de changement de domaine, mettre à jour `link[rel=canonical]`,
`meta[property="og:url"]` et `meta[property="og:image"]`.

Réserve : `og:image` référence le SVG du hero, or la plupart des réseaux sociaux
n'affichent pas d'aperçu au format SVG. Pour une vignette de partage effective, produire
une image PNG ou JPEG de 1200 × 630 px et la référencer à la place.

### Déploiement manuel

```sh
npx wrangler deploy          # depuis la racine du dépôt
npx wrangler dev             # aperçu local sur http://localhost:8787
```

### Alternative : Cloudflare Workers Builds

Si vous préférez que Cloudflare construise depuis le dépôt plutôt que GitHub Actions,
connecter le dépôt dans *Workers & Pages → Create → Connect to Git*. Le même
`wrangler.toml` est utilisé, aucun secret n'est alors à stocker côté GitHub, et le
workflow `deploy.yml` peut être supprimé pour éviter deux déploiements concurrents.

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

### IMG-1 — arrière-plan du hero (`public/assets/img/hero-sahel.svg`)

Scène sahélienne stylisée (dunes, architecture en banco avec torons, acacias, motif
bogolan au sol) déjà traitée dans la palette, recouverte d'un voile `rgba(19,30,56,.74)`
défini par `.hero-veil`.

Pour la remplacer par une photographie :

1. déposer le fichier dans `public/assets/img/` (WebP conseillé, largeur 1920 px, ~200 Ko) ;
2. dans `public/index.html`, remplacer la valeur `src` de `.hero-bg` et adapter l'attribut `alt` ;
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

### IMG-2 — portrait (`public/assets/img/portrait-placeholder.svg`)

Le fichier livré est **volontairement un emplacement réservé**, pas une photographie :
utiliser le portrait d'une autre personne pour représenter Soumailou Touré reviendrait à
publier une fausse image d'une personne réelle. Remplacer par une photo authentique :

1. cadrage 4:5, buste, fond neutre, lumière douce, largeur 800 px ;
2. enregistrer en `public/assets/img/portrait.jpg` (ou `.webp`) ;
3. dans `public/index.html`, remplacer le `src` de `.portrait img`, mettre `width="800" height="1000"`
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
`public/index.html` (classe `.ico`), dans le même vocabulaire graphique que le diagramme du hero.
Leur couleur suit `--argile-dark`.

### IMG-4 — motif de la section Méthode

`public/assets/img/bogolan.svg` est un motif carré répétable (carrés, losanges, tirets),
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

La validation est intégralement côté front (`public/assets/js/main.js`) : champs requis, format
d'email, message d'au moins 20 caractères, messages d'erreur reliés aux champs par
`aria-describedby` et `aria-invalid`, focus placé sur le premier champ fautif.

Aucun message n'est envoyé tant qu'un service d'envoi n'est pas branché. Pour l'activer
avec [Formspree](https://formspree.io) :

1. créer un formulaire et récupérer son identifiant ;
2. dans `public/assets/js/main.js`, renseigner :

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
- [ ] Renseigner `ENDPOINT` dans `public/assets/js/main.js`.
- [ ] Vérifier les mentions de références clients (AXA, Crédit Agricole, BNP Paribas,
      Alchimie) et la mention de Dcarte Engineering au regard des clauses de
      confidentialité et de non-sollicitation des missions concernées.
- [ ] Ajouter mentions légales et politique de confidentialité si le formulaire collecte
      des données personnelles (RGPD).
