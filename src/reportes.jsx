import { useState } from 'react';
import {
  getReportes, saveReportes, getUsers, resolvePerms,
  addHistorial, addNotif
} from './data.js';
import {
  REPORTE_ESTADO, REPORTE_TIPO_COLOR, sharedStyles,
  KModal, FormGroup, KInput, Badge, AdjuntosSection, InfoItem
} from './shared.jsx';

export function ReportesTab({ user }) {
  const [reportes,     setReportes]     = useState(getReportes());
  const [users]                         = useState(getUsers());
  const [showForm,     setShowForm]     = useState(false);
  const [detalle,      setDetalle]      = useState(null);
  const [enviado,      setEnviado]      = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const perms      = resolvePerms(user);
  const canVerTodo = perms.canSeeAll;

  const visibles  = canVerTodo ? reportes : reportes.filter(r => r.autorId === user.id);
  const filtrados = filtroEstado === "todos" ? visibles : visibles.filter(r => r.estado === filtroEstado);

  const counts = {
    todos:     visibles.length,
    pendiente: visibles.filter(r => r.estado === "pendiente").length,
    revision:  visibles.filter(r => r.estado === "revision").length,
    aprobado:  visibles.filter(r => r.estado === "aprobado").length,
  };

  function getUserName(id) {
    const u = users.find(x => x.id === id);
    return u ? u.nombre : "—";
  }

  function handleEnviar(datos) {
    const nuevo = {
      id: Date.now(), titulo: datos.titulo, tipo: datos.tipo,
      contenido: datos.contenido, adjuntos: datos.adjuntos,
      fecha: new Date().toISOString().split("T")[0],
      autorId: user.id, estado: "pendiente",
    };
    const updated = [nuevo, ...getReportes()];
    saveReportes(updated);
    setReportes(updated);
    addHistorial(`${user.nombre} entregó "${nuevo.titulo}"`, user.id, "reporte_nuevo");
    setEnviado(true);
    setTimeout(() => { setEnviado(false); setShowForm(false); }, 2200);
  }

  function handleCambiarEstado(id, estado) {
    const updated = getReportes().map(r => r.id === id ? { ...r, estado } : r);
    saveReportes(updated);
    setReportes(updated);
    const rep = reportes.find(r => r.id === id);
    addHistorial(`${user.nombre} marcó "${rep?.titulo}" como ${REPORTE_ESTADO[estado]?.label}`, user.id, "reporte_estado");
    const autor = getUsers().find(u => u.id === rep?.autorId);
    if (autor && autor.id !== user.id) addNotif(autor.id, `Tu reporte "${rep?.titulo}" fue marcado como ${REPORTE_ESTADO[estado]?.label}`);
    if (detalle?.id === id) setDetalle(prev => ({ ...prev, estado }));
  }

  function handleAgregarAdjunto(id, adj) {
    const updated = getReportes().map(r =>
      r.id === id ? { ...r, adjuntos: [...(r.adjuntos || []), adj] } : r
    );
    saveReportes(updated);
    setReportes(updated);
    if (detalle?.id === id) setDetalle(prev => ({ ...prev, adjuntos: [...(prev.adjuntos || []), adj] }));
  }

  function exportarCSV() {
    const headers = ["Título","Tipo","Estado","Autor","Fecha","Contenido"];
    const rows = filtrados.map(r => [
      `"${r.titulo}"`,
      r.tipo,
      REPORTE_ESTADO[r.estado]?.label || r.estado,
      `"${getUserName(r.autorId)}"`,
      r.fecha,
      `"${(r.contenido || "").replace(/"/g, "'")}"`,
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `reportes-komplex-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarPDF() {
    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Reportes Komplex GYM</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 32px; }
          h1 { font-size: 28px; letter-spacing: 4px; margin-bottom: 4px; }
          p.sub { color: #666; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #D32F2F; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; letter-spacing: 1px; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; vertical-align: top; }
          tr:nth-child(even) td { background: #f9f9f9; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; }
          .aprobado { background: #dcfce7; color: #166534; }
          .revision { background: #dbeafe; color: #1e40af; }
          .pendiente { background: #fef9c3; color: #854d0e; }
        </style>
      </head>
      <body>
        <h1>KOMPLEX GYM</h1>
        <p class="sub">Reporte generado el ${new Date().toLocaleDateString("es-MX")} — ${filtrados.length} registros</p>
        <table>
          <thead><tr><th>Título</th><th>Tipo</th><th>Estado</th><th>Autor</th><th>Fecha</th><th>Contenido</th></tr></thead>
          <tbody>
            ${filtrados.map(r => `
              <tr>
                <td><strong>${r.titulo}</strong></td>
                <td>${r.tipo}</td>
                <td><span class="badge ${r.estado}">${REPORTE_ESTADO[r.estado]?.label || r.estado}</span></td>
                <td>${getUserName(r.autorId)}</td>
                <td>${r.fecha}</td>
                <td>${r.contenido || "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([contenido], { type: "text/html;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const w    = window.open(url, "_blank");
    if (w) setTimeout(() => { w.print(); }, 600);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>REPORTES</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>
            {canVerTodo ? "Todos los reportes del equipo" : "Tus reportes entregados"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={exportarCSV} style={{ ...sharedStyles.btnSecundario, padding: "9px 14px", fontSize: "12px" }}
              title="Exportar como CSV">📊 CSV</button>
            <button onClick={exportarPDF} style={{ ...sharedStyles.btnSecundario, padding: "9px 14px", fontSize: "12px" }}
              title="Exportar e imprimir PDF">🖨 PDF</button>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: "var(--red)", color: "#fff", border: "none",
            borderRadius: "8px", padding: "10px 20px",
            fontFamily: "var(--font-display)", fontSize: "14px", letterSpacing: "2px", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--red-dark)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--red)"}
          >+ ENTREGAR REPORTE</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { key: "todos",     label: "Todos" },
          { key: "pendiente", label: "Pendientes" },
          { key: "revision",  label: "En Revisión" },
          { key: "aprobado",  label: "Aprobados" },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroEstado(f.key)} style={{
            background: filtroEstado === f.key ? "rgba(211,47,47,0.15)" : "var(--bg2)",
            border: filtroEstado === f.key ? "1px solid var(--red)" : "1px solid var(--border)",
            borderRadius: "20px", padding: "6px 16px",
            fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px",
            color: filtroEstado === f.key ? "var(--red)" : "var(--gray2)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            {f.label}
            <span style={{
              background: filtroEstado === f.key ? "var(--red)" : "var(--border2)",
              color: filtroEstado === f.key ? "#fff" : "var(--gray)",
              borderRadius: "10px", padding: "1px 7px", fontSize: "10px",
            }}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "12px" }}>
        {filtrados.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "var(--gray)", fontFamily: "'Barlow Condensed'", fontSize: "16px", letterSpacing: "2px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>SIN REPORTES
          </div>
        ) : filtrados.map(r => (
          <ReporteCard key={r.id} reporte={r} getUserName={getUserName} onClick={() => setDetalle(r)} />
        ))}
      </div>

      {detalle && (
        <KModal onClose={() => setDetalle(null)} width={560}>
          <DetalleReporteModal
            reporte={detalle} user={user} getUserName={getUserName}
            canVerTodo={canVerTodo}
            onCambiarEstado={handleCambiarEstado}
            onAgregarAdjunto={handleAgregarAdjunto}
            onClose={() => setDetalle(null)}
          />
        </KModal>
      )}

      {showForm && (
        <KModal onClose={() => setShowForm(false)}>
          {enviado ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "50px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#22c55e", letterSpacing: "2px" }}>REPORTE ENVIADO</h3>
              <p style={{ color: "var(--gray2)", marginTop: "8px" }}>Tu reporte fue recibido correctamente.</p>
            </div>
          ) : (
            <NuevoReporteForm onEnviar={handleEnviar} onClose={() => setShowForm(false)} />
          )}
        </KModal>
      )}
    </div>
  );
}

function ReporteCard({ reporte, getUserName, onClick }) {
  const [hov, setHov] = useState(false);
  const est    = REPORTE_ESTADO[reporte.estado];
  const tColor = REPORTE_TIPO_COLOR[reporte.tipo] || "var(--gray)";
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? "var(--bg3)" : "var(--bg2)",
      border: `1px solid ${hov ? "var(--border2)" : "var(--border)"}`,
      borderRadius: "10px", padding: "16px", transition: "all 0.15s", cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <Badge color={tColor} label={reporte.tipo.toUpperCase()} />
        <Badge color={est.color} bg={est.bg} label={est.label} />
      </div>
      <h4 style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px", lineHeight: 1.4 }}>{reporte.titulo}</h4>
      <p style={{ fontSize: "12px", color: "var(--gray2)", lineHeight: 1.5, marginBottom: "10px" }}>
        {(reporte.contenido || "").slice(0, 80)}{reporte.contenido?.length > 80 ? "…" : ""}
      </p>
      {reporte.adjuntos?.length > 0 && (
        <div style={{ fontSize: "11px", color: "var(--gray)", marginBottom: "10px" }}>📎 {reporte.adjuntos.length} adjunto(s)</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "12px", color: "var(--gray2)" }}>{getUserName(reporte.autorId)}</span>
        <span style={{ fontSize: "11px", color: "var(--gray)", fontFamily: "'Barlow Condensed'" }}>{reporte.fecha}</span>
      </div>
    </div>
  );
}

function DetalleReporteModal({ reporte, user, getUserName, canVerTodo, onCambiarEstado, onAgregarAdjunto, onClose }) {
  const [adjuntos, setAdjuntos] = useState(reporte.adjuntos || []);
  const est    = REPORTE_ESTADO[reporte.estado];
  const tColor = REPORTE_TIPO_COLOR[reporte.tipo] || "var(--gray)";
  const isAutor = reporte.autorId === user.id;

  function handleAddAdj(adj) {
    const nl = [...adjuntos, adj];
    setAdjuntos(nl);
    onAgregarAdjunto(reporte.id, adj);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingRight: "32px" }}>
        <Badge color={tColor} label={reporte.tipo.toUpperCase()} />
        <Badge color={est.color} bg={est.bg} label={est.label} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "16px" }}>{reporte.titulo}</h3>
      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
        <InfoItem label="Autor" value={getUserName(reporte.autorId)} />
        <InfoItem label="Fecha" value={reporte.fecha} />
      </div>
      <FormGroup label="Contenido">
        <p style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.7, background: "var(--bg3)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          {reporte.contenido || <span style={{ color: "var(--gray)", fontStyle: "italic" }}>Sin contenido.</span>}
        </p>
      </FormGroup>
      <div style={{ marginTop: "16px" }}>
        <label style={sharedStyles.label}>Archivos Adjuntos ({adjuntos.length})</label>
        <AdjuntosSection adjuntos={adjuntos} onAdd={handleAddAdj} canAdd={isAutor || canVerTodo} />
      </div>
      {canVerTodo && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "16px" }}>
          <label style={{ ...sharedStyles.label, marginBottom: "10px" }}>Estado del Reporte</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(REPORTE_ESTADO).map(([key, val]) => (
              <button key={key} onClick={() => onCambiarEstado(reporte.id, key)} style={{
                padding: "8px 16px",
                background: reporte.estado === key ? val.bg : "var(--bg3)",
                border: `1px solid ${reporte.estado === key ? val.color : "var(--border2)"}`,
                borderRadius: "6px", color: reporte.estado === key ? val.color : "var(--gray2)",
                fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", cursor: "pointer",
              }}>{val.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NuevoReporteForm({ onEnviar, onClose }) {
  const [titulo,    setTitulo]    = useState("");
  const [tipo,      setTipo]      = useState("asistencia");
  const [contenido, setContenido] = useState("");
  const [adjuntos,  setAdjuntos]  = useState([]);
  const [error,     setError]     = useState("");
  const tipos = ["asistencia","mantenimiento","ventas","clientes"];

  function handleEnviar() {
    if (!titulo.trim())    { setError("El título es obligatorio."); return; }
    if (!contenido.trim()) { setError("El contenido no puede estar vacío."); return; }
    onEnviar({ titulo: titulo.trim(), tipo, contenido: contenido.trim(), adjuntos });
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "20px", paddingRight: "32px" }}>ENTREGAR REPORTE</h3>
      {error && <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {error}</div>}
      <FormGroup label="Título">
        <KInput value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Reporte de asistencia semanal" />
      </FormGroup>
      <FormGroup label="Tipo de Reporte" mt={14}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tipos.map(t => {
            const c = REPORTE_TIPO_COLOR[t];
            return (
              <button key={t} type="button" onClick={() => setTipo(t)} style={{
                padding: "7px 14px",
                background: tipo === t ? `${c}20` : "var(--bg3)",
                border: `1px solid ${tipo === t ? c : "var(--border2)"}`,
                borderRadius: "6px", color: tipo === t ? c : "var(--gray2)",
                cursor: "pointer", fontSize: "12px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase",
              }}>{t}</button>
            );
          })}
        </div>
      </FormGroup>
      <FormGroup label="Contenido del Reporte" mt={14}>
        <KInput rows={5} value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Describe los detalles del reporte..." />
      </FormGroup>
      <FormGroup label="Archivos Adjuntos" mt={14}>
        <AdjuntosSection adjuntos={adjuntos} onAdd={adj => setAdjuntos(prev => [...prev, adj])} canAdd={true} />
      </FormGroup>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleEnviar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>Enviar Reporte</button>
      </div>
    </div>
  );
}
