/* ============================================================
   carrito.js — Lógica del carrito
   Persiste en localStorage bajo la clave 'carrito'.
   Expone window.Carrito y dispara CustomEvent 'carrito-cambiado'.
   ============================================================ */

window.Carrito = (function () {
  'use strict';

  const CLAVE = 'carrito';

  // Lee el carrito de localStorage devolviendo siempre un array.
  function leer() {
    try {
      const data = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (_e) {
      return [];
    }
  }

  function guardar(items) {
    localStorage.setItem(CLAVE, JSON.stringify(items));
    // Notificamos a otros componentes (contador del header, página de carrito, etc.)
    window.dispatchEvent(new CustomEvent('carrito-cambiado', { detail: { items } }));
  }

  // Cuenta total de unidades en el carrito.
  function contar() {
    return leer().reduce((acc, item) => acc + (item.cantidad || 0), 0);
  }

  /**
   * Añade un producto al carrito. Si ya existe la misma combinación
   * (idProducto + formato), incrementa cantidad.
   */
  function agregar({ idProducto, nombre, formato, precio, imagen }, cantidad) {
    cantidad = Math.max(1, parseInt(cantidad || 1, 10));
    const items = leer();
    const clave = idProducto + '__' + formato;
    const existente = items.find((i) => i.clave === clave);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({ clave, idProducto, nombre, formato, precio, imagen, cantidad });
    }
    guardar(items);
    return items;
  }

  function eliminar(clave) {
    const items = leer().filter((i) => i.clave !== clave);
    guardar(items);
    return items;
  }

  function actualizarCantidad(clave, cantidad) {
    cantidad = parseInt(cantidad, 10);
    if (isNaN(cantidad) || cantidad < 1) return eliminar(clave);
    const items = leer().map((i) => i.clave === clave ? { ...i, cantidad } : i);
    guardar(items);
    return items;
  }

  function vaciar() {
    guardar([]);
  }

  function total() {
    return leer().reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
  }

  return { leer, contar, agregar, eliminar, actualizarCantidad, vaciar, total };
})();
