import { useReactToPrint } from "react-to-print";
import { useRef, forwardRef, useImperativeHandle } from "react";
import "../styles/ImprimirFactura.css";

const ImprimirFacturaPOS = forwardRef(({ venta }, ref) => {
  const contentRef = useRef();
  const callbackRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Factura_${venta.id}_${venta.fecha}_${venta.hora}`,
    onAfterPrint: () => {
      if (callbackRef.current) {
        callbackRef.current();
        callbackRef.current = null;
      }
    },
  });

  // Permite ejecutar desde el padre con printRef.current.print(callback)
  useImperativeHandle(ref, () => ({
    print: (callback) => {
      callbackRef.current = callback ?? null;
      handlePrint();
    },
  }));

  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: "0",
        width: "58mm", // MUY IMPORTANTE
      }}
    >
      {/* Contenido a imprimir (oculto visualmente) */}
      <div ref={contentRef} className="factura-container">
        {/* Encabezado */}
        <div className="factura-header">
          <img
            src="/src/assets/images/qsaboreslogo.png" // cambia a tu logo real
            alt="Q'Sabores"
            className="factura-logo"
          />
          <h2>ORBITABAR</h2>
          <p className="factura-slogan">
            ¡Sabor que te da una experiencia galactica! 🌟
          </p>
          <hr />
          <p className="factura-info">
            <strong>NIT EMPRESA ORBITABAR:</strong> xxxxxxxx
            <br />
            <strong>Direccion:</strong> Bello-Antioquia
            <br />
            <strong>Factura N°:</strong> {venta.id}
            <br />
            <strong>Fecha:</strong> {venta.fecha}
            <br />
            <strong>Hora:</strong> {venta.hora}
          </p>
        </div>

        {/* Detalles */}
        <table className="factura-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detallesVentas?.map((d) => (
              <tr key={d.id}>
                <td>{d.producto.nombre}</td>
                <td className="centro">{d.cantidad}</td>
                <td className="derecha">
                  ${parseFloat(d.subtotal).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="factura-total">
          Total: ${parseFloat(venta.total).toLocaleString()}
        </div>

        {/* Pago y devuelta */}
        {(venta.pago > 0 || venta.devuelta != null) && (
          <div className="factura-pago">
            {venta.pago > 0 && (
              <span>
                Pago cliente: ${parseFloat(venta.pago).toLocaleString()}
              </span>
            )}
            {venta.devuelta != null && (
              <span>
                Devuelta: ${parseFloat(venta.devuelta).toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Pie */}
        <div className="factura-footer">
          <hr />
          ¡Gracias por su compra! 🌿
        </div>
      </div>
    </div>
  );
});

export default ImprimirFacturaPOS;
