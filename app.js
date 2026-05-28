// ═══════════════════════════════════════════════════════
//  NÄRMA HELADERAS — LÓGICA v4
//  Con persistencia real en Google Sheets
// ═══════════════════════════════════════════════════════

// ── CREDENCIALES GOOGLE SHEETS ───────────────────────────
const SHEETS_CONFIG = {
  spreadsheetId: "13PzNC5qFziLC3obu79P65yZ-JlU6JaJF0ynzHUovt6o",
  clientEmail:   "narma-sheets@high-splicer-497717-h8.iam.gserviceaccount.com",
  // La private key se carga desde config para mantener el archivo limpio
};

// ── APLICAR COLORES DESDE CONFIG ────────────────────────
(function aplicarConfig() {
  const r = document.documentElement.style;
  const c = CONFIG.colores;
  r.setProperty('--beige',  c.beige);
  r.setProperty('--beige2', c.beige2);
  r.setProperty('--navy',   c.navy);
  r.setProperty('--navy2',  c.navy2);
  r.setProperty('--orange', c.orange);
  r.setProperty('--green',  c.green);
  r.setProperty('--green2', c.green2);
  r.setProperty('--yellow', c.yellow);
  r.setProperty('--pink',   c.pink);
  r.setProperty('--text',   c.navy);
  r.setProperty('--text2',  '#3a5a7a');
  r.setProperty('--text3',  '#7a9ab5');
  document.querySelectorAll('.js-heladera').forEach(el => el.textContent = CONFIG.nombreHeladera);
})();

// ── STOCK INICIAL ────────────────────────────────────────
const STOCK_INICIAL = {};
CONFIG.catalogo.forEach(it => {
  STOCK_INICIAL[it.id] = Math.max(3, Math.round(it.mix * 10 * 5 + 2));
});

// ── BASE DE DATOS LOCAL (cache mientras carga Sheets) ───
const DB = {
  funcionarios: [],
  stock: JSON.parse(JSON.stringify(STOCK_INICIAL)),
  consumos: [],
  cargado: false,
};

// ── SESIÓN ───────────────────────────────────────────────
let SESSION = null;
let currentFunc   = null;
let selectedItems = {};

// ── UTILS ────────────────────────────────────────────────
const fmt      = n => Math.round(n).toLocaleString('es-PY');
const initials = n => n.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const getItem  = id => CONFIG.catalogo.find(x => x.id === id);
const getNombre= c  => { const i = getItem(c.item); return i ? i.nombre : '—'; };
const getCat   = c  => { const i = getItem(c.item); return i ? i.cat    : '—'; };
const now      = ()  => new Date().toLocaleString('es-PY', { dateStyle:'short', timeStyle:'short' });

function catPill(cat) {
  const slug = cat
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n')
    .replace(/\s/g,'_');
  return `<span class="cat-pill cat-${slug}">${cat}</span>`;
}

// ══════════════════════════════════════════════════════════
//  GOOGLE SHEETS API — JWT + fetch directo
// ══════════════════════════════════════════════════════════

// Generar JWT para autenticar con Google
async function getAccessToken() {
  const privateKey = CONFIG.googlePrivateKey;
  const clientEmail = SHEETS_CONFIG.clientEmail;
  const scope = "https://www.googleapis.com/auth/spreadsheets";

  const header = { alg: "RS256", typ: "JWT" };
  const now2 = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now2 + 3600,
    iat: now2,
  };

  const b64 = obj => btoa(JSON.stringify(obj))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');

  const header64 = b64(header);
  const claim64  = b64(claim);
  const sigInput = `${header64}.${claim64}`;

  // Importar clave privada
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  // Firmar
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(sigInput)
  );
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');

  const jwt = `${sigInput}.${sig64}`;

  // Obtener access token
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await resp.json();
  return data.access_token;
}

// Leer un rango del Sheet
async function sheetsRead(range) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await resp.json();
  return data.values || [];
}

// Escribir (append) una fila al Sheet
async function sheetsAppend(sheet, values) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${encodeURIComponent(sheet + '!A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  });
}

// Actualizar un rango específico
async function sheetsUpdate(range, values) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
}

// Cargar todos los datos desde Sheets al iniciar
async function cargarDatosDesdeSheets() {
  try {
    // Funcionarios
    const fRows = await sheetsRead('funcionarios!A2:D');
    DB.funcionarios = fRows.map(r => ({
      cedula: r[0] || '', nombre: r[1] || '', mail: r[2] || '', fecha: r[3] || ''
    }));

    // Consumos
    const cRows = await sheetsRead('consumos!A2:F');
    DB.consumos = cRows.map(r => ({
      hora:   r[0] || '',
      cedula: r[1] || '',
      nombre: r[2] || '',
      item:   parseInt(r[3]) || 0,
      nombre_item: r[4] || '',
      monto:  parseInt(r[5]) || 0,
    })).reverse(); // más recientes primero

    // Stock
    const sRows = await sheetsRead('stock!A2:C');
    sRows.forEach(r => {
      const id = parseInt(r[0]);
      if (id) DB.stock[id] = parseInt(r[2]) || 0;
    });

    DB.cargado = true;
  } catch(e) {
    console.error('Error cargando Sheets:', e);
    // Si falla, sigue con datos en memoria
  }
}

// Inicializar stock en Sheets (solo primera vez)
async function inicializarStockEnSheets() {
  const rows = await sheetsRead('stock!A2:A');
  if (rows.length === 0) {
    // Sheet vacío — cargar catálogo inicial
    const values = CONFIG.catalogo.map(it => [
      it.id, it.nombre, STOCK_INICIAL[it.id]
    ]);
    await sheetsUpdate('stock!A2', values);
  }
}

// ══════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════

function mostrarLogin() {
  document.getElementById('screen-login').style.display  = 'flex';
  document.getElementById('screen-app').style.display    = 'none';
  document.getElementById('screen-qr').style.display     = 'none';
  document.getElementById('login-error').style.display   = 'none';
  document.getElementById('login-usuario').value         = '';
  document.getElementById('login-pass').value            = '';
}

function intentarLogin() {
  const u = document.getElementById('login-usuario').value.trim().toLowerCase();
  const p = document.getElementById('login-pass').value;
  const found = CONFIG.usuarios.find(x => x.usuario.toLowerCase() === u && x.pass === p);
  if (!found) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-pass').value = '';
    return;
  }
  SESSION = found;
  iniciarApp();
}

function cerrarSesion() {
  SESSION = null;
  mostrarLogin();
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') intentarLogin();
  });
  document.getElementById('login-usuario').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });

  // Cargar datos de Sheets en segundo plano
  cargarDatosDesdeSheets().then(() => {
    inicializarStockEnSheets();
  });

  if (window.location.hash === '#qr') abrirQR();
  else mostrarLogin();
});

// ══════════════════════════════════════════════════════════
//  INICIAR APP SEGÚN ROL
// ══════════════════════════════════════════════════════════

function iniciarApp() {
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('nav-usuario').textContent = SESSION.nombre;

  const btnAdmin    = document.getElementById('nav-btn-admin');
  const btnCliente  = document.getElementById('nav-btn-cliente');
  const btnOperador = document.getElementById('nav-btn-operador');
  const btnQR       = document.getElementById('nav-btn-qr');

  [btnAdmin, btnCliente, btnOperador, btnQR].forEach(b => b.style.display = 'none');

  if (SESSION.rol === 'admin') {
    btnAdmin.style.display = 'inline-flex';
    btnQR.style.display    = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('admin', btnAdmin);
  } else if (SESSION.rol === 'cliente') {
    btnCliente.style.display = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('cliente', btnCliente);
    document.getElementById('cliente-nombre').textContent = SESSION.empresa;
    document.getElementById('cliente-avatar').textContent = initials(SESSION.empresa);
  } else if (SESSION.rol === 'operador') {
    btnOperador.style.display = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('operador', btnOperador);
  }
}

// ══════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════════════════

function switchView(v, btn) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  if (btn) btn.classList.add('active');
  if (v === 'admin')    renderAdmin();
  if (v === 'cliente')  renderCliente();
  if (v === 'operador') renderOperador();
}

function switchTab(t, el) {
  ['resumen','consumos','stock','funcionarios'].forEach(id => {
    document.getElementById('tab-' + id).style.display = id === t ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  if (t === 'consumos')     renderConsumos();
  if (t === 'stock')        renderStock();
  if (t === 'funcionarios') renderFuncionarios();
}

// ══════════════════════════════════════════════════════════
//  QR FLOW
// ══════════════════════════════════════════════════════════

function abrirQR() {
  document.getElementById('screen-app').style.display   = 'none';
  document.getElementById('screen-qr').style.display    = 'block';
  document.getElementById('screen-login').style.display = 'none';
  resetQR();
}

function cerrarQR() {
  document.getElementById('screen-qr').style.display = 'none';
  if (SESSION) document.getElementById('screen-app').style.display = 'block';
  else mostrarLogin();
}

function resetQR() {
  selectedItems = {};
  currentFunc   = null;
  document.getElementById('step-cedula').style.display   = 'block';
  document.getElementById('step-registro').style.display = 'none';
  document.getElementById('step-items').style.display    = 'none';
  document.getElementById('cedula-input').value          = '';
  document.getElementById('qr-success').style.display   = 'none';
  document.getElementById('confirm-area').style.display  = 'none';
}

function buscarFuncionario() {
  const c = document.getElementById('cedula-input').value.replace(/\D/g,'');
  if (!c) { alert('Ingresá tu número de cédula.'); return; }
  const f = DB.funcionarios.find(x => x.cedula.replace(/\D/g,'') === c);
  if (f) { currentFunc = f; mostrarItems(); }
  else   { alert('Cédula no encontrada. Si es tu primera vez, registrate.'); irRegistro(); }
}

function irRegistro() {
  document.getElementById('step-cedula').style.display   = 'none';
  document.getElementById('step-registro').style.display = 'block';
}
function volverCedula() {
  document.getElementById('step-cedula').style.display   = 'block';
  document.getElementById('step-registro').style.display = 'none';
}

async function registrar() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const cedula = document.getElementById('reg-cedula').value.trim();
  const mail   = document.getElementById('reg-mail').value.trim();
  if (!nombre || !cedula || !mail) { alert('Completá todos los campos.'); return; }
  if (DB.funcionarios.find(f => f.cedula.replace(/\D/g,'') === cedula.replace(/\D/g,''))) {
    alert('Esa cédula ya está registrada.'); return;
  }
  currentFunc = { cedula, nombre, mail, fecha: now() };
  DB.funcionarios.push(currentFunc);

  // Guardar en Sheets
  try {
    await sheetsAppend('funcionarios', [cedula, nombre, mail, now()]);
  } catch(e) { console.error('Error guardando funcionario:', e); }

  document.getElementById('step-registro').style.display = 'none';
  mostrarItems();
}

function mostrarItems() {
  selectedItems = {};
  document.getElementById('step-cedula').style.display   = 'none';
  document.getElementById('step-registro').style.display = 'none';
  document.getElementById('step-items').style.display    = 'block';
  document.getElementById('qr-nombre').textContent       = currentFunc.nombre;
  document.getElementById('qr-avatar').textContent       = initials(currentFunc.nombre);
  renderItemGrid();
  actualizarConfirm();
}

function renderItemGrid() {
  const grid = document.getElementById('item-grid');
  grid.innerHTML = CONFIG.catalogo.map(it => {
    const disp    = DB.stock[it.id] || 0;
    const agotado = disp <= 0;
    const sel     = selectedItems[it.id] ? true : false;
    return `<div class="item-card${agotado?' agotado':''}${sel?' selected':''}"
      onclick="${agotado ? '' : 'toggleItem('+it.id+')'}">
      <div class="item-cat">${it.cat}</div>
      <div class="item-name">${it.nombre}</div>
      <div class="item-price">Gs. ${fmt(it.precio)}</div>
      <div class="item-stock-label">${agotado ? 'Sin stock' : disp+' disp.'}</div>
    </div>`;
  }).join('');
}

function toggleItem(id) {
  if (selectedItems[id]) delete selectedItems[id];
  else selectedItems[id] = true;
  renderItemGrid();
  actualizarConfirm();
}

function actualizarConfirm() {
  const ids  = Object.keys(selectedItems).map(Number);
  const area = document.getElementById('confirm-area');
  if (ids.length === 0) { area.style.display = 'none'; return; }
  area.style.display = 'block';
  document.getElementById('confirm-items-list').innerHTML = ids.map(id => {
    const it = getItem(id);
    return `<div class="confirm-item-row">
      <span>${it.nombre}</span>
      <span style="font-weight:600;">Gs. ${fmt(it.precio)}</span>
    </div>`;
  }).join('');
  const total = ids.reduce((a, id) => a + getItem(id).precio, 0);
  document.getElementById('confirm-total').textContent = 'Gs. ' + fmt(total);
}

async function confirmar() {
  const ids = Object.keys(selectedItems).map(Number);
  if (ids.length === 0) return;
  const hora = new Date().toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' });
  const timestamp = now();

  // Guardar cada consumo
  for (const id of ids) {
    const it = getItem(id);
    const consumo = { hora, cedula: currentFunc.cedula, nombre: currentFunc.nombre, item: id, monto: it.precio };
    DB.consumos.unshift(consumo);
    if (DB.stock[id] > 0) DB.stock[id]--;

    try {
      await sheetsAppend('consumos', [timestamp, currentFunc.cedula, currentFunc.nombre, id, it.nombre, it.precio]);
    } catch(e) { console.error('Error guardando consumo:', e); }
  }

  // Actualizar stock en Sheets
  try {
    const stockValues = CONFIG.catalogo.map(it => [it.id, it.nombre, DB.stock[it.id] || 0]);
    await sheetsUpdate('stock!A2', stockValues);
  } catch(e) { console.error('Error actualizando stock:', e); }

  document.getElementById('item-grid').style.display    = 'none';
  document.getElementById('confirm-area').style.display = 'none';
  document.getElementById('qr-success').style.display   = 'block';
  setTimeout(() => {
    document.getElementById('qr-success').style.display  = 'none';
    document.getElementById('item-grid').style.display   = 'grid';
    resetQR();
  }, 2800);
}

// ══════════════════════════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════════════════════════

function renderAdmin() {
  const total  = DB.consumos.reduce((a,c) => a + c.monto, 0);
  const cnt    = DB.consumos.length;
  const ticket = cnt > 0 ? Math.round(total/cnt) : 0;

  document.getElementById('m-hoy').textContent    = cnt;
  document.getElementById('m-ing').textContent    = fmt(total);
  document.getElementById('m-ticket').textContent = fmt(ticket);
  document.getElementById('m-func').textContent   = DB.funcionarios.length;

  const ebitda = cnt > 0
    ? Math.round(total * CONFIG.modelo.diasHabilesMes * (1 - CONFIG.modelo.cogsPorc) - CONFIG.modelo.costosFijosMes)
    : 0;
  document.getElementById('pace-dia').textContent    = cnt;
  document.getElementById('pace-ebitda').textContent = cnt > 0 ? 'Gs. '+fmt(ebitda) : '—';

  const pb = document.getElementById('pace-badge');
  if      (cnt === 0)                                  { pb.className='badge badge-neutral'; pb.textContent='Sin datos'; }
  else if (cnt >= CONFIG.modelo.escenarioAlto)         { pb.className='badge badge-success'; pb.textContent='Óptimo'; }
  else if (cnt >= CONFIG.modelo.escenarioBase)         { pb.className='badge badge-info';    pb.textContent='En camino'; }
  else                                                  { pb.className='badge badge-warning'; pb.textContent='Bajo break.'; }

  const catCount  = {};
  DB.consumos.forEach(c => { const cat=getCat(c); catCount[cat]=(catCount[cat]||0)+1; });
  const catColors = { 'Wraps':'#254EA9','Sándwiches':'#FF3D03','Dulces':'#F5A72D','Bebidas':'#00795E','Ensaladas':'#082B55' };
  const maxCat    = Math.max(...Object.values(catCount), 1);
  document.getElementById('cat-chart').innerHTML = Object.keys(catCount).length === 0
    ? `<div class="empty-state">Sin consumos aún.</div>`
    : Object.entries(catCount).sort((a,b)=>b[1]-a[1]).map(([cat,n]) => {
        const pct = Math.round(n/maxCat*100);
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
            <span style="font-weight:500;">${cat}</span>
            <span style="color:var(--text3);">${n} consumo${n!==1?'s':''}</span>
          </div>
          <div class="stock-bar" style="height:6px;">
            <div class="stock-fill" style="width:${pct}%;background:${catColors[cat]||'#082B55'};"></div>
          </div>
        </div>`;
      }).join('');
}

function renderConsumos() {
  const fc    = document.getElementById('filtro-cat').value;
  const lista = fc ? DB.consumos.filter(c => getCat(c)===fc) : DB.consumos;
  document.getElementById('tabla-consumos').innerHTML = lista.length === 0
    ? `<tr><td colspan="5" class="empty-state">Sin consumos aún.</td></tr>`
    : lista.map(c => `<tr>
        <td style="color:var(--text3);font-weight:500;">${c.hora}</td>
        <td>${c.nombre ? c.nombre.split(' ')[0] : '—'}</td>
        <td>${catPill(getCat(c))}</td>
        <td style="font-weight:500;">${getNombre(c)}</td>
        <td style="font-weight:600;color:var(--orange);">Gs.${fmt(c.monto)}</td>
      </tr>`).join('');
}

function renderStock() {
  document.getElementById('tabla-stock').innerHTML = CONFIG.catalogo.map(it => {
    const vendido = STOCK_INICIAL[it.id] - (DB.stock[it.id]||0);
    const disp    = DB.stock[it.id]||0;
    const pct     = Math.round(disp/STOCK_INICIAL[it.id]*100);
    let cls, lbl;
    if (pct > 50)      { cls='badge-success'; lbl='OK'; }
    else if (pct > 20) { cls='badge-warning'; lbl='Bajo'; }
    else               { cls='badge-danger';  lbl='Reponer'; }
    const color = pct>50 ? '#00795E' : pct>20 ? '#F5A72D' : '#FF3D03';
    return `<tr>
      <td style="font-weight:600;">${it.nombre}</td>
      <td>${catPill(it.cat)}</td>
      <td style="color:var(--text3);">Gs.${fmt(it.precio)}</td>
      <td style="color:var(--text3);">${STOCK_INICIAL[it.id]}</td>
      <td>${vendido}</td>
      <td><strong>${disp}</strong>
        <div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${color};"></div></div>
      </td>
      <td><span class="badge ${cls}">${lbl}</span></td>
    </tr>`;
  }).join('');
}

function renderFuncionarios() {
  document.getElementById('tabla-func').innerHTML = DB.funcionarios.length === 0
    ? `<tr><td colspan="5" class="empty-state">Sin funcionarios aún.</td></tr>`
    : DB.funcionarios.map(f => {
        const cs    = DB.consumos.filter(c => c.cedula===f.cedula);
        const total = cs.reduce((a,c)=>a+c.monto,0);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:8px;">
            <div class="avatar" style="width:26px;height:26px;font-size:10px;">${initials(f.nombre)}</div>
            <span style="font-weight:500;">${f.nombre}</span>
          </div></td>
          <td style="color:var(--text3);font-size:11px;">${f.cedula}</td>
          <td style="font-size:11px;">${f.mail}</td>
          <td style="font-weight:600;">${cs.length}</td>
          <td style="font-weight:600;color:var(--orange);">Gs.${fmt(total)}</td>
        </tr>`;
      }).join('');
}

// ══════════════════════════════════════════════════════════
//  OPERADOR
// ══════════════════════════════════════════════════════════

function renderOperador() {
  document.getElementById('op-tabla').innerHTML = CONFIG.catalogo.map(it => {
    const disp = DB.stock[it.id] || 0;
    const pct  = Math.round(disp/STOCK_INICIAL[it.id]*100);
    const cls  = pct>50 ? 'badge-success' : pct>20 ? 'badge-warning' : 'badge-danger';
    return `<tr>
      <td style="font-weight:600;">${it.nombre}</td>
      <td>${catPill(it.cat)}</td>
      <td><strong>${disp}</strong> / ${STOCK_INICIAL[it.id]}
        <div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${pct>50?'#00795E':pct>20?'#F5A72D':'#FF3D03'};"></div></div>
      </td>
      <td>
        <input type="number" min="0" max="99" value="0" id="recarga-${it.id}"
          style="width:64px;padding:6px 8px;border:1.5px solid var(--border2);border-radius:8px;font-family:var(--font);font-size:12px;text-align:center;background:var(--beige);"/>
      </td>
      <td><span class="badge ${cls}">${pct>50?'OK':pct>20?'Bajo':'Reponer'}</span></td>
    </tr>`;
  }).join('');
}

async function confirmarRecarga() {
  let total = 0;
  CONFIG.catalogo.forEach(it => {
    const input = document.getElementById('recarga-'+it.id);
    const cant  = parseInt(input.value) || 0;
    if (cant > 0) { DB.stock[it.id] = (DB.stock[it.id]||0) + cant; total += cant; }
  });
  if (total === 0) { alert('Ingresá al menos una unidad para recargar.'); return; }

  try {
    const stockValues = CONFIG.catalogo.map(it => [it.id, it.nombre, DB.stock[it.id]||0]);
    await sheetsUpdate('stock!A2', stockValues);
    alert(`✓ Recarga registrada: ${total} unidades agregadas al stock.`);
  } catch(e) {
    alert('Error guardando recarga. Verificá tu conexión.');
  }
  renderOperador();
}

// ══════════════════════════════════════════════════════════
//  CLIENTE
// ══════════════════════════════════════════════════════════

function renderCliente() {
  const total        = DB.consumos.reduce((a,c)=>a+c.monto,0);
  const funcsActivos = [...new Set(DB.consumos.map(c=>c.cedula))].length;

  document.getElementById('c-cons').textContent  = DB.consumos.length;
  document.getElementById('c-total').textContent = fmt(total);
  document.getElementById('c-func').textContent  = funcsActivos;

  const porFunc = {};
  DB.consumos.forEach(c => {
    if (!porFunc[c.nombre]) porFunc[c.nombre] = { cnt:0, total:0 };
    porFunc[c.nombre].cnt++; porFunc[c.nombre].total += c.monto;
  });

  document.getElementById('tabla-cliente').innerHTML = Object.keys(porFunc).length === 0
    ? `<tr><td colspan="3" class="empty-state">Sin datos aún.</td></tr>`
    : Object.entries(porFunc).map(([n,d]) =>
        `<tr><td style="font-weight:500;">${n}</td><td>${d.cnt}</td><td style="font-weight:600;color:var(--orange);">Gs.${fmt(d.total)}</td></tr>`
      ).join('');

  document.getElementById('tabla-cliente-det').innerHTML = DB.consumos.length === 0
    ? `<tr><td colspan="4" class="empty-state">Sin consumos aún.</td></tr>`
    : DB.consumos.slice(0,8).map(c =>
        `<tr>
          <td style="color:var(--text3);font-weight:500;">${c.hora}</td>
          <td>${c.nombre ? c.nombre.split(' ')[0] : '—'}</td>
          <td>${getNombre(c)}</td>
          <td style="font-weight:600;color:var(--orange);">Gs.${fmt(c.monto)}</td>
        </tr>`
      ).join('');
}

// ── INIT ─────────────────────────────────────────────────
renderAdmin();
renderStock();
