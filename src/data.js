// ═══════════════════════════════════════════════════════════
//  DORADO CLUB — Capa de Datos v1
//  Enfoque actual: Inicio de Sesión + Papel de Acceso (cargos)
// ═══════════════════════════════════════════════════════════

// ── Métodos de pago y su moneda ──
// Si el método es en dólares (Zelle / Dólares) la tasa es siempre 1.
export const METODOS_PAGO = [
  { id: "pago_movil",  label: "Pago Móvil",  moneda: "Bs",  esUSD: false },
  { id: "zelle",       label: "Zelle",       moneda: "USD", esUSD: true  },
  { id: "dolares",     label: "Dólares",     moneda: "USD", esUSD: true  },
  { id: "bancolombia", label: "Bancolombia", moneda: "COP", esUSD: false },
  { id: "cop",         label: "COP",         moneda: "COP", esUSD: false },
];

// Cálculo de monto en USD a partir del método de pago y la tasa.
// Métodos en dólares => tasa 1 (monto = USD). Otros => monto / tasa.
export function calcUSD(monto, metodoId, tasa) {
  const m = METODOS_PAGO.find(x => x.id === metodoId);
  const n = parseFloat(monto) || 0;
  if (!m) return 0;
  if (m.esUSD) return n;
  const t = parseFloat(tasa) || 0;
  return t > 0 ? n / t : 0;
}

// ── Catálogo de módulos de gestión (por departamento) ──
// Estos módulos se construirán en fases posteriores. Por ahora se
// muestran como "Próximamente" para reflejar la estructura del sistema.
export const MODULOS = {
  consolidado:  { label: "Consolidado General",     icon: "📈", desc: "Ingresos y egresos de todas las gerencias (solo lectura)." },
  egresos:      { label: "Egresos / Gastos",        icon: "💸", desc: "Registro de gastos propios de administración." },
  campanas:     { label: "Campañas y Publicidad",   icon: "📣", desc: "Registro de gastos de campañas y publicidad." },
  alquileres:   { label: "Alquiler de Locales",     icon: "🏢", desc: "Ingresos por alquiler de locales del Club." },
  alicuotas:    { label: "Alícuotas",               icon: "🧾", desc: "Cobro a locales según consumo (alícuota por %)." },
  afiliaciones: { label: "Afiliaciones",            icon: "🎟️", desc: "Ingresos por afiliación y planes del gimnasio." },
  entrenadores: { label: "Entrenadores",            icon: "🏋️", desc: "Entrenadores y afiliados que entrenan ($10 c/u)." },
  inventario:   { label: "Inventario",              icon: "📦", desc: "Compras, ventas y control de stock." },
  reservas:     { label: "Reservas",                icon: "📅", desc: "Reservas de canchas y tarifas." },
  clientes:     { label: "Clientes Fijos / Academia", icon: "🤝", desc: "Clientes fijos y academia con % de descuento." },
  personal:     { label: "Personal del Área",       icon: "👥", desc: "Gestión del personal del departamento." },
  reportes:     { label: "Reportes",                icon: "📊", desc: "Ingresos, gastos, novedades, mantenimiento y consolidados." },
};

// ── Departamentos del Club ──
export const DEPARTAMENTOS = {
  ejecutivo:      { label: "Ejecutivo",        icon: "♛",  color: "#C9A227", modulos: ["consolidado", "reportes"] },
  administracion: { label: "Administración",   icon: "📊", color: "#60a5fa", modulos: ["consolidado", "egresos", "reportes"] },
  mercadeo:       { label: "Mercadeo",         icon: "📣", color: "#a78bfa", modulos: ["campanas", "reportes"] },
  rrhh:           { label: "Recursos Humanos", icon: "👥", color: "#ec4899", modulos: ["personal", "reportes"] },
  inmobiliaria:   { label: "Inmobiliaria",     icon: "🏢", color: "#14b8a6", modulos: ["alquileres", "reportes"] },
  condominio:     { label: "Condominio",       icon: "🏘️", color: "#f97316", modulos: ["alicuotas", "reportes"] },
  komplex_gym:    { label: "Komplex Gym",      icon: "🏋️", color: "#D32F2F", modulos: ["afiliaciones", "entrenadores", "inventario", "reportes"] },
  dfc:            { label: "DFC",              icon: "⚽", color: "#22c55e", modulos: ["reservas", "clientes", "inventario", "reportes"] },
  sport_bar:      { label: "Sport Bar",        icon: "🍻", color: "#f59e0b", modulos: ["inventario", "reportes"] },
};

// ═══════════════════════════════════════════════════════════
//  CARGOS / ROLES DEL SISTEMA
//  - canManageUsers: puede crear cargos y perfiles (solo cargos
//    más elevados: Gerente General y Súper Intendente).
//  - canSeeConsolidado: ve el total de ingresos/egresos de todas
//    las gerencias (solo lectura para Administración).
// ═══════════════════════════════════════════════════════════
export const SYSTEM_ROLES = {
  GG:   { label: "Gerente General",        color: "#C9A227", departamento: "ejecutivo",      nivel: "Ejecutivo",      canManageUsers: true,  canSeeConsolidado: true,  canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  SI:   { label: "Súper Intendente",       color: "#E0C24A", departamento: "ejecutivo",      nivel: "Ejecutivo",      canManageUsers: true,  canSeeConsolidado: true,  canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  ADM:  { label: "Gerente Administrativo", color: "#60a5fa", departamento: "administracion", nivel: "Administración", canManageUsers: false, canSeeConsolidado: true,  canRegistrarIngresos: false, canRegistrarEgresos: true,  system: true },
  MKT:  { label: "Gerente de Mercadeo",    color: "#a78bfa", departamento: "mercadeo",       nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: false, canRegistrarEgresos: true,  system: true },
  RRHH: { label: "Gerente de RRHH",        color: "#ec4899", departamento: "rrhh",           nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: false, canRegistrarEgresos: true,  system: true },
  INM:  { label: "Gerente Inmobiliaria",   color: "#14b8a6", departamento: "inmobiliaria",   nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  CON:  { label: "Gerente de Condominio",  color: "#f97316", departamento: "condominio",     nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  KGYM: { label: "Gerente de Komplex Gym", color: "#D32F2F", departamento: "komplex_gym",    nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  DFC:  { label: "Gerente de DFC",         color: "#22c55e", departamento: "dfc",            nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
  SB:   { label: "Gerente de Sport Bar",   color: "#f59e0b", departamento: "sport_bar",      nivel: "Gerencia",       canManageUsers: false, canSeeConsolidado: false, canRegistrarIngresos: true,  canRegistrarEgresos: true,  system: true },
};

export function getRoles() {
  const custom = JSON.parse(sessionStorage.getItem("dc_roles") || "[]");
  const all = { ...SYSTEM_ROLES };
  custom.forEach(r => { all[r.key] = r; });
  return all;
}

// Proxy dinámico — permite ROLES[key] en cualquier componente.
export const ROLES = new Proxy({}, {
  get(_, key)  { return getRoles()[key]; },
  has(_, key)  { return key in getRoles(); },
  ownKeys()    { return Object.keys(getRoles()); },
  getOwnPropertyDescriptor(_, key) {
    const val = getRoles()[key];
    return val ? { value: val, writable: true, enumerable: true, configurable: true } : undefined;
  },
});

export function getCustomRoles()   { return JSON.parse(sessionStorage.getItem("dc_roles") || "[]"); }
export function saveCustomRoles(d) { sessionStorage.setItem("dc_roles", JSON.stringify(d)); }

// ── Usuarios / Perfiles (uno por cargo) ──
export const USERS_INITIAL = [
  { id: 1,  user: "gerencia.general", pass: "dorado2026", nombre: "Roberto Salazar",   rolKey: "GG",   avatar: "RS", activo: true, perms: {} },
  { id: 2,  user: "superintendente",  pass: "dorado2026", nombre: "Patricia Oviedo",   rolKey: "SI",   avatar: "PO", activo: true, perms: {} },
  { id: 3,  user: "administracion",   pass: "dorado2026", nombre: "Luis Camacho",      rolKey: "ADM",  avatar: "LC", activo: true, perms: {} },
  { id: 4,  user: "mercadeo",         pass: "dorado2026", nombre: "Valeria Torres",    rolKey: "MKT",  avatar: "VT", activo: true, perms: {} },
  { id: 5,  user: "rrhh",             pass: "dorado2026", nombre: "Daniela Pérez",     rolKey: "RRHH", avatar: "DP", activo: true, perms: {} },
  { id: 6,  user: "inmobiliaria",     pass: "dorado2026", nombre: "Andrés Quintero",   rolKey: "INM",  avatar: "AQ", activo: true, perms: {} },
  { id: 7,  user: "condominio",       pass: "dorado2026", nombre: "Marta Rondón",      rolKey: "CON",  avatar: "MR", activo: true, perms: {} },
  { id: 8,  user: "komplexgym",       pass: "dorado2026", nombre: "Carlos Herrera",    rolKey: "KGYM", avatar: "CH", activo: true, perms: {} },
  { id: 9,  user: "dfc",              pass: "dorado2026", nombre: "José Ríos",         rolKey: "DFC",  avatar: "JR", activo: true, perms: {} },
  { id: 10, user: "sportbar",         pass: "dorado2026", nombre: "Gabriel Méndez",    rolKey: "SB",   avatar: "GM", activo: true, perms: {} },
];

// ── Historial / Auditoría ──
export const HISTORIAL_INITIAL = [
  { id: 1, tipo: "sistema",       msg: "Sistema Dorado Club inicializado",          fecha: "2026-06-15", hora: "00:00", userId: 1 },
  { id: 2, tipo: "usuario_nuevo", msg: "Cuentas de gerencia creadas",               fecha: "2026-06-15", hora: "00:00", userId: 1 },
];

// ── Storage ──
const STORAGE_VERSION = "dc_v1";

export function initStorage() {
  // Re-siembra si cambia la versión del esquema.
  if (sessionStorage.getItem("dc_version") !== STORAGE_VERSION) {
    sessionStorage.setItem("dc_users",     JSON.stringify(USERS_INITIAL));
    sessionStorage.setItem("dc_historial", JSON.stringify(HISTORIAL_INITIAL));
    sessionStorage.setItem("dc_roles",     JSON.stringify([]));
    sessionStorage.setItem("dc_version",   STORAGE_VERSION);
  }
  if (!sessionStorage.getItem("dc_theme")) sessionStorage.setItem("dc_theme", "dark");
}

export function getUsers()     { return JSON.parse(sessionStorage.getItem("dc_users")     || "[]"); }
export function getHistorial() { return JSON.parse(sessionStorage.getItem("dc_historial") || "[]"); }
export function getTheme()     { return sessionStorage.getItem("dc_theme") || "dark"; }

export function saveUsers(d)     { sessionStorage.setItem("dc_users",     JSON.stringify(d)); }
export function saveHistorial(d) { sessionStorage.setItem("dc_historial", JSON.stringify(d)); }
export function saveTheme(t)     { sessionStorage.setItem("dc_theme", t); }

// ── Permisos efectivos de un usuario ──
// canManageUsers proviene SIEMPRE del cargo (no es individualizable),
// para garantizar que solo los cargos más elevados gestionen perfiles.
export function resolvePerms(u) {
  const roles = getRoles();
  const r = roles[u.rolKey] || {};
  const ind = u.perms || {};
  const pick = (k) => (ind[k] !== undefined ? ind[k] : (r[k] || false));
  return {
    canManageUsers:       r.canManageUsers || false,
    canSeeConsolidado:    pick("canSeeConsolidado"),
    canRegistrarIngresos: pick("canRegistrarIngresos"),
    canRegistrarEgresos:  pick("canRegistrarEgresos"),
    departamento:         r.departamento,
    nivel:                r.nivel,
    color:                r.color,
  };
}

// ── Helpers ──
export function addHistorial(msg, userId, tipo = "accion") {
  const h     = getHistorial();
  const now   = new Date();
  const hora  = now.toTimeString().slice(0, 5);
  const fecha = now.toISOString().split("T")[0];
  saveHistorial([{ id: Date.now(), tipo, msg, fecha, hora, userId }, ...h].slice(0, 200));
}

export function exportBackup() {
  const data = {
    version: STORAGE_VERSION,
    fecha:   new Date().toISOString(),
    users:     getUsers(),
    historial: getHistorial(),
    roles:     getCustomRoles(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `dorado-club-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
