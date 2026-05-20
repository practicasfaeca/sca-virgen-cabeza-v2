/* ============================================================
   catalogo-datos.js — Catálogo de productos de aceite
   Define window.CATALOGO. Lo consumen producto.html y tienda.html.
   ============================================================ */

/* PRECIOS PROVISIONALES — se sustituyen cuando llegue la lista oficial del equipo. */

window.CATALOGO = (function () {
  'use strict';

  const BASE_IMG = 'assets/images/products/';

  // Cada producto: id estable, nombre, variedad, descripción, lista de formatos
  // (cada formato con precio, imagen principal e imágenes secundarias opcionales),
  // notas de cata y relacionados.
  const productos = {

    'aove-coupage': {
      id: 'aove-coupage',
      nombre: 'AOVE Coupage Cooperativa',
      variedad: 'Coupage',
      categoria: 'coupage',
      destacado: true,
      descripcion: 'Nuestro coupage equilibrado, hecho con las variedades del olivar de Montejícar. Aceite del día a día, versátil para guisos, sofritos y fritos.',
      formatos: [
        { formato: '1 L', precio: 8.50, imagen: BASE_IMG + 'AOVE_DCOOP_ESPECIAL_COOPERATIVAS_CAJA_1L.png' },
        { formato: '5 L', precio: 38.90, imagen: BASE_IMG + 'AOVE_DCOOP_ESPECIAL_COOPERATIVAS_CAJA_5L.png' }
      ],
      cata: {
        visual: 'Color amarillo verdoso con reflejos dorados. Limpio y brillante.',
        olfativa: 'Frutado medio de aceituna verde, con notas de hierba recién cortada y hoja de olivo.',
        gustativa: 'Amargo y picante moderados, equilibrados. Frutado verde persistente, con un final ligeramente almendrado.',
        casa: 'Sirve unas cucharadas en un vaso de cristal. Tápalo con la mano y caliéntalo unos segundos al calor de la palma. Destapa, huele y bebe un sorbo pequeño. Hazlo siempre antes de cocinar para apreciar los matices.'
      },
      relacionados: ['olixicar', 'dcoop-especial', 'unico-frutado']
    },

    'olixicar': {
      id: 'olixicar',
      nombre: 'AOVE Olixicar',
      variedad: 'Coupage',
      categoria: 'coupage',
      descripcion: 'Aceite de oliva virgen extra para hostelería y consumo intensivo. Formato familiar pensado para usar a diario en casa o en cocina profesional.',
      formatos: [
        { formato: '5 L', precio: 32.50, imagen: BASE_IMG + 'AceiteDeOlivaVirgenExtraOlixicar.png' }
      ],
      cata: {
        visual: 'Color amarillo dorado con tonos verdes suaves. Aspecto limpio.',
        olfativa: 'Frutado suave de aceituna madura, con recuerdos a almendra y manzana.',
        gustativa: 'Suave en boca, amargo y picante ligeros. Equilibrado, sin notas agresivas.',
        casa: 'Ideal para freír, guisar y consumir en crudo sin imponer un sabor dominante. Perfecto si buscas un aceite versátil y para todos los gustos.'
      },
      relacionados: ['aove-coupage', 'dcoop-especial', 'dcoop-seleccion-picual']
    },

    'dcoop-especial': {
      id: 'dcoop-especial',
      nombre: 'AOVE DCOOP Especial Cooperativas',
      variedad: 'Coupage',
      categoria: 'coupage',
      descripcion: 'Línea Especial Cooperativas de DCOOP. Un virgen extra estable y de calidad consistente, disponible en formatos para hogar y hostelería.',
      formatos: [
        { formato: '1 L', precio: 9.20, imagen: BASE_IMG + 'AceiteDeOlivaVirgenExtra1L.png' },
        { formato: '5 L', precio: 41.50, imagen: BASE_IMG + 'AceiteDeOlivaVirgenExtra5L.png' },
        { formato: 'Lata 3 L', precio: 26.90, imagen: BASE_IMG + 'AceiteDeOlivaVirgenExtraEspecial.png' }
      ],
      cata: {
        visual: 'Amarillo dorado con leves reflejos verdes.',
        olfativa: 'Frutado medio, con aromas a aceituna madura, almendra fresca y plátano.',
        gustativa: 'Equilibrado, con un amargor y picor medios. Final largo y limpio.',
        casa: 'Pruébalo en una rebanada de pan tostado, con una pizca de sal en escamas. Un buen pan deja hablar al aceite.'
      },
      relacionados: ['aove-coupage', 'olixicar', 'dcoop-seleccion-hojiblanca']
    },

    'dcoop-seleccion-picual': {
      id: 'dcoop-seleccion-picual',
      nombre: 'AOVE DCOOP Selección Picual',
      variedad: 'Picual',
      categoria: 'monovarietal',
      destacado: true,
      descripcion: 'Picual monovarietal intenso para crudo y aliñar. Personalidad fuerte y carácter del olivar andaluz, ideal para ensaladas, tostadas y un buen pan.',
      formatos: [
        { formato: '250 ml', precio: 6.50, imagen: BASE_IMG + 'AoveDCOOP_SelecctionPicual_250ml.png' }
      ],
      cata: {
        visual: 'Color verde intenso con reflejos amarillos. Limpio y brillante.',
        olfativa: 'Frutado intenso de aceituna verde, con notas claras a tomatera, hoja de olivo y hierba.',
        gustativa: 'Amargo medio-alto y picante intenso, equilibrados. Frutado verde muy persistente, con un final ligeramente almendrado.',
        casa: 'Funciona muy bien sobre una ensalada de tomate de temporada, sobre un gazpacho o como toque final de un guiso de legumbres.'
      },
      relacionados: ['dcoop-seleccion-hojiblanca', 'dcoop-seleccion-arbequina', 'unico-frutado']
    },

    'dcoop-seleccion-hojiblanca': {
      id: 'dcoop-seleccion-hojiblanca',
      nombre: 'AOVE DCOOP Selección Hojiblanca',
      variedad: 'Hojiblanca',
      categoria: 'monovarietal',
      descripcion: 'Hojiblanca monovarietal, más suave y elegante que el picual. Aromas finos, equilibrio en boca y un final largo.',
      formatos: [
        { formato: '250 ml', precio: 6.50, imagen: BASE_IMG + 'AoveDCOOP_SelecctionHojiblanca_250ml.png' }
      ],
      cata: {
        visual: 'Amarillo dorado con reflejos verdes. Limpio y brillante.',
        olfativa: 'Frutado medio, con notas a manzana verde, hierba y almendra.',
        gustativa: 'Amargo y picante medios y equilibrados. Sabor a almendra dulce en el retrogusto.',
        casa: 'Aliña un pescado blanco al horno o un carpaccio de verduras. Su elegancia se aprecia mejor sobre platos suaves.'
      },
      relacionados: ['dcoop-seleccion-picual', 'dcoop-seleccion-arbequina', 'aove-coupage']
    },

    'dcoop-seleccion-arbequina': {
      id: 'dcoop-seleccion-arbequina',
      nombre: 'AOVE DCOOP Selección Arbequina',
      variedad: 'Arbequina',
      categoria: 'monovarietal',
      descripcion: 'Arbequina monovarietal, suave y afrutada. La opción más amable de la gama de monovarietales: muy aromática y poco amarga.',
      formatos: [
        { formato: '250 ml', precio: 6.50, imagen: BASE_IMG + 'AoveDCOOP_SelecctionArbequina_250ml.png' }
      ],
      cata: {
        visual: 'Amarillo dorado con reflejos verdes suaves.',
        olfativa: 'Frutado dulce, con aromas a plátano, manzana y almendra fresca.',
        gustativa: 'Muy suave, casi sin amargor, con picante ligero. Sabor dulce y afrutado.',
        casa: 'Perfecta para introducir a alguien al mundo del AOVE. Pruébala en repostería casera o sobre una vainilla helada — sorprende.'
      },
      relacionados: ['dcoop-seleccion-picual', 'dcoop-seleccion-hojiblanca', 'aove-coupage']
    },

    'unico-frutado': {
      id: 'unico-frutado',
      nombre: 'Único Frutado',
      variedad: 'Hojiblanca',
      categoria: 'premium',
      destacado: true,
      edicionLimitada: true,
      descripcion: 'Selección de los mejores lotes del inicio de campaña. Hojiblanca recogida temprano, con cuerpo, vigor y un frutado intenso que solo aparece en las primeras semanas de molienda. Producción limitada.',
      formatos: [
        { formato: '500 ml', precio: 18.90, imagen: BASE_IMG + 'AoveUnicoFrutadoProduccionLimitada.png' }
      ],
      cata: {
        visual: 'Color verde intenso con tonos dorados. Aspecto opalescente característico de aceite sin filtrar.',
        olfativa: 'Frutado muy intenso de aceituna verde, con notas marcadas de hoja de olivo, hierba recién cortada, alcachofa y un toque a tomatera.',
        gustativa: 'Entrada potente. Amargo medio y picante alto, perfectamente equilibrados. Frutado verde persistente y final ligeramente almendrado y muy largo.',
        casa: 'Es un aceite para disfrutar en crudo. Pruébalo sobre pan recién tostado, sobre un buen jamón o como toque final a un solomillo a la plancha. No lo malgastes friendo.'
      },
      relacionados: ['dcoop-seleccion-picual', 'dcoop-seleccion-hojiblanca', 'aove-coupage']
    }

  };

  // Helpers
  function obtener(id) { return productos[id] || null; }
  function lista() { return Object.values(productos); }
  function porCategoria(cat) { return lista().filter((p) => p.categoria === cat); }

  // Formatea un precio numérico al estilo español (12,50 €)
  function formatearPrecio(numero) {
    return numero.toFixed(2).replace('.', ',') + '\u00A0€';
  }

  return { obtener, lista, porCategoria, formatearPrecio };
})();
