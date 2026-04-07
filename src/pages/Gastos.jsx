import React from 'react';
import "../styles/Gastos.css";

const Gastos = ({ seleccionados, setSeleccionados, gastosData, itemEditando, datosEditados, handleChangeEdicion }) => {

    const handleSeleccion = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const allIds = gastosData.map(g => g.id);
    const allSelected = allIds.length > 0 && allIds.every(id => seleccionados.includes(id));

    const handleSelectAll = () => {
        if (allSelected) {
            setSeleccionados(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    return (
        <div className="eg-table-wrap">
            <table className="eg-table">
                <thead className="eg-thead">
                    <tr className="eg-tr eg-tr--header">
                        <th className="eg-th eg-th--chk">
                            <input
                                type="checkbox"
                                className="eg-checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                disabled={allIds.length === 0}
                                title="Seleccionar todo"
                            />
                        </th>
                        <th className="eg-th eg-th--idx">#</th>
                        <th className="eg-th">NOMBRE</th>
                        <th className="eg-th">PRECIO</th>
                        <th className="eg-th">ESTADO</th>
                        <th className="eg-th">FECHA DE PAGO</th>
                    </tr>
                </thead>
                <tbody>
                    {gastosData && gastosData.length > 0 ? (
                        gastosData.toReversed().map((gasto, index) => (
                            <tr
                                key={gasto.id}
                                className={`eg-tr eg-tr--clickable${seleccionados.includes(gasto.id) ? ' eg-tr--sel' : ''}${itemEditando === gasto.id ? ' eg-tr--editando' : ''}`}
                                onClick={() => itemEditando === null && handleSeleccion(gasto.id)}
                            >
                                <td className="eg-td eg-td--chk" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="eg-checkbox"
                                        checked={seleccionados.includes(gasto.id)}
                                        onChange={() => handleSeleccion(gasto.id)}
                                        disabled={itemEditando !== null && itemEditando !== gasto.id}
                                    />
                                </td>
                                <td className="eg-td eg-td--idx">{index + 1}</td>
                                <td className="eg-td">
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="eg-input-edit"
                                            type="text"
                                            name="nombre"
                                            value={datosEditados.nombre || ''}
                                            onChange={handleChangeEdicion}
                                        />
                                    ) : (
                                        <span className="eg-nombre-txt">{gasto.nombre || 'N/A'}</span>
                                    )}
                                </td>
                                <td className="eg-td">
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="eg-input-edit eg-input-edit--sm"
                                            type="number"
                                            name="precio"
                                            value={datosEditados.precio || 0}
                                            onChange={handleChangeEdicion}
                                            min="0"
                                        />
                                    ) : (
                                        <span className="eg-precio-txt">
                                            ${Number(gasto.precio || 0).toLocaleString('es-CO', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}
                                        </span>
                                    )}
                                </td>
                                <td className="eg-td">
                                    {itemEditando === gasto.id ? (
                                        <select
                                            className="eg-input-edit eg-input-edit--select"
                                            name="estado"
                                            value={datosEditados.estado || ''}
                                            onChange={handleChangeEdicion}
                                        >
                                            <option value="Fijo">Fijo</option>
                                            <option value="Variable">Variable</option>
                                        </select>
                                    ) : (
                                        <span className={`eg-badge${gasto.estado === 'Fijo' ? ' eg-badge--fijo' : ' eg-badge--variable'}`}>
                                            {gasto.estado || 'N/A'}
                                        </span>
                                    )}
                                </td>
                                <td className="eg-td eg-td--fecha">
                                    {itemEditando === gasto.id ? (
                                        <input
                                            className="eg-input-edit eg-input-edit--sm"
                                            type="date"
                                            name="fecha_de_pago"
                                            value={datosEditados.fecha_de_pago || ''}
                                            onChange={handleChangeEdicion}
                                        />
                                    ) : (
                                        gasto.fecha_de_pago
                                            ? new Date(gasto.fecha_de_pago.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })
                                            : 'N/A'
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="eg-td eg-td--empty">
                                <div className="eg-empty-state">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
                                        <path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2" />
                                    </svg>
                                    <span>No hay gastos registrados</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Gastos;
