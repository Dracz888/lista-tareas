import { useState } from 'react';
import { getTareas, getUsers, resolvePerms, getTareaUrgencia } from './data.js';
import { ESTADO_BADGE, PRIORIDAD_COLOR, Badge } from './shared.jsx';

export function CalendarioTab({ user }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [vista, setVista] = useState("mes");
  const [tareas,]         = useState(getTareas());
  const [users,]          = useState(getUsers());
  const [selDia, setSelDia] = useState(null);

  const perms      = resolvePerms(user);
  const canVerTodo = perms.verTodos;

  const misTareas = canVerTodo
    ? tareas
    : tareas.filter(t => t.asignadoA.includes(user.id));

  const tareasPorFecha = {};
  misTareas.forEach(t => {
    if (!t.fecha) return;
    if (!tareasPorFecha[t.fecha]) tareasPorFecha[t.fecha] = [];
    tareasPorFecha[t.fecha].push(t);
  });

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  function prevMes() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMes() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  const primerDia  = new Date(year, month, 1).getDay();
  const diasMes    = new Date(year, month+1, 0).getDate();
  const celdas     = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  function fechaStr(d) {
    if (!d) return null;
    return `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  const todayStr = today.toISOString().split("T")[0];

  const [semanaOffset, setSemanaOffset] = useState(0);
  const lunesSemana = (() => {
    const d = new Date(today);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + semanaOffset * 7);
    return d;
  })();
  const diasSemana = Array.from({length:7}, (_,i) => {
    const d = new Date(lunesSemana);
    d.setDate(d.getDate() + i);
    return d;
  });

  const tareasDia = selDia ? (tareasPorFecha[selDia] || []) : [];

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>CALENDARIO</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>Vista de tareas por fecha</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["mes","semana"].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              background: vista === v ? "var(--red)" : "var(--bg2)",
              border: vista === v ? "none" : "1px solid var(--border2)",
              borderRadius: "6px", padding: "7px 16px",
              color: vista === v ? "#fff" : "var(--gray2)",
              fontFamily: "var(--font-display)", fontSize: "13px", letterSpacing: "1px",
              cursor: "pointer", textTransform: "uppercase",
            }}>{v}</button>
          ))}
        </div>
      </div>

      {vista === "mes" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <button onClick={prevMes} style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "6px 12px", color: "var(--text)", cursor: "pointer", fontSize: "16px" }}>‹</button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", flex: 1, textAlign: "center" }}>{MESES[month]} {year}</h2>
            <button onClick={nextMes} style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "6px 12px", color: "var(--text)", cursor: "pointer", fontSize: "16px" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px", marginBottom: "4px" }}>
            {DIAS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px", padding: "6px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
            {celdas.map((d, i) => {
              const fs    = fechaStr(d);
              const tList = fs ? (tareasPorFecha[fs] || []) : [];
              const isHoy = fs === todayStr;
              const isSel = fs === selDia;
              return (
                <div key={i} onClick={() => d && setSelDia(isSel ? null : fs)} style={{
                  minHeight: "80px",
                  background: isSel ? "rgba(211,47,47,0.12)" : isHoy ? "rgba(211,47,47,0.06)" : "var(--bg2)",
                  border: `1px solid ${isSel ? "var(--red)" : isHoy ? "rgba(211,47,47,0.4)" : "var(--border)"}`,
                  borderRadius: "8px", padding: "6px",
                  cursor: d ? "pointer" : "default",
                  opacity: d ? 1 : 0,
                  transition: "all 0.15s",
                }}>
                  {d && (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: isHoy ? 700 : 400, color: isHoy ? "var(--red)" : "var(--text)", marginBottom: "4px" }}>{d}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {tList.slice(0, 3).map(t => {
                          const dias  = getTareaUrgencia(t.fecha);
                          const color = t.estado === "completada" ? "#22c55e"
                            : dias !== null && dias < 0 ? "#D32F2F"
                            : dias !== null && dias <= 1 ? "#f97316"
                            : "#60a5fa";
                          return (
                            <div key={t.id} style={{
                              fontSize: "9px", background: `${color}22`, color,
                              border: `1px solid ${color}33`,
                              borderRadius: "4px", padding: "1px 5px",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontFamily: "'Barlow Condensed'",
                            }}>{t.titulo}</div>
                          );
                        })}
                        {tList.length > 3 && (
                          <div style={{ fontSize: "9px", color: "var(--gray)", fontFamily: "'Barlow Condensed'" }}>+{tList.length - 3} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <button onClick={() => setSemanaOffset(o => o-1)} style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "6px 12px", color: "var(--text)", cursor: "pointer", fontSize: "16px" }}>‹</button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "2px", flex: 1, textAlign: "center" }}>
              {diasSemana[0].toLocaleDateString("es-MX",{day:"numeric",month:"short"})} — {diasSemana[6].toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
            </h2>
            <button onClick={() => setSemanaOffset(o => o+1)} style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "6px", padding: "6px 12px", color: "var(--text)", cursor: "pointer", fontSize: "16px" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px" }}>
            {diasSemana.map((dia, i) => {
              const fs    = dia.toISOString().split("T")[0];
              const tList = tareasPorFecha[fs] || [];
              const isHoy = fs === todayStr;
              const isSel = fs === selDia;
              return (
                <div key={i} onClick={() => setSelDia(isSel ? null : fs)} style={{
                  background: isSel ? "rgba(211,47,47,0.1)" : isHoy ? "rgba(211,47,47,0.05)" : "var(--bg2)",
                  border: `1px solid ${isSel ? "var(--red)" : isHoy ? "rgba(211,47,47,0.35)" : "var(--border)"}`,
                  borderRadius: "10px", padding: "10px 8px", cursor: "pointer", minHeight: "120px",
                }}>
                  <div style={{ textAlign: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "10px", color: "var(--gray2)", fontFamily: "'Barlow Condensed'", letterSpacing: "1px" }}>{["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"][dia.getDay()]}</div>
                    <div style={{ fontSize: "20px", fontFamily: "var(--font-display)", color: isHoy ? "var(--red)" : "var(--text)", lineHeight: 1.2 }}>{dia.getDate()}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {tList.map(t => {
                      const dias  = getTareaUrgencia(t.fecha);
                      const color = t.estado === "completada" ? "#22c55e" : dias !== null && dias < 0 ? "#D32F2F" : "#60a5fa";
                      return (
                        <div key={t.id} style={{
                          fontSize: "9px", background: `${color}20`, color,
                          borderRadius: "4px", padding: "2px 5px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          fontFamily: "'Barlow Condensed'",
                        }}>{t.titulo}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selDia && (
        <div style={{ marginTop: "20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "2px", marginBottom: "14px" }}>
            TAREAS DEL {new Date(selDia+"T00:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}
          </h3>
          {tareasDia.length === 0 ? (
            <p style={{ color: "var(--gray)", fontSize: "13px", fontStyle: "italic" }}>Sin tareas para este día.</p>
          ) : tareasDia.map(t => {
            const est    = ESTADO_BADGE[t.estado];
            const pColor = PRIORIDAD_COLOR[t.prioridad];
            const nombres= (t.asignadoA||[]).map(id => users.find(u=>u.id===id)?.nombre||"—").join(", ");
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pColor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{t.titulo}</div>
                  <div style={{ fontSize: "11px", color: "var(--gray2)", marginTop: "2px" }}>👤 {nombres}</div>
                </div>
                <Badge color={est.color} bg={est.bg} label={est.label} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
