/* ============================================================
   producto.js — Lógica de la página de ficha de producto
   Lee ?id= de la URL, busca en window.CATALOGO y rellena la plantilla.
   Depende de catalogo-datos.js, carrito.js y main.js (todos cargados antes).
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.CATALOGO) {
      console.warn('Catálogo no disponible.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    let producto = id ? window.CATALOGO.obtener(id) : null;

    // Si el id existe pero no resuelve, lo tratamos como error y redirigimos.
    if (id && !producto) {
      window.location.replace('index.html');
      return;
    }
    // Si no se ha pasado id, mostramos el primer producto del catálogo
    // como vista por defecto (útil para entrar sin parámetros).
    if (!producto) {
      producto = window.CATALOGO.lista()[0];
    }
    if (!producto) return; // catálogo vacío: no rompemos nada

    inicializarFicha(producto);
    inicializarAcordeon();
    inicializarRelacionados(producto);
  });

  // -----------------------------------------------------------
  // Ficha principal
  // -----------------------------------------------------------
  function inicializarFicha(producto) {
    const formato = producto.formatos[0];

    // Migas de pan + meta
    document.title = producto.nombre + ' · SCA Virgen de la Cabeza';
    setText('producto-breadcrumb', producto.nombre);

    // Chips superiores
    const chips = qs('#producto-chips');
    chips.innerHTML = '';
    chips.appendChild(crearChip(producto.variedad));
    if (producto.edicionLimitada) chips.appendChild(crearChip('Edición limitada', 'destacado'));

    // Datos básicos
    setText('producto-nombre', producto.nombre);
    setText('producto-descripcion', producto.descripcion);
    setText('producto-precio', window.CATALOGO.formatearPrecio(formato.precio));

    // Imagen principal y miniaturas (cuando un formato tiene varias)
    actualizarImagenPrincipal(formato.imagen, producto.nombre);
    actualizarMiniaturas(producto, formato);

    // Selector de formato (chips). Sólo si hay más de uno.
    const selectorFormato = qs('#producto-formatos');
    selectorFormato.innerHTML = '';
    if (producto.formatos.length > 1) {
      producto.formatos.forEach((f, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-formato' + (i === 0 ? ' chip-formato--activo' : '');
        btn.textContent = f.formato;
        btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        btn.addEventListener('click', () => seleccionarFormato(producto, i));
        selectorFormato.appendChild(btn);
      });
    } else {
      // Sólo un formato — lo mostramos como etiqueta informativa, no como botón.
      const span = document.createElement('span');
      span.className = 'chip-formato chip-formato--unico';
      span.textContent = producto.formatos[0].formato;
      selectorFormato.appendChild(span);
    }

    // Selector de cantidad
    const inputCantidad = qs('#producto-cantidad');
    qs('#cantidad-menos').addEventListener('click', () => ajustarCantidad(-1));
    qs('#cantidad-mas').addEventListener('click', () => ajustarCantidad(1));
    inputCantidad.addEventListener('change', () => {
      let v = parseInt(inputCantidad.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > 99) v = 99;
      inputCantidad.value = v;
    });

    // Botón añadir al carrito
    const botonAnyadir = qs('#producto-anyadir');
    botonAnyadir.addEventListener('click', () => {
      const formatoActual = producto.formatos[parseInt(botonAnyadir.dataset.formatoIndex || '0', 10)];
      const cantidad = parseInt(inputCantidad.value, 10) || 1;
      window.Carrito.agregar({
        idProducto: producto.id,
        nombre: producto.nombre,
        formato: formatoActual.formato,
        precio: formatoActual.precio,
        imagen: formatoActual.imagen
      }, cantidad);
      mostrarToast(`Añadido al carrito: ${producto.nombre} (${formatoActual.formato})`);
      // Disparar bounce del icono del carrito en el header
      window.dispatchEvent(new CustomEvent('carrito-bounce'));
    });

    // Notas de cata
    setText('cata-visual',    producto.cata.visual);
    setText('cata-olfativa',  producto.cata.olfativa);
    setText('cata-gustativa', producto.cata.gustativa);
    setText('cata-casa',      producto.cata.casa);
  }

  function seleccionarFormato(producto, indice) {
    const formato = producto.formatos[indice];
    // Actualizar precio con un mini fade
    const precioEl = qs('#producto-precio');
    precioEl.style.opacity = '0';
    setTimeout(() => {
      precioEl.textContent = window.CATALOGO.formatearPrecio(formato.precio);
      precioEl.style.opacity = '1';
    }, 120);

    // Actualizar imagen principal y miniaturas
    actualizarImagenPrincipal(formato.imagen, producto.nombre);
    actualizarMiniaturas(producto, formato);

    // Marcar chip activo
    qsa('#producto-formatos .chip-formato').forEach((c, i) => {
      const activo = i === indice;
      c.classList.toggle('chip-formato--activo', activo);
      c.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    // Guardar índice del formato seleccionado en el botón
    qs('#producto-anyadir').dataset.formatoIndex = String(indice);
  }

  function actualizarImagenPrincipal(src, alt) {
    const img = qs('#producto-imagen');
    // Crossfade suave
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = src;
      img.alt = alt;
      img.style.opacity = '1';
    }, 180);
  }

  function actualizarMiniaturas(producto, formatoActivo) {
    const lista = qs('#producto-miniaturas');
    lista.innerHTML = '';
    // Si sólo hay un formato y una imagen, no mostramos miniaturas.
    if (producto.formatos.length <= 1) return;

    producto.formatos.forEach((f, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'miniatura' + (f === formatoActivo ? ' miniatura--activa' : '');
      btn.setAttribute('aria-label', `Ver imagen del formato ${f.formato}`);
      btn.innerHTML = `<img src="${f.imagen}" alt="" loading="lazy" />`;
      btn.addEventListener('click', () => seleccionarFormato(producto, i));
      lista.appendChild(btn);
    });
  }

  function ajustarCantidad(delta) {
    const input = qs('#producto-cantidad');
    let v = parseInt(input.value, 10) || 1;
    v = Math.max(1, Math.min(99, v + delta));
    input.value = v;
  }

  // -----------------------------------------------------------
  // Acordeón de notas de cata
  // -----------------------------------------------------------
  function inicializarAcordeon() {
    qsa('.acordeon__cabecera').forEach((cabecera) => {
      cabecera.addEventListener('click', () => {
        const fila = cabecera.closest('.acordeon__fila');
        const abierto = fila.classList.toggle('acordeon__fila--abierta');
        cabecera.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        const panel = fila.querySelector('.acordeon__panel');
        // Animación altura
        if (abierto) {
          panel.style.height = panel.scrollHeight + 'px';
          // Tras la transición, dejamos auto para que se adapte si cambia el contenido.
          panel.addEventListener('transitionend', function quitar() {
            if (fila.classList.contains('acordeon__fila--abierta')) panel.style.height = 'auto';
            panel.removeEventListener('transitionend', quitar);
          });
        } else {
          // De auto a su scrollHeight para que pueda animar al cerrar
          panel.style.height = panel.scrollHeight + 'px';
          requestAnimationFrame(() => { panel.style.height = '0px'; });
        }
      });
    });
  }

  // -----------------------------------------------------------
  // Productos relacionados
  // -----------------------------------------------------------
  function inicializarRelacionados(producto) {
    const cont = qs('#producto-relacionados');
    cont.innerHTML = '';

    // Resuelve IDs; si alguno no existe (o coincide con el actual), filtra.
    const ids = (producto.relacionados || []).filter((id) => id !== producto.id);
    let items = ids.map((id) => window.CATALOGO.obtener(id)).filter(Boolean);

    // Si no llegamos a 3, completamos con destacados del catálogo.
    if (items.length < 3) {
      const extra = window.CATALOGO.lista()
        .filter((p) => p.destacado && p.id !== producto.id && !items.includes(p));
      items = items.concat(extra).slice(0, 3);
    }
    items = items.slice(0, 3);

    items.forEach((p) => cont.appendChild(crearTarjetaProducto(p)));
  }

  // Tarjeta de producto compartida con la tienda.
  // (Cuando lleguemos al brief de tienda, esta función puede extraerse a otro fichero.)
  function crearTarjetaProducto(p) {
    const formato = p.formatos[0];
    const articulo = document.createElement('article');
    articulo.className = 'tarjeta-producto';

    articulo.innerHTML = `
      <a href="producto.html?id=${p.id}" class="tarjeta-producto__enlace">
        <div class="tarjeta-producto__imagen-wrapper">
          <img class="tarjeta-producto__imagen" src="${formato.imagen}" alt="${escapeHtml(p.nombre)}" loading="lazy" />
        </div>
        <div class="tarjeta-producto__cuerpo">
          <span class="tarjeta-producto__variedad">${escapeHtml(p.variedad)}</span>
          <h3 class="tarjeta-producto__nombre">${escapeHtml(p.nombre)}</h3>
          <span class="tarjeta-producto__formato">Desde ${escapeHtml(formato.formato)}</span>
          <span class="tarjeta-producto__precio">${window.CATALOGO.formatearPrecio(formato.precio)}</span>
        </div>
      </a>
      <button class="tarjeta-producto__anyadir" type="button" aria-label="Añadir ${escapeHtml(p.nombre)} al carrito">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6"/>
          <circle cx="9" cy="20" r="1.5"/>
          <circle cx="17" cy="20" r="1.5"/>
          <path d="M12 9v6M9 12h6" stroke-width="1.8"/>
        </svg>
        <span>Añadir</span>
      </button>
    `;

    articulo.querySelector('.tarjeta-producto__anyadir').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.Carrito.agregar({
        idProducto: p.id, nombre: p.nombre,
        formato: formato.formato, precio: formato.precio, imagen: formato.imagen
      }, 1);
      mostrarToast(`Añadido al carrito: ${p.nombre} (${formato.formato})`);
      window.dispatchEvent(new CustomEvent('carrito-bounce'));
    });

    return articulo;
  }

  // -----------------------------------------------------------
  // Toast de confirmación
  // -----------------------------------------------------------
  let toastTimer = null;
  function mostrarToast(mensaje) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 3000);
  }

  // -----------------------------------------------------------
  // Helpers DOM
  // -----------------------------------------------------------
  function qs(sel)  { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function crearChip(texto, modificador) {
    const chip = document.createElement('span');
    chip.className = 'chip' + (modificador ? ' chip--' + modificador : '');
    chip.textContent = texto;
    return chip;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
})();
