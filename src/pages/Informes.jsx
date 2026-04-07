import { useState, useEffect } from "react";
import "../styles/Informes.css";
import { ConsultarInformes } from "../js/informes.js";
import {
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Utilidades de color ──────────────────────────────
const getBarColor = (v) => {
  if (v <= 30) return "#ff4d4f";
  if (v <= 70) return "#f59e0b";
  return "#9cff93";
};

const getEstadoBadge = (estado) => {
  const n = Number(estado);
  if (n <= 30) return { label: "CRÍTICO", cls: "inf-badge--rojo" };
  if (n <= 70) return { label: "NORMAL", cls: "inf-badge--naranja" };
  return { label: "ÓPTIMO", cls: "inf-badge--verde" };
};

// ── Tooltips personalizados ──────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const val = payload[0].value;
    return (
      <div className="inf-tooltip">
        <p className="inf-tooltip-label">{label}</p>
        <p style={{ color: getBarColor(val), margin: 0 }}>
          Stock: <strong>{val}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value, fill } = payload[0].payload;
    return (
      <div className="inf-tooltip">
        <p style={{ color: fill, margin: 0 }}>
          {name}: <strong>{value} productos</strong>
        </p>
      </div>
    );
  }
  return null;
};

// ── Componente principal ─────────────────────────────
const Informes = () => {
  const [informesData, setinformesData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  const consultarInformes = async () => {
    setCargando(true);
    try {
      const response = await ConsultarInformes();
      if (response.success && Array.isArray(response.data)) {
        setinformesData(response.data);
      } else {
        console.error("Respuesta inesperada:", response);
      }
    } catch (err) {
      console.error("Error en la consulta:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarInformes();
  }, []);

  // ── KPIs ────────────────────────────────────────────
  const total = informesData.length;
  const criticos = informesData.filter((i) => Number(i.estado) <= 30).length;
  const normales = informesData.filter(
    (i) => Number(i.estado) > 30 && Number(i.estado) <= 70,
  ).length;
  const optimos = informesData.filter((i) => Number(i.estado) > 70).length;

  // ── Datos para gráficos ──────────────────────────────
  const pieData = [
    { name: "Críticos", value: criticos, fill: "#ff4d4f" },
    { name: "Normales", value: normales, fill: "#f59e0b" },
    { name: "Óptimos", value: optimos, fill: "#9cff93" },
  ];

  const barData = [...informesData]
    .sort((a, b) => Number(a.estado) - Number(b.estado))
    .map((i) => ({ name: i.nombre, stock: Number(i.estado) }));

  const datosFiltrados = informesData.filter(
    (i) =>
      i.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (i.proveedor && i.proveedor.toLowerCase().includes(filtro.toLowerCase())),
  );

  const barChartHeight = Math.max(barData.length * 42 + 60, 200);

  // ── Estado de carga ──────────────────────────────────
  if (cargando) {
    return (
      <div className="inf-loading">
        <div className="inf-loader"></div>
        <p className="inf-loading-text">CARGANDO DATOS...</p>
      </div>
    );
  }

  return (
    <div className="informes-page">
      {/* ── Header ── */}
      <div className="inf-header">
        <div className="inf-header-left">
          <div className="inf-status">
            <span className="inf-status-dot"></span>
            <span className="inf-status-text">MÓDULO ACTIVO</span>
          </div>
          <h2 className="inf-title">Análisis de Inventario</h2>
        </div>
        <button className="inf-refresh-btn" onClick={consultarInformes}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          ACTUALIZAR
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="inf-kpi-grid">
        {/* IN-01: Total */}
        <div className="inf-kpi inf-kpi--neutral">
          <div className="inf-kpi-top">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8abb3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
              <path d="M12 12l8 -4.5" />
              <path d="M12 12l0 9" />
              <path d="M12 12l-8 -4.5" />
            </svg>
            <span className="inf-kpi-id">IN-01</span>
          </div>
          <p className="inf-kpi-label">Total Productos</p>
          <h3 className="inf-kpi-valor">{total}</h3>
          <p className="inf-kpi-sub">Registros en inventario</p>
        </div>

        {/* IN-02: Críticos */}
        <div className="inf-kpi inf-kpi--rojo">
          <div className="inf-kpi-top">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff4d4f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="inf-kpi-id inf-kpi-id--rojo">IN-02</span>
          </div>
          <p className="inf-kpi-label">Críticos</p>
          <h3 className="inf-kpi-valor inf-kpi-valor--rojo">{criticos}</h3>
          <p className="inf-kpi-sub inf-kpi-sub--rojo">
            Stock por debajo del 30%
          </p>
        </div>

        {/* IN-03: Normales */}
        <div className="inf-kpi inf-kpi--naranja">
          <div className="inf-kpi-top">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="inf-kpi-id inf-kpi-id--naranja">IN-03</span>
          </div>
          <p className="inf-kpi-label">En Riesgo</p>
          <h3 className="inf-kpi-valor inf-kpi-valor--naranja">{normales}</h3>
          <p className="inf-kpi-sub inf-kpi-sub--naranja">
            Stock entre 31% y 70%
          </p>
        </div>

        {/* IN-04: Óptimos */}
        <div className="inf-kpi inf-kpi--verde">
          <div className="inf-kpi-top">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9cff93"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="inf-kpi-id inf-kpi-id--verde">IN-04</span>
          </div>
          <p className="inf-kpi-label">Óptimos</p>
          <h3 className="inf-kpi-valor inf-kpi-valor--verde">{optimos}</h3>
          <p className="inf-kpi-sub inf-kpi-sub--verde">
            Stock superior al 70%
          </p>
        </div>
      </div>

      {/* ── Tabla + Pie ── */}
      <div className="inf-main">
        {/* Panel de tabla */}
        <div className="inf-table-panel">
          <div className="inf-panel-header">
            <div>
              <h4 className="inf-panel-title">Registro de Stock</h4>
              <p className="inf-panel-sub">
                {datosFiltrados.length} de {total} productos
              </p>
            </div>
            <div className="inf-search-wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8abb3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="inf-search"
                placeholder="BUSCAR PRODUCTO O PROVEEDOR..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="inf-table-wrap">
            <table className="inf-table">
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>STOCK</th>
                  <th>ESTADO</th>
                  <th>PROVEEDOR</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((item, idx) => {
                  const badge = getEstadoBadge(item.estado);
                  const pct = Number(item.estado);
                  return (
                    <tr key={idx} className="inf-tr">
                      <td className="inf-td inf-td--nombre" data-label="Producto">{item.nombre}</td>
                      <td className="inf-td inf-td--center" data-label="Cantidad">
                        {item.cantidad_actual}
                      </td>
                      <td className="inf-td inf-td--stock" data-label="Stock">
                        <div className="inf-stock-track">
                          <div
                            className="inf-stock-fill"
                            style={{
                              width: `${pct}%`,
                              background: getBarColor(pct),
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: getBarColor(pct),
                            fontSize: "0.65rem",
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="inf-td inf-td--estado" data-label="Estado">
                        <span className={`inf-badge ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="inf-td inf-td--proveedor" data-label="Proveedor">
                        {item.proveedor ?? "—"}
                      </td>
                    </tr>
                  );
                })}
                {datosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" className="inf-td inf-td--empty">
                      Sin resultados para &quot;{filtro}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de distribución (Pie) */}
        <div className="inf-pie-panel">
          <h4 className="inf-panel-title">Distribución de Stock</h4>
          <p className="inf-panel-sub">Por rangos de porcentaje</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.fill}
                    fillOpacity={0.85}
                    stroke={entry.fill}
                    strokeWidth={0.5}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Leyenda del pie */}
          <div className="inf-pie-legend">
            {pieData.map((entry, idx) => (
              <div key={idx} className="inf-pie-legend-item">
                <span
                  className="inf-pie-dot"
                  style={{ background: entry.fill }}
                />
                <span className="inf-pie-name">{entry.name}</span>
                <span className="inf-pie-val" style={{ color: entry.fill }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>

          {/* Barra de progreso de criticidad */}
          {total > 0 && (
            <div className="inf-criticidad">
              <p className="inf-criticidad-label">Índice de criticidad</p>
              <div className="inf-crit-track">
                <div
                  className="inf-crit-fill"
                  style={{ width: `${Math.round((criticos / total) * 100)}%` }}
                />
              </div>
              <p className="inf-criticidad-val">
                {Math.round((criticos / total) * 100)}% en alerta
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Gráfico de barras horizontal ── */}
      <div className="inf-bar-panel">
        <div className="inf-panel-header">
          <div>
            <h4 className="inf-panel-title">Nivel de Stock por Producto</h4>
            <p className="inf-panel-sub">
              Ordenado de menor a mayor // Zona crítica en rojo
            </p>
          </div>
        </div>
        <div style={{ height: barChartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={barData}
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{
                  fill: "#a8abb3",
                  fontSize: 10,
                  fontFamily: "Space Grotesk, sans-serif",
                }}
                axisLine={{ stroke: "#44484f" }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{
                  fill: "#a8abb3",
                  fontSize: 10,
                  fontFamily: "Space Grotesk, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(156,255,147,0.04)" }}
              />
              <Bar dataKey="stock" radius={[0, 3, 3, 0]} barSize={14}>
                {barData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={getBarColor(entry.stock)}
                    fillOpacity={0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Informes;
