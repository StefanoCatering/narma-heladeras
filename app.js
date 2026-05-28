// ═══════════════════════════════════════════════════════
//  NÄRMA HELADERAS — LÓGICA
// ═══════════════════════════════════════════════════════

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

// ── BASE DE DATOS EN MEMORIA ─────────────────────────────
const DB = {
  funcionarios: [],
  stock: JSON.parse(JSON.stringify(STOCK_INICIAL)),
  consumos: [],
};

// ── SESIÓN ACTIVA ────────────────────────────────────────
let SESSION = null;   // { usuario, rol, empresa, nombre }

// ── ESTADO QR ────────────────────────────────────────────
let currentFunc   = null;
let selectedItems = {};

// ── UTILS ────────────────────────────────────────────────
const fmt      = n => Math.round(n).toLocaleString('es-PY');
const initials = n => n.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const getItem  = id => CONFIG.catalogo.find(x => x.id === id);
const getNombre= c  => { const i = getItem(c.item); return i ? i.nombre : '—'; };
const getCat   = c  => { const i = getItem(c.item); return i ? i.cat    : '—'; };

function catPill(cat) {
  const slug = cat
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n')
    .replace(/\s/g,'_');
  return `<span class="cat-pill cat-${slug}">${cat}</span>`;
}

// ════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════

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
  const found = CONFIG.usuarios.find(x =>
    x.usuario.toLowerCase() === u && x.pass === p
  );
  if (!found) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-pass').value = '';
    return;
  }
  SESSION = found;
  document.getElementById('login-error').style.display = 'none';
  iniciarApp();
}

function cerrarSesion() {
  SESSION = null;
  mostrarLogin();
}

// Enter en el form de login
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') intentarLogin();
  });
  document.getElementById('login-usuario').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });
  mostrarLogin();
});

// ════════════════════════════════════════════════════════
//  INICIAR APP SEGÚN ROL
// ════════════════════════════════════════════════════════

function iniciarApp() {
  document.getElementById('screen-login').style.display = 'none';

  // Nombre de sesión en nav
  document.getElementById('nav-usuario').textContent = SESSION.nombre;

  // Mostrar/ocultar botones de nav según rol
  const btnAdmin    = document.getElementById('nav-btn-admin');
  const btnCliente  = document.getElementById('nav-btn-cliente');
  const btnOperador = document.getElementById('nav-btn-operador');
  const btnQR       = document.getElementById('nav-btn-qr');

  btnAdmin.style.display    = 'none';
  btnCliente.style.display  = 'none';
  btnOperador.style.display = 'none';
  btnQR.style.display       = 'none';

  if (SESSION.rol === 'admin') {
    btnAdmin.style.display = 'inline-flex';
    btnQR.style.display    = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('admin', btnAdmin);
  } else if (SESSION.rol === 'cliente') {
    btnCliente.style.display = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('cliente', btnCliente);
    // Rellenar datos de empresa en vista cliente
    document.getElementById('cliente-nombre').textContent  = SESSION.empresa;
    document.getElementById('cliente-avatar').textContent  = initials(SESSION.empresa);
  } else if (SESSION.rol === 'operador') {
    btnOperador.style.display = 'inline-flex';
    document.getElementById('screen-app').style.display = 'block';
    switchView('operador', btnOperador);
  }
}

// ════════════════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════
//  QR FLOW (público — sin login)
// ════════════════════════════════════════════════════════

function abrirQR() {
  document.getElementById('screen-app').style.display   = 'none';
  document.getElementById('screen-qr').style.display    = 'block';
  document.getElementById('screen-login').style.display = 'none';
  resetQR();
}

function cerrarQR() {
  document.getElementById('screen-qr').style.display  = 'none';
  if (SESSION) {
    document.getElementById('screen-app').style.display = 'block';
  } else {
    mostrarLogin();
  }
}

function resetQR() {
  selectedItems = {};
  currentFunc   = null;
  document.getElementById('step-cedula').style.display    = 'block';
  document.getElementById('step-registro').style.display  = 'none';
  document.getElementById('step-items').style.display     = 'none';
  document.getElementById('cedula-input').value           = '';
  document.getElementById('qr-success').style.display     = 'none';
  document.getElementById('confirm-area').style.display   = 'none';
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
function registrar() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const cedula = document.getElementById('reg-cedula').value.trim();
  const mail   = document.getElementById('reg-mail').value.trim();
  if (!nombre || !cedula || !mail) { alert('Completá todos los campos.'); return; }
  if (DB.funcionarios.find(f => f.cedula.replace(/\D/g,'') === cedula.replace(/\D/g,''))) {
    alert('Esa cédula ya está registrada. Ingresá con tu cédula.'); return;
  }
  currentFunc = { cedula, nombre, mail };
  DB.funcionarios.push(currentFunc);
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

function confirmar() {
  const ids = Object.keys(selectedItems).map(Number);
  if (ids.length === 0) return;
  const hora = new Date().toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' });
  ids.forEach(id => {
    DB.consumos.unshift({ hora, nombre:currentFunc.nombre, cedula:currentFunc.cedula, item:id, monto:getItem(id).precio });
    if (DB.stock[id] > 0) DB.stock[id]--;
  });
  document.getElementById('item-grid').style.display    = 'none';
  document.getElementById('confirm-area').style.display = 'none';
  document.getElementById('qr-success').style.display   = 'block';
  setTimeout(() => {
    document.getElementById('qr-success').style.display  = 'none';
    document.getElementById('item-grid').style.display   = 'grid';
    resetQR();
  }, 2800);
}

// ════════════════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════════════════

function renderAdmin() {
  const total  = DB.consumos.reduce((a,c) => a+c.monto, 0);
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
    ? `<tr><td colspan="5" class="empty-state">Sin consumos registrados aún.</td></tr>`
    : lista.map(c => `<tr>
        <td style="color:var(--text3);font-weight:500;">${c.hora}</td>
        <td>${c.nombre.split(' ')[0]}</td>
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
    ? `<tr><td colspan="5" class="empty-state">Sin funcionarios registrados aún.</td></tr>`
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

// ════════════════════════════════════════════════════════
//  OPERADOR — recarga de stock
// ════════════════════════════════════════════════════════

function renderOperador() {
  document.getElementById('op-tabla').innerHTML = CONFIG.catalogo.map(it => {
    const disp = DB.stock[it.id] || 0;
    const pct  = Math.round(disp/STOCK_INICIAL[it.id]*100);
    let cls = pct>50 ? 'badge-success' : pct>20 ? 'badge-warning' : 'badge-danger';
    return `<tr>
      <td style="font-weight:600;">${it.nombre}</td>
      <td>${catPill(it.cat)}</td>
      <td><strong>${disp}</strong> / ${STOCK_INICIAL[it.id]}
        <div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${pct>50?'#00795E':pct>20?'#F5A72D':'#FF3D03'};"></div></div>
      </td>
      <td>
        <input type="number" min="0" max="99" value="0"
          id="recarga-${it.id}"
          style="width:64px;padding:6px 8px;border:1.5px solid var(--border2);border-radius:8px;font-family:var(--font);font-size:12px;text-align:center;background:var(--beige);"
        />
      </td>
      <td><span class="badge ${cls}">${pct>50?'OK':pct>20?'Bajo':'Reponer'}</span></td>
    </tr>`;
  }).join('');
}

function confirmarRecarga() {
  let total = 0;
  CONFIG.catalogo.forEach(it => {
    const input = document.getElementById('recarga-'+it.id);
    const cant  = parseInt(input.value) || 0;
    if (cant > 0) {
      DB.stock[it.id] = (DB.stock[it.id] || 0) + cant;
      total += cant;
    }
  });
  if (total === 0) { alert('Ingresá al menos una unidad para recargar.'); return; }
  alert(`✓ Recarga registrada: ${total} unidades agregadas al stock.`);
  renderOperador();
}

// ════════════════════════════════════════════════════════
//  CLIENTE
// ════════════════════════════════════════════════════════

function renderCliente() {
  const empresa  = SESSION ? SESSION.empresa : CONFIG.nombreEmpresa;
  const consumos = DB.consumos; // cuando haya multi-empresa, filtrar por empresa
  const total    = consumos.reduce((a,c)=>a+c.monto,0);
  const funcsActivos = [...new Set(consumos.map(c=>c.cedula))].length;

  document.getElementById('c-cons').textContent  = consumos.length;
  document.getElementById('c-total').textContent = fmt(total);
  document.getElementById('c-func').textContent  = funcsActivos;

  const porFunc = {};
  consumos.forEach(c => {
    if (!porFunc[c.nombre]) porFunc[c.nombre] = { cnt:0, total:0 };
    porFunc[c.nombre].cnt++; porFunc[c.nombre].total += c.monto;
  });

  document.getElementById('tabla-cliente').innerHTML = Object.keys(porFunc).length === 0
    ? `<tr><td colspan="3" class="empty-state">Sin datos aún.</td></tr>`
    : Object.entries(porFunc).map(([n,d]) =>
        `<tr>
          <td style="font-weight:500;">${n}</td>
          <td>${d.cnt}</td>
          <td style="font-weight:600;color:var(--orange);">Gs.${fmt(d.total)}</td>
        </tr>`).join('');

  document.getElementById('tabla-cliente-det').innerHTML = consumos.length === 0
    ? `<tr><td colspan="4" class="empty-state">Sin consumos aún.</td></tr>`
    : consumos.slice(0,8).map(c =>
        `<tr>
          <td style="color:var(--text3);font-weight:500;">${c.hora}</td>
          <td>${c.nombre.split(' ')[0]}</td>
          <td>${getNombre(c)}</td>
          <td style="font-weight:600;color:var(--orange);">Gs.${fmt(c.monto)}</td>
        </tr>`).join('');
}
