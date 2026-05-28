// ═══════════════════════════════════════════════════════
//  NÄRMA HELADERAS — CONFIG
//  Este es el único archivo que necesitás tocar para
//  personalizar el sistema sin saber programar.
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── MARCA ──────────────────────────────────────────
  nombreMarca:   "närma",
  tagline:       "viandas saludables",
  nombreHeladera: "H-01",

  // ── EMPRESA CLIENTE (cambiar por cada cliente) ─────
  nombreEmpresa: "Empresa Piloto S.A.",
  iniciales:     "EP",

  // ── COLORES DE MARCA ───────────────────────────────
  // Para cambiar un color, reemplazá el valor entre comillas.
  colores: {
    beige:   "#F0EBE7",   // fondo principal
    beige2:  "#F4DFBD",   // fondo secundario
    navy:    "#082B55",   // azul oscuro — nav, texto principal
    navy2:   "#254EA9",   // azul medio — acentos
    orange:  "#FF3D03",   // naranja — acción principal, botones
    green:   "#00795E",   // verde — estados OK, éxito
    green2:  "#BEDBD9",   // verde claro — fondos
    yellow:  "#F5A72D",   // amarillo — alertas
    pink:    "#F17F97",   // rosa — decorativo
  },

  // ── MODELO FINANCIERO (del Excel) ──────────────────
  // Estos valores vienen de tu planilla. Actualizalos si cambia el modelo.
  modelo: {
    ticketPromedio:      18820,   // Gs. ticket promedio ponderado
    cogsPorc:            0.55,    // % costo variable sobre precio venta
    costosFijosMes:      1545250, // Gs. costos fijos mensuales (1 empresa)
    diasHabilesMes:      22,
    breakeven:           8.3,     // unidades/día mínimas
    escenarioBase:       10,      // unidades/día escenario base
    escenarioAlto:       13,      // unidades/día escenario alto
    ebitdaBase:          317930,  // Gs. EBITDA escenario base
    ebitdaAlto:          876884,  // Gs. EBITDA escenario alto
  },

  // ── CATÁLOGO DE PRODUCTOS ──────────────────────────
  // Para agregar un producto: copiá un bloque { } y completá los datos.
  // Para quitar un producto: borrá su bloque { }.
  catalogo: [
    { id:1,  nombre:"Wrap de Carne",             precio:35000, cat:"Wraps",      costo:25896, mix:0.03 },
    { id:2,  nombre:"Wrap Caesar",               precio:35000, cat:"Wraps",      costo:19925, mix:0.07 },
    { id:3,  nombre:"Wrap de Bondiola",          precio:35000, cat:"Wraps",      costo:17083, mix:0.08 },
    { id:4,  nombre:"Wrap Pollo Teriyaki",       precio:35000, cat:"Wraps",      costo:15182, mix:0.06 },
    { id:5,  nombre:"Wrap Falafel",              precio:35000, cat:"Wraps",      costo:14166, mix:0.04 },
    { id:6,  nombre:"Ensalada Caesar",           precio:35000, cat:"Ensaladas",  costo:21434, mix:0.05 },
    { id:7,  nombre:"Ensalada Falafel",          precio:35000, cat:"Ensaladas",  costo:23641, mix:0.03 },
    { id:8,  nombre:"Ensalada Pollo/Q.Azul",    precio:35000, cat:"Ensaladas",  costo:27601, mix:0.02 },
    { id:9,  nombre:"Sándwich Verdura Blanco",   precio:20000, cat:"Sándwiches", costo:11083, mix:0.08 },
    { id:10, nombre:"Sándwich Verdura Integral", precio:20000, cat:"Sándwiches", costo:11117, mix:0.04 },
    { id:11, nombre:"Sándwich J&Q Blanco",       precio:18000, cat:"Sándwiches", costo:9394,  mix:0.15 },
    { id:12, nombre:"Sándwich J&Q Integral",     precio:18000, cat:"Sándwiches", costo:9464,  mix:0.10 },
    { id:13, nombre:"Brownie",                   precio:15000, cat:"Dulces",     costo:7916,  mix:0.14 },
    { id:14, nombre:"Cookie",                    precio:28000, cat:"Dulces",     costo:16501, mix:0.05 },
    { id:15, nombre:"Coca Cola 500ml",           precio:6000,  cat:"Bebidas",    costo:3500,  mix:0.14 },
    { id:16, nombre:"Agua Mineral 500ml",        precio:3000,  cat:"Bebidas",    costo:1500,  mix:0.11 },
  ],

};
