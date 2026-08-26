/* =========================================================
   Lsahelien-tech — Worker Cloudflare
   Sert le site statique et traite l'envoi du formulaire de contact.

   Le formulaire ne peut pas appeler Brevo directement : le site est
   statique, toute clé qui y figurerait serait lisible par n'importe quel
   visiteur. Le Worker fait l'intermédiaire ; la clé reste un secret
   Cloudflare, jamais dans le dépôt.

   Secrets attendus (npx wrangler secret put <NOM>) :
     BREVO_API_KEY  clé API Brevo (xkeysib-…)
     CONTACT_TO     adresse destinataire des messages
     CONTACT_FROM   adresse expéditrice, validée comme expéditeur chez Brevo
   ========================================================= */

const LIMITES = {
  nomMin: 2,
  nomMax: 120,
  emailMax: 254,
  messageMin: 20,
  messageMax: 5000,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function json(corps, statut = 200, entetes = {}) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8', ...entetes },
  });
}

/** Valide la charge utile. Retourne un message d'erreur, ou null si tout va bien. */
function valider(d) {
  if (typeof d !== 'object' || d === null) return 'Requête illisible.';

  // Champ piège : invisible à l'écran, seuls les robots le remplissent.
  if (typeof d.website === 'string' && d.website.trim() !== '') return 'Requête rejetée.';

  const nom = typeof d.name === 'string' ? d.name.trim() : '';
  const email = typeof d.email === 'string' ? d.email.trim() : '';
  const message = typeof d.message === 'string' ? d.message.trim() : '';

  if (nom.length < LIMITES.nomMin || nom.length > LIMITES.nomMax) return 'Nom invalide.';
  if (email.length > LIMITES.emailMax || !EMAIL.test(email)) return 'Adresse email invalide.';
  if (message.length < LIMITES.messageMin || message.length > LIMITES.messageMax) return 'Message invalide.';

  return null;
}

async function traiterContact(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Méthode non autorisée.' }, 405, { allow: 'POST' });
  }

  if (!env.BREVO_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    console.error('Configuration incomplète : BREVO_API_KEY, CONTACT_TO ou CONTACT_FROM manquant.');
    return json({ error: "Le formulaire n'est pas encore configuré." }, 503);
  }

  let donnees;
  try {
    donnees = await request.json();
  } catch {
    return json({ error: 'Requête illisible.' }, 400);
  }

  const erreur = valider(donnees);
  if (erreur) return json({ error: erreur }, 400);

  const nom = donnees.name.trim();
  const email = donnees.email.trim();
  const message = donnees.message.trim();

  const reponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Site Lsahelien-tech', email: env.CONTACT_FROM },
      to: [{ email: env.CONTACT_TO }],
      // Répondre au message écrit directement au visiteur.
      replyTo: { email, name: nom },
      subject: `Lsahelien-tech — message de ${nom}`,
      textContent: [
        `Nom     : ${nom}`,
        `Email   : ${email}`,
        '',
        message,
      ].join('\n'),
    }),
  });

  if (!reponse.ok) {
    // Le détail Brevo reste dans les journaux : il peut contenir des
    // informations de compte qui n'ont rien à faire chez le visiteur.
    console.error('Brevo a répondu', reponse.status, await reponse.text());
    return json({ error: "L'envoi a échoué. Réessayez plus tard." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return traiterContact(request, env);
    }

    // Tout le reste est du fichier statique servi par Workers Static Assets ;
    // n'arrive ici que ce qui ne correspond à aucun fichier.
    return new Response('Page introuvable', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
