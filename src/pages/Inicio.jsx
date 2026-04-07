import "../styles/Inicio.css";
import { useState, useEffect } from "react";
import { consultaDashboard } from "../js/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

const DIAS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

const getDia = (fechaStr) => {
  const f = new Date(fechaStr + "T12:00:00");
  return DIAS[f.getDay()];
};

const formatCOP = (num) => "$" + (num ?? 0).toLocaleString("es-CO");

// Custom Tooltip para el chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="db-chart-tooltip">
        <p className="db-chart-tooltip-label">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatCOP(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Inicio = () => {
  const [ahora, setAhora] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);

  const recibirDashboard = async () => {
    try {
      const data = await consultaDashboard();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setDashboardData(data);
      } else {
        console.error("Respuesta inesperada del dashboard:", data);
      }
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
    }
  };

  useEffect(() => {
    recibirDashboard();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const fecha = `${ahora.getFullYear()}.${String(ahora.getMonth() + 1).padStart(2, "0")}.${String(ahora.getDate()).padStart(2, "0")}`;
  const hora = ahora.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const chartData = (dashboardData?.graficoGastosVsIngresos ?? []).map((d) => ({
    ...d,
    dia: getDia(d.dia),
  }));

  const maxGastos = Math.max(
    ...(dashboardData?.graficoGastosVsIngresos ?? []).map((d) => d.Gastos),
    0,
  );

  const descorches = dashboardData?.descorches ?? 0;
  const otros = dashboardData?.otros ?? 0;
  const conteoDeudores = dashboardData?.conteo_deudores ?? 0;

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-status">
            <span className="db-status-dot"></span>
            <span className="db-status-text">SISTEMA EN LÍNEA</span>
          </div>
          <h2 className="db-title">Terminal de Control Principal</h2>
        </div>
        <div className="db-header-right">
          <p className="db-fecha-label">FECHA ESTELAR</p>
          <p className="db-fecha-valor">
            {fecha} // {hora}
          </p>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="db-cards">
        {/* MT-01: Ventas Hoy */}
        <div className="db-card db-card--verde">
          <div className="db-card-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9cff93"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span className="db-card-id db-card-id--verde">MT-01</span>
          </div>
          <p className="db-card-label">Ventas Hoy</p>
          <h3 className="db-card-valor">
            {formatCOP(dashboardData?.ventas_hoy)}
          </h3>
          <div className="db-card-bar-track">
            <div
              className="db-card-bar-fill db-card-bar-fill--verde"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div>

        {/* MT-02: Conteo Deudores */}
        <div className="db-card db-card--cyan">
          <div className="db-card-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0eeafd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="db-card-id db-card-id--cyan">MT-02</span>
          </div>
          <p className="db-card-label">Conteo Deudores</p>
          <h3 className="db-card-valor">
            {dashboardData?.conteo_deudores ?? 0}
          </h3>
          <p className="db-card-sub db-card-sub--cyan">
            Cuentas Pendientes de Liquidación
          </p>
        </div>

        {/* MT-03: Deuda Total */}
        <div className="db-card db-card--rojo">
          <div className="db-card-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff4d4f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="db-card-id db-card-id--rojo">MT-03</span>
          </div>
          <p className="db-card-label">Deuda Total</p>
          <h3 className="db-card-valor">
            {formatCOP(dashboardData?.deuda_total)}
          </h3>
          <div className="db-card-sub db-card-sub--rojo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Riesgo de Liquidez:{" "}
            {conteoDeudores > 3
              ? "Alto"
              : conteoDeudores > 0
                ? "Moderado"
                : "Bajo"}
          </div>
        </div>

        {/* MT-04: Propinas Acum. */}
        <div className="db-card db-card--amarillo">
          <div className="db-card-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#89faaa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="db-card-id db-card-id--amarillo">MT-04</span>
          </div>
          <p className="db-card-label">Propinas Acum.</p>
          <h3 className="db-card-valor">
            {formatCOP(dashboardData?.propinas)}
          </h3>
          <p className="db-card-sub db-card-sub--amarillo">
            Fondo de Servicio Distribuible
          </p>
        </div>
      </div>

      {/* ── Main Visuals ── */}
      <div className="db-bottom">
        {/* Chart */}
        <div className="db-chart-panel">
          <div className="db-chart-header">
            <div>
              <h4 className="db-chart-title">Análisis de Flujo de Caja</h4>
              <p className="db-chart-sub">INGRESOS VS GASTOS // CICLO ACTUAL</p>
            </div>
            <div className="db-chart-legend">
              <div className="db-legend-item">
                <span className="db-legend-dot db-legend-dot--cyan"></span>
                <span className="db-legend-text">Ingresos</span>
              </div>
              <div className="db-legend-item">
                <span className="db-legend-dot db-legend-dot--rojo"></span>
                <span className="db-legend-text">Gastos</span>
              </div>
            </div>
          </div>
          <div className="db-chart-area">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="dia"
                  tick={{
                    fill: "#a8abb3",
                    fontSize: 10,
                    fontFamily: "Space Grotesk",
                  }}
                  axisLine={{ stroke: "#44484f" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "#a8abb3",
                    fontSize: 10,
                    fontFamily: "Space Grotesk",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={50}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(156,255,147,0.05)" }}
                />
                <ReferenceLine
                  y={maxGastos}
                  stroke="rgba(255,77,79,0.4)"
                  strokeDasharray="4 4"
                  label={{
                    value: `LINEA BASE DE GASTOS: ${formatCOP(maxGastos)}`,
                    fill: "rgba(255,77,79,0.6)",
                    fontSize: 9,
                    fontFamily: "Space Grotesk",
                    position: "insideBottomLeft",
                  }}
                />
                <Bar
                  dataKey="Ingresos"
                  fill="rgba(14,234,253,0.15)"
                  stroke="#0eeafd"
                  strokeWidth={1.5}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="Gastos"
                  fill="rgba(255,77,79,0.15)"
                  stroke="#ff4d4f"
                  strokeWidth={1.5}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations Panel */}
        <div className="db-ops-panel">
          <h4 className="db-ops-title">Operaciones Críticas</h4>

          <div className="db-ops-list">
            {/* Descorches */}
            <div className="db-op-item db-op-item--cyan">
              <div className="db-op-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0eeafd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <div>
                  <p className="db-op-name">DESCORCHES</p>
                  <p className="db-op-detail">
                    Total: {formatCOP(descorches)} hoy
                  </p>
                </div>
              </div>
              <span className="db-op-badge db-op-badge--cyan">NOMINAL</span>
            </div>

            {/* Otros Ingresos */}
            <div
              className={`db-op-item ${otros > 0 ? "db-op-item--verde" : "db-op-item--cyan"}`}
            >
              <div className="db-op-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={otros > 0 ? "#9cff93" : "#0eeafd"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <div>
                  <p className="db-op-name">OTROS INGRESOS</p>
                  <p className="db-op-detail">Total: {formatCOP(otros)} hoy</p>
                </div>
              </div>
              <span
                className={`db-op-badge ${otros > 0 ? "db-op-badge--verde" : "db-op-badge--cyan"}`}
              >
                {otros > 0 ? "ACTIVO" : "NOMINAL"}
              </span>
            </div>

            {/* Deudores */}
            <div
              className={`db-op-item ${conteoDeudores > 0 ? "db-op-item--rojo" : "db-op-item--verde"}`}
            >
              <div className="db-op-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={conteoDeudores > 0 ? "#ff4d4f" : "#9cff93"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="db-op-name">DEUDORES</p>
                  <p className="db-op-detail">
                    {conteoDeudores} cuentas pendientes
                  </p>
                </div>
              </div>
              <span
                className={`db-op-badge ${conteoDeudores > 0 ? "db-op-badge--rojo db-op-badge--pulsar" : "db-op-badge--verde"}`}
              >
                {conteoDeudores > 0 ? "ALERTA" : "OK"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
