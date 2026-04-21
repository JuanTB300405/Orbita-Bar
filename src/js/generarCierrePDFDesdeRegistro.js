// js/generarCierrePDFDesdeRegistro.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (valor) => {
  const n = parseFloat(valor || 0);
  return "$" + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const generarCierrePDFDesdeRegistro = (registro) => {
  const {
    fecha,
    hora,
    total_ventas,
    total_propinas,
    total_descorches,
    total_otros,
    total_ingresos,
    total_gastos,
    total_compras,
    total_egresos,
    balance_neto,
    conteo_deudores,
    deuda_total,
    num_ventas,
  } = registro;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const DARK = [15, 23, 42];
  const HEADER_BG = [30, 41, 59];
  const GREEN = [22, 163, 74];
  const RED = [220, 38, 38];
  const GRAY = [100, 116, 139];

  // Encabezado
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
  doc.text(`Fecha: ${fecha}   |   Hora: ${hora}`, W / 2, 26, {
    align: "center",
  });

  let y = 38;

  const tableDefaults = {
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: {
      fillColor: HEADER_BG,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14 },
  };

  const sectionTitle = (titulo) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(titulo, 14, y);
    y += 3;
  };

  // Ingresos
  sectionTitle("INGRESOS DEL DÍA");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Ventas", fmt(total_ventas)],
      ["Propinas", fmt(total_propinas)],
      ["Descorches", fmt(total_descorches)],
      ["Otros ingresos", fmt(total_otros)],
      [
        { content: "TOTAL INGRESOS", styles: { fontStyle: "bold" } },
        {
          content: fmt(total_ingresos),
          styles: { fontStyle: "bold", textColor: GREEN },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // Egresos
  sectionTitle("EGRESOS DEL DÍA");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Gastos", fmt(total_gastos)],
      ["Compras a proveedores", fmt(total_compras)],
      [
        { content: "TOTAL EGRESOS", styles: { fontStyle: "bold" } },
        {
          content: fmt(total_egresos),
          styles: { fontStyle: "bold", textColor: RED },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // Balance
  sectionTitle("BALANCE NETO DEL DÍA");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Monto"]],
    body: [
      ["Total ingresos", fmt(total_ingresos)],
      ["Total egresos", fmt(total_egresos)],
      [
        { content: "BALANCE NETO", styles: { fontStyle: "bold" } },
        {
          content: fmt(balance_neto),
          styles: {
            fontStyle: "bold",
            textColor: parseFloat(balance_neto) >= 0 ? GREEN : RED,
          },
        },
      ],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // Deudores
  sectionTitle("ESTADO DE DEUDORES");
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    columnStyles: { 1: { halign: "right" } },
    head: [["Concepto", "Valor"]],
    body: [
      ["Número de transacciones", String(num_ventas || 0)],
      ["Número de deudores activos", String(conteo_deudores || 0)],
      [
        { content: "Deuda total acumulada", styles: {} },
        { content: fmt(deuda_total), styles: { textColor: RED } },
      ],
    ],
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      `Orbita Bar — Cierre de caja ${fecha} — Página ${i} de ${totalPages}`,
      W / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  doc.save(`CierreCaja_${fecha}.pdf`);
};
