// ═══════════════════════════════════════════════════════
//  NÄRMA HELADERAS — CONFIG
//  Editá este archivo para personalizar el sistema.
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── MARCA ──────────────────────────────────────────
  nombreMarca:    "närma",
  tagline:        "viandas saludables",
  nombreHeladera: "H-01",

  // ── EMPRESA CLIENTE ────────────────────────────────
  nombreEmpresa: "Empresa Piloto S.A.",
  iniciales:     "EP",

  // ── USUARIOS Y ROLES ───────────────────────────────
  // Para cambiar una contraseña: editá el campo "pass".
  // Para agregar un cliente nuevo: copiá el bloque
  // { usuario, pass, rol, empresa } y completalo.
  //
  // Roles disponibles: "admin" | "operador" | "cliente"
  usuarios: [
    {
      usuario:  "narma.admin",
      pass:     "narma2025",
      rol:      "admin",
      empresa:  null,           // admin ve todo
      nombre:   "Admin Närma",
    },
    {
      usuario:  "operador",
      pass:     "recarga2025",
      rol:      "operador",
      empresa:  null,
      nombre:   "Operador Recarga",
    },
    {
      usuario:  "empresapiloto",
      pass:     "piloto2025",
      rol:      "cliente",
      empresa:  "Empresa Piloto S.A.",
      nombre:   "Empresa Piloto S.A.",
    },
  ],

  // ── COLORES DE MARCA ───────────────────────────────
  colores: {
    beige:   "#F0EBE7",
    beige2:  "#F4DFBD",
    navy:    "#082B55",
    navy2:   "#254EA9",
    orange:  "#FF3D03",
    green:   "#00795E",
    green2:  "#BEDBD9",
    yellow:  "#F5A72D",
    pink:    "#F17F97",
  },

  // ── MODELO FINANCIERO ──────────────────────────────
  modelo: {
    ticketPromedio:   18820,
    cogsPorc:         0.55,
    costosFijosMes:   1545250,
    diasHabilesMes:   22,
    breakeven:        8.3,
    escenarioBase:    10,
    escenarioAlto:    13,
    ebitdaBase:       317930,
    ebitdaAlto:       876884,
  },

  // ── CATÁLOGO DE PRODUCTOS ──────────────────────────
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
