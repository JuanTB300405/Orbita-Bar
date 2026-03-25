// src/pages/Informes.jsx
import { useState, useEffect } from "react";
import "../styles/Informes.css";
import Button from "../components/Button";
import { ConsultarInformes } from "../js/informes.js";

// Importar componentes de Recharts
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Informes = () => {
  const [informesData, setinformesData] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const consultarInformes = async () => {
    try {
      const response = await ConsultarInformes();
      if (response.success && Array.isArray(response.data)) {
        setinformesData(response.data);
      } else {
        setError("Error al acceder al inventario");
        console.error("Respuesta inesperada:", response.data);
      }
    } catch (err) {
      setError("Error al consultar el inventario", err);
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarInformes();
  }, []);

  if (cargando) {
    return (
      <div className="modal-cargando">
        <div className="modal-contenido-c">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  const asignarColor = (estado) => {
    if (estado <= 30) {
      return "red";
    } else if (estado > 30 && estado <= 70) {
      return "orange";
    } else {
      return "green";
    }
  };

  // Datos para gráficos de barras y líneas
  const chartData = informesData.map((item) => ({
    name: item.nombre,
    estado: Number(item.estado),
  }));

  // Datos para gráfico de torta (pastel)
  const pieData = [
    {
      name: "Por debajo del 30%",
      value: informesData.filter((i) => Number(i.estado) <= 30).length,
    },
    {
      name: "Entre 31% y 70%",
      value: informesData.filter(
        (i) => Number(i.estado) > 30 && Number(i.estado) <= 70
      ).length,
    },
    {
      name: "Más del 70%",
      value: informesData.filter((i) => Number(i.estado) > 70).length,
    },
  ];

  const COLORS = ["#FF4D4D", "#FFB347", "#4CAF50"];

  return (
    <section className="informes">
      {/* Tabla de informes */}
      <section className="TablaInformes">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {informesData.map((informe, index) => (
              <tr key={index}>
                <td>{informe.nombre}</td>
                <td>{informe.cantidad_actual}</td>
                <td
                  style={{
                    backgroundColor: asignarColor(Number(informe.estado)),
                    color:
                      Number(informe.estado) > 30 && Number(informe.estado) < 70
                        ? "white"
                        : "black",
                  }}
                >
                  {informe.estado}%
                </td>
                <td>{informe.proveedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Contenedor de gráficos (scroll hacia abajo) */}
      <div className="charts-container">
        {/* Gráfico de barras */}
        <div className="chart">
          <h4>Estado de Inventario (Barras)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estado" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de líneas */}
        <div className="chart">
          <h4>Estado de Inventario (Líneas)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="estado"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de torta */}
        <div className="chart">
          <h4>Distribución por Rangos (%)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default Informes;
