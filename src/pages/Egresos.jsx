import React from 'react';
import Button from '../components/Button';
import '../styles/Egresos.css';
import { useState, useEffect } from 'react';
import Gastos from './Gastos';
import Compras from './Compras';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEgresos, createEgreso, deleteEgreso, updateEgreso, getProductos } from "../js/egresosService";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


const normalizarTexto = (texto) => {
    return texto
        .normalize("NFD") // Descompone los caracteres con tilde
        .replace(/[\u0300-\u036f]/g, "") // Elimina las tildes
        .toLowerCase(); // Pasa a minúsculas
};


const formatearFechaHumana = (fecha) => {
    if (!fecha) return '';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj)) return ''; // Maneja fechas inválidas
    return fechaObj.toLocaleDateString('es-ES', opciones); // Ej: "24 de julio de 2025"
};


const Egresos = () => {

    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [vista, setVista] = useState("gastos");
    const [egresoData, setEgresoData] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [error, setError] = useState('');
    const [edicion, setEdicion] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);
    const [datosEditados, setDatosEditados] = useState({});
    
    const animatedComponents = makeAnimated();
    

    // Modificar el estado inicial
    const [productosOptions, setProductosOptions] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Agregar esta función para obtener productos
    const obtenerProductos = async () => {
        try {
            const productos = await getProductos(); // Asume que tienes este endpoint
            const options = productos.map(producto => ({
                value: producto.id,
                label: `${producto.nombre} (${producto.proveedor.nombre})`,
                nombre: producto.nombre,
                proveedor: producto.proveedor.nombre
            }));
            setProductosOptions(options);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            toast.error("Error al cargar los productos");
        }
    };


 const filtrarEgresos = () => {
        const termino = normalizarTexto(busqueda.trim());

    // Detectar si el usuario quiere filtrar por campo específico
    const matchCampo = termino.match(/^(\w+)=(.*)$/);

    return egresoData.filter(item => {
        const nombre = item.nombre || item.producto?.nombre || '';
        const proveedor = item.proveedor || item.producto?.proveedor?.nombre || '';
        const estado = item.estado || '';
        const fecha = item.fecha || '';
        const fechaNormal = normalizarTexto(fecha); // 2025-07-24
        const fechaHumana = normalizarTexto(formatearFechaHumana(fecha)); // 24 de julio de 2025

        if (matchCampo) {
            const campo = matchCampo[1];
            const valor = matchCampo[2].trim();

            switch (campo) {
                case 'nombre':
                    return normalizarTexto(nombre).includes(normalizarTexto(valor));
                case 'detalles':
                    return normalizarTexto(nombre).includes(normalizarTexto(valor));
                case 'proveedor':
                    return normalizarTexto(proveedor).includes(normalizarTexto(valor));
                case 'estado':
                    return normalizarTexto(estado).includes(normalizarTexto(valor));
                case 'fecha':
                    return (
                        fechaNormal.includes(normalizarTexto(valor)) ||
                        fechaHumana.includes(normalizarTexto(valor))
                    );
                default:
                    return true; // Si el campo no es reconocido, muestra todo
            }
        }

        // Filtro general si no hay campo específico
            return (
                normalizarTexto(nombre).includes(termino) ||
                normalizarTexto(proveedor).includes(termino) ||
                fechaNormal.includes(termino) ||
                fechaHumana.includes(termino)
            );
        });
    };


    // Formulario dinámico según vista
    const [datosForm, setDatosForm] = useState({
        nombre: '',
        precio: '',
        // Campos para gastos
        estado: '',
        fecha_de_pago: '',
        // Campos para compras
        cantidad: '',
        proveedor: '',
        fecha_de_compra: ''
    });

    // Obtener datos según la vista actual
    const obtenerEgresos = async () => {
        try {
            setCargando(true);
            const data = await getEgresos(vista);
            // console.log("data", data)
            const datosNormalizados = data.map(item => ({
                id: item.id || '',
                nombre: item.nombre || '',
                precio: item.precio || item.subtotal || 0,
                estado: item.estado || '',
                fecha_de_pago: item.fecha_de_pago || '',
                idDetalle: item.detallesCompra?.id || (item.detallesCompra && item.detallesCompra[0]?.id) || '',
                producto: item.idproducto || (item.detallesCompra && item.detallesCompra[0]?.producto) || '',
                cantidad: item.cantidad || (item.detallesCompra && item.detallesCompra[0]?.cantidad) || 0,
                fecha: item.fecha || item.fecha_de_compra || '',
                proveedor: item.proveedor || '',
                productoInfo: item.productoInfo || '',
                
            }));
            console.log("datos normalizados",datosNormalizados)
            setEgresoData(datosNormalizados);
        } catch (error) {
            console.error("Error en la consulta:", error);
            toast.error("Error al cargar los datos");
        } finally {
            setCargando(false);
        }
    };

    // Manejar cambio en inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatosForm(prev => ({ ...prev, [name]: value }));
    };

    // Manejar envío del formulario
   const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica
        if (vista === "gastos" && (!datosForm.nombre || !datosForm.precio || !datosForm.estado || !datosForm.fecha_de_pago)) {
            setError("Todos los campos son obligatorios para gastos");
            return;
        }

        if (vista === "compras" && (!datosForm.idproducto || !datosForm.precio || !datosForm.cantidad || !datosForm.fecha_de_compra)) {
            setError("Todos los campos son obligatorios para compras");
            return;
        }
        
        try {
            let dataToSend;
            
            if (vista === "gastos") {
                dataToSend = {
                    nombre: datosForm.nombre,
                    precio: datosForm.precio,
                    estado: datosForm.estado,
                    fecha_de_pago: datosForm.fecha_de_pago
                };
            } else { // compras
                dataToSend = {
                    subtotal: datosForm.precio,
                    fecha: datosForm.fecha_de_compra,
                    detallesCompra: [{
                        idproducto: datosForm.idproducto,
                        cantidad: datosForm.cantidad
                    }]
                };
            }

            const response = await createEgreso(vista, dataToSend);
            if (response.status === 201) {
                toast.success(`${vista === "gastos" ? "Gasto" : "Compra"} creado exitosamente!`);
                obtenerEgresos();
                cerrarModalAgregar();
                setProductoSeleccionado(null); // Limpiar selección
            }
        } catch (error) {
            toast.error(`Error al crear ${vista === "gastos" ? "gasto" : "compra"}`);
            console.error(error);
        }
    };

    // Manejar eliminación de egresos
    const eliminarEgresoSeleccionado = async () => {
        try {
            const response = await deleteEgreso(vista, seleccionados);
            if (response.status === 204) {
                toast.success(`${vista === "gastos" ? "Gasto(s)" : "Compra(s)"} eliminado(s) exitosamente!`);
                obtenerEgresos();
            }
        } catch (error) {
            toast.error(`Error al eliminar ${vista}`);
        }
        setShowModalEliminar(false);
    };

    const obtenerFechaColombia = () => {
        const hoy = new Date();
        const offsetColombia = hoy.getTimezoneOffset() + 300; // getTimezoneOffset() ya da en minutos
        hoy.setMinutes(hoy.getMinutes() - offsetColombia); // restamos para ajustar a UTC-5
        return hoy.toISOString().slice(0, 10); // YYYY-MM-DD
    };
    // Funciones para manejar modales
    const abrirModalAgregar = () => {
        setDatosForm({
            nombre: '',
            precio: '',
            estado: '',
            fecha_de_pago: obtenerFechaColombia(),
            idproducto: '',
            cantidad: '',
            fecha_de_compra: obtenerFechaColombia()
        });
        setProductoSeleccionado(null);
        setError('');
        setShowModalAgregar(true);
    };

    const cerrarModalAgregar = () => {
        setShowModalAgregar(false);
    };

    // Lógica para edición
    const verEdicion = () => {
        const itemsSeleccionados = egresoData.filter(item => seleccionados.includes(item.id));

        if (itemsSeleccionados.length === 0) {
            toast.warning(`No hay ningún ${vista === "gastos" ? "gasto" : "compra"} seleccionado`);
            return;
        }
        
        if (itemsSeleccionados.length > 1) {
            toast.warning(`Selecciona solo un ${vista === "gastos" ? "gasto" : "compra"} para editar`);
            return;
        }

        const itemSeleccionado = itemsSeleccionados[0];
        setEdicion(true);
        setItemEditando(itemSeleccionado.id);
        setDatosEditados({ ...itemSeleccionado });
    };

    const cancelarEdicion = () => {
        setEdicion(false);
        setItemEditando(null);
        setDatosEditados({});
        toast.info("Edición cancelada");
    };

    const guardarEdicion = async () => {
    try {
        let datosActualizados;
        if (vista == "gastos") {
            datosActualizados = {
                id: datosEditados.id,
                nombre: datosEditados.nombre,
                precio: datosEditados.precio,
                estado: datosEditados.estado,
                fecha_de_pago: datosEditados.fecha_de_pago
            };
        } else { // compras
            datosActualizados = {
                id: datosEditados.id,
                subtotal: Number(datosEditados.precio),
                fecha: datosEditados.fecha,
                detallesCompra: [{
                    id: Number(datosEditados.idDetalle), 
                    idproducto: Number(datosEditados.producto?.id ?? datosEditados.idproducto),
                    cantidad: Number(datosEditados.cantidad)
                }]
            };
        }
        const response = await updateEgreso(vista, datosActualizados.id, datosActualizados);
        
        if (response.status == 200) {
            toast.success("¡Cambios guardados exitosamente!");
            obtenerEgresos();
            cancelarEdicion();
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        toast.error("Error al guardar los cambios");
        }
    }


    const handleChangeEdicion = (e) => {
        const { name, value } = e.target;
        setDatosEditados(prev => ({ ...prev, [name]: value }));
    };

    // Cargar datos cuando cambia la vista
    useEffect(() => {
          if (vista === "compras") {
            obtenerProductos();
            }
        obtenerEgresos();
        setSeleccionados([]);
        setEdicion(false);
        setItemEditando(null);
    }, [vista]);

    if (cargando) {
        return (
            <div className="modal-cargando">
                <div className="modal-contenido-c">
                    <div className='loader'></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="egresos">
                {/* <h1>EGRESOS</h1> */}
                <div id="cont">
                    <div className="buscador">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-search">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                       <input
                            type="text"
                            placeholder={`Buscar ${vista === "gastos" ? "gastos" : "compras"}...`}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="rojo" 
                        onClick={() => seleccionados.length > 0 ? setShowModalEliminar(true) : toast.warning(`Seleccione ${vista === "gastos" ? "gastos" : "compras"} para eliminar`)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 7l16 0" />
                            <path d="M10 11l0 6" />
                            <path d="M14 11l0 6" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                        Eliminar
                    </Button>
                    <Button 
                        variant="azul" 
                        onClick={verEdicion}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                            <path d="M16 5l3 3" />
                        </svg>
                        Editar
                    </Button>
                    <Button variant="verde" onClick={abrirModalAgregar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-plus">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
                            <path d="M15 12h-6" />
                            <path d="M12 9v6" />
                        </svg>
                        Agregar
                    </Button>
                </div>
                <div id='botones-tablas'>
                    <Button 
                        variant={vista === "gastos" ? "activo" : "neutro"} 
                        onClick={() => setVista('gastos')}
                    >
                        Ver Gastos
                    </Button>
                    <Button 
                        variant={vista === "compras" ? "activo" : "neutro"} 
                        onClick={() => setVista('compras')}
                    >
                        Ver Compras
                    </Button>
                </div>
                <div id='tablas'>
                    {vista === "gastos" && 
                        <Gastos 
                            seleccionados={seleccionados}
                            setSeleccionados={setSeleccionados}
                            gastosData={filtrarEgresos()}
                            itemEditando={itemEditando}
                            datosEditados={datosEditados}
                            handleChangeEdicion={handleChangeEdicion}
                        />
                    }
                    {vista === "compras" && 
                        <Compras 
                            seleccionados={seleccionados}
                            setSeleccionados={setSeleccionados}
                            comprasData={filtrarEgresos()}
                            itemEditando={itemEditando}
                            datosEditados={datosEditados}
                            handleChangeEdicion={handleChangeEdicion}
                        />
                    }
                </div>

                {edicion && (
                    <div id="botoness-edicion">
                        <Button variant="verde" onClick={guardarEdicion}>Guardar</Button>
                        <Button variant="rojo" onClick={cancelarEdicion}>Cancelar</Button>
                    </div>
                )}

                {/* Modal de eliminar */}
                {showModalEliminar && (
                    <div className="modal" onClick={() => setShowModalEliminar(false)}>
                        <div className="modal-contenedor-eliminar-p" onClick={(e) => e.stopPropagation()}>
                            <h2>¿Está completamente seguro que desea eliminar el/los {vista === "gastos" ? "gasto(s)" : "compra(s)"} seleccionado(s)?</h2>
                            <div id="botoness">
                                <Button variant="verde" onClick={eliminarEgresoSeleccionado}>Aceptar</Button>
                                <Button variant="rojo" onClick={() => setShowModalEliminar(false)}>Cancelar</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de agregar */}
                {showModalAgregar && (
                    <div className="modal" onClick={cerrarModalAgregar}>
                        <div className="modal-contenedor-p" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-contenido-p">
                                <form className="formulario-p" onSubmit={handleSubmit}>
                                    <h2>Agregar {vista === "gastos" ? "Gasto" : "Compra"}</h2>
                                    {vista === "gastos" ? (
                                        <>
                                            <div className="bloque-p">
                                                <label>{vista === "gastos" ? "Nombre del gasto" : "Nombre del producto"}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder={vista === "gastos" ? "Ej: Arriendo" : "Ej: Bon Bon Bum"} 
                                                    name="nombre" 
                                                    value={datosForm.nombre} 
                                                    onChange={handleChange} 
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="bloque-p">
                                                <label>Precio</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Ej: 500000" 
                                                    name="precio" 
                                                    value={datosForm.precio} 
                                                    onChange={handleChange}  
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <div className="bloque-p">
                                                <label>Estado</label>
                                                <select 
                                                    name="estado" 
                                                    value={datosForm.estado} 
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Seleccione...</option>
                                                    <option value="Fijo">Fijo</option>
                                                    <option value="Variable">Variable</option>
                                                </select>
                                            </div>

                                            <div className="bloque-p">
                                                <label>Fecha de pago</label>
                                                <input 
                                                    type="date" 
                                                    name="fecha_de_pago" 
                                                    value={datosForm.fecha_de_pago} 
                                                    onChange={handleChange} 
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                            <>
                                                <div className="bloque-p">
                                                    <label>Producto</label>
                                                    <Select
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        menuPlacement='auto'
                                                        options={productosOptions}
                                                        value={productoSeleccionado}
                                                        onChange={(selectedOption) => {
                                                            setProductoSeleccionado(selectedOption);
                                                            setDatosForm(prev => ({
                                                                ...prev,
                                                                idproducto: selectedOption.value,
                                                                nombre: selectedOption.nombre,
                                                                proveedor: selectedOption.proveedor
                                                            }));
                                                        }}
                                                        placeholder="Buscar producto..."
                                                        isSearchable
                                                        noOptionsMessage={() => "No se encontraron productos"}
                                                        components={animatedComponents}
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="bloque-p">
                                                    <label>Subtotal</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Ej: 500000" 
                                                        name="precio" 
                                                        value={datosForm.precio} 
                                                        onChange={handleChange}  
                                                        min="0"
                                                        required
                                                    />
                                                </div>

                                                <div className="bloque-p">
                                                    <label>Cantidad</label>
                                                    <input 
                                                        type="text" 
                                                        pattern="[0-9]*"
                                                        placeholder="Ej: 100" 
                                                        name="cantidad" 
                                                        value={datosForm.cantidad} 
                                                        onChange={handleChange} 
                                                        // min="1"
                                                        required
                                                    />
                                                </div>

                                                <div className="bloque-p">
                                                    <label>Fecha de compra</label>
                                                    <input 
                                                        type="date" 
                                                        name="fecha_de_compra" 
                                                        value={datosForm.fecha_de_compra} 
                                                        onChange={handleChange} 
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}
                                    {error && <p className="error-p">{error}</p>}  

                                    <div className="botones">
                                        <Button type="submit" variant="verde" className="btn">Guardar</Button>
                                        <Button variant="rojo" onClick={cerrarModalAgregar} className="btn">Cancelar</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer position="top-center" autoClose={3000} />
            </section>
        </>
    );
}

export default Egresos;