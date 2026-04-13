import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { consultaDashboard } from "./dashboard";
import { consultarIngresosExternos } from "./ingresosExternos";
import { ConsultarVentas } from "./ventas";
import { getEgresos } from "./egresosService";

// Formatea número como $1.250.000 (estilo colombiano)
const fmt = (valor) => {
  const n = parseFloat(valor || 0);
  return "$" + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Retorna la fecha de hoy en hora Colombia (UTC-5) como "YYYY-MM-DD"
const fechaHoyColombia = () => {
  const colombia = new Date(Date.now() - 5 * 60 * 60 * 1000);
  return colombia.toISOString().split("T")[0];
};

// Retorna la hora actual Colombia como "HH:MM:SS"
const horaActualColombia = () => {
  const colombia = new Date(Date.now() - 5 * 60 * 60 * 1000);
  return colombia.toISOString().split("T")[1].split(".")[0];
};

// Verifica si una fecha ISO pertenece al día de hoy en Colombia
const esDehoy = (fechaISO) => {
  if (!fechaISO) return false;
  return fechaISO.startsWith(fechaHoyColombia());
};

export const generarCierreCajaPDF = async () => {
  // ── 1. Obtener datos de todos los endpoints ────────────────
  const [dashboard, ventas, ingresosExt, gastos, compras] = await Promise.all([
    consultaDashboard(),
    ConsultarVentas(),
    consultarIngresosExternos(),
    getEgresos("gastos").catch(() => []),
    getEgresos("compras").catch(() => []),
  ]);

  const hoy = fechaHoyColombia();
  const hora = horaActualColombia();

  // ── 2. Filtrar registros del día ───────────────────────────
  const ventasHoy = Array.isArray(ventas)
    ? ventas.filter((v) => esDehoy(v.fecha))
    : [];

  const gastosHoy = Array.isArray(gastos)
    ? gastos.filter((g) => esDehoy(g.fecha_de_pago))
    : [];

  const comprasHoy = Array.isArray(compras)
    ? compras.filter((c) => esDehoy(c.fecha || c.fecha_de_compra))
    : [];

  // ── 3. Calcular totales ────────────────────────────────────
  // Ingresos: el dashboard ya los agrega para hoy
  const totalVentas = parseFloat(dashboard.ventas_hoy || 0);
  const totalPropinas = parseFloat(dashboard.propinas || 0);
  const totalDescorches = parseFloat(dashboard.descorches || 0);
  const totalOtros = parseFloat(dashboard.otros || 0);
  const totalIngresosExt = totalPropinas + totalDescorches + totalOtros;
  const totalIngresos = totalVentas + totalIngresosExt;

  // Egresos: sumar desde los registros filtrados del día
  const totalGastos = gastosHoy.reduce(
    (a, g) => a + parseFloat(g.precio || 0),
    0
  );
  const totalCompras = comprasHoy.reduce(
    (a, c) => a + parseFloat(c.precio || c.subtotal || 0),
    0
  );
  const totalEgresos = totalGastos + totalCompras;

  const balanceNeto = totalIngresos - totalEgresos;

  // ── 4. Construir PDF ───────────────────────────────────────
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Colores reutilizables
  const DARK = [15, 23, 42];
  const HEADER_BG = [30, 41, 59];
  const GREEN = [22, 163, 74];
  const RED = [220, 38, 38];
  const GRAY = [100, 116, 139];

  // ── Encabezado ─────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ORBITA BAR", W / 2, 12, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("CIERRE DE CAJA", W / 2, 19, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(`Fecha: ${hoy}   |   Hora: ${hora}`, W / 2, 26, {
    align: "center",
  });

  let y = 38;

  const sectionTitle = (titulo) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(titulo, 14, y);
    y += 3;
  };

  const tableDefaults = {
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  };

  // ── Sección: Ingresos del día ──────────────────────────────
  sectionTitle("INGRESOS DEL DÍA");

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Ventas", fmt(totalVentas)],
      ["Propinas", fmt(totalPropinas)],
      ["Descorches", fmt(totalDescorches)],
      ["Otros ingresos", fmt(totalOtros)],
      [
        { content: "TOTAL INGRESOS", styles: { fontStyle: "bold" } },
        {
          content: fmt(totalIngresos),
          styles: { fontStyle: "bold", textColor: GREEN },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Sección: Egresos del día ───────────────────────────────
  sectionTitle("EGRESOS DEL DÍA");

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Gastos", fmt(totalGastos)],
      ["Compras a proveedores", fmt(totalCompras)],
      [
        { content: "TOTAL EGRESOS", styles: { fontStyle: "bold" } },
        {
          content: fmt(totalEgresos),
          styles: { fontStyle: "bold", textColor: RED },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Sección: Balance neto ──────────────────────────────────
  sectionTitle("BALANCE NETO DEL DÍA");

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Total ingresos", fmt(totalIngresos)],
      ["Total egresos", fmt(totalEgresos)],
      [
        { content: "BALANCE NETO", styles: { fontStyle: "bold" } },
        {
          content: fmt(balanceNeto),
          styles: {
            fontStyle: "bold",
            textColor: balanceNeto >= 0 ? GREEN : RED,
          },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Sección: Deudores ──────────────────────────────────────
  sectionTitle("ESTADO DE DEUDORES");

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Valor"]],
    body: [
      ["Número de deudores activos", String(dashboard.conteo_deudores || 0)],
      [
        { content: "Deuda total acumulada", styles: {} },
        {
          content: fmt(dashboard.deuda_total),
          styles: { textColor: RED },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Sección: Detalle ventas del día ───────────────────────
  if (ventasHoy.length > 0) {
    sectionTitle(`DETALLE DE VENTAS HOY  (${ventasHoy.length} transacciones)`);

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 24 },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      head: [["#", "Hora", "Productos", "Total", "Devuelta"]],
      body: ventasHoy.map((v, i) => {
        const horaVenta = v.fecha
          ? v.fecha.split("T")[1]?.split(".")[0] ?? "--"
          : "--";
        const productos =
          v.detallesVentas
            ?.map((d) => `${d.producto?.nombre} x${d.cantidad}`)
            .join(", ") || "--";
        return [
          i + 1,
          horaVenta,
          productos,
          fmt(v.total),
          fmt(v.devuelta),
        ];
      }),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Sección: Detalle gastos del día ───────────────────────
  if (gastosHoy.length > 0) {
    sectionTitle("DETALLE DE GASTOS HOY");

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 2: { halign: "right" } },
      head: [["Nombre", "Estado", "Monto"]],
      body: gastosHoy.map((g) => [g.nombre, g.estado, fmt(g.precio)]),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Sección: Detalle compras del día ──────────────────────
  if (comprasHoy.length > 0) {
    sectionTitle("DETALLE DE COMPRAS HOY");

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 2: { halign: "right" } },
      head: [["Producto / Descripción", "Proveedor", "Monto"]],
      body: comprasHoy.map((c) => [
        c.nombre || c.producto?.nombre || "--",
        c.proveedor || c.producto?.proveedor?.nombre || "--",
        fmt(c.precio || c.subtotal),
      ]),
    });
  }

  // ── Footer en cada página ─────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      `Orbita Bar — Cierre de caja ${hoy} — Página ${i} de ${totalPages}`,
      W / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // ── Descargar ─────────────────────────────────────────────
  doc.save(`CierreCaja_${hoy}.pdf`);
};
