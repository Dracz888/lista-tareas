import { useState } from 'react';
import {
  getTareas, saveTareas, getUsers, getEtiquetas, getRoles,
  resolvePerms, addHistorial, addNotif, getTareaUrgencia
} from './data.js';
import {
  PRIORIDAD_COLOR, ESTADO_BADGE, sharedStyles,
  KModal, FormGroup, KInput, Badge, AdjuntosSection, ConfirmDelete
} from './shared.jsx';

export function TareasTab({ user }) {
  const [tareas,     setTareas]    = useState(getTareas());
  const [users,      setUsersLocal]= useState(getUsers());
  const [etiquetas,  setEtiquetas] = useState(getEtiquetas());
  const [filtro,     setFiltro]    = useState("todas");
  const [filtroEtiq, setFiltroEtiq]= useState(null);
  const [modalTarea, setModalTarea]= useState(null);
  const [showForm,   setShowForm]  = useState(false);
  const [confirmDel, setConfirmDel]= useState(null);

  const perms       = resolvePerms(user);
  const canVerTodo  = perms.verTodos;
  const canCrear    = perms.crearTareas;
  const canEliminar = perms.eliminarTareas;

  function refresh() {
    const t = getTareas();
    setTareas(t);
    if (modalTarea) {
      const upd = t.find(x => x.id === modalTarea.id);
      if (upd) setModalTarea(upd);
    }
  }

  const visibles = canVerTodo
    ? tareas
    : tareas.filter(t => t.asignadoA.includes(user.id));

  const filtradas = (filtro === "todas" ? visibles : visibles.filter(t => t.estado === filtro))
    .filter(t => !filtroEtiq || (t.etiquetas || []).includes(filtroEtiq))
    .map(t => ({ ...t, dias: getTareaUrgencia(t.fecha) }))
    .sort((a, b) => {
      if (a.estado === "completada" && b.estado !== "completada") return 1;
      if (b.estado === "completada" && a.estado !== "completada") return -1;
      if (a.dias === null) return 1;
      if (b.dias === null) return -1;
      return a.dias - b.dias;
    });

  const counts = {
    todas:      visibles.length,
    pendiente:  visibles.filter(t => t.estado === "pendiente").length,
    en_proceso: visibles.filter(t => t.estado === "en_proceso").length,
    completada: visibles.filter(t => t.estado === "completada").length,
  };

  const urgentCount = visibles.filter(t => t.estado !== "completada" && getTareaUrgencia(t.fecha) !== null && getTareaUrgencia(t.fecha) <= 1).length;

  function getUserName(id) {
    const u = users.find(x => x.id === id);
    return u ? u.nombre : "—";
  }

  function handleCambiarEstado(tareaId, nuevoEstado) {
    const tarea = getTareas().find(t => t.id === tareaId);
    const updated = getTareas().map(t => t.id === tareaId ? { ...t, estado: nuevoEstado } : t);
    saveTareas(updated);
    addHistorial(`${user.nombre} cambió "${tarea?.titulo}" a ${ESTADO_BADGE[nuevoEstado]?.label}`, user.id, "tarea_estado");
    refresh();
  }

  function handleAgregarAdjunto(tareaId, adj) {
    const updated = getTareas().map(t =>
      t.id === tareaId ? { ...t, adjuntos: [...(t.adjuntos || []), adj] } : t
    );
    saveTareas(updated);
    refresh();
  }

  function handleActualizarDesc(tareaId, desc) {
    saveTareas(getTareas().map(t => t.id === tareaId ? { ...t, descripcion: desc } : t));
    refresh();
  }

  function handleAgregarComentario(tareaId, texto) {
    const nuevo = { id: Date.now(), userId: user.id, texto, fecha: new Date().toLocaleDateString("es-MX") };
    saveTareas(getTareas().map(t =>
      t.id === tareaId ? { ...t, comentarios: [...(t.comentarios || []), nuevo] } : t
    ));
    refresh();
  }

  function handleActualizarEtiquetas(tareaId, etiqIds) {
    saveTareas(getTareas().map(t => t.id === tareaId ? { ...t, etiquetas: etiqIds } : t));
    refresh();
  }

  function handleEliminar(tareaId) {
    const tarea = getTareas().find(t => t.id === tareaId);
    saveTareas(getTareas().filter(t => t.id !== tareaId));
    addHistorial(`${user.nombre} eliminó la tarea "${tarea?.titulo}"`, user.id, "accion");
    setTareas(getTareas());
    setModalTarea(null);
    setConfirmDel(null);
  }

  function handleCrearTarea(nueva) {
    const all = [nueva, ...getTareas()];
    saveTareas(all);
    setTareas(all);
    addHistorial(`${user.nombre} creó la tarea "${nueva.titulo}"`, user.id, "tarea_nueva");
    nueva.asignadoA.forEach(uid => {
      if (uid !== user.id) addNotif(uid, `Se te asignó la tarea "${nueva.titulo}"`);
    });
    setShowForm(false);
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>TAREAS</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>
            {canVerTodo ? "Vista completa — todas las áreas" : `Tareas de ${user.nombre.split(" ")[0]}`}
            {urgentCount > 0 && <span style={{ color: "#D32F2F", marginLeft: "10px", fontWeight: 600 }}>⚠ {urgentCount} urgente{urgentCount > 1 ? "s" : ""}</span>}
          </p>
        </div>
        {canCrear && (
          <button onClick={() => setShowForm(true)} style={{
            background: "var(--red)", color: "#fff", border: "none",
            borderRadius: "8px", padding: "10px 20px",
            fontFamily: "var(--font-display)", fontSize: "14px", letterSpacing: "2px", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--red-dark)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
          >+ NUEVA TAREA</button>
        )}
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button onClick={() => setFiltroEtiq(null)} style={{
          background: !filtroEtiq ? "var(--bg3)" : "transparent",
          border: `1px solid ${!filtroEtiq ? "var(--border2)" : "var(--border)"}`,
          borderRadius: "14px", padding: "4px 12px",
          fontSize: "11px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px",
          color: !filtroEtiq ? "var(--text)" : "var(--gray)", cursor: "pointer",
        }}>Todas</button>
        {etiquetas.map(e => (
          <button key={e.id} onClick={() => setFiltroEtiq(filtroEtiq === e.id ? null : e.id)} style={{
            background: filtroEtiq === e.id ? `${e.color}22` : "transparent",
            border: `1px solid ${filtroEtiq === e.id ? e.color : "var(--border)"}`,
            borderRadius: "14px", padding: "4px 12px",
            fontSize: "11px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px",
            color: filtroEtiq === e.id ? e.color : "var(--gray)", cursor: "pointer",
          }}>{e.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { key: "todas",      label: "Todas" },
          { key: "pendiente",  label: "Pendientes" },
          { key: "en_proceso", label: "En Proceso" },
          { key: "completada", label: "Completadas" },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{
            background: filtro === f.key ? "rgba(211,47,47,0.15)" : "var(--bg2)",
            border: filtro === f.key ? "1px solid var(--red)" : "1px solid var(--border)",
            borderRadius: "20px", padding: "6px 16px",
            fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px",
            color: filtro === f.key ? "var(--red)" : "var(--gray2)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {f.label}
            <span style={{
              background: filtro === f.key ? "var(--red)" : "var(--border2)",
              color: filtro === f.key ? "#fff" : "var(--gray)",
              borderRadius: "10px", padding: "1px 7px", fontSize: "10px",
            }}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--gray)", fontFamily: "'Barlow Condensed'", fontSize: "16px", letterSpacing: "2px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✓</div>
            SIN TAREAS EN ESTA CATEGORÍA
          </div>
        ) : filtradas.map(tarea => (
          <TareaRow
            key={tarea.id}
            tarea={tarea}
            etiquetas={etiquetas}
            getUserName={getUserName}
            onClick={() => setModalTarea(tarea)}
          />
        ))}
      </div>

      {modalTarea && (
        <KModal onClose={() => setModalTarea(null)} width={600}>
          <DetalleTareaModal
            tarea={modalTarea}
            user={user}
            users={users}
            etiquetas={etiquetas}
            perms={perms}
            onCambiarEstado={handleCambiarEstado}
            onAgregarAdjunto={handleAgregarAdjunto}
            onActualizarDesc={handleActualizarDesc}
            onAgregarComentario={handleAgregarComentario}
            onActualizarEtiquetas={handleActualizarEtiquetas}
            onEliminar={(id) => { setModalTarea(null); setConfirmDel(id); }}
            onClose={() => setModalTarea(null)}
            getUserName={getUserName}
          />
        </KModal>
      )}

      {confirmDel && (
        <KModal onClose={() => setConfirmDel(null)} width={400}>
          <ConfirmDelete
            mensaje="¿Eliminar esta tarea permanentemente? Esta acción no puede deshacerse."
            onConfirm={() => handleEliminar(confirmDel)}
            onCancel={() => setConfirmDel(null)}
          />
        </KModal>
      )}

      {showForm && (
        <KModal onClose={() => setShowForm(false)}>
          <NuevaTareaForm
            user={user}
            users={users}
            etiquetas={etiquetas}
            onGuardar={handleCrearTarea}
            onClose={() => setShowForm(false)}
          />
        </KModal>
      )}
    </div>
  );
}

function TareaRow({ tarea, etiquetas, getUserName, onClick }) {
  const [hov, setHov] = useState(false);
  const est    = ESTADO_BADGE[tarea.estado];
  const pColor = PRIORIDAD_COLOR[tarea.prioridad];
  const nombres= (tarea.asignadoA || []).map(getUserName).join(", ");
  const dias   = tarea.dias !== undefined ? tarea.dias : getTareaUrgencia(tarea.fecha);
  const vencida= dias !== null && dias < 0 && tarea.estado !== "completada";
  const urgente= dias !== null && dias <= 1 && dias >= 0 && tarea.estado !== "completada";
  const tareaEtiq = etiquetas.filter(e => (tarea.etiquetas || []).includes(e.id));

  let borderColor = pColor;
  if (vencida) borderColor = "#D32F2F";
  else if (urgente) borderColor = "#f97316";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: vencida ? "rgba(211,47,47,0.04)" : hov ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${vencida ? "rgba(211,47,47,0.25)" : hov ? "var(--border2)" : "var(--border)"}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "8px", padding: "14px 16px",
        cursor: "pointer", transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: "14px",
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: borderColor, flexShrink: 0,
        ...(vencida || urgente ? { animation: "pulse 1.5s infinite" } : {}) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{tarea.titulo}</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "3px" }}>
          {tareaEtiq.map(e => (
            <span key={e.id} style={{
              fontSize: "10px", color: e.color, background: `${e.color}18`,
              border: `1px solid ${e.color}33`, borderRadius: "8px", padding: "1px 7px",
              fontFamily: "'Barlow Condensed'", letterSpacing: "0.5px",
            }}>{e.label}</span>
          ))}
        </div>
        <div style={{ fontSize: "12px", color: "var(--gray2)" }}>
          {nombres && <span style={{ marginRight: "10px" }}>👤 {nombres}</span>}
          {(tarea.adjuntos?.length > 0) && <span style={{ marginRight: "8px" }}>📎 {tarea.adjuntos.length}</span>}
          {(tarea.comentarios?.length > 0) && <span>💬 {tarea.comentarios.length}</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
        <Badge color={est.color} bg={est.bg} label={est.label} />
        {dias !== null && tarea.estado !== "completada" && (
          <span style={{
            fontSize: "10px",
            color: vencida ? "#D32F2F" : urgente ? "#f97316" : "var(--gray)",
            fontFamily: "'Barlow Condensed'", letterSpacing: "0.5px",
          }}>
            {vencida ? `Venció hace ${Math.abs(dias)}d` : dias === 0 ? "Vence hoy" : `${dias}d restantes`}
          </span>
        )}
      </div>
    </div>
  );
}

function DetalleTareaModal({ tarea, user, users, etiquetas, perms, onCambiarEstado, onAgregarAdjunto, onActualizarDesc, onAgregarComentario, onActualizarEtiquetas, onEliminar, onClose, getUserName }) {
  const [desc,       setDesc]      = useState(tarea.descripcion || "");
  const [editDesc,   setEditDesc]  = useState(false);
  const [adjuntos,   setAdjuntos]  = useState(tarea.adjuntos || []);
  const [comentarios,setComents]   = useState(tarea.comentarios || []);
  const [nuevoComent,setNuevoCom]  = useState("");
  const [tareaEtiq,  setTareaEtiq] = useState(tarea.etiquetas || []);
  const [showEtiq,   setShowEtiq]  = useState(false);

  const est    = ESTADO_BADGE[tarea.estado];
  const pColor = PRIORIDAD_COLOR[tarea.prioridad];
  const dias   = getTareaUrgencia(tarea.fecha);
  const isAsignado  = (tarea.asignadoA || []).includes(user.id);
  const canEditDesc = perms.crearTareas || isAsignado;
  const canAddAdj   = perms.crearTareas || isAsignado;
  const canCambiarE = perms.crearTareas || isAsignado;
  const canDel      = perms.eliminarTareas;
  const nombres     = (tarea.asignadoA || []).map(id => users.find(u => u.id === id)?.nombre || "—").join(", ");

  function saveDesc() { onActualizarDesc(tarea.id, desc); setEditDesc(false); }
  function handleAddAdj(adj) { const nl = [...adjuntos, adj]; setAdjuntos(nl); onAgregarAdjunto(tarea.id, adj); }
  function handleComent() {
    if (!nuevoComent.trim()) return;
    const c = { id: Date.now(), userId: user.id, texto: nuevoComent.trim(), fecha: new Date().toLocaleDateString("es-MX") };
    setComents(prev => [...prev, c]);
    onAgregarComentario(tarea.id, nuevoComent.trim());
    setNuevoCom("");
  }
  function toggleEtiq(id) {
    const newList = tareaEtiq.includes(id) ? tareaEtiq.filter(x => x !== id) : [...tareaEtiq, id];
    setTareaEtiq(newList);
    onActualizarEtiquetas(tarea.id, newList);
  }

  return (
    <div>
      <div style={{ borderLeft: `4px solid ${pColor}`, paddingLeft: "12px", marginBottom: "16px", paddingRight: "32px" }}>
        <span style={{ fontSize: "10px", color: pColor, fontFamily: "'Barlow Condensed'", letterSpacing: "2px", textTransform: "uppercase" }}>Prioridad {tarea.prioridad}</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginTop: "4px" }}>{tarea.titulo}</h3>
      </div>

      {dias !== null && tarea.estado !== "completada" && dias <= 2 && (
        <div style={{
          background: dias < 0 ? "rgba(211,47,47,0.12)" : "rgba(249,115,22,0.10)",
          border: `1px solid ${dias < 0 ? "rgba(211,47,47,0.3)" : "rgba(249,115,22,0.3)"}`,
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          fontSize: "13px", color: dias < 0 ? "#ef9a9a" : "#fdba74",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          {dias < 0 ? "🚨" : "⚠️"}
          {dias < 0 ? `Esta tarea venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}` :
           dias === 0 ? "Esta tarea vence hoy" : `Esta tarea vence en ${dias} día${dias !== 1 ? "s" : ""}`}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
        <InfoItemLocal label="Fecha límite" value={tarea.fecha} />
        <InfoItemLocal label="Asignado a"  value={nombres || "—"} />
        <InfoItemLocal label="Estado"><span style={{ color: est.color, fontWeight: 600 }}>{est.label}</span></InfoItemLocal>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <label style={sharedStyles.label}>Etiquetas</label>
          {(canEditDesc) && (
            <button onClick={() => setShowEtiq(!showEtiq)} style={{
              background: "none", border: "none", color: "var(--red)",
              fontSize: "12px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "1px",
            }}>{showEtiq ? "✓ Listo" : "✏️ Editar"}</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {etiquetas.map(e => {
            const active = tareaEtiq.includes(e.id);
            return (
              <span
                key={e.id}
                onClick={showEtiq ? () => toggleEtiq(e.id) : undefined}
                style={{
                  fontSize: "11px", color: active ? e.color : "var(--gray)",
                  background: active ? `${e.color}18` : "var(--bg3)",
                  border: `1px solid ${active ? e.color + "44" : "var(--border2)"}`,
                  borderRadius: "10px", padding: "3px 10px",
                  fontFamily: "'Barlow Condensed'", letterSpacing: "0.5px",
                  cursor: showEtiq ? "pointer" : "default",
                  transition: "all 0.15s",
                  opacity: showEtiq ? 1 : (active ? 1 : 0.4),
                }}
              >{e.label}</span>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <label style={sharedStyles.label}>Descripción</label>
          {canEditDesc && !editDesc && (
            <button onClick={() => setEditDesc(true)} style={{ background: "none", border: "none", color: "var(--red)", fontSize: "12px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>✏️ Editar</button>
          )}
        </div>
        {editDesc ? (
          <div>
            <KInput rows={4} value={desc} onChange={e => setDesc(e.target.value)} />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button onClick={() => setEditDesc(false)} style={{ ...sharedStyles.btnSecundario, padding: "8px 16px", fontSize: "12px" }}>Cancelar</button>
              <button onClick={saveDesc} style={{ ...sharedStyles.btnPrimario, padding: "8px 16px", fontSize: "12px" }}>Guardar</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.6, background: "var(--bg3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            {desc || <span style={{ color: "var(--gray)", fontStyle: "italic" }}>Sin descripción.</span>}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={sharedStyles.label}>Archivos Adjuntos ({adjuntos.length})</label>
        <AdjuntosSection adjuntos={adjuntos} onAdd={handleAddAdj} canAdd={canAddAdj} />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={sharedStyles.label}>Comentarios ({comentarios.length})</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", marginBottom: "8px" }}>
          {comentarios.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--gray)", fontStyle: "italic", padding: "8px" }}>Sin comentarios aún.</p>
          )}
          {comentarios.map(c => {
            const autor = users.find(u => u.id === c.userId);
            return (
              <div key={c.id} style={{ background: "var(--bg3)", borderRadius: "8px", padding: "10px 12px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "4px", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff", fontFamily: "'Bebas Neue'" }}>{autor?.avatar || "??"}</div>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{autor?.nombre || "Usuario"}</span>
                  <span style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "'Barlow Condensed'" }}>{c.fecha}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.5 }}>{c.texto}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <KInput
            value={nuevoComent}
            onChange={e => setNuevoCom(e.target.value)}
            placeholder="Escribe un comentario..."
            style={{ flex: 1 }}
          />
          <button onClick={handleComent} style={{ ...sharedStyles.btnPrimario, padding: "10px 16px", fontSize: "13px", whiteSpace: "nowrap" }}>Enviar</button>
        </div>
      </div>

      {canCambiarE && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginBottom: "12px" }}>
          <label style={{ ...sharedStyles.label, marginBottom: "10px" }}>Cambiar Estado</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(ESTADO_BADGE).map(([key, val]) => (
              <button key={key} onClick={() => onCambiarEstado(tarea.id, key)} style={{
                padding: "8px 16px",
                background: tarea.estado === key ? val.bg : "var(--bg3)",
                border: `1px solid ${tarea.estado === key ? val.color : "var(--border2)"}`,
                borderRadius: "6px", color: tarea.estado === key ? val.color : "var(--gray2)",
                fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", cursor: "pointer",
              }}>{val.label}</button>
            ))}
          </div>
        </div>
      )}

      {canDel && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
          <button onClick={() => { onClose(); onEliminar(tarea.id); }} style={{ ...sharedStyles.btnDanger, width: "100%", textAlign: "center" }}>🗑 Eliminar Tarea</button>
        </div>
      )}
    </div>
  );
}

function InfoItemLocal({ label, value, children }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: "var(--text-dim)", fontWeight: 500 }}>{children || value}</div>
    </div>
  );
}

function NuevaTareaForm({ user, users, etiquetas, onGuardar, onClose }) {
  const [titulo,      setTitulo]    = useState("");
  const [prioridad,   setPrioridad] = useState("media");
  const [descripcion, setDesc]      = useState("");
  const [fecha,       setFecha]     = useState("");
  const [asignadoA,   setAsignadoA] = useState([]);
  const [adjuntos,    setAdjuntos]  = useState([]);
  const [selEtiq,     setSelEtiq]   = useState([]);
  const [error,       setError]     = useState("");

  const opcionesUsuarios = user.rolKey === "ADM"
    ? users.filter(u => u.activo)
    : user.rolKey === "GM"
      ? users.filter(u => u.activo && u.rolKey !== "ADM")
      : users.filter(u => u.activo && u.id === user.id);

  function toggleAsignado(id) {
    setAsignadoA(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleEtiq(id) {
    setSelEtiq(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleGuardar() {
    if (!titulo.trim())         { setError("El título es obligatorio."); return; }
    if (asignadoA.length === 0) { setError("Selecciona al menos un responsable."); return; }
    onGuardar({
      id: Date.now(), titulo: titulo.trim(), prioridad, descripcion,
      fecha: fecha || new Date().toISOString().split("T")[0],
      asignadoA, creadoPor: user.id, estado: "pendiente",
      adjuntos, comentarios: [], etiquetas: selEtiq,
    });
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "20px", paddingRight: "32px" }}>NUEVA TAREA</h3>

      {error && (
        <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {error}</div>
      )}

      <FormGroup label="Título">
        <KInput value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Nombre de la tarea" />
      </FormGroup>

      <FormGroup label="Prioridad" mt={14}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["alta", "media", "baja"].map(p => (
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

      <FormGroup label="Fecha Límite" mt={14}>
        <KInput type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ colorScheme: "dark" }} />
      </FormGroup>

      <FormGroup label="Etiquetas" mt={14}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {etiquetas.map(e => (
            <span key={e.id} onClick={() => toggleEtiq(e.id)} style={{
              fontSize: "12px", color: selEtiq.includes(e.id) ? e.color : "var(--gray)",
              background: selEtiq.includes(e.id) ? `${e.color}18` : "var(--bg3)",
              border: `1px solid ${selEtiq.includes(e.id) ? e.color + "44" : "var(--border2)"}`,
              borderRadius: "10px", padding: "4px 12px",
              fontFamily: "'Barlow Condensed'", letterSpacing: "0.5px", cursor: "pointer",
              transition: "all 0.15s",
            }}>{e.label}</span>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Asignar a" mt={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto", background: "var(--bg3)", borderRadius: "8px", padding: "8px", border: "1px solid var(--border2)" }}>
          {opcionesUsuarios.map(u => {
            const roles = getRoles();
            return (
              <label key={u.id} style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px", borderRadius: "6px", cursor: "pointer",
                background: asignadoA.includes(u.id) ? "rgba(211,47,47,0.1)" : "transparent",
              }}>
                <input type="checkbox" checked={asignadoA.includes(u.id)} onChange={() => toggleAsignado(u.id)} style={{ accentColor: "var(--red)", width: "15px", height: "15px" }} />
                <div style={{ width: "26px", height: "26px", background: asignadoA.includes(u.id) ? "var(--red)" : "var(--border2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontFamily: "'Bebas Neue'", flexShrink: 0 }}>{u.avatar}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{u.nombre}</div>
                  <div style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>{roles[u.rolKey]?.label || u.rolKey}</div>
                </div>
              </label>
            );
          })}
        </div>
      </FormGroup>

      <FormGroup label="Descripción" mt={14}>
        <KInput rows={3} value={descripcion} onChange={e => setDesc(e.target.value)} placeholder="Detalla la tarea..." />
      </FormGroup>

      <FormGroup label="Archivos Adjuntos" mt={14}>
        <AdjuntosSection adjuntos={adjuntos} onAdd={adj => setAdjuntos(prev => [...prev, adj])} canAdd={true} />
      </FormGroup>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleGuardar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>Crear Tarea</button>
      </div>
    </div>
  );
}
