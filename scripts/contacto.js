/* ============================================================
   contacto.js — Formulario de contacto
   Validación HTML5 nativa + simulación de envío.
   No envía a ningún backend: ya se conectará a Formspree/EmailJS.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-contacto');
    if (!form) return;

    const mensajeExito  = document.getElementById('formulario-exito');
    const botonEnviar   = document.getElementById('formulario-enviar');

    form.setAttribute('novalidate', 'novalidate'); // gestionamos los mensajes manualmente

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Limpiar errores previos
      form.querySelectorAll('.campo--error').forEach((c) => c.classList.remove('campo--error'));
      form.querySelectorAll('.campo__error-mensaje').forEach((m) => m.textContent = '');

      // Validación nativa: si falla, marcamos cada campo individualmente.
      if (!form.checkValidity()) {
        let primerInvalido = null;
        form.querySelectorAll('input, textarea, select').forEach((campo) => {
          if (!campo.checkValidity()) {
            marcarError(campo, mensajeDeError(campo));
            if (!primerInvalido) primerInvalido = campo;
          }
        });
        if (primerInvalido) primerInvalido.focus();
        return;
      }

      // Simulación de envío: deshabilitamos el botón, esperamos un instante
      // y mostramos el mensaje de éxito. Para integrar con backend real,
      // sustituir el bloque del setTimeout por un fetch a Formspree/EmailJS.
      botonEnviar.disabled = true;
      botonEnviar.textContent = 'Enviando…';

      setTimeout(() => {
        form.reset();
        botonEnviar.disabled = false;
        botonEnviar.textContent = 'Enviar mensaje';
        if (mensajeExito) {
          mensajeExito.hidden = false;
          mensajeExito.focus();
          // Lo ocultamos pasados unos segundos
          setTimeout(() => { mensajeExito.hidden = true; }, 6000);
        }
      }, 700);
    });

    // Al volver a escribir, quitar la marca de error del campo
    form.querySelectorAll('input, textarea, select').forEach((campo) => {
      campo.addEventListener('input',  () => limpiarError(campo));
      campo.addEventListener('change', () => limpiarError(campo));
    });
  });

  function marcarError(campo, mensaje) {
    const wrapper = campo.closest('.campo');
    if (!wrapper) return;
    wrapper.classList.add('campo--error');
    const mensajeEl = wrapper.querySelector('.campo__error-mensaje');
    if (mensajeEl) mensajeEl.textContent = mensaje;
  }
  function limpiarError(campo) {
    const wrapper = campo.closest('.campo');
    if (!wrapper) return;
    wrapper.classList.remove('campo--error');
    const mensajeEl = wrapper.querySelector('.campo__error-mensaje');
    if (mensajeEl) mensajeEl.textContent = '';
  }

  // Mensajes en español más claros que los nativos.
  function mensajeDeError(campo) {
    const v = campo.validity;
    if (v.valueMissing) {
      if (campo.tagName === 'SELECT') return 'Selecciona una opción.';
      return 'Este campo es obligatorio.';
    }
    if (v.typeMismatch && campo.type === 'email') return 'Introduce un correo válido.';
    if (v.typeMismatch && campo.type === 'tel')   return 'Introduce un teléfono válido.';
    if (v.tooShort) return `Mínimo ${campo.minLength} caracteres.`;
    return 'Revisa este campo.';
  }
})();
