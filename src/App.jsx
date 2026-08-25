import { useState, useEffect } from "react";
import { PartyPopper, Wallet, Users, ListChecks, Plus, Trash2, Check, Clock, Cake } from "lucide-react";

const TABS = [
  { id: "resumen", label: "Resumen", icon: PartyPopper },
  { id: "presupuesto", label: "Presupuesto", icon: Wallet },
  { id: "familias", label: "Familias", icon: Users },
  { id: "tareas", label: "Tareas", icon: ListChecks },
];

const STATUS_BUDGET = ["cotizado", "aprobado", "pagado"];
const STATUS_TASK = ["pendiente", "en proceso", "listo"];

function currency(n) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);
}

async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
  } catch (e) {
    console.error("Error guardando", key, e);
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("resumen");
  const [core, setCore] = useState({ eventDate: "", budgetGoal: 3000000 });
  const [families, setFamilies] = useState([]);
  const [budget, setBudget] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      const [c, f, b, t] = await Promise.all([
        loadKey("core-data", { eventDate: "", budgetGoal: 3000000 }),
        loadKey("families", []),
        loadKey("budget", []),
        loadKey("tasks", []),
      ]);
      setCore(c);
      setFamilies(f);
      setBudget(b);
      setTasks(t);
      setLoading(false);
    })();
  }, []);

  const totalPersonas = families.reduce((s, f) => s + (Number(f.members) || 0), 0);
  const totalCotizado = budget.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalAprobado = budget.filter((b) => b.status !== "cotizado").reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalPagado = budget.filter((b) => b.status === "pagado").reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const pct = core.budgetGoal ? Math.min(100, Math.round((totalAprobado / core.budgetGoal) * 100)) : 0;

  const daysLeft = (() => {
    if (!core.eventDate) return null;
    const diff = Math.ceil((new Date(core.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  })();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1B2A4A", color: "#F5EFE0", fontFamily: "sans-serif" }}>
        Cargando la fiesta…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#1B2A4A 0%,#152238 100%)", fontFamily: "'Inter',sans-serif", color: "#F5EFE0", paddingBottom: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        .h1title { font-family:'Fraunces',serif; }
        .mono { font-family:'IBM Plex Mono',monospace; }
        button { font-family:'Inter',sans-serif; cursor:pointer; }
        input, select { font-family:'Inter',sans-serif; }
        ::placeholder { color:#9aa5c0; }
      `}</style>

      {/* Header */}
      <header style={{ padding: "40px 24px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(242,169,59,0.15) 0, transparent 40%), radial-gradient(circle at 80% 10%, rgba(232,93,78,0.15) 0, transparent 40%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#F2A93B", fontWeight: 600, marginBottom: 8 }}>
            🎉 Organización familiar
          </div>
          <h1 className="h1title" style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, margin: 0, color: "#F5EFE0" }}>
            Fiesta de cumpleaños abuelito Luis
          </h1>
          {daysLeft !== null && (
            <p style={{ marginTop: 10, color: "#c9d2ea", fontSize: 15 }}>
              {daysLeft > 0 ? `Faltan ${daysLeft} días` : daysLeft === 0 ? "¡Es hoy!" : "El evento ya pasó"}
            </p>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", padding: "0 16px 24px" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 999, border: active ? "1px solid #F2A93B" : "1px solid #33456e",
                background: active ? "rgba(242,169,59,0.15)" : "transparent",
                color: active ? "#F2A93B" : "#c9d2ea", fontSize: 14, fontWeight: 600,
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
        {tab === "resumen" && (
          <Resumen
            core={core} setCore={setCore} saveKey={saveKey}
            totalPersonas={totalPersonas} totalCotizado={totalCotizado}
            totalAprobado={totalAprobado} totalPagado={totalPagado}
            pct={pct} familiesCount={families.length}
          />
        )}
        {tab === "presupuesto" && <Presupuesto budget={budget} setBudget={setBudget} />}
        {tab === "familias" && <Familias families={families} setFamilies={setFamilies} />}
        {tab === "tareas" && <Tareas tasks={tasks} setTasks={setTasks} />}
      </main>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#24365c", border: "1px solid #33456e", borderRadius: 16, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Resumen({ core, setCore, saveKey, totalPersonas, totalCotizado, totalAprobado, totalPagado, pct, familiesCount }) {
  const layers = 4;
  const litLayers = Math.round((pct / 100) * layers);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Signature: pastel de progreso de presupuesto */}
      <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 13, color: "#c9d2ea", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
          Presupuesto aprobado vs meta
        </div>
        <svg width="180" height="150" viewBox="0 0 180 150">
          {/* vela */}
          <rect x="86" y="4" width="8" height="18" rx="2" fill="#E85D4E" />
          <ellipse cx="90" cy="4" rx="5" ry="7" fill={pct >= 100 ? "#F2A93B" : "#5b6a92"} />
          {[0, 1, 2, 3].map((i) => {
            const lit = i < litLayers;
            const y = 26 + i * 30;
            const w = 170 - i * 22;
            const x = 90 - w / 2;
            return (
              <rect key={i} x={x} y={y} width={w} height={26} rx="6"
                fill={lit ? "#F2A93B" : "#2f4066"} stroke="#1B2A4A" strokeWidth="2" />
            );
          })}
        </svg>
        <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: "#F2A93B" }}>{pct}%</div>
        <div style={{ fontSize: 13, color: "#c9d2ea" }}>
          {currency(totalAprobado)} de {currency(core.budgetGoal)} aprobados
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
        <Stat label="Personas confirmadas" value={totalPersonas} />
        <Stat label="Familias" value={familiesCount} />
        <Stat label="Cotizado total" value={currency(totalCotizado)} />
        <Stat label="Pagado" value={currency(totalPagado)} />
      </div>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Ajustes del evento</div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <label style={{ fontSize: 13, color: "#c9d2ea" }}>
            Fecha del evento
            <input type="date" value={core.eventDate}
              onChange={(e) => { const c = { ...core, eventDate: e.target.value }; setCore(c); saveKey("core-data", c); }}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8, borderRadius: 8, border: "1px solid #33456e", background: "#1B2A4A", color: "#F5EFE0" }} />
          </label>
          <label style={{ fontSize: 13, color: "#c9d2ea" }}>
            Meta de presupuesto (COP)
            <input type="number" value={core.budgetGoal}
              onChange={(e) => { const c = { ...core, budgetGoal: Number(e.target.value) }; setCore(c); saveKey("core-data", c); }}
              style={{ display: "block", width: "100%", marginTop: 4, padding: 8, borderRadius: 8, border: "1px solid #33456e", background: "#1B2A4A", color: "#F5EFE0" }} />
          </label>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: "#9aa5c0", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </Card>
  );
}

function Presupuesto({ budget, setBudget }) {
  const [form, setForm] = useState({ name: "", provider: "", amount: "", status: "cotizado" });

  const add = async () => {
    if (!form.name || !form.amount) return;
    const item = { id: Date.now(), ...form, amount: Number(form.amount) };
    const next = [...budget, item];
    setBudget(next);
    await saveKey("budget", next);
    setForm({ name: "", provider: "", amount: "", status: "cotizado" });
  };
  const update = async (id, patch) => {
    const next = budget.map((b) => (b.id === id ? { ...b, ...patch } : b));
    setBudget(next);
    await saveKey("budget", next);
  };
  const remove = async (id) => {
    const next = budget.filter((b) => b.id !== id);
    setBudget(next);
    await saveKey("budget", next);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Agregar cotización</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: 8 }}>
          <input placeholder="Rubro (ej. Salón, Torta)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <input placeholder="Proveedor" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} style={inputStyle} />
          <input placeholder="Valor" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
          <button onClick={add} style={btnPrimary}><Plus size={16} /></button>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 10 }}>
        {budget.length === 0 && <EmptyState text="Aún no hay cotizaciones. Agrega la primera arriba." />}
        {budget.map((b) => (
          <Card key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{b.name}</div>
              <div style={{ fontSize: 13, color: "#9aa5c0" }}>{b.provider || "Sin proveedor"}</div>
            </div>
            <div className="mono" style={{ fontWeight: 700 }}>{currency(b.amount)}</div>
            <select value={b.status} onChange={(e) => update(b.id, { status: e.target.value })} style={{ ...inputStyle, width: 130 }}>
              {STATUS_BUDGET.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => remove(b.id)} style={btnGhost}><Trash2 size={16} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Familias({ families, setFamilies }) {
  const [form, setForm] = useState({ name: "", members: "", confirmed: "confirmado", notes: "" });

  const add = async () => {
    if (!form.name || !form.members) return;
    const item = { id: Date.now(), ...form, members: Number(form.members) };
    const next = [...families, item];
    setFamilies(next);
    await saveKey("families", next);
    setForm({ name: "", members: "", confirmed: "confirmado", notes: "" });
  };
  const update = async (id, patch) => {
    const next = families.map((f) => (f.id === id ? { ...f, ...patch } : f));
    setFamilies(next);
    await saveKey("families", next);
  };
  const remove = async (id) => {
    const next = families.filter((f) => f.id !== id);
    setFamilies(next);
    await saveKey("families", next);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Registrar familia</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr auto", gap: 8 }}>
          <input placeholder="Familia (ej. Familia Pérez)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <input placeholder="# integrantes" type="number" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} style={inputStyle} />
          <input placeholder="Notas (alergias, niños...)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
          <button onClick={add} style={btnPrimary}><Plus size={16} /></button>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 10 }}>
        {families.length === 0 && <EmptyState text="Ninguna familia registrada todavía." />}
        {families.map((f) => (
          <Card key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              {f.notes && <div style={{ fontSize: 13, color: "#9aa5c0" }}>{f.notes}</div>}
            </div>
            <div className="mono" style={{ fontWeight: 700 }}>{f.members} pers.</div>
            <select value={f.confirmed} onChange={(e) => update(f.id, { confirmed: e.target.value })} style={{ ...inputStyle, width: 140 }}>
              <option value="confirmado">confirmado</option>
              <option value="tal vez">tal vez</option>
              <option value="no asiste">no asiste</option>
            </select>
            <button onClick={() => remove(f.id)} style={btnGhost}><Trash2 size={16} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Tareas({ tasks, setTasks }) {
  const [form, setForm] = useState({ title: "", responsible: "" });

  const add = async () => {
    if (!form.title) return;
    const item = { id: Date.now(), ...form, status: "pendiente" };
    const next = [...tasks, item];
    setTasks(next);
    await saveKey("tasks", next);
    setForm({ title: "", responsible: "" });
  };
  const cycle = async (t) => {
    const idx = STATUS_TASK.indexOf(t.status);
    const status = STATUS_TASK[(idx + 1) % STATUS_TASK.length];
    const next = tasks.map((x) => (x.id === t.id ? { ...x, status } : x));
    setTasks(next);
    await saveKey("tasks", next);
  };
  const remove = async (id) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    await saveKey("tasks", next);
  };

  const statusStyle = (s) => ({
    pendiente: { bg: "rgba(232,93,78,0.15)", color: "#E85D4E" },
    "en proceso": { bg: "rgba(242,169,59,0.15)", color: "#F2A93B" },
    listo: { bg: "rgba(111,207,151,0.15)", color: "#6FCF97" },
  }[s]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Nueva tarea</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: 8 }}>
          <input placeholder="Tarea (ej. Comprar decoración)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input placeholder="Responsable" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} style={inputStyle} />
          <button onClick={add} style={btnPrimary}><Plus size={16} /></button>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 10 }}>
        {tasks.length === 0 && <EmptyState text="No hay tareas creadas aún." />}
        {tasks.map((t) => {
          const st = statusStyle(t.status);
          return (
            <Card key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: "#9aa5c0" }}>{t.responsible || "Sin asignar"}</div>
              </div>
              <button onClick={() => cycle(t)} style={{ ...btnGhost, background: st.bg, color: st.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {t.status === "listo" ? <Check size={14} /> : <Clock size={14} />} {t.status}
              </button>
              <button onClick={() => remove(t.id)} style={btnGhost}><Trash2 size={16} /></button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: 24, color: "#9aa5c0", fontSize: 14 }}>
      <Cake size={22} style={{ marginBottom: 8, opacity: 0.6 }} />
      <div>{text}</div>
    </div>
  );
}

const inputStyle = {
  padding: "9px 10px", borderRadius: 8, border: "1px solid #33456e",
  background: "#1B2A4A", color: "#F5EFE0", fontSize: 14, outline: "none",
};
const btnPrimary = {
  background: "#F2A93B", color: "#1B2A4A", border: "none", borderRadius: 8,
  padding: "0 14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
};
const btnGhost = {
  background: "transparent", border: "1px solid #33456e", color: "#c9d2ea",
  borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center",
};
