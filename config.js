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
      usuario:  "aliado.piloto",
      pass:     "aliado2025",
      rol:      "aliado",
      empresa:  "Empresa Piloto S.A.",
      nombre:   "Aliado — Empresa Piloto",
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

  // ── GOOGLE SHEETS — CLAVE PRIVADA ─────────────────
  // No compartir este archivo con nadie
  googlePrivateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3BuF9Mf3JO3Pb\n1ROdrZA9146PbkP3IGuZLsA+rjsW9HUNwe9iS80A14alQeHbeems/RTLZPb7J7cE\nov0nYDh75SRROLCOnmDQJjyT8hSsPyyPVbWhBqOFWXIQfX3keWjuszZpXlHZG/XA\nvNuVS/vHV120etccjsTzNl1epa6Dt0syz9WXa632+Pj6npT0eA7JZcgB5r8MIZcU\nzXLJYLRzULKi40BWGJ/jJn4Ft2Z6WVdQx96YNALPzy4qeqNnEyRfn78Cilt3MPP8\n7cFIrlWxxbbwXP7YLZH4v7dHr1YeYtE2GtNT9/EcJztGtyJQgu0GSPoGwZEvDzNG\npMpx/4NTAgMBAAECggEAC4xEl+iakaLNqZYlGbLEwhIirYwQf7ws7cpUWOAXXFhq\nNkcBOpt7wMzYcv7YKEfl5YNGV5r0Nl6IHqPGA0D/71lC1FkWUrlNdHSlJ9SDV2bZ\nAeYvgoxvrs848i9ozQyYAU+PZFCOK3unItUHqcDUjvxFLkj935Bmfs30UC919ltz\nxUasiVw3SaaqKGnrPFFi/ltlQRUrWl2QML4R7FoCqYEwqfeO5VZUbFjFphFW0kSu\no4+6Reout4oLMPynhXqpjkQR6YFNBFCDhAqbUkNS8ukp7aO1Oqya8cEdr+IpPmNm\nQ56CxZXwzME5rUyqPtt8dsW+NGVLWz23BULaR1FJIQKBgQDy0uqXNmVqmWoJLQH0\nEouMfOoeqMEnQuybaCkgadLI/gH42WJF5FjPKXXDtcpjdLa20KzG6hzqIkWLuQmn\nRm+M062P104zVSprNcx7sMsg7uI/tC+KQf3OWVVfB7fgTaGlsoOr9EMeThkWc37H\nsWQ5ubh6JcJRmnklfKp8VA3cgwKBgQDA9VHogcpbBgUS5s3+KsEHTGWlO4cDWnRI\nfIVy+VgeYPK3XOYmCSsfABINKI0uYjjjuFwb2aWjIIUxlA8Sp5ez99E8oTknGq/u\nlhbZMjDEUTa+0NjkzokQD1iMkHWwGeSatEQbiv/lpQHMA02t67hHznCd9XVjlEWt\nhQRs0GWk8QKBgD+SpMRuA2NDQxWf6PEDofFoCst4Fwm2ZcfSH2JTElJ43f9OuoHd\n5Lpn+mMAxzn+po96VqHFTUinLFoGWdanhDD0gm40Sk76Lx7eeOixQp0erbFL9V5X\nJKHPlaBJnwRkjruY3ww36RKYE81i84BImxrZ2shv9k3zCWCdIO1n/DENAoGBALEL\nZlATZnwGFfm11CP1To9HxavJ5qNpB3DK8BcCOZwGEC22C2Wy2+Hhyq5QGtoIPXKT\n4c+b76KxYASReRMAuuzh4RXkR/BdSDd9dxFqP9yhN731Gk02RAR8UB8JHTKrT1mz\nNRqgexNWR0PNdCS0N62K+UG1yjPIA/amKd09iUXBAoGBAOpx4HQDBRDTX4RoUE17\nPG5E4uHkE1z1gQqtbnBQtKEccUglAKDmLCI0kUr7rimnpHRFaPb+12DVLCJT/FMo\nUx/0vvgTPsFWJpFeeeOjvkMdr+1RBKC43Lrw0ddMSL2hSOB8447cMgOyXu4FEdH1\nRnNqzfb+Nai1yk5sMN0/odFv\n-----END PRIVATE KEY-----\n",

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
