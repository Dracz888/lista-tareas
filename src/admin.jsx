import { useState } from 'react';
import {
  getUsers, saveUsers, getRoles, getCustomRoles, saveCustomRoles,
  SYSTEM_ROLES, DEPARTAMENTOS, getHistorial, addHistorial,
} from './data.js';
import {
  sharedStyles, KModal, FormGroup, KInput, Badge, ConfirmDelete,
} from './shared.jsx';

/* ───────────────────────── helpers UI ───────────────────────── */
function MiniChip({ label, color }) {
  return (
    <span style={{
      fontSize: "10px", color, background: `${color}18`,
      border: `1px solid ${color}33`, borderRadius: "8px", padding: "2px 7px",
      fontFamily: "var(--font-cond)", letterSpacing: "0.5px", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function ActionBtn({ onClick, title, color, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}20` : "var(--bg3)",
        border: `1px solid ${hov ? color + "55" : "var(--border2)"}`,
        borderRadius: "6px", padding: "7px 10px",
        color: hov ? color : "var(--gray2)", cursor: "pointer",
        fontSize: "14px", transition: "all 0.15s",
      }}>{children}</button>
  );
}

function PermToggle({ label, desc, checked, onChange, color }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      background: checked ? `${color}10` : "var(--bg3)",
      border: `1px solid ${checked ? color + "44" : "var(--border2)"}`,
      borderRadius: "10px", padding: "12px 14px", cursor: "pointer", transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: "13px", color: checked ? color : "var(--text)" }}>{label}</span>
        <div style={{ width: "38px", height: "21px", borderRadius: "11px", background: checked ? color : "var(--border2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: "2.5px", left: checked ? "19px" : "2.5px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
        </div>
      </div>
      {desc && <p style={{ fontSize: "11px", color: "var(--gray2)", lineHeight: 1.5, marginTop: "5px" }}>{desc}</p>}
    </div>
  );
}

/* ═══════════════════════ GESTIÓN DE CARGOS ═══════════════════════ */
export function CargosTab() {
  const [customRoles, setCustomRoles] = useState(getCustomRoles());
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);

  function refresh() { setCustomRoles(getCustomRoles()); }

  function handleGuardar(datos, id = null) {
    const all = getCustomRoles();
    if (id) {
      saveCustomRoles(all.map(r => r.key === id ? { ...r, ...datos } : r));
    } else {
      if (getRoles()[datos.key]) return "Ya existe un cargo con esa clave.";
      saveCustomRoles([...all, { ...datos, system: false }]);
    }
    refresh(); setShowForm(false); setEditTarget(null);
    return null;
  }

  function handleEliminar(key) {
    const usersWithRole = getUsers().filter(u => u.rolKey === key);
    if (usersWithRole.length > 0) {
      return `No se puede eliminar: ${usersWithRole.length} perfil(es) usan este cargo.`;
    }
    saveCustomRoles(getCustomRoles().filter(r => r.key !== key));
    refresh(); setConfirmDel(null);
    return null;
  }

  const systemRoles = Object.entries(SYSTEM_ROLES);

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>CARGOS</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>
            {systemRoles.length} cargos del sistema · {customRoles.length} personalizados
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ ...sharedStyles.btnPrimario, padding: "10px 20px" }}>+ NUEVO CARGO</button>
      </div>

      <SectionTitle title="CARGOS DEL SISTEMA" right="NO EDITABLES" />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {systemRoles.map(([key, rol]) => <CargoRow key={key} rolKey={key} rol={rol} system />)}
      </div>

      <SectionTitle title="CARGOS PERSONALIZADOS" />
      {customRoles.length === 0 ? (
        <EmptyBox icon="🏷️" titulo="SIN CARGOS PERSONALIZADOS" sub="Crea cargos con permisos específicos para tu equipo." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {customRoles.map(rol => (
            <CargoRow key={rol.key} rolKey={rol.key} rol={rol}
              onEdit={() => setEditTarget(rol)} onDelete={() => setConfirmDel(rol.key)} />
          ))}
        </div>
      )}

      {showForm && (
        <KModal onClose={() => setShowForm(false)}>
          <CargoForm onGuardar={(d) => handleGuardar(d)} onClose={() => setShowForm(false)} />
        </KModal>
      )}
      {editTarget && (
        <KModal onClose={() => setEditTarget(null)}>
          <CargoForm initial={editTarget} onGuardar={(d) => handleGuardar(d, editTarget.key)} onClose={() => setEditTarget(null)} />
        </KModal>
      )}
      {confirmDel && (
        <KModal onClose={() => setConfirmDel(null)} width={420}>
          <ConfirmDelete
            mensaje={`¿Eliminar el cargo "${getRoles()[confirmDel]?.label}"? Esta acción no puede deshacerse.`}
            onConfirm={() => { const err = handleEliminar(confirmDel); if (err) alert(err); }}
            onCancel={() => setConfirmDel(null)}
          />
        </KModal>
      )}
    </div>
  );
}

function CargoRow({ rolKey, rol, system, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  const usersCount = getUsers().filter(u => u.rolKey === rolKey).length;
  const depto = DEPARTAMENTOS[rol.departamento];

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${hov ? "var(--border2)" : "var(--border)"}`,
        borderLeft: `3px solid ${rol.color || "#555"}`,
        borderRadius: "8px", padding: "14px 16px", transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
      }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "8px",
        background: `${rol.color}22`, border: `1px solid ${rol.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: "11px", color: rol.color,
        letterSpacing: "1px", flexShrink: 0,
      }}>{rolKey.slice(0, 4)}</div>

      <div style={{ flex: 1, minWidth: "150px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{rol.label}</span>
          {system && <Badge color="var(--gray)" label="SISTEMA" />}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
          {depto && <MiniChip label={`${depto.icon} ${depto.label}`} color={rol.color} />}
          {rol.canManageUsers       && <MiniChip label="Gestiona usuarios" color="#C9A227" />}
          {rol.canSeeConsolidado    && <MiniChip label="Ve consolidado" color="#60a5fa" />}
          {rol.canRegistrarIngresos && <MiniChip label="Registra ingresos" color="#22c55e" />}
          {rol.canRegistrarEgresos  && <MiniChip label="Registra egresos" color="#f59e0b" />}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "18px", fontFamily: "var(--font-display)" }}>{usersCount}</div>
        <div style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "var(--font-cond)", letterSpacing: "1px" }}>perfil{usersCount !== 1 ? "es" : ""}</div>
      </div>

      {!system && (
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <ActionBtn onClick={onEdit}   title="Editar cargo"   color="#60a5fa">✏️</ActionBtn>
          <ActionBtn onClick={onDelete} title="Eliminar cargo" color="#ef9a9a">🗑</ActionBtn>
        </div>
      )}
    </div>
  );
}

function CargoForm({ initial, onGuardar, onClose }) {
  const isEdit = !!initial;
  const [label,  setLabel]  = useState(initial?.label || "");
  const [key,    setKey]    = useState(initial?.key   || "");
  const [departamento, setDepartamento] = useState(initial?.departamento || "komplex_gym");
  const [verCons, setVerCons] = useState(initial?.canSeeConsolidado    || false);
  const [regIng,  setRegIng]  = useState(initial?.canRegistrarIngresos || false);
  const [regEgr,  setRegEgr]  = useState(initial?.canRegistrarEgresos  || false);
  const [error,   setError]   = useState("");

  function handleGuardar() {
    if (!label.trim()) { setError("El nombre del cargo es obligatorio."); return; }
    if (!isEdit && !key.trim()) { setError("La clave es obligatoria."); return; }
    const clave = isEdit ? initial.key : key.trim().toUpperCase().replace(/\s/g, "_");
    const depto = DEPARTAMENTOS[departamento];
    const datos = {
      key: clave, label: label.trim(), color: depto?.color || "#888",
      departamento, nivel: "Gerencia",
      canManageUsers: false,            // exclusivo de los cargos del sistema más elevados
      canSeeConsolidado: verCons, canRegistrarIngresos: regIng, canRegistrarEgresos: regEgr,
    };
    const err = onGuardar(datos);
    if (err) setError(err);
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "18px", paddingRight: "32px" }}>
        {isEdit ? "EDITAR CARGO" : "NUEVO CARGO"}
      </h3>
      {error && <ErrorBox msg={error} />}
      <FormGroup label="Nombre del Cargo">
        <KInput value={label} onChange={e => setLabel(e.target.value)} placeholder="Ej. Coordinador de Eventos" />
      </FormGroup>
      {!isEdit && (
        <FormGroup label="Clave (única, sin espacios)" mt={14}>
          <KInput value={key} onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 8))} placeholder="Ej. COORD" />
          <p style={{ fontSize: "11px", color: "var(--gray)", marginTop: "5px" }}>Máx. 8 caracteres, solo letras y números.</p>
        </FormGroup>
      )}
      <FormGroup label="Departamento" mt={14}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {Object.entries(DEPARTAMENTOS).map(([id, d]) => (
            <button key={id} type="button" onClick={() => setDepartamento(id)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: departamento === id ? `${d.color}1e` : "var(--bg3)",
              border: `1px solid ${departamento === id ? d.color : "var(--border2)"}`,
              borderRadius: "8px", padding: "8px 11px", cursor: "pointer",
              color: departamento === id ? d.color : "var(--gray2)", fontSize: "12px",
            }}>{d.icon} {d.label}</button>
          ))}
        </div>
      </FormGroup>
      <FormGroup label="Permisos de Gestión" mt={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <PermToggle label="Registrar ingresos" desc="Puede registrar los ingresos de su área." checked={regIng}  onChange={setRegIng}  color="#22c55e" />
          <PermToggle label="Registrar egresos / gastos" desc="Puede registrar los gastos de su área." checked={regEgr}  onChange={setRegEgr}  color="#f59e0b" />
          <PermToggle label="Ver consolidado general" desc="Acceso de solo lectura al total de ingresos y egresos de todas las gerencias." checked={verCons} onChange={setVerCons} color="#60a5fa" />
        </div>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", marginTop: "12px", fontSize: "11px", color: "var(--gray2)", lineHeight: 1.6 }}>
          ℹ️ La creación de cargos y perfiles es exclusiva del <strong style={{ color: "var(--text-dim)" }}>Gerente General</strong> y el <strong style={{ color: "var(--text-dim)" }}>Súper Intendente</strong>.
        </div>
      </FormGroup>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleGuardar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>{isEdit ? "Guardar Cambios" : "Crear Cargo"}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ GESTIÓN DE PERFILES ═══════════════════════ */
export function PersonalTab({ user }) {
  const [users,      setUsers]      = useState(getUsers());
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  function refresh() { setUsers(getUsers()); }

  function handleCrear(datos) {
    const all = getUsers();
    if (all.find(u => u.user === datos.user)) return "El nombre de usuario ya existe.";
    const nuevo = {
      id: Date.now(), user: datos.user, pass: datos.pass, nombre: datos.nombre, rolKey: datos.rolKey,
      avatar: datos.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      activo: true, perms: {},
    };
    saveUsers([...all, nuevo]);
    addHistorial(`${user.nombre} creó el perfil de ${nuevo.nombre}`, user.id, "usuario_nuevo");
    refresh(); setShowForm(false);
    return null;
  }

  function handleGuardarEdicion(id, cambios) {
    const all = getUsers();
    if (cambios.user && all.find(u => u.user === cambios.user && u.id !== id)) return "El nombre de usuario ya existe.";
    saveUsers(all.map(u => {
      if (u.id !== id) return u;
      const updated = { ...u, ...cambios };
      if (cambios.nombre) updated.avatar = cambios.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      return updated;
    }));
    addHistorial(`${user.nombre} editó el perfil de ${all.find(u => u.id === id)?.nombre}`, user.id, "usuario_edit");
    refresh(); setEditTarget(null);
    return null;
  }

  function handleToggleActivo(id) {
    if (id === user.id) return;
    saveUsers(getUsers().map(u => u.id === id ? { ...u, activo: !u.activo } : u));
    refresh();
  }

  function handleEliminar(id) {
    if (id === user.id) return;
    const target = getUsers().find(u => u.id === id);
    saveUsers(getUsers().filter(u => u.id !== id));
    addHistorial(`${user.nombre} eliminó el perfil de ${target?.nombre}`, user.id, "usuario_del");
    refresh(); setConfirmDel(null);
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px" }}>PERFILES</h1>
          <p style={{ fontSize: "13px", color: "var(--gray2)", marginTop: "2px" }}>
            {users.filter(u => u.activo).length} activos · {users.length} total
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ ...sharedStyles.btnPrimario, padding: "10px 20px" }}>+ NUEVO PERFIL</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {users.map(u => {
          const rol     = getRoles()[u.rolKey] || {};
          const rColor  = rol.color || "var(--gray)";
          const depto   = DEPARTAMENTOS[rol.departamento];
          const esMismo = u.id === user.id;
          return (
            <div key={u.id} style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderLeft: `3px solid ${u.activo ? rColor : "var(--border2)"}`,
              borderRadius: "8px", padding: "14px 16px",
              display: "flex", alignItems: "center", gap: "14px",
              opacity: u.activo ? 1 : 0.55, flexWrap: "wrap",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "8px",
                background: u.activo ? rColor : "var(--border2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "14px", color: "#fff",
                letterSpacing: "1px", flexShrink: 0,
              }}>{u.avatar}</div>

              <div style={{ flex: 1, minWidth: "160px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{u.nombre}</span>
                  {esMismo && <Badge color="#C9A227" label="TÚ" />}
                  {!u.activo && <Badge color="var(--gray)" label="INACTIVO" />}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "var(--gray2)", fontFamily: "var(--font-cond)", letterSpacing: "1px" }}>@{u.user}</span>
                  <Badge color={rColor} label={rol.label || u.rolKey} />
                  {depto && <MiniChip label={`${depto.icon} ${depto.label}`} color={rColor} />}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
                <ActionBtn onClick={() => setEditTarget(u)} title="Editar perfil" color="#60a5fa">✏️</ActionBtn>
                {!esMismo && <ActionBtn onClick={() => handleToggleActivo(u.id)} title={u.activo ? "Desactivar" : "Activar"} color={u.activo ? "#f59e0b" : "#22c55e"}>{u.activo ? "⏸" : "▶"}</ActionBtn>}
                {!esMismo && <ActionBtn onClick={() => setConfirmDel(u.id)} title="Eliminar perfil" color="#ef9a9a">🗑</ActionBtn>}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <KModal onClose={() => setShowForm(false)}>
          <PerfilForm onGuardar={handleCrear} onClose={() => setShowForm(false)} />
        </KModal>
      )}
      {editTarget && (
        <KModal onClose={() => setEditTarget(null)}>
          <PerfilForm initial={editTarget} isSelf={editTarget.id === user.id}
            onGuardar={(c) => handleGuardarEdicion(editTarget.id, c)} onClose={() => setEditTarget(null)} />
        </KModal>
      )}
      {confirmDel && (
        <KModal onClose={() => setConfirmDel(null)} width={400}>
          <ConfirmDelete
            mensaje={`¿Eliminar permanentemente el perfil de "${users.find(u => u.id === confirmDel)?.nombre}"?`}
            onConfirm={() => handleEliminar(confirmDel)} onCancel={() => setConfirmDel(null)} />
        </KModal>
      )}
    </div>
  );
}

function PerfilForm({ initial, isSelf, onGuardar, onClose }) {
  const isEdit = !!initial;
  const [nombre,  setNombre]  = useState(initial?.nombre || "");
  const [usuario, setUsuario] = useState(initial?.user   || "");
  const [pass,    setPass]    = useState("");
  const [rolKey,  setRolKey]  = useState(initial?.rolKey || "KGYM");
  const [verPass, setVerPass] = useState(false);
  const [error,   setError]   = useState("");

  const roles = Object.entries(getRoles());

  function handleGuardar() {
    if (!nombre.trim())  { setError("El nombre completo es obligatorio."); return; }
    if (!usuario.trim()) { setError("El nombre de usuario es obligatorio."); return; }
    if (isEdit) {
      if (pass && pass.length < 6) { setError("La contraseña debe tener mínimo 6 caracteres."); return; }
      const cambios = { nombre: nombre.trim(), user: usuario.trim() };
      if (!isSelf) cambios.rolKey = rolKey;
      if (pass) cambios.pass = pass;
      const err = onGuardar(cambios);
      if (err) setError(err);
    } else {
      if (pass.length < 6) { setError("La contraseña debe tener mínimo 6 caracteres."); return; }
      const err = onGuardar({ nombre: nombre.trim(), user: usuario.trim(), pass, rolKey });
      if (err) setError(err);
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "2px", marginBottom: "18px", paddingRight: "32px" }}>
        {isEdit ? "EDITAR PERFIL" : "NUEVO PERFIL"}
      </h3>
      {error && <ErrorBox msg={error} />}
      <FormGroup label="Nombre Completo">
        <KInput value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. María González" />
      </FormGroup>
      <FormGroup label="Nombre de Usuario" mt={14}>
        <KInput value={usuario} onChange={e => setUsuario(e.target.value.toLowerCase().replace(/\s/g, ""))} placeholder="ej. mgonzalez" />
      </FormGroup>
      <FormGroup label={isEdit ? "Nueva Contraseña" : "Contraseña"} mt={14}>
        <div style={{ position: "relative" }}>
          <KInput type={verPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
            placeholder={isEdit ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"} style={{ paddingRight: "44px" }} />
          <button type="button" onClick={() => setVerPass(!verPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray)", fontSize: "16px", padding: "4px" }}>{verPass ? "🙈" : "👁️"}</button>
        </div>
      </FormGroup>
      {!isSelf && (
        <FormGroup label="Cargo" mt={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "240px", overflowY: "auto" }}>
            {roles.map(([key, rol]) => {
              const c = rol.color || "#888";
              const depto = DEPARTAMENTOS[rol.departamento];
              return (
                <label key={key} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "9px 12px", borderRadius: "7px", cursor: "pointer",
                  background: rolKey === key ? `${c}15` : "var(--bg3)",
                  border: `1px solid ${rolKey === key ? c : "var(--border2)"}`, transition: "all 0.15s",
                }}>
                  <input type="radio" name="rol_perfil" value={key} checked={rolKey === key} onChange={() => setRolKey(key)} style={{ accentColor: c }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: rolKey === key ? c : "var(--text)" }}>{rol.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "var(--font-cond)", letterSpacing: "1px" }}>{depto?.label || key}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </FormGroup>
      )}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={onClose} style={{ ...sharedStyles.btnSecundario, flex: 1 }}>Cancelar</button>
        <button onClick={handleGuardar} style={{ ...sharedStyles.btnPrimario, flex: 1 }}>{isEdit ? "Guardar Cambios" : "Crear Perfil"}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ AUDITORÍA ═══════════════════════ */
export function AuditoriaTab() {
  const historial = getHistorial();
  const ICON = { login: "🔑", usuario_nuevo: "➕", usuario_edit: "✏️", usuario_del: "🗑", sistema: "⚙️", accion: "•" };
  return (
    <div style={{ padding: "24px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "2px", marginBottom: "4px" }}>AUDITORÍA</h1>
      <p style={{ fontSize: "13px", color: "var(--gray2)", marginBottom: "22px" }}>Registro de actividad del sistema.</p>
      {historial.length === 0 ? (
        <EmptyBox icon="📜" titulo="SIN ACTIVIDAD" sub="Aún no hay eventos registrados." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {historial.map(h => (
            <div key={h.id} style={{ display: "flex", gap: "12px", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "11px 14px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{ICON[h.tipo] || "•"}</span>
              <span style={{ flex: 1, fontSize: "13px", color: "var(--text-dim)" }}>{h.msg}</span>
              <span style={{ fontSize: "11px", color: "var(--gray)", fontFamily: "var(--font-cond)", letterSpacing: "1px", whiteSpace: "nowrap" }}>{h.fecha} · {h.hora}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── compartidos locales ───────────────────────── */
function SectionTitle({ title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px", color: "var(--gray2)" }}>{title}</h2>
      <div style={{ height: "1px", flex: 1, background: "var(--border)" }} />
      {right && <span style={{ fontSize: "10px", color: "var(--gray)", fontFamily: "var(--font-cond)", letterSpacing: "1px" }}>{right}</span>}
    </div>
  );
}

function EmptyBox({ icon, titulo, sub }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px dashed var(--border2)", borderRadius: "10px", padding: "40px", textAlign: "center", color: "var(--gray)" }}>
      <div style={{ fontSize: "36px", marginBottom: "10px" }}>{icon}</div>
      <p style={{ fontFamily: "var(--font-cond)", fontSize: "14px", letterSpacing: "2px", marginBottom: "6px" }}>{titulo}</p>
      <p style={{ fontSize: "12px" }}>{sub}</p>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: "rgba(211,47,47,0.12)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#ef9a9a", marginBottom: "14px" }}>⚠️ {msg}</div>
  );
}
