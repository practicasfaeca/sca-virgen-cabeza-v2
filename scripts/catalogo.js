/* ============================================================
   catalogo.js — Lógica de la tienda
   - Apertura/cierre del modal de producto al pulsar tarjetas.
   - Selector de cantidad ( – nº + ) dentro del modal.
   - "Añadir al carrito" desde tarjeta y desde modal.
   - Toast de confirmación en la esquina inferior derecha.
   - Foco atrapado dentro del modal mientras está abierto.

   Depende de window.Carrito (scripts/carrito.js).
   ============================================================ */

(function () {
  'use strict';

  const modal = document.getElementById('modal-producto');
  if (!modal) return; // Esta página puede cargar el script y no tener modal — salimos limpios.

  // -----------------------------------------------------------
  // Referencias a los huecos dentro del modal
  // -----------------------------------------------------------
  const refs = {
    nombre:      modal.querySelector('[data-modal-nombre]'),
    meta:        modal.querySelector('[data-modal-meta]'),
    precio:      modal.querySelector('[data-modal-precio]'),
    imagen:      modal.querySelector('[data-modal-imagen]'),
    sello:       modal.querySelector('[data-modal-sello]'),
    descripcion: modal.querySelector('[data-modal-descripcion]'),
    uso:         modal.querySelector('[data-modal-uso]'),
    // Perfil sensorial — 3 barras + nivel textual a la derecha
    frutado:      modal.querySelector('[data-modal-frutado]'),
    frutadoNivel: modal.querySelector('[data-modal-frutado-nivel]'),
    amargor:      modal.querySelector('[data-modal-amargor]'),
    amargorNivel: modal.querySelector('[data-modal-amargor-nivel]'),
    picor:        modal.querySelector('[data-modal-picor]'),
    picorNivel:   modal.querySelector('[data-modal-picor-nivel]'),
    cantidad:    modal.querySelector('[data-cantidad-input]'),
    masBtn:      modal.querySelector('[data-cantidad-mas]'),
    menosBtn:    modal.querySelector('[data-cantidad-menos]'),
    anyadirBtn:  modal.querySelector('[data-modal-anyadir]')
  };

  let productoActual = null;
  let triggerActivo = null; // el elemento que abrió el modal — al cerrar devolvemos el foco aquí

  // -----------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------
  function formatearPrecio(numero) {
    return numero.toFixed(2).replace('.', ',') + '\u00A0€';
  }

  /**
   * Lee los data-* de la tarjeta y devuelve un objeto producto.
   * Cualquier "data-foo-bar" se convierte en propiedad fooBar.
   */
  function leerProducto(tarjeta) {
    if (!tarjeta) return null;
    const d = tarjeta.dataset;
    return {
      id: d.id,
      nombre: d.nombre,
      variedad: d.variedad,
      formato: d.formato,
      precio: parseFloat(d.precio),
      imagen: d.imagen,
      // Tres atributos sensoriales en escala 0-100
      frutado: parseInt(d.frutado, 10) || 0,
      amargor: parseInt(d.amargor, 10) || 0,
      picor:   parseInt(d.picor,   10) || 0,
      descripcion: d.descripcion || '',
      uso: d.uso || '',
      edicionLimitada: d.edicionLimitada === 'true'
    };
  }

  /**
   * Traduce un valor 0-100 a un nivel textual.
   * Tres tramos: Suave (0-33), Medio (34-66), Intenso (67-100).
   */
  function nivelTextual(valor) {
    if (!isFinite(valor)) return '—';
    if (valor <= 33) return 'Suave';
    if (valor <= 66) return 'Medio';
    return 'Intenso';
  }

  // -----------------------------------------------------------
  // Apertura y cierre del modal
  // -----------------------------------------------------------
  function pintarProducto(p) {
    if (!p) return;
    productoActual = p;

    refs.nombre.textContent      = p.nombre;
    refs.meta.textContent        = (p.variedad || '') + ' · ' + (p.formato || '');
    refs.precio.textContent      = formatearPrecio(p.precio);
    refs.imagen.src              = p.imagen;
    refs.imagen.alt              = p.nombre;
    refs.descripcion.textContent = p.descripcion;
    refs.uso.textContent         = p.uso;

    // Perfil sensorial — tres barras + nivel textual.
    // Pintamos en dos fases (0% → valor) para que la transición CSS
    // anime el relleno cada vez que se abre el modal.
    const cap = (v) => Math.max(0, Math.min(100, v));
    const atributos = [
      ['frutado', p.frutado],
      ['amargor', p.amargor],
      ['picor',   p.picor]
    ];
    atributos.forEach(([key]) => {
      if (refs[key]) refs[key].style.setProperty('--w', '0%');
    });
    requestAnimationFrame(() => {
      atributos.forEach(([key, valor]) => {
        const v = cap(valor);
        if (refs[key])             refs[key].style.setProperty('--w', v + '%');
        if (refs[key + 'Nivel'])   refs[key + 'Nivel'].textContent = nivelTextual(v);
      });
    });

    // Sello de edición limitada solo cuando aplica
    if (p.edicionLimitada) {
      refs.sello.hidden = false;
    } else {
      refs.sello.hidden = true;
    }

    // Reset de cantidad cada vez que se abre el modal
    refs.cantidad.value = '1';
  }

  function abrirModal(producto, trigger) {
    pintarProducto(producto);
    triggerActivo = trigger || null;

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Esperamos al siguiente frame para que la transición de entrada se vea.
    requestAnimationFrame(() => {
      // Pasamos el foco al botón de cerrar (primer focusable).
      const cerrar = modal.querySelector('.modal-producto__cerrar');
      if (cerrar) cerrar.focus({ preventScroll: true });
    });
  }

  function cerrarModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    productoActual = null;
    // Devolvemos el foco al trigger para no perder el sitio al usuario.
    if (triggerActivo && typeof triggerActivo.focus === 'function') {
      triggerActivo.focus({ preventScroll: true });
    }
    triggerActivo = null;
  }

  // -----------------------------------------------------------
  // Cantidad
  // -----------------------------------------------------------
  function cantidadActual() {
    const n = parseInt(refs.cantidad.value, 10);
    if (isNaN(n) || n < 1) return 1;
    if (n > 99) return 99;
    return n;
  }

  refs.masBtn.addEventListener('click', () => {
    refs.cantidad.value = String(Math.min(99, cantidadActual() + 1));
  });
  refs.menosBtn.addEventListener('click', () => {
    refs.cantidad.value = String(Math.max(1, cantidadActual() - 1));
  });
  refs.cantidad.addEventListener('change', () => {
    refs.cantidad.value = String(cantidadActual());
  });

  // -----------------------------------------------------------
  // Añadir al carrito (desde la tarjeta y desde el modal)
  // -----------------------------------------------------------
  function anyadirAlCarrito(producto, cantidad) {
    if (!producto || !window.Carrito) return;
    window.Carrito.agregar({
      idProducto: producto.id,
      nombre:     producto.nombre,
      formato:    producto.formato,
      precio:     producto.precio,
      imagen:     producto.imagen
    }, cantidad);

    // Disparamos un bounce visual del icono del carrito.
    window.dispatchEvent(new CustomEvent('carrito-bounce'));

    mostrarToast(producto.nombre + ' · ' + producto.formato + ' añadido al carrito');
  }

  refs.anyadirBtn.addEventListener('click', () => {
    if (!productoActual) return;
    anyadirAlCarrito(productoActual, cantidadActual());
  });

  // -----------------------------------------------------------
  // Toast
  // -----------------------------------------------------------
  const toast = document.getElementById('toast-carrito');
  const toastTexto = toast ? toast.querySelector('[data-toast-texto]') : null;
  let toastTimer = null;

  function mostrarToast(mensaje) {
    if (!toast || !toastTexto) return;
    toastTexto.textContent = mensaje;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3000);
  }

  // -----------------------------------------------------------
  // Cableado: clic en tarjetas
  //   - Capa "tarjeta-aceite__abrir" → abre el modal.
  //   - Botón [data-anyadir] → añade al carrito directamente.
  //   - Cualquier [data-abrir-producto="id"] (banda final) → abre el modal por id.
  // -----------------------------------------------------------
  function tarjetaContenedora(el) {
    return el.closest('[data-producto]');
  }

  // Delegación: un único listener para todas las tarjetas.
  document.addEventListener('click', (e) => {
    // 1) Botón "Añadir al carrito" dentro de la tarjeta
    const botonAnyadir = e.target.closest('[data-anyadir]');
    if (botonAnyadir) {
      const tarjeta = tarjetaContenedora(botonAnyadir);
      const p = leerProducto(tarjeta);
      if (p) {
        anyadirAlCarrito(p, 1);
        // Pequeño feedback en el propio botón para confirmar la acción.
        botonAnyadir.classList.add('boton--confirmado');
        setTimeout(() => botonAnyadir.classList.remove('boton--confirmado'), 800);
      }
      e.preventDefault();
      return;
    }

    // 2) Capa de apertura del modal en la tarjeta
    const capaAbrir = e.target.closest('.tarjeta-aceite__abrir');
    if (capaAbrir) {
      const tarjeta = tarjetaContenedora(capaAbrir);
      const p = leerProducto(tarjeta);
      if (p) abrirModal(p, capaAbrir);
      return;
    }

    // 3) Botón explícito de abrir producto por id (banda final)
    const triggerId = e.target.closest('[data-abrir-producto]');
    if (triggerId) {
      const id = triggerId.dataset.abrirProducto;
      const tarjeta = document.querySelector('[data-producto][data-id="' + id + '"]');
      const p = leerProducto(tarjeta);
      if (p) abrirModal(p, triggerId);
      return;
    }

    // 4) Cierre del modal (velo o botón cerrar)
    if (e.target.closest('[data-cerrar-modal]')) {
      cerrarModal();
    }
  });

  // -----------------------------------------------------------
  // Teclado: Escape cierra, Tab atrapado dentro del modal
  // -----------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') !== 'false') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      cerrarModal();
      return;
    }

    if (e.key === 'Tab') {
      // Recolectamos elementos focuseables dentro del modal cada vez,
      // porque algunos son inputs y otros botones — y el sello se oculta.
      const focuseables = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focuseables.length) return;
      const primero = focuseables[0];
      const ultimo = focuseables[focuseables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  });
})();
