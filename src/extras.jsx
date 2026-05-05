import { useState, useRef } from 'react';
import {
  getUsers, getTareas, getReportes, saveReportes, getPlantillas, savePlantillas,
  getAnuncios, saveAnuncios, getHistorial, saveHistorial, getCustomRoles,
  getRoles, resolvePerms, addHistorial, getStatsUsuario,
  exportBackup, importBackup
} from './data.js';
import {
  PRIORIDAD_COLOR, REPORTE_ESTADO, sharedStyles,
  KModal, FormGroup, KInput, Badge, AdjuntosSection, ConfirmDelete
} from './shared.jsx';

/* ════════════════════════════════════
   MÉTRICAS DE RENDIMIENTO
════════════════════════════════════ */
export function MetricasTab({ user }) {
  const [users,]  = useState(getUsers());
  const [tareas,] = useState(getTareas());
  const perms     = resolvePerms(user);
  const canVerTodo= perms.verTodos;

  const visibles = canVerTodo ? users.filter(u => u.activo) : [users.find(u => u.id === user.id)].filter(Boolean);

  const stats = visibles.map(u => {
    const s = getStatsUsuario(u.id);
    const roles = getRoles();
    return { ...u, ...s, rolLabel: roles[u.rolKey]?.label || u.rolKey, rolColor: roles[u.rolKey]?.color || "#888" };
  }).sort((a,b) => b.completadas - a.completadas);

  const totalTareas     = tareas.length;
  const totalCompletadas= tareas.filter(t => t.estado === "completada").length;
  const tasaGlobal      = totalTareas > 0 ? Math.round((totalCompletadas/totalTareas)*100) : 0;

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>MÉTRICAS</h1>
        <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>Rendimiento del equipo Komplex</p>
      </div>

      {canVerTodo && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Total Tareas",    value: totalTareas,      color: "#e8e8e8" },
            { label: "Completadas",     value: totalCompletadas, color: "#22c55e" },
            { label: "Tasa Global",     value: tasaGlobal+"%",   color: "#60a5fa" },
            { label: "Personal Activo", value: users.filter(u=>u.activo).length, color: "#a78bfa" },
          ].map((s,i) => (
            <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 16px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "34px", color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "2px" }}>RENDIMIENTO POR PERSONA</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          {stats.map((u, i) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "14px 20px",
              borderBottom: i < stats.length-1 ? "1px solid var(--border)" : "none",
              flexWrap: "wrap",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: i===0?"#f59e0b":i===1?"#aaaaaa":i===2?"#cd7f32":"var(--gray)", width: "28px", flexShrink: 0, textAlign: "center" }}>
                {i+1}
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: u.rolColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "13px", color: "#fff", flexShrink: 0 }}>{u.avatar}</div>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{u.nombre}</div>
                <div style={{ fontSize: "11px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>{u.rolLabel}</div>
              </div>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <StatMini label="Total"      value={u.total}      color="var(--text)" />
                <StatMini label="Complet."   value={u.completadas}color="#22c55e" />
                <StatMini label="Pendientes" value={u.pendientes} color="#f59e0b" />
                <StatMini label="Reportes"   value={u.misReportes}color="#60a5fa" />
              </div>
              <div style={{ width: "120px", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'" }}>Tasa</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: u.tasa >= 80 ? "#22c55e" : u.tasa >= 50 ? "#f59e0b" : "#D32F2F" }}>{u.tasa}%</span>
                </div>
                <div style={{ height: "6px", background: "var(--bg3)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: u.tasa+"%", background: u.tasa >= 80 ? "#22c55e" : u.tasa >= 50 ? "#f59e0b" : "#D32F2F", borderRadius: "3px", transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "9px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════
   ANUNCIOS
════════════════════════════════════ */
export function AnunciosWidget({ user }) {
  const [anuncios, setAnuncios] = useState(getAnuncios().filter(a => a.activo));
  const [showForm, setShowForm] = useState(false);
  const perms    = resolvePerms(user);
  const canPost  = perms.crearTareas;

  function handlePublicar(datos) {
    const nuevo = { id: Date.now(), ...datos, autorId: user.id, fecha: new Date().toISOString().split("T")[0], activo: true };
    const all   = [nuevo, ...getAnuncios()];
    saveAnuncios(all);
    setAnuncios(all.filter(a => a.activo));
    addHistorial(`${user.nombre} publicó el anuncio "${nuevo.titulo}"`, user.id, "anuncio");
    setShowForm(false);
  }

  function handleArchivar(id) {
    const all = getAnuncios().map(a => a.id === id ? { ...a, activo: false } : a);
    saveAnuncios(all);
    setAnuncios(all.filter(a => a.activo));
  }

  const prioColors = { alta: "#D32F2F", media: "#f59e0b", baja: "#22c55e" };
  const users_     = getUsers();

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "2px" }}>📢 ANUNCIOS</h3>
        {canPost && (
          <button onClick={() => setShowForm(true)} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: "6px", padding: "7px 14px", fontFamily: "var(--font-display)", fontSize: "12px", letterSpacing: "1px", cursor: "pointer" }}>+ PUBLICAR</button>
        )}
      </div>

      {anuncios.length === 0 ? (
        <p style={{ color: "var(--gray)", fontSize: "13px", fontStyle: "italic" }}>Sin anuncios activos.</p>
      ) : anuncios.map(a => {
        const pColor = prioColors[a.prioridad] || "var(--gray)";
        const autor  = users_.find(u => u.id === a.autorId);
        return (
          <div key={a.id} style={{ borderLeft: `3px solid ${pColor}`, paddingLeft: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>{a.titulo}</span>
                  <Badge color={pColor} label={a.prioridad.toUpperCase()} />
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px" }}>{a.contenido}</p>
                <div style={{ fontSize: "11px", color: "var(--gray)", fontFamily: "'Barlow Condensed'" }}>
                  {autor?.nombre} · {a.fecha}
                </div>
              </div>
              {canPost && (
                <button onClick={() => handleArchivar(a.id)} title="Archivar anuncio" style={{ background: "none", border: "none", color: "var(--gray)", cursor: "pointer", fontSize: "14px", flexShrink: 0, padding: "2px" }}>✕</button>
              )}
            </div>
          </div>
        );
      })}

      {showForm && (
        <KModal onClose={() => setShowForm(false)} width={460}>
          <NuevoAnuncioForm onPublicar={handlePublicar} onClose={() => setShowForm(false)} />
        </KModal>
      )}
    </div>
  );
}

function NuevoAnuncioForm({ onPublicar, onClose }) {
  const [titulo,    setTitulo]   = useState("");
  const [contenido, setContenido]= useState("");
  const [prioridad, setPrioridad]= useState("media");
  const [error,     setError]    = useState("");

  function handlePublicar() {
    if (!titulo.trim())    { setError("El título es obligatorio."); return; }
    if (!contenido.trim()) { setError("El contenido es obligatorio."); return; }
    onPublicar({ titulo: titulo.trim(), contenido: contenido.trim(), prioridad });
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "20px", paddingRight: "32px" }}>NUEVO ANUNCIO</h3>
      {error && <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {error}</div>}
      <FormGroup label="Título">
        <KInput value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del anuncio" />
      </FormGroup>
      <FormGroup label="Prioridad" mt={14}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["alta","media","baja"].map(p => (
            <button key={p} type="button" onClick={() => setPrioridad(p)} style={{
              flex: 1, padding: "8px",
              background: prioridad === p ? `${PRIORIDAD_COLOR[p]}22` : "var(--bg3)",
              border: `1px solid ${prioridad === p ? PRIORIDAD_COLOR[p] : "var(--border2)"}`,
              borderRadius: "6px", color: prioridad === p ? PRIORIDAD_COLOR[p] : "var(--gray2)",
              cursor: "pointer", fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase",
            }}>{p}</button>
          ))}
        </div>
      </FormGroup>
      <FormGroup label="Contenido" mt={14}>
        <KInput rows={4} value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribe el anuncio..." />
      </FormGroup>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handlePublicar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>Publicar</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   AUDITORÍA
════════════════════════════════════ */
export function AuditoriaTab({ user }) {
  const [historial,] = useState(getHistorial());
  const [users,]     = useState(getUsers());
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroUser, setFiltroUser] = useState("todos");

  const tiposMap = {
    todos:         "Todos",
    login:         "Login",
    tarea_estado:  "Estado tarea",
    tarea_nueva:   "Tarea nueva",
    reporte_nuevo: "Reporte entregado",
    reporte_estado:"Estado reporte",
    usuario_nuevo: "Usuario creado",
    anuncio:       "Anuncio",
    accion:        "Acción",
  };

  const tipoIcon = {
    login:          "🔑",
    tarea_estado:   "✓",
    tarea_nueva:    "➕",
    reporte_nuevo:  "📋",
    reporte_estado: "🔖",
    usuario_nuevo:  "👤",
    anuncio:        "📢",
    accion:         "⚡",
  };

  const filtrado = historial
    .filter(h => filtroTipo === "todos" || h.tipo === filtroTipo)
    .filter(h => filtroUser === "todos" || String(h.userId) === filtroUser);

  function getUserName(id) {
    return users.find(u => u.id === id)?.nombre || "Sistema";
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>LOG DE AUDITORÍA</h1>
        <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>{filtrado.length} registros · Solo visible para Administración</p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ ...sharedStyles.input, width: "auto", padding: "8px 14px", cursor: "pointer" }}>
          {Object.entries(tiposMap).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filtroUser} onChange={e => setFiltroUser(e.target.value)} style={{ ...sharedStyles.input, width: "auto", padding: "8px 14px", cursor: "pointer" }}>
          <option value="todos">Todos los usuarios</option>
          {users.map(u => <option key={u.id} value={String(u.id)}>{u.nombre}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {filtrado.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--gray)", fontSize: "14px" }}>Sin registros para estos filtros</div>
        ) : filtrado.map((h, i) => (
          <div key={h.id} style={{
            display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px",
            borderBottom: i < filtrado.length-1 ? "1px solid var(--border)" : "none",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
              {tipoIcon[h.tipo] || "⚡"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.msg}</p>
              <p style={{ fontSize: "11px", color: "var(--gray2)", marginTop: "2px", fontFamily: "'Barlow Condensed'" }}>
                {getUserName(h.userId)} · {h.fecha} {h.hora || ""}
              </p>
            </div>
            <span style={{
              fontSize: "10px", background: "var(--bg3)", color: "var(--gray2)",
              border: "1px solid var(--border2)", borderRadius: "8px",
              padding: "2px 8px", fontFamily: "'Barlow Condensed'", letterSpacing: "0.5px",
              flexShrink: 0,
            }}>{tiposMap[h.tipo] || h.tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   BACKUP / RESTAURACIÓN
════════════════════════════════════ */
export function BackupTab({ user }) {
  const [importando, setImportando] = useState(false);
  const [resultado,  setResultado]  = useState(null);
  const fileRef = useRef();

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportando(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const res = importBackup(ev.target.result);
      setResultado(res);
      setImportando(false);
      if (res.ok) {
        addHistorial(`${user.nombre} restauró un backup`, user.id, "accion");
        setTimeout(() => window.location.reload(), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const stats = {
    usuarios:   getUsers().length,
    tareas:     getTareas().length,
    reportes:   getReportes().length,
    plantillas: getPlantillas().length,
    anuncios:   getAnuncios().length,
    historial:  getHistorial().length,
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>BACKUP Y RESTAURACIÓN</h1>
        <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>Exporta o importa todos los datos del sistema</p>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", marginBottom: "14px" }}>ESTADO ACTUAL DEL SISTEMA</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: "10px" }}>
          {Object.entries(stats).map(([k,v]) => (
            <div key={k} style={{ background: "var(--bg3)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--red)", lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase", marginTop: "4px" }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", marginBottom: "8px" }}>📤 EXPORTAR BACKUP</h3>
        <p style={{ fontSize: "13px", color: "var(--gray2)", marginBottom: "14px", lineHeight: 1.6 }}>
          Descarga todos los datos del sistema en formato JSON.
        </p>
        <button onClick={exportBackup} style={{ ...sharedStyles.btnPrimario, padding: "12px 24px" }}>
          ⬇ Descargar Backup JSON
        </button>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", marginBottom: "8px" }}>📥 RESTAURAR BACKUP</h3>
        <div style={{ background: "rgba(211,47,47,0.08)", border: "1px solid rgba(211,47,47,0.2)", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px", fontSize: "12px", color: "#ef9a9a", lineHeight: 1.6 }}>
          ⚠️ <strong>Advertencia:</strong> Restaurar un backup reemplazará TODOS los datos actuales. Esta acción no puede deshacerse.
        </div>
        <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
        <button onClick={() => fileRef.current.click()} disabled={importando} style={{ ...sharedStyles.btnSecundario, padding: "12px 24px" }}>
          {importando ? "Importando..." : "📂 Seleccionar archivo JSON"}
        </button>
        {resultado && (
          <div style={{
            marginTop: "14px", padding: "12px 14px", borderRadius: "8px",
            background: resultado.ok ? "rgba(34,197,94,0.1)" : "rgba(211,47,47,0.1)",
            border: `1px solid ${resultado.ok ? "rgba(34,197,94,0.3)" : "rgba(211,47,47,0.3)"}`,
            fontSize: "13px", color: resultado.ok ? "#22c55e" : "#ef9a9a",
          }}>
            {resultado.ok ? "✅ Backup restaurado correctamente. Recargando..." : `❌ Error: ${resultado.error}`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   PERFIL PERSONAL
════════════════════════════════════ */
export function PerfilTab({ user, onUserUpdate }) {
  const [userData, setUserData] = useState(getUsers().find(u => u.id === user.id) || user);
  const stats    = getStatsUsuario(user.id);
  const roles    = getRoles();
  const historial= getHistorial().filter(h => h.userId === user.id).slice(0, 8);

  const tipoIcon = { login:"🔑", tarea_estado:"✓", tarea_nueva:"➕", reporte_nuevo:"📋", reporte_estado:"🔖", accion:"⚡", anuncio:"📢" };
  const rolColor = roles[userData.rolKey]?.color || "#888";

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1000px", margin: "0 auto" }}>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "16px",
            background: rolColor, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: "28px", color: "#fff", letterSpacing: "2px",
          }}>{userData.avatar}</div>
          <div style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "20px", height: "20px", borderRadius: "50%", background: "#22c55e", border: "3px solid var(--bg2)" }} />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "26px", letterSpacing: "2px", marginBottom: "4px" }}>{userData.nombre}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Badge color={rolColor} label={roles[userData.rolKey]?.label || userData.rolKey} />
            <span style={{ fontSize: "12px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>@{userData.user}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: stats.tasa >= 80 ? "#22c55e" : stats.tasa >= 50 ? "#f59e0b" : "var(--red)", lineHeight: 1 }}>{stats.tasa}%</div>
          <div style={{ fontSize: "11px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>TASA DE COMPL.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Tareas Total",    value: stats.total,       color: "var(--text)" },
          { label: "Completadas",     value: stats.completadas, color: "#22c55e" },
          { label: "En Proceso",      value: stats.enProceso,   color: "#60a5fa" },
          { label: "Pendientes",      value: stats.pendientes,  color: "#f59e0b" },
          { label: "Reportes",        value: stats.misReportes, color: "#a78bfa" },
          { label: "Aprobados",       value: stats.aprobados,   color: "#22c55e" },
        ].map((s,i) => (
          <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", marginBottom: "14px" }}>DISTRIBUCIÓN DE TAREAS</h3>
        {stats.total === 0 ? (
          <p style={{ color: "var(--gray)", fontSize: "13px" }}>Sin tareas asignadas aún.</p>
        ) : (
          <div>
            <div style={{ display: "flex", height: "20px", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" }}>
              {stats.completadas > 0 && <div style={{ flex: stats.completadas, background: "#22c55e" }} title={`Completadas: ${stats.completadas}`} />}
              {stats.enProceso   > 0 && <div style={{ flex: stats.enProceso,   background: "#60a5fa" }} title={`En proceso: ${stats.enProceso}`}   />}
              {stats.pendientes  > 0 && <div style={{ flex: stats.pendientes,  background: "#f59e0b" }} title={`Pendientes: ${stats.pendientes}`}  />}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[["#22c55e","Completadas",stats.completadas],["#60a5fa","En proceso",stats.enProceso],["#f59e0b","Pendientes",stats.pendientes]].map(([c,l,v]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--gray2)" }}>{l}: <strong style={{ color: "var(--text)" }}>{v}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", marginBottom: "14px" }}>MI ACTIVIDAD RECIENTE</h3>
        {historial.length === 0 ? (
          <p style={{ color: "var(--gray)", fontSize: "13px" }}>Sin actividad registrada.</p>
        ) : historial.map((h, i) => (
          <div key={h.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 0", borderBottom: i < historial.length-1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
              {tipoIcon[h.tipo] || "⚡"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5 }}>{h.msg}</p>
              <p style={{ fontSize: "10px", color: "var(--gray)", marginTop: "2px", fontFamily: "'Barlow Condensed'" }}>{h.fecha} {h.hora || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   PLANTILLAS DE REPORTE
════════════════════════════════════ */
export function PlantillasTab({ user }) {
  const [plantillas, setPlantillas] = useState(getPlantillas());
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [useModal,   setUseModal]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const perms    = resolvePerms(user);
  const canManage= perms.crearTareas;
  const users_   = getUsers();

  function refresh() { setPlantillas(getPlantillas()); }

  function handleGuardar(datos, id = null) {
    const all = getPlantillas();
    if (id) {
      savePlantillas(all.map(p => p.id === id ? { ...p, ...datos } : p));
    } else {
      savePlantillas([...all, { id: Date.now(), creadoPor: user.id, adjuntoEjemplo: null, ...datos }]);
    }
    refresh();
    setShowForm(false);
    setEditTarget(null);
  }

  function handleEliminar(id) {
    savePlantillas(getPlantillas().filter(p => p.id !== id));
    refresh();
    setConfirmDel(null);
  }

  function handleAdjuntarEjemplo(plantillaId, adj) {
    savePlantillas(getPlantillas().map(p => p.id === plantillaId ? { ...p, adjuntoEjemplo: adj } : p));
    refresh();
  }

  const tipoColors = { asistencia:"#a78bfa", mantenimiento:"#f97316", ventas:"#22c55e", clientes:"#60a5fa" };

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>PLANTILLAS</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>Formularios estándar para reportes</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)} style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontFamily: "var(--font-display)", fontSize: "14px", letterSpacing: "2px", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--red-dark)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
          >+ NUEVA PLANTILLA</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "12px" }}>
        {plantillas.map(p => {
          const tc     = tipoColors[p.tipo] || "var(--gray)";
          const creador= users_.find(u => u.id === p.creadoPor);
          return (
            <div key={p.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <Badge color={tc} label={p.tipo?.toUpperCase() || "GENERAL"} />
                <h4 style={{ fontWeight: 700, fontSize: "15px", marginTop: "8px" }}>{p.nombre}</h4>
                <p style={{ fontSize: "12px", color: "var(--gray2)", marginTop: "4px", lineHeight: 1.5 }}>{p.descripcion}</p>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: "8px", padding: "10px" }}>
                <p style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", marginBottom: "6px" }}>CAMPOS ({p.campos?.length || 0})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {(p.campos||[]).slice(0,4).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", color: tc, background: `${tc}18`, border: `1px solid ${tc}33`, borderRadius: "4px", padding: "1px 5px", fontFamily: "'Barlow Condensed'" }}>{c.tipo}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{c.label}{c.requerido && " *"}</span>
                    </div>
                  ))}
                  {p.campos?.length > 4 && <span style={{ fontSize: "11px", color: "var(--gray)" }}>+{p.campos.length-4} más</span>}
                </div>
              </div>
              {p.adjuntoEjemplo ? (
                <a href={p.adjuntoEjemplo.data} download={p.adjuntoEjemplo.nombre} style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg3)", borderRadius: "6px", padding: "8px 10px", textDecoration: "none", border: "1px solid var(--border)" }}>
                  <span>📎</span>
                  <span style={{ fontSize: "12px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.adjuntoEjemplo.nombre}</span>
                  <span style={{ fontSize: "11px", color: "var(--red)", marginLeft: "auto" }}>↓</span>
                </a>
              ) : canManage && (
                <AdjuntosSection adjuntos={[]} onAdd={adj => handleAdjuntarEjemplo(p.id, adj)} canAdd={true} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", color: "var(--gray2)" }}>{creador?.nombre}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => setUseModal(p)} style={{ background: "rgba(211,47,47,0.1)", border: "1px solid rgba(211,47,47,0.25)", borderRadius: "6px", padding: "5px 12px", color: "var(--red)", cursor: "pointer", fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>Usar</button>
                  {canManage && <>
                    <button onClick={() => setEditTarget(p)} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "5px 10px", color: "var(--gray2)", cursor: "pointer", fontSize: "12px" }}>✏️</button>
                    <button onClick={() => setConfirmDel(p.id)} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "5px 10px", color: "#ef9a9a", cursor: "pointer", fontSize: "12px" }}>🗑</button>
                  </>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {useModal && (
        <KModal onClose={() => setUseModal(null)} width={560}>
          <UsarPlantillaForm plantilla={useModal} user={user}
            onEnviar={(datos) => {
              const nuevo = { id: Date.now(), titulo: datos.titulo, tipo: useModal.tipo, contenido: JSON.stringify(datos.campos), adjuntos: [], fecha: new Date().toISOString().split("T")[0], autorId: user.id, estado: "pendiente", plantillaId: useModal.id };
              const all   = [nuevo, ...getReportes()];
              saveReportes(all);
              addHistorial(`${user.nombre} entregó reporte con plantilla "${useModal.nombre}"`, user.id, "reporte_nuevo");
              setUseModal(null);
            }}
            onClose={() => setUseModal(null)}
          />
        </KModal>
      )}

      {showForm && (
        <KModal onClose={() => setShowForm(false)} width={600}>
          <PlantillaForm onGuardar={datos => handleGuardar(datos)} onClose={() => setShowForm(false)} />
        </KModal>
      )}

      {editTarget && (
        <KModal onClose={() => setEditTarget(null)} width={600}>
          <PlantillaForm initial={editTarget} onGuardar={datos => handleGuardar(datos, editTarget.id)} onClose={() => setEditTarget(null)} />
        </KModal>
      )}

      {confirmDel && (
        <KModal onClose={() => setConfirmDel(null)} width={400}>
          <ConfirmDelete mensaje="¿Eliminar esta plantilla?" onConfirm={() => handleEliminar(confirmDel)} onCancel={() => setConfirmDel(null)} />
        </KModal>
      )}
    </div>
  );
}

function UsarPlantillaForm({ plantilla, user, onEnviar, onClose }) {
  const [titulo,  setTitulo]  = useState(`${plantilla.nombre} — ${new Date().toLocaleDateString("es-MX")}`);
  const [valores, setValores] = useState({});
  const [error,   setError]   = useState("");

  function handleEnviar() {
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    const faltantes = (plantilla.campos||[]).filter(c => c.requerido && !valores[c.id]?.trim());
    if (faltantes.length > 0) { setError(`Campos requeridos: ${faltantes.map(f=>f.label).join(", ")}`); return; }
    onEnviar({ titulo, campos: valores });
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "6px", paddingRight: "32px" }}>{plantilla.nombre}</h3>
      <p style={{ fontSize: "13px", color: "var(--gray2)", marginBottom: "20px" }}>{plantilla.descripcion}</p>
      {error && <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {error}</div>}
      <FormGroup label="Título del Reporte">
        <KInput value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" />
      </FormGroup>
      {(plantilla.campos||[]).map(c => (
        <FormGroup key={c.id} label={`${c.label}${c.requerido?" *":""}`} mt={14}>
          {c.tipo === "textarea" ? (
            <KInput rows={3} value={valores[c.id]||""} onChange={e => setValores(v=>({...v,[c.id]:e.target.value}))} placeholder={c.label} />
          ) : c.tipo === "select" ? (
            <select value={valores[c.id]||""} onChange={e => setValores(v=>({...v,[c.id]:e.target.value}))} style={{ ...sharedStyles.input, cursor: "pointer" }}>
              <option value="">Seleccionar...</option>
              {(c.opciones||[]).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <KInput type={c.tipo} value={valores[c.id]||""} onChange={e => setValores(v=>({...v,[c.id]:e.target.value}))} placeholder={c.label} />
          )}
        </FormGroup>
      ))}
      {plantilla.adjuntoEjemplo && (
        <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(211,47,47,0.06)", border: "1px solid rgba(211,47,47,0.15)", borderRadius: "8px", fontSize: "12px", color: "var(--gray2)" }}>
          📎 Documento de referencia: <a href={plantilla.adjuntoEjemplo.data} download={plantilla.adjuntoEjemplo.nombre} style={{ color: "var(--red)" }}>{plantilla.adjuntoEjemplo.nombre}</a>
        </div>
      )}
      <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleEnviar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>Enviar Reporte</button>
      </div>
    </div>
  );
}

function PlantillaForm({ initial, onGuardar, onClose }) {
  const isEdit = !!initial;
  const [nombre,      setNombre]     = useState(initial?.nombre      || "");
  const [tipo,        setTipo]       = useState(initial?.tipo        || "asistencia");
  const [descripcion, setDesc]       = useState(initial?.descripcion || "");
  const [campos,      setCampos]     = useState(initial?.campos      || []);
  const [error,       setError]      = useState("");

  function addCampo() {
    setCampos(prev => [...prev, { id: `campo_${Date.now()}`, label: "", tipo: "text", requerido: false }]);
  }
  function updateCampo(idx, key, val) {
    setCampos(prev => prev.map((c,i) => i===idx ? {...c,[key]:val} : c));
  }
  function removeCampo(idx) {
    setCampos(prev => prev.filter((_,i) => i!==idx));
  }

  function handleGuardar() {
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (campos.length === 0) { setError("Agrega al menos un campo."); return; }
    const vacios = campos.filter(c => !c.label.trim());
    if (vacios.length > 0) { setError("Todos los campos deben tener nombre."); return; }
    onGuardar({ nombre: nombre.trim(), tipo, descripcion: descripcion.trim(), campos });
  }

  const tipos = ["asistencia","mantenimiento","ventas","clientes"];
  const tiposCampo = ["text","number","textarea","select","date"];

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "20px", paddingRight: "32px" }}>
        {isEdit ? "EDITAR PLANTILLA" : "NUEVA PLANTILLA"}
      </h3>
      {error && <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {error}</div>}
      <FormGroup label="Nombre">
        <KInput value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la plantilla" />
      </FormGroup>
      <FormGroup label="Tipo" mt={14}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tipos.map(t => (
            <button key={t} type="button" onClick={() => setTipo(t)} style={{
              padding: "7px 14px",
              background: tipo === t ? "rgba(211,47,47,0.15)" : "var(--bg3)",
              border: `1px solid ${tipo === t ? "var(--red)" : "var(--border2)"}`,
              borderRadius: "6px", color: tipo === t ? "var(--red)" : "var(--gray2)",
              cursor: "pointer", fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase",
            }}>{t}</button>
          ))}
        </div>
      </FormGroup>
      <FormGroup label="Descripción" mt={14}>
        <KInput rows={2} value={descripcion} onChange={e => setDesc(e.target.value)} placeholder="Describe para qué sirve esta plantilla" />
      </FormGroup>
      <FormGroup label="Campos del Formulario" mt={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
          {campos.map((c, i) => (
            <div key={c.id} style={{ background: "var(--bg3)", borderRadius: "8px", padding: "10px 12px", border: "1px solid var(--border2)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <KInput value={c.label} onChange={e => updateCampo(i,"label",e.target.value)} placeholder="Nombre del campo" style={{ flex: 1, minWidth: "120px", padding: "8px 10px" }} />
              <select value={c.tipo} onChange={e => updateCampo(i,"tipo",e.target.value)} style={{ ...sharedStyles.input, width: "auto", padding: "8px 10px", cursor: "pointer" }}>
                {tiposCampo.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--gray2)", cursor: "pointer", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={c.requerido} onChange={e => updateCampo(i,"requerido",e.target.checked)} style={{ accentColor: "var(--red)" }} />
                Req.
              </label>
              <button onClick={() => removeCampo(i)} style={{ background: "none", border: "none", color: "#ef9a9a", cursor: "pointer", fontSize: "16px", padding: "2px" }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={addCampo} style={{ ...sharedStyles.btnSecundario, width: "100%", textAlign: "center", fontSize: "13px", padding: "8px" }}>+ Agregar Campo</button>
      </FormGroup>
      <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleGuardar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>{isEdit ? "Guardar Cambios" : "Crear Plantilla"}</button>
      </div>
    </div>
  );
}
