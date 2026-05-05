import { useState, useEffect } from 'react';
import { getTareas, getReportes, getUsers, getHistorial, resolvePerms, getRoles, getTareaUrgencia } from './data.js';
import { Badge, REPORTE_ESTADO, REPORTE_TIPO_COLOR } from './shared.jsx';
import { AnunciosWidget } from './extras.jsx';

export function DashboardTab({ user, onNavigate }) {
  const [tareas,   ] = useState(getTareas());
  const [reportes, ] = useState(getReportes());
  const [users,    ] = useState(getUsers());
  const [historial,] = useState(getHistorial());
  const [mounted,    setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const perms      = resolvePerms(user);
  const canVerTodo = perms.verTodos;

  const misTareas   = canVerTodo ? tareas   : tareas.filter(t => t.asignadoA.includes(user.id));
  const misReportes = canVerTodo ? reportes : reportes.filter(r => r.autorId === user.id);

  const stats = {
    totalTareas:       misTareas.length,
    pendientes:        misTareas.filter(t => t.estado === "pendiente").length,
    enProceso:         misTareas.filter(t => t.estado === "en_proceso").length,
    completadas:       misTareas.filter(t => t.estado === "completada").length,
    reportesPend:      misReportes.filter(r => r.estado === "pendiente").length,
    reportesAprobados: misReportes.filter(r => r.estado === "aprobado").length,
    personalActivo:    users.filter(u => u.activo).length,
  };

  const urgentes = misTareas
    .filter(t => t.estado !== "completada")
    .map(t => ({ ...t, dias: getTareaUrgencia(t.fecha) }))
    .filter(t => t.dias !== null && t.dias <= 2)
    .sort((a,b) => a.dias - b.dias)
    .slice(0, 5);

  const actividad = historial.slice(0, 8);

  const tipoIcon = {
    tarea_estado:   "✓",
    reporte_nuevo:  "📋",
    reporte_estado: "🔖",
    usuario_nuevo:  "👤",
    tarea_nueva:    "➕",
    login:          "🔑",
    anuncio:        "📢",
    accion:         "⚡",
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{
        marginBottom: "24px",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)",
        transition: "all 0.4s ease",
      }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "3px" }}>
          BIENVENIDO, <span style={{ color: "var(--red)" }}>{user.nombre.split(" ")[0].toUpperCase()}</span>
        </h1>
        <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "4px" }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {" · "}{getRoles()[user.rolKey]?.label || user.rolKey}
        </p>
      </div>

      <AnunciosWidget user={user} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))",
        gap: "10px", marginBottom: "24px",
      }}>
        <StatCard label="Tareas Totales"    value={stats.totalTareas}       color="#e8e8e8" icon="📋" delay={0}   mounted={mounted} onClick={() => onNavigate("gestion")} />
        <StatCard label="Pendientes"         value={stats.pendientes}         color="#f59e0b" icon="⏳" delay={50}  mounted={mounted} onClick={() => onNavigate("gestion")} />
        <StatCard label="En Proceso"         value={stats.enProceso}          color="#60a5fa" icon="⚡" delay={100} mounted={mounted} onClick={() => onNavigate("gestion")} />
        <StatCard label="Completadas"        value={stats.completadas}        color="#22c55e" icon="✓" delay={150} mounted={mounted} onClick={() => onNavigate("gestion")} />
        <StatCard label="Reportes Pend."    value={stats.reportesPend}       color="#f97316" icon="📄" delay={200} mounted={mounted} onClick={() => onNavigate("gestion")} />
        <StatCard label="Rep. Aprobados"    value={stats.reportesAprobados}  color="#22c55e" icon="✅" delay={250} mounted={mounted} onClick={() => onNavigate("gestion")} />
        {canVerTodo && <StatCard label="Personal Activo" value={stats.personalActivo} color="#a78bfa" icon="👥" delay={300} mounted={mounted} onClick={() => onNavigate("admin")} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", letterSpacing: "2px" }}>TAREAS URGENTES</h3>
            <button onClick={() => onNavigate("gestion")} style={{ background: "none", border: "none", color: "var(--red)", fontSize: "12px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>Ver todas →</button>
          </div>

          {urgentes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--gray)" }}>
              <div style={{ fontSize: "30px", marginBottom: "8px" }}>🎉</div>
              <p style={{ fontSize: "13px", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>Sin tareas urgentes</p>
            </div>
          ) : urgentes.map(t => {
            const vencida  = t.dias < 0;
            const hoyMismo = t.dias === 0;
            const urgColor = vencida ? "#D32F2F" : hoyMismo ? "#f97316" : "#f59e0b";
            const diasLabel= vencida
              ? `Venció hace ${Math.abs(t.dias)}d`
              : hoyMismo ? "Vence hoy"
              : `${t.dias}d restantes`;
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: urgColor, flexShrink: 0, animation: (vencida||hoyMismo)?"pulse 1.5s infinite":"none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titulo}</div>
                  <div style={{ fontSize: "11px", color: urgColor, fontFamily: "'Barlow Condensed'", marginTop: "2px" }}>{diasLabel}</div>
                </div>
                <span style={{ fontSize: "10px", background: `${urgColor}18`, color: urgColor, border: `1px solid ${urgColor}33`, borderRadius: "8px", padding: "2px 8px", fontFamily: "'Barlow Condensed'", flexShrink: 0 }}>{t.prioridad?.toUpperCase()}</span>
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", letterSpacing: "2px" }}>ACTIVIDAD RECIENTE</h3>
            {perms.canManageUsers && (
              <button onClick={() => onNavigate("admin")} style={{ background: "none", border: "none", color: "var(--red)", fontSize: "12px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>Ver log →</button>
            )}
          </div>
          {actividad.length === 0 ? (
            <p style={{ color: "var(--gray)", fontSize: "13px", textAlign: "center", padding: "28px 0" }}>Sin actividad</p>
          ) : actividad.map((h, i) => (
            <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 0", borderBottom: i < actividad.length-1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                {tipoIcon[h.tipo] || "⚡"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.5 }}>{h.msg}</div>
                <div style={{ fontSize: "10px", color: "var(--gray)", marginTop: "2px", fontFamily: "'Barlow Condensed'" }}>{h.fecha} {h.hora||""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canVerTodo && (
        <div style={{ marginTop: "14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", letterSpacing: "2px" }}>ÚLTIMOS REPORTES</h3>
            <button onClick={() => onNavigate("gestion")} style={{ background: "none", border: "none", color: "var(--red)", fontSize: "12px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>Ver todos →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "10px" }}>
            {reportes.slice(0,4).map(r => {
              const est    = REPORTE_ESTADO[r.estado];
              const tColor = REPORTE_TIPO_COLOR[r.tipo] || "var(--gray)";
              const autor  = users.find(u => u.id === r.autorId);
              return (
                <div key={r.id} style={{ background: "var(--bg3)", borderRadius: "8px", padding: "12px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Badge color={tColor} label={r.tipo.toUpperCase()} />
                    <Badge color={est.color} bg={est.bg} label={est.label} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{r.titulo}</div>
                  <div style={{ fontSize: "11px", color: "var(--gray2)" }}>{autor?.nombre} · {r.fecha}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon, delay, mounted, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${hov ? color+"44" : "var(--border)"}`,
        borderRadius: "12px", padding: "16px 14px",
        cursor: "pointer", transition: "all 0.18s",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(12px)",
        transitionDelay: delay+"ms",
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color, lineHeight: 1, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
