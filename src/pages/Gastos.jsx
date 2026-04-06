import React from 'react';
import "../styles/Gastos.css";

const parsearFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const [y, m, d] = fechaStr.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const Gastos = ({ seleccionados, setSeleccionados, gastosData, itemEditando, datosEditados, handleChangeEdicion }) => {
    const handleSeleccion = (id) => {
        setSeleccionados(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };
    // console.log(gastosData)
    return (
        <div className="gastos-tabla">
            <table className="tabla">
                <thead className='t'>
                    <tr>
                        <th></th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Fecha de pago</th>
                    </tr>
                </thead>
                <tbody>
                    {gastosData && gastosData.length > 0 ? (
                        gastosData.toReversed().map((gasto) => (
                            <tr key={gasto.id}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={seleccionados.includes(gasto.id)}
                                        onChange={() => handleSeleccion(gasto.id)}
                                        disabled={itemEditando !== null && itemEditando !== gasto.id}
                                    />
                                </td>
                                <td>
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="inputss"
                                            type="text"
                                            name="nombre"
                                            value={datosEditados.nombre || ''}
                                            onChange={handleChangeEdicion}
                                        />
                                    ) : (
                                        gasto.nombre || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="inputss"
                                            type="number"
                                            name="precio"
                                            value={datosEditados.precio || 0}
                                            onChange={handleChangeEdicion}
                                            min="0"
                                        />
                                    ) : (
                                        `$${Number(gasto.precio || 0).toLocaleString('es-CO', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                            })}`
                                    )}
                                </td>
                                <td>
                                    {itemEditando === gasto.id ? (
                                        <select
                                            className="inputss"
                                            name="estado"
                                            value={datosEditados.estado || ''}
                                            onChange={handleChangeEdicion}
                                        >
                                            <option value="Fijo">Fijo</option>
                                            <option value="Variable">Variable</option>
                                        </select>
                                    ) : (
                                        gasto.estado || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="inputss"
                                            type="date"
                                            name="fecha_de_pago"
                                            value={datosEditados.fecha_de_pago || ''}
                                            onChange={handleChangeEdicion}
                                        />
                                    ) : (
                                        gasto.fecha_de_pago ? new Date(gasto.fecha_de_pago.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) : 'N/A'
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-data">
                                No hay gastos registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Gastos;