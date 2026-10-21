(function () {
  'use strict';

  const whatsappNumber = '5591998116629';
  const form = document.getElementById('launch-form');
  const phoneInput = document.getElementById('launch-phone');
  const status = document.getElementById('launch-status');

  if (!form || !phoneInput || !status) return;

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 3) return digits ? '(' + digits : '';
    if (digits.length < 7) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    }
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.setCustomValidity('');
    phoneInput.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.hidden = true;
    status.replaceChildren();

    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      phoneInput.setCustomValidity('Informe um WhatsApp válido com DDD.');
      phoneInput.setAttribute('aria-invalid', 'true');
      phoneInput.reportValidity();
      return;
    }

    phoneInput.setCustomValidity('');
    phoneInput.removeAttribute('aria-invalid');
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const message = [
      'Olá, Bruno! Gostaria de receber materiais sobre futuros lançamentos.',
      '',
      'Nome: ' + formData.get('nome').trim(),
      'WhatsApp: ' + formData.get('whatsapp').trim(),
      'Tipo de imóvel desejado: ' + formData.get('tipoImovel'),
      'Previsão de compra: ' + formData.get('previsaoCompra')
    ].join('\n');
    const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    const confirmation = document.createElement('span');
    confirmation.textContent = 'Sua solicitação está pronta. Revise e envie a mensagem pelo WhatsApp para pedir acesso aos materiais. ';

    const fallbackLink = document.createElement('a');
    fallbackLink.href = whatsappUrl;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = 'Abrir WhatsApp';

    status.append(confirmation, fallbackLink);
    status.hidden = false;
  });
})();
