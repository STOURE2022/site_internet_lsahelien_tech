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
     Validation front uniquement. Pour l'envoi réel, renseigner ENDPOINT
     avec une URL Formspree (https://formspree.io/f/xxxxxxxx) ou celle
     de votre backend, puis décommenter le bloc `fetch` ci-dessous.      */
  var ENDPOINT = '';

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

    if (!ENDPOINT) {
      setStatus('Formulaire valide. Aucun service d’envoi n’est encore connecté (voir assets/js/main.js).');
      return;
    }

    setStatus('Envoi en cours…');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    }).then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      form.reset();
      setStatus('Message envoyé. Réponse sous 48 h ouvrées.');
    }).catch(function () {
      setStatus('L’envoi a échoué. Réessayez ou écrivez directement par email.', true);
    });
  });
})();
