import { useRef } from 'react';

export const PRIORIDAD_COLOR = { alta: "#D32F2F", media: "#f59e0b", baja: "#22c55e" };
export const ESTADO_BADGE = {
  pendiente:  { label: "Pendiente",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  en_proceso: { label: "En Proceso", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  completada: { label: "Completada", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};
export const REPORTE_ESTADO = {
  aprobado:  { label: "Aprobado",    color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  revision:  { label: "En Revisión", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  pendiente: { label: "Pendiente",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};
export const REPORTE_TIPO_COLOR = {
  asistencia:    "#a78bfa",
  mantenimiento: "#f97316",
  ventas:        "#22c55e",
  clientes:      "#60a5fa",
};

export const sharedStyles = {
  label: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "var(--gray2)",
    marginBottom: "8px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    background: "var(--bg3)",
    border: "1px solid var(--border2)",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "'Barlow', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  },
  btnPrimario: {
    background: "var(--red)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "2px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  btnSecundario: {
    background: "var(--bg3)",
    color: "var(--gray2)",
    border: "1px solid var(--border2)",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnDanger: {
    background: "rgba(211,47,47,0.12)",
    color: "#ef9a9a",
    border: "1px solid rgba(211,47,47,0.3)",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export function Spinner({ size = 14 }) {
  return (
    <span style={{
      display: "inline-block",
      width: size + "px", height: size + "px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

export function KModal({ children, onClose, width = 520 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
          borderRadius: "14px",
          padding: "28px",
          width: "100%", maxWidth: width + "px",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "var(--bg3)", border: "1px solid var(--border2)",
            borderRadius: "50%", width: "28px", height: "28px",
            color: "var(--gray2)", cursor: "pointer", fontSize: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
        {children}
      </div>
    </div>
  );
}

export function FormGroup({ label, children, mt = 0 }) {
  return (
    <div style={{ marginTop: mt }}>
      <label style={sharedStyles.label}>{label}</label>
      {children}
    </div>
  );
}

export function KInput({ type = "text", value, onChange, placeholder, rows, style: extra }) {
  const Tag = rows ? "textarea" : "input";
  return (
    <Tag
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{ ...sharedStyles.input, resize: rows ? "vertical" : undefined, ...extra }}
      onFocus={e => e.target.style.borderColor = "var(--red)"}
      onBlur={e => e.target.style.borderColor = "var(--border2)"}
    />
  );
}

export function Badge({ color, bg, label, border }) {
  return (
    <span style={{
      fontSize: "10px",
      background: bg || `${color}18`,
      color: color,
      border: `1px solid ${border || color + "33"}`,
      padding: "3px 10px",
      borderRadius: "12px",
      fontFamily: "'Barlow Condensed', sans-serif",
      letterSpacing: "0.5px",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

export function AdjuntosSection({ adjuntos, onAdd, canAdd = true }) {
  const fileRef = useRef();

  function handleFile(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        onAdd({
          nombre: file.name,
          tipo: file.type,
          size: file.size,
          data: ev.target.result,
          fecha: new Date().toLocaleDateString("es-MX"),
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function getIcon(tipo) {
    if (!tipo) return "📎";
    if (tipo.startsWith("image/")) return "🖼️";
    if (tipo.includes("pdf")) return "📄";
    if (tipo.includes("word") || tipo.includes("document")) return "📝";
    if (tipo.includes("sheet") || tipo.includes("excel")) return "📊";
    return "📎";
  }

  function formatSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div>
      {canAdd && (
        <>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--bg3)", border: "1px dashed var(--border2)",
              borderRadius: "8px", padding: "10px 16px",
              color: "var(--gray2)", cursor: "pointer",
              fontSize: "13px", fontFamily: "'Barlow', sans-serif",
              width: "100%", justifyContent: "center",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--red)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
          >
            📎 Adjuntar imagen o documento
          </button>
        </>
      )}

      {adjuntos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
          {adjuntos.map((adj, i) => (
            <a
              key={i}
              href={adj.data}
              download={adj.nombre}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "var(--bg3)", borderRadius: "6px",
                padding: "8px 12px", textDecoration: "none",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "18px" }}>{getIcon(adj.tipo)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adj.nombre}</div>
                <div style={{ fontSize: "10px", color: "var(--gray)", marginTop: "1px" }}>{formatSize(adj.size)} · {adj.fecha}</div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--red)", flexShrink: 0 }}>↓</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function InfoItem({ label, value, children }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: "var(--text-dim)", fontWeight: 500 }}>{children || value}</div>
    </div>
  );
}

export function ConfirmDelete({ mensaje, onConfirm, onCancel }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
      <p style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "20px", lineHeight: 1.5 }}>{mensaje}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={onCancel} style={{ ...sharedStyles.btnSecundario }}>Cancelar</button>
        <button onClick={onConfirm} style={{ ...sharedStyles.btnDanger }}>Eliminar</button>
      </div>
    </div>
  );
}
