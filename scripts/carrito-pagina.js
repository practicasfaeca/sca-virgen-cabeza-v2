/* ============================================================
   carrito-pagina.js — Lógica de la página de carrito (carrito.html)
   Depende de catalogo-datos.js, carrito.js y main.js.
   Renderiza la vista 2A (con productos), 2B (vacío) o 2C (confirmado).
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.Carrito) return;
    renderizar();
    inicializarSubtituloHero();
    inicializarBotonFinalizar();

    // Si el carrito cambia desde otra pestaña / botón eliminar,
    // re-renderizamos.
    window.addEventListener('carrito-cambiado', () => {
      // Sólo si estamos en la vista de productos (no en la confirmación)
      const enConfirmado = document.getElementById('vista-confirmado').classList.contains('vista--activa');
      if (!enConfirmado) renderizar();
    });
  });

  // -----------------------------------------------------------
  // Render principal
  // -----------------------------------------------------------
  function renderizar() {
    const items = window.Carrito.leer();
    const vistaProductos = document.getElementById('vista-productos');
    const vistaVacio     = document.getElementById('vista-vacio');

    if (items.length === 0) {
      mostrarVista('vista-vacio');
      return;
    }

    mostrarVista('vista-productos');
    pintarLista(items);
    pintarResumen(items);
  }

  function pintarLista(items) {
    const lista = document.getElementById('carrito-lista');
    lista.innerHTML = '';

    items.forEach((item) => {
      const fila = document.createElement('article');
      fila.className = 'fila-carrito';
      fila.dataset.clave = item.clave;
      fila.innerHTML = `
        <a href="producto.html?id=${escapeAttr(item.idProducto)}" class="fila-carrito__imagen-wrapper" aria-label="Ver ficha de ${escapeAttr(item.nombre)}">
          <img class="fila-carrito__imagen" src="${escapeAttr(item.imagen)}" alt="${escapeAttr(item.nombre)}" loading="lazy" />
        </a>
        <div class="fila-carrito__info">
          <a href="producto.html?id=${escapeAttr(item.idProducto)}" class="fila-carrito__nombre">${escapeHtml(item.nombre)}</a>
          <span class="fila-carrito__formato">${escapeHtml(item.formato)}</span>
          <span class="fila-carrito__precio-unidad">${window.CATALOGO.formatearPrecio(item.precio)} / unidad</span>
        </div>
        <div class="fila-carrito__cantidad">
          <div class="cantidad-control">
            <button class="cantidad-control__boton" type="button" data-accion="restar" aria-label="Disminuir cantidad">−</button>
            <input class="cantidad-control__input" type="number" min="1" max="99" value="${item.cantidad}" aria-label="Cantidad" />
            <button class="cantidad-control__boton" type="button" data-accion="sumar" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
        <div class="fila-carrito__subtotal" aria-label="Subtotal">
          ${window.CATALOGO.formatearPrecio(item.precio * item.cantidad)}
        </div>
        <button class="fila-carrito__eliminar" type="button" aria-label="Eliminar ${escapeAttr(item.nombre)} del carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      `;
      lista.appendChild(fila);
      conectarEventosFila(fila, item);
    });
  }

  function conectarEventosFila(fila, item) {
    const input = fila.querySelector('.cantidad-control__input');
    const subtotal = fila.querySelector('.fila-carrito__subtotal');

    const aplicar = (nueva) => {
      nueva = Math.max(0, Math.min(99, nueva));
      if (nueva === 0) return animarEliminacion(fila, item.clave);
      window.Carrito.actualizarCantidad(item.clave, nueva);
      input.value = nueva;
      // Tick visual en el subtotal
      const nuevoSubtotal = window.CATALOGO.formatearPrecio(item.precio * nueva);
      subtotal.textContent = nuevoSubtotal;
      subtotal.classList.remove('parpadea');
      void subtotal.offsetWidth;
      subtotal.classList.add('parpadea');
      // Actualizar resumen lateral
      pintarResumen(window.Carrito.leer());
    };

    fila.querySelector('[data-accion="sumar"]').addEventListener('click', () => {
      aplicar((parseInt(input.value, 10) || 0) + 1);
    });
    fila.querySelector('[data-accion="restar"]').addEventListener('click', () => {
      aplicar((parseInt(input.value, 10) || 1) - 1);
    });
    input.addEventListener('change', () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      aplicar(v);
    });

    fila.querySelector('.fila-carrito__eliminar').addEventListener('click', () => {
      animarEliminacion(fila, item.clave);
    });
  }

  function animarEliminacion(fila, clave) {
    fila.classList.add('fila-carrito--saliendo');
    fila.addEventListener('transitionend', function quitar() {
      window.Carrito.eliminar(clave);
      // renderizar() lo dispara el listener de carrito-cambiado
      fila.removeEventListener('transitionend', quitar);
    });
  }

  // -----------------------------------------------------------
  // Resumen lateral
  // -----------------------------------------------------------
  function pintarResumen(items) {
    const total = items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0);
    setText('resumen-subtotal', window.CATALOGO.formatearPrecio(total));
    setText('resumen-total', window.CATALOGO.formatearPrecio(total));
    setText('resumen-unidades', totalUnidades + (totalUnidades === 1 ? ' artículo' : ' artículos'));
  }

  // -----------------------------------------------------------
  // Hero subtítulo dinámico
  // -----------------------------------------------------------
  function inicializarSubtituloHero() {
    const subtitulo = document.getElementById('hero-carrito-subtitulo');
    if (!subtitulo) return;
    const hayItems = window.Carrito.contar() > 0;
    subtitulo.textContent = hayItems
      ? 'Revisa tu pedido antes de confirmarlo.'
      : 'Aún no has añadido productos.';

    // Actualizar el subtítulo cuando cambia el carrito
    window.addEventListener('carrito-cambiado', () => {
      const enConfirmado = document.getElementById('vista-confirmado').classList.contains('vista--activa');
      if (enConfirmado) return;
      const hay = window.Carrito.contar() > 0;
      subtitulo.textContent = hay
        ? 'Revisa tu pedido antes de confirmarlo.'
        : 'Aún no has añadido productos.';
    });
  }

  // -----------------------------------------------------------
  // Botón finalizar pedido → vista de confirmación
  // -----------------------------------------------------------
  function inicializarBotonFinalizar() {
    const boton = document.getElementById('finalizar-pedido');
    if (!boton) return;
    boton.addEventListener('click', () => {
      const items = window.Carrito.leer();
      if (items.length === 0) return;

      const total = items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
      const numeroPedido = generarNumeroPedido();

      // Rellenar la vista de confirmación
      setText('pedido-numero', numeroPedido);
      setText('pedido-total', window.CATALOGO.formatearPrecio(total));
      const listaPedido = document.getElementById('pedido-productos');
      listaPedido.innerHTML = '';
      items.forEach((i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHtml(i.nombre)} <em>(${escapeHtml(i.formato)})</em></span><span>× ${i.cantidad}</span>`;
        listaPedido.appendChild(li);
      });

      // Vaciar el carrito ahora — el pedido queda "enviado"
      window.Carrito.vaciar();

      // Transición fade
      mostrarVista('vista-confirmado', true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -----------------------------------------------------------
  // Vistas (productos / vacío / confirmado)
  // -----------------------------------------------------------
  function mostrarVista(id, conFade) {
    const vistas = document.querySelectorAll('.vista');
    if (conFade) {
      // Fade out de la activa, fade in de la nueva
      const activa = document.querySelector('.vista--activa');
      if (activa) {
        activa.classList.add('vista--saliendo');
        setTimeout(() => {
          vistas.forEach((v) => v.classList.remove('vista--activa', 'vista--saliendo'));
          const destino = document.getElementById(id);
          destino.classList.add('vista--activa');
        }, 350);
      } else {
        vistas.forEach((v) => v.classList.toggle('vista--activa', v.id === id));
      }
    } else {
      vistas.forEach((v) => v.classList.toggle('vista--activa', v.id === id));
    }
  }

  // -----------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------
  function generarNumeroPedido() {
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    const dd = String(ahora.getDate()).padStart(2, '0');
    const aleatorio = String(Math.floor(Math.random() * 9000) + 1000); // 4 dígitos
    return `MTJ-${yyyy}${mm}${dd}-${aleatorio}`;
  }
  function setText(id, t) {
    const el = document.getElementById(id);
    if (el) el.textContent = t;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
