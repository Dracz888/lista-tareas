// ═══════════════════════════════════════════
//  KOMPLEX GYM — Data Layer v4
// ═══════════════════════════════════════════

export const SYSTEM_ROLES = {
  ADM: { label: "Gerencia General",          color: "#D32F2F", canManageUsers: true,  canSeeAll: true,  canAssignTo: "all",    defaultPerms: { verTodos: true,  crearTareas: true,  eliminarTareas: true  }, system: true },
  GM:  { label: "Gerencia de Marca",         color: "#a78bfa", canManageUsers: false, canSeeAll: true,  canAssignTo: "nonAdm", defaultPerms: { verTodos: true,  crearTareas: true,  eliminarTareas: true  }, system: true },
  AC:  { label: "Anfitrión Comercial",       color: "#60a5fa", canManageUsers: false, canSeeAll: false, canAssignTo: "none",   defaultPerms: { verTodos: false, crearTareas: false, eliminarTareas: false }, system: true },
  PM:  { label: "Personal de Mantenimiento", color: "#f97316", canManageUsers: false, canSeeAll: false, canAssignTo: "none",   defaultPerms: { verTodos: false, crearTareas: false, eliminarTareas: false }, system: true },
  EP:  { label: "Entrenador de Planta",      color: "#22c55e", canManageUsers: false, canSeeAll: false, canAssignTo: "none",   defaultPerms: { verTodos: false, crearTareas: false, eliminarTareas: false }, system: true },
  ENP: { label: "Entrenador Personalizado",  color: "#f59e0b", canManageUsers: false, canSeeAll: false, canAssignTo: "none",   defaultPerms: { verTodos: false, crearTareas: false, eliminarTareas: false }, system: true },
};

export function getRoles() {
  const custom = JSON.parse(sessionStorage.getItem("kx_roles") || "[]");
  const all = { ...SYSTEM_ROLES };
  custom.forEach(r => { all[r.key] = r; });
  return all;
}

// Proxy dinámico — permite ROLES[key] en todos los componentes
export const ROLES = new Proxy({}, {
  get(_, key)  { return getRoles()[key]; },
  has(_, key)  { return key in getRoles(); },
  ownKeys(_)   { return Object.keys(getRoles()); },
  getOwnPropertyDescriptor(_, key) {
    const val = getRoles()[key];
    return val ? { value: val, writable: true, enumerable: true, configurable: true } : undefined;
  },
});

export function getCustomRoles()    { return JSON.parse(sessionStorage.getItem("kx_roles")    || "[]"); }
export function saveCustomRoles(d)  { sessionStorage.setItem("kx_roles", JSON.stringify(d)); }

// ── Etiquetas ──
export const ETIQUETAS_INITIAL = [
  { id: "urgente",   label: "Urgente",   color: "#D32F2F" },
  { id: "cardio",    label: "Cardio",    color: "#60a5fa" },
  { id: "ventas",    label: "Ventas",    color: "#22c55e" },
  { id: "limpieza",  label: "Limpieza",  color: "#f97316" },
  { id: "marketing", label: "Marketing", color: "#a78bfa" },
  { id: "cliente",   label: "Cliente",   color: "#f59e0b" },
];

// ── Usuarios ──
export const USERS_INITIAL = [
  { id: 1, user: "admin",      pass: "admin123",  nombre: "Carlos Herrera",  rolKey: "ADM", avatar: "CH", activo: true, perms: { verTodos: true,  crearTareas: true,  eliminarTareas: true  } },
  { id: 2, user: "gmarca",     pass: "marca123",  nombre: "Valeria Torres",  rolKey: "GM",  avatar: "VT", activo: true, perms: { verTodos: true,  crearTareas: true,  eliminarTareas: true  } },
  { id: 3, user: "anfitrion",  pass: "anf123",    nombre: "Diego Fuentes",   rolKey: "AC",  avatar: "DF", activo: true, perms: { verTodos: false, crearTareas: false, eliminarTareas: false } },
  { id: 4, user: "mant",       pass: "mant123",   nombre: "José Ríos",       rolKey: "PM",  avatar: "JR", activo: true, perms: { verTodos: false, crearTareas: false, eliminarTareas: false } },
  { id: 5, user: "entrplanta", pass: "entr123",   nombre: "Ana Salinas",     rolKey: "EP",  avatar: "AS", activo: true, perms: { verTodos: false, crearTareas: false, eliminarTareas: false } },
  { id: 6, user: "entrpers",   pass: "pers123",   nombre: "Luis Mendoza",    rolKey: "ENP", avatar: "LM", activo: true, perms: { verTodos: false, crearTareas: false, eliminarTareas: false } },
];

// ── Tareas ──
export const TAREAS_INITIAL = [
  { id: 1, titulo: "Revisión de equipos cardio",       prioridad: "alta",  estado: "pendiente",  fecha: "2026-05-05", asignadoA: [4], creadoPor: 1, descripcion: "Verificar estado de cintas, elípticas y bicicletas estáticas.", adjuntos: [], comentarios: [], etiquetas: ["cardio","urgente"], recurrencia: "semanal",  plantilla: null },
  { id: 2, titulo: "Actualizar redes sociales",        prioridad: "media", estado: "en_proceso", fecha: "2026-05-06", asignadoA: [2], creadoPor: 1, descripcion: "Publicar contenido semanal en Instagram y Facebook.", adjuntos: [], comentarios: [], etiquetas: ["marketing"],            recurrencia: "semanal",  plantilla: null },
  { id: 3, titulo: "Clase grupal de funcional",        prioridad: "baja",  estado: "completada", fecha: "2026-05-03", asignadoA: [5], creadoPor: 1, descripcion: "Impartir clase grupal de entrenamiento funcional a las 7am.", adjuntos: [], comentarios: [], etiquetas: [],                recurrencia: null,       plantilla: null },
  { id: 4, titulo: "Renovar contrato cliente VIP",     prioridad: "alta",  estado: "pendiente",  fecha: "2026-05-05", asignadoA: [3], creadoPor: 2, descripcion: "Contactar a cliente para renovación de membresía premium.", adjuntos: [], comentarios: [], etiquetas: ["cliente","urgente"], recurrencia: null,       plantilla: null },
  { id: 5, titulo: "Limpieza zona de pesas",           prioridad: "media", estado: "en_proceso", fecha: "2026-05-07", asignadoA: [4], creadoPor: 2, descripcion: "Desinfección y reorganización del área de pesas libre.", adjuntos: [], comentarios: [], etiquetas: ["limpieza"],            recurrencia: "quincenal",plantilla: null },
  { id: 6, titulo: "Sesión personalizada cliente #12", prioridad: "media", estado: "pendiente",  fecha: "2026-05-08", asignadoA: [6], creadoPor: 1, descripcion: "Entrenamiento personalizado enfocado en hipertrofia.", adjuntos: [], comentarios: [], etiquetas: ["cliente"],              recurrencia: null,       plantilla: null },
  { id: 7, titulo: "Reporte mensual de membresías",    prioridad: "alta",  estado: "pendiente",  fecha: "2026-05-09", asignadoA: [1], creadoPor: 1, descripcion: "Consolidar datos de membresías activas e ingresos.", adjuntos: [], comentarios: [], etiquetas: ["ventas"],               recurrencia: "mensual",  plantilla: null },
];

// ── Reportes ──
export const REPORTES_INITIAL = [
  { id: 1, titulo: "Reporte de asistencia semanal",     tipo: "asistencia",    fecha: "2026-04-28", autorId: 5, estado: "aprobado",  contenido: "Asistencia de 87 personas esta semana.", adjuntos: [] },
  { id: 2, titulo: "Reporte de mantenimiento – Cardio", tipo: "mantenimiento", fecha: "2026-04-30", autorId: 4, estado: "revision",  contenido: "Cinta #3 requiere mantenimiento urgente.", adjuntos: [] },
  { id: 3, titulo: "Reporte de ventas – Abril",         tipo: "ventas",        fecha: "2026-04-30", autorId: 1, estado: "aprobado",  contenido: "Ventas totales: $48,200. Meta cumplida al 103%.", adjuntos: [] },
  { id: 4, titulo: "Reporte de nuevos clientes",        tipo: "clientes",      fecha: "2026-05-01", autorId: 3, estado: "pendiente", contenido: "12 nuevos clientes registrados en mayo.", adjuntos: [] },
];

// ── Plantillas de reporte ──
export const PLANTILLAS_INITIAL = [
  {
    id: 1, nombre: "Reporte de Asistencia", tipo: "asistencia", creadoPor: 1,
    descripcion: "Plantilla estándar para registrar asistencia semanal.",
    campos: [
      { id: "semana",      label: "Semana",                tipo: "text",   requerido: true  },
      { id: "total",       label: "Total de asistentes",   tipo: "number", requerido: true  },
      { id: "pico",        label: "Hora pico",             tipo: "text",   requerido: false },
      { id: "observacion", label: "Observaciones",         tipo: "textarea",requerido: false },
    ],
    adjuntoEjemplo: null,
  },
  {
    id: 2, nombre: "Reporte de Mantenimiento", tipo: "mantenimiento", creadoPor: 1,
    descripcion: "Para registrar incidencias y trabajos de mantenimiento.",
    campos: [
      { id: "equipo",      label: "Equipo/Área afectada",  tipo: "text",    requerido: true  },
      { id: "problema",    label: "Problema detectado",    tipo: "textarea",requerido: true  },
      { id: "accion",      label: "Acción tomada",         tipo: "textarea",requerido: true  },
      { id: "estado_eq",   label: "Estado del equipo",     tipo: "select",  opciones: ["Operativo","En reparación","Fuera de servicio"], requerido: true },
    ],
    adjuntoEjemplo: null,
  },
];

// ── Anuncios ──
export const ANUNCIOS_INITIAL = [
  { id: 1, titulo: "¡Bienvenidos al nuevo sistema!", contenido: "Komplex GYM estrena su sistema interno de gestión. Ante cualquier duda, contactar a administración.", autorId: 1, fecha: "2026-05-01", prioridad: "alta",  activo: true },
  { id: 2, titulo: "Mantenimiento programado",        contenido: "El lunes 6 de mayo el gimnasio cerrará a las 8pm por mantenimiento preventivo de equipos.", autorId: 2, fecha: "2026-05-03", prioridad: "media", activo: true },
];

// ── Historial / Auditoría ──
export const HISTORIAL_INITIAL = [
  { id: 1, tipo: "tarea_estado",   msg: "Ana Salinas completó 'Clase grupal de funcional'",    fecha: "2026-05-03", hora: "09:14", userId: 5, ip: "192.168.1.5" },
  { id: 2, tipo: "reporte_nuevo",  msg: "Ana Salinas entregó 'Reporte de asistencia semanal'", fecha: "2026-04-28", hora: "10:30", userId: 5, ip: "192.168.1.5" },
  { id: 3, tipo: "reporte_estado", msg: "Carlos Herrera aprobó 'Reporte de ventas – Abril'",   fecha: "2026-04-30", hora: "16:45", userId: 1, ip: "192.168.1.1" },
  { id: 4, tipo: "usuario_nuevo",  msg: "Carlos Herrera creó al usuario Luis Mendoza",          fecha: "2026-04-25", hora: "11:00", userId: 1, ip: "192.168.1.1" },
  { id: 5, tipo: "login",          msg: "Valeria Torres inició sesión",                         fecha: "2026-05-03", hora: "08:02", userId: 2, ip: "192.168.1.2" },
];

// ── Notificaciones ──
export const NOTIF_INITIAL = [
  { id: 1, userId: 4, msg: "Se te asignó 'Revisión de equipos cardio'",      fecha: "2026-05-01", leida: false },
  { id: 2, userId: 2, msg: "Se te asignó 'Actualizar redes sociales'",        fecha: "2026-05-01", leida: false },
  { id: 3, userId: 5, msg: "Tu reporte de asistencia fue aprobado",           fecha: "2026-04-28", leida: true  },
  { id: 4, userId: 3, msg: "Se te asignó 'Renovar contrato cliente VIP'",     fecha: "2026-05-02", leida: false },
  { id: 5, userId: 6, msg: "Se te asignó 'Sesión personalizada cliente #12'", fecha: "2026-05-02", leida: false },
];

// ── Storage helpers ──
export function initStorage() {
  if (!sessionStorage.getItem("kx_users"))      sessionStorage.setItem("kx_users",      JSON.stringify(USERS_INITIAL));
  if (!sessionStorage.getItem("kx_tareas"))     sessionStorage.setItem("kx_tareas",     JSON.stringify(TAREAS_INITIAL));
  if (!sessionStorage.getItem("kx_reportes"))   sessionStorage.setItem("kx_reportes",   JSON.stringify(REPORTES_INITIAL));
  if (!sessionStorage.getItem("kx_plantillas")) sessionStorage.setItem("kx_plantillas", JSON.stringify(PLANTILLAS_INITIAL));
  if (!sessionStorage.getItem("kx_anuncios"))   sessionStorage.setItem("kx_anuncios",   JSON.stringify(ANUNCIOS_INITIAL));
  if (!sessionStorage.getItem("kx_historial"))  sessionStorage.setItem("kx_historial",  JSON.stringify(HISTORIAL_INITIAL));
  if (!sessionStorage.getItem("kx_notifs"))     sessionStorage.setItem("kx_notifs",     JSON.stringify(NOTIF_INITIAL));
  if (!sessionStorage.getItem("kx_etiquetas"))  sessionStorage.setItem("kx_etiquetas",  JSON.stringify(ETIQUETAS_INITIAL));
  if (!sessionStorage.getItem("kx_roles"))      sessionStorage.setItem("kx_roles",      JSON.stringify([]));
  if (!sessionStorage.getItem("kx_theme"))      sessionStorage.setItem("kx_theme",      "dark");
}

export function getUsers()      { return JSON.parse(sessionStorage.getItem("kx_users")      || "[]"); }
export function getTareas()     { return JSON.parse(sessionStorage.getItem("kx_tareas")     || "[]"); }
export function getReportes()   { return JSON.parse(sessionStorage.getItem("kx_reportes")   || "[]"); }
export function getPlantillas() { return JSON.parse(sessionStorage.getItem("kx_plantillas") || "[]"); }
export function getAnuncios()   { return JSON.parse(sessionStorage.getItem("kx_anuncios")   || "[]"); }
export function getHistorial()  { return JSON.parse(sessionStorage.getItem("kx_historial")  || "[]"); }
export function getNotifs()     { return JSON.parse(sessionStorage.getItem("kx_notifs")     || "[]"); }
export function getEtiquetas()  { return JSON.parse(sessionStorage.getItem("kx_etiquetas")  || "[]"); }
export function getTheme()      { return sessionStorage.getItem("kx_theme") || "dark"; }

export function saveUsers(d)      { sessionStorage.setItem("kx_users",      JSON.stringify(d)); }
export function saveTareas(d)     { sessionStorage.setItem("kx_tareas",     JSON.stringify(d)); }
export function saveReportes(d)   { sessionStorage.setItem("kx_reportes",   JSON.stringify(d)); }
export function savePlantillas(d) { sessionStorage.setItem("kx_plantillas", JSON.stringify(d)); }
export function saveAnuncios(d)   { sessionStorage.setItem("kx_anuncios",   JSON.stringify(d)); }
export function saveHistorial(d)  { sessionStorage.setItem("kx_historial",  JSON.stringify(d)); }
export function saveNotifs(d)     { sessionStorage.setItem("kx_notifs",     JSON.stringify(d)); }
export function saveEtiquetas(d)  { sessionStorage.setItem("kx_etiquetas",  JSON.stringify(d)); }
export function saveTheme(t)      { sessionStorage.setItem("kx_theme", t); }

// ── Permisos ──
export function resolvePerms(u) {
  const roles = getRoles();
  const base  = roles[u.rolKey]?.defaultPerms || { verTodos: false, crearTareas: false, eliminarTareas: false };
  const ind   = u.perms || {};
  return {
    verTodos:       ind.verTodos       !== undefined ? ind.verTodos       : base.verTodos,
    crearTareas:    ind.crearTareas    !== undefined ? ind.crearTareas    : base.crearTareas,
    eliminarTareas: ind.eliminarTareas !== undefined ? ind.eliminarTareas : base.eliminarTareas,
    canManageUsers: roles[u.rolKey]?.canManageUsers || false,
    canSeeAll:      roles[u.rolKey]?.canSeeAll      || false,
    canAssignTo:    roles[u.rolKey]?.canAssignTo    || "none",
  };
}

// ── Helpers ──
export function addHistorial(msg, userId, tipo = "accion") {
  const h    = getHistorial();
  const now  = new Date();
  const hora = now.toTimeString().slice(0, 5);
  const fecha= now.toISOString().split("T")[0];
  saveHistorial([{ id: Date.now(), tipo, msg, fecha, hora, userId }, ...h].slice(0, 200));
}

export function addNotif(userId, msg) {
  const n = getNotifs();
  saveNotifs([{ id: Date.now(), userId, msg, fecha: new Date().toISOString().split("T")[0], leida: false }, ...n]);
}

export function getUnreadCount(userId) {
  return getNotifs().filter(n => n.userId === userId && !n.leida).length;
}

export function getTareaUrgencia(fechaStr) {
  if (!fechaStr) return null;
  const hoy    = new Date(); hoy.setHours(0,0,0,0);
  const limite = new Date(fechaStr + "T00:00:00");
  return Math.round((limite - hoy) / 86400000);
}

// ── Backup / Restauración ──
export function exportBackup() {
  const data = {
    version: 4,
    fecha: new Date().toISOString(),
    users:      getUsers(),
    tareas:     getTareas(),
    reportes:   getReportes(),
    plantillas: getPlantillas(),
    anuncios:   getAnuncios(),
    historial:  getHistorial(),
    etiquetas:  getEtiquetas(),
    roles:      getCustomRoles(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `komplex-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.users)      saveUsers(data.users);
    if (data.tareas)     saveTareas(data.tareas);
    if (data.reportes)   saveReportes(data.reportes);
    if (data.plantillas) savePlantillas(data.plantillas);
    if (data.anuncios)   saveAnuncios(data.anuncios);
    if (data.historial)  saveHistorial(data.historial);
    if (data.etiquetas)  saveEtiquetas(data.etiquetas);
    if (data.roles)      saveCustomRoles(data.roles);
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

export function nextFechaRecurrencia(fechaStr, tipo) {
  if (!fechaStr || !tipo) return null;
  const d = new Date(fechaStr + "T00:00:00");
  if (tipo === "semanal")   d.setDate(d.getDate() + 7);
  if (tipo === "quincenal") d.setDate(d.getDate() + 15);
  if (tipo === "mensual")   d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

export function getStatsUsuario(userId) {
  const tareas   = getTareas();
  const reportes = getReportes();
  const completadas  = tareas.filter(t => t.asignadoA.includes(userId) && t.estado === "completada").length;
  const pendientes   = tareas.filter(t => t.asignadoA.includes(userId) && t.estado === "pendiente").length;
  const enProceso    = tareas.filter(t => t.asignadoA.includes(userId) && t.estado === "en_proceso").length;
  const total        = tareas.filter(t => t.asignadoA.includes(userId)).length;
  const misReportes  = reportes.filter(r => r.autorId === userId).length;
  const aprobados    = reportes.filter(r => r.autorId === userId && r.estado === "aprobado").length;
  const tasa         = total > 0 ? Math.round((completadas / total) * 100) : 0;
  return { completadas, pendientes, enProceso, total, misReportes, aprobados, tasa };
}
