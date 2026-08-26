/* =========================================================
   Lsahelien-tech — interactions légères
   - année du copyright
   - fermeture du menu mobile après clic
   - validation côté front du formulaire de contact
   ========================================================= */
(function () {
  'use strict';

  /* ---- Année courante ---- */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ---- Menu mobile : refermer après navigation ---- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { toggle.checked = false; }
    });
  }

  /* ---- Formulaire de contact ----
     La validation ci-dessous est un confort d'usage : elle évite un aller-retour
     réseau pour une faute de frappe. Le Worker revalide tout de son côté, la
     validation navigateur pouvant être contournée. */
  var ENDPOINT = '/api/contact';

  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var status = document.getElementById('form-status');

  var rules = {
    name: function (v) { return v.trim().length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
    message: function (v) { return v.trim().length >= 20; }
  };

  function fieldState(input, valid) {
    var err = document.getElementById('err-' + input.id);
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    if (err) { err.hidden = valid; }
    return valid;
  }

  function validate(input) {
    return fieldState(input, rules[input.id](input.value));
  }

  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) { return; }
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') { validate(input); }
    });
  });

  function setStatus(message, isError) {
    if (!status) { return; }
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      if (input && !validate(input) && !firstInvalid) { firstInvalid = input; }
    });

    if (firstInvalid) {
      setStatus('Le formulaire comporte des champs à corriger.', true);
      firstInvalid.focus();
      return;
    }

    var bouton = form.querySelector('button[type=submit]');
    bouton.disabled = true;
    setStatus('Envoi en cours…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        website: document.getElementById('website').value
      })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (corps) {
        if (!res.ok) { throw new Error(corps.error || 'HTTP ' + res.status); }
        form.reset();
        setStatus('Message envoyé. Réponse sous 48 h ouvrées.');
      });
    }).catch(function (err) {
      // En cas d'échec, l'adresse directe évite au visiteur d'être laissé
      // sans recours — elle figure aussi dans la colonne de gauche.
      var base = err.message || 'L’envoi a échoué.';
      setStatus(base + ' Vous pouvez écrire à lsahelien.tech@gmail.com.', true);
    }).then(function () {
      bouton.disabled = false;
    });
  });
})();
