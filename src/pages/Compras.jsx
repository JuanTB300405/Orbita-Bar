import React from 'react';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import "../styles/Compras.css";
import makeAnimated from 'react-select/animated';
import { getProductos } from '../js/egresosService';

const animatedComponents = makeAnimated();

const Compras = ({ seleccionados, setSeleccionados, comprasData, itemEditando, datosEditados, handleChangeEdicion }) => {

    const [productosOptions, setProductosOptions] = useState([]);
    const [proveedoresOptions, setProveedoresOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [headerColspan, setHeaderColspan] = useState({ proveedor: 1, detalles: 1 });

    useEffect(() => {
        const loadOptions = async () => {

            if (itemEditando) {
                setHeaderColspan({ proveedor: 2, detalles: 0 });
            } else {
                setHeaderColspan({ proveedor: 1, detalles: 1 });
            }

            const productos = await getProductos();

            const productosOpts = productos.map(p => ({
                value: p.id,
                label: `${p.nombre} | ${p.proveedor.nombre}`,
                producto: p.nombre,
                proveedor: p.proveedor.nombre
            }));

            setProductosOptions(productosOpts);
            setCombinedOptions(productosOpts);
        };

        loadOptions();
    }, []);


    const handleSeleccion = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const allIds = comprasData.map(c => c.id);
    const allSelected = allIds.length > 0 && allIds.every(id => seleccionados.includes(id));

    const handleSelectAll = () => {
        if (allSelected) {
            setSeleccionados(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSeleccionados(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    const handleCombinedChange = (selectedOption, compra) => {
        if (selectedOption) {
            handleChangeEdicion({ target: { name: 'producto', value: selectedOption.producto } });
            handleChangeEdicion({ target: { name: 'proveedor', value: selectedOption.proveedor } });
            handleChangeEdicion({ target: { name: 'idproducto', value: selectedOption.value } });

            const detalle = compra?.detallesCompra?.[0] || null;
            handleChangeEdicion({
                target: {
                    name: 'detalleCompra',
                    value: detalle
                }
            });
        }
    };

    const buildLabelgetCurrentCombinedValue = (compra) => {
        if (typeof (datosEditados.producto) == "object") {
            return `${(datosEditados.producto.nombre)} | ${(datosEditados.producto?.proveedor?.nombre)}`
        }
        return `${(datosEditados.producto)} | ${(datosEditados.proveedor || compra.proveedor?.nombre)}`
    }

    const getCurrentCombinedValue = (compra) => {
        const producto = datosEditados.producto?.nombre || compra.producto?.nombre || '';
        const proveedor = datosEditados.proveedor || compra.proveedor || compra.producto?.proveedor?.nombre || '';

        if (!producto && !proveedor) return null;

        console.log("datosEditados", buildLabelgetCurrentCombinedValue(compra))

        return {
            value: datosEditados.idproducto || compra.producto?.id || '',
            label: buildLabelgetCurrentCombinedValue(compra),
            producto,
            proveedor
        };
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
                        <th className="eg-th" colSpan={headerColspan.proveedor}>
                            {itemEditando ? 'DETALLES / PROVEEDOR' : 'PROVEEDOR'}
                        </th>
                        {!itemEditando && <th className="eg-th" colSpan={headerColspan.detalles}>DETALLES</th>}
                        <th className="eg-th">CANTIDAD</th>
                        <th className="eg-th">MONTO</th>
                        <th className="eg-th">FECHA</th>
                    </tr>
                </thead>
                <tbody>
                    {comprasData && comprasData.length > 0 ? (
                        comprasData.toReversed().map((compra, index) => (
                            <tr
                                key={compra.id}
                                className={`eg-tr eg-tr--clickable${seleccionados.includes(compra.id) ? ' eg-tr--sel' : ''}${itemEditando === compra.id ? ' eg-tr--editando' : ''}`}
                                onClick={() => itemEditando === null && handleSeleccion(compra.id)}
                            >
                                <td className="eg-td eg-td--chk" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="eg-checkbox"
                                        checked={seleccionados.includes(compra.id)}
                                        onChange={() => handleSeleccion(compra.id)}
                                        disabled={itemEditando !== null && itemEditando !== compra.id}
                                    />
                                </td>
                                <td className="eg-td eg-td--idx">{index + 1}</td>

                                {/* Proveedor - Se combina con Detalles solo en edición */}
                                <td className="eg-td">
                                    {itemEditando === compra.id ? (
                                        <div className="eg-combined-select">
                                            <Select
                                                className="eg-react-select"
                                                classNamePrefix="eg-rs"
                                                menuPlacement='auto'
                                                options={combinedOptions}
                                                value={getCurrentCombinedValue(compra)}
                                                onChange={(selectedOption) => handleCombinedChange(selectedOption, compra)}
                                                placeholder="Buscar producto/proveedor..."
                                                isSearchable
                                                noOptionsMessage={() => "No se encontraron resultados"}
                                                components={animatedComponents}
                                            />
                                        </div>
                                    ) : (
                                        <span className="eg-proveedor-txt">
                                            {compra.proveedor || compra.producto?.proveedor?.nombre || 'N/A'}
                                        </span>
                                    )}
                                </td>

                                {/* Detalles - Oculto en edición */}
                                {itemEditando !== compra.id && (
                                    <td className="eg-td" style={{ visibility: itemEditando === compra.id ? 'hidden' : 'visible' }}>
                                        {compra.producto?.nombre || 'N/A'}
                                    </td>
                                )}
                                {itemEditando === compra.id && (
                                    <td className="eg-td" style={{ display: 'none' }}></td>
                                )}

                                {/* Cantidad */}
                                <td className="eg-td">
                                    {itemEditando === compra.id ? (
                                        <input
                                            className="eg-input-edit eg-input-edit--sm"
                                            type="number"
                                            name="cantidad"
                                            value={datosEditados.cantidad === 0 ? 0 : datosEditados.cantidad || ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? '' : Number(e.target.value);
                                                handleChangeEdicion({ target: { name: e.target.name, value } });
                                            }}
                                            min="0"
                                        />
                                    ) : (
                                        compra.cantidad ? new Number(compra.cantidad).toLocaleString('es-CO', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }) : 'N/A'
                                    )}
                                </td>

                                {/* Precio */}
                                <td className="eg-td">
                                    {itemEditando === compra.id ? (
                                        <input
                                            className="eg-input-edit eg-input-edit--sm"
                                            type="number"
                                            name="precio"
                                            value={datosEditados.precio === 0 ? 0 : datosEditados.precio || ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? '' : Number(e.target.value);
                                                handleChangeEdicion({ target: { name: e.target.name, value } });
                                            }}
                                            min="0"
                                        />
                                    ) : (
                                        <span className="eg-precio-txt">
                                            ${Number(compra.precio || 0).toLocaleString('es-CO', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}
                                        </span>
                                    )}
                                </td>

                                {/* Fecha */}
                                <td className="eg-td eg-td--fecha">
                                    {itemEditando === compra.id ? (
                                        <input
                                            className="eg-input-edit eg-input-edit--sm"
                                            type="date"
                                            name="fecha"
                                            value={datosEditados.fecha || compra.fecha || ''}
                                            onChange={handleChangeEdicion}
                                        />
                                    ) : (
                                        compra.fecha ? new Date(compra.fecha.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) : 'N/A'
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="eg-td eg-td--empty">
                                <div className="eg-empty-state">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <path d="M17 17h-11v-14h-2" />
                                        <path d="M6 5l14 1l-1 7h-13" />
                                    </svg>
                                    <span>No hay compras registradas</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Compras;
