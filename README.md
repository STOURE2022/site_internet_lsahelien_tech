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
src/worker.js          Worker : traite POST /api/contact et relaie vers Brevo
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

`wrangler.toml` déclare un Worker adossé à Workers Static Assets, sans étape de build.
Une requête qui correspond à un fichier de `public/` est servie directement ; les autres
atteignent `src/worker.js`, qui ne traite que `POST /api/contact` et répond 404 au reste.

Le nom du Worker (`site-internet-lsahelien-tech`) détermine l'URL `workers.dev` : le
modifier change l'adresse du site.

### Secrets GitHub, pour le déploiement

Ils autorisent l'action GitHub à déployer. Les secrets nécessaires à l'envoi des
messages, eux, vivent côté Cloudflare — voir « Formulaire de contact ».

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

### IMG-2 — portrait (`public/assets/img/portrait.jpg`)

Le portrait en place est une photographie réelle, préparée pour le web :

- recadrée au format 4:5 sur le buste, au-dessus du lettrage du vêtement ;
- redimensionnée en 800 × 1000 et réencodée en JPEG progressif, soit 60 Ko contre
  1,8 Mo pour l'original 3456 × 4608 ;
- métadonnées EXIF supprimées — un fichier issu d'un téléphone embarque modèle
  d'appareil, date et parfois coordonnées GPS, qu'il n'y a aucune raison de publier.

L'original pleine résolution reste accessible dans l'historique Git, au commit qui
l'a ajouté.

Le rendu tient à deux règles de `public/assets/css/style.css`, ciblant les extensions
matricielles pour laisser intact `portrait-placeholder.svg`, conservé comme repli :

- **duotone indigo** — `grayscale` puis `mix-blend-mode: luminosity` sur le fond indigo
  du cadre ; le contraste et la luminosité sont réglés pour une photo claire ;
- **vignettage** — un dégradé radial discret qui détache le sujet d'un arrière-plan chargé.

Pour afficher la photo sans traitement, supprimer ces deux blocs.

**Remplacer le portrait par un autre** demande deux modifications :

1. déposer le fichier dans `public/assets/img/` (`.jpg`, `.jpeg`, `.png` ou `.webp`) ;
2. dans `public/index.html`, changer le `src` de `.portrait img` et son `alt`.

Le cadre applique `aspect-ratio: 4/5` et `object-fit: cover` : une photo de proportions
différentes est recadrée au centre, sans déformation ni décalage de la mise en page.

Une photo prise de face avec un téléphone en mode selfie apparaît inversée — le texte
d'un vêtement s'y lit à l'envers. Le recadrage actuel place la limite basse au-dessus du
lettrage, ce qui rend le défaut invisible ; un cadrage plus large demanderait un miroir
horizontal.

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

### Pourquoi un Worker

Le site est statique : tout ce qu'il contient est lisible par n'importe quel visiteur.
Une clé d'API Brevo placée dans le JavaScript de la page serait donc publique, et
permettrait à quiconque d'envoyer des emails au nom du compte. Le formulaire appelle
`POST /api/contact` sur le Worker, qui détient seul la clé et relaie vers l'API Brevo.

Le navigateur ne voit jamais que `{"ok": true}` ou un message d'erreur générique : les
réponses de Brevo, susceptibles de contenir des informations de compte, restent dans les
journaux Cloudflare.

### Secrets Cloudflare, pour l'envoi des messages

Les secrets vivent dans Cloudflare, jamais dans le dépôt ni dans les secrets GitHub. Ils
survivent aux déploiements — à définir une seule fois, depuis la racine du dépôt :

```sh
npx wrangler secret put BREVO_API_KEY    # clé API Brevo (xkeysib-…)
npx wrangler secret put CONTACT_TO       # adresse qui reçoit les messages
npx wrangler secret put CONTACT_FROM     # adresse expéditrice
```

Ou dans le tableau de bord : *Workers & Pages → site-internet-lsahelien-tech → Settings →
Variables and Secrets*.

L'adresse publiée sur le site est `lsahelien.tech@gmail.com` — elle figure dans la section
Contact et dans le message affiché quand l'envoi échoue, pour que le visiteur ne reste
jamais sans recours. Elle est écrite en clair dans `public/index.html` : c'est le choix le
plus accessible, au prix d'une exposition aux robots collecteurs d'adresses.

`CONTACT_FROM` doit être **validée comme expéditeur chez Brevo** (*Expéditeurs, domaine,
IP*), sinon l'API refuse l'envoi. Tant qu'un des trois secrets manque, le Worker répond
503 avec « Le formulaire n'est pas encore configuré » plutôt que d'échouer obscurément.

La clé API (`xkeysib-…`) suffit : la clé SMTP (`xsmtpsib-…`) sert au protocole SMTP, que
les Workers Cloudflare ne peuvent pas utiliser — ils ne disposent pas de sockets TCP
sortants classiques. C'est l'API HTTP de Brevo qui est appelée.

### Validation

Elle a lieu deux fois, et c'est délibéré. Côté navigateur
(`public/assets/js/main.js`) pour éviter un aller-retour réseau sur une faute de frappe ;
côté Worker parce que la validation navigateur se contourne en trois lignes de console.
Les deux appliquent les mêmes règles : nom d'au moins 2 caractères, format d'email,
message de 20 à 5000 caractères.

Le formulaire contient un champ piège (`website`), masqué à l'écran, aux lecteurs d'écran
et à la tabulation. Rempli, la requête est rejetée : les robots remplissent tous les
champs d'un formulaire, les visiteurs ne voient pas celui-là.

**Limite connue :** il n'y a pas de limitation de débit. Le champ piège arrête le spam
automatisé courant, pas un envoi répété délibéré. Si le besoin s'en fait sentir, Cloudflare
Turnstile ou un compteur en KV indexé sur l'adresse IP sont les deux réponses habituelles.

### Vérifier après déploiement

```sh
curl -i -X POST https://site-internet-lsahelien-tech.touresoumailou19.workers.dev/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"vous@exemple.fr","message":"Message de contrôle de la chaîne d envoi."}'
```

`200 {"ok":true}` et un email reçu : la chaîne fonctionne. `503` : un secret manque.
`502` : Brevo a refusé — le détail est dans les journaux du Worker.

## Accessibilité et performance

- Hiérarchie de titres continue : un seul `h1`, chaque section ouverte par un `h2`, cartes en `h3`.
- Lien d'évitement, focus visible (`:focus-visible`, contour or), libellés explicites.
- Chaque image porte un `alt` en français ; les éléments décoratifs sont marqués `aria-hidden`.
- Menu mobile en CSS pur (case à cocher), refermé par JavaScript après navigation.
- Animations CSS uniquement, désactivées sous `prefers-reduced-motion: reduce`.
- Aucune dépendance externe hors Google Fonts ; visuels vectoriels de quelques kilo-octets.

## Points à compléter avant mise en ligne

- [ ] Définir les trois secrets Cloudflare (`BREVO_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`).
- [ ] Valider l'adresse expéditrice comme expéditeur chez Brevo.
- [ ] Tester l'envoi de bout en bout après déploiement.
- [ ] Vérifier les mentions de références clients (AXA, Crédit Agricole, BNP Paribas,
      Alchimie) et la mention de Dcarte Engineering au regard des clauses de
      confidentialité et de non-sollicitation des missions concernées.
- [ ] Ajouter mentions légales et politique de confidentialité si le formulaire collecte
      des données personnelles (RGPD).
