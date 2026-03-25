import "../styles/Inventario.css";
import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../components/Button";
import { consultaExistencias, consultaInventario } from "../js/inventario";
import { consultaProveedores } from "../js/proveedores";
import { consultaCategoria } from "../js/categoria";
import { crearProductos } from "../js/inventario";
import { eliminarProductos } from "../js/inventario";
import { editarProductos } from "../js/inventario";

const Inventario = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  console.log("busqueda", busqueda);
  const [productosData, setProductosData] = useState([]);
  const [existencias, setExistencias] = useState([]);
  const [proveedoresData, setProveedoresData] = useState([]);
  const [categoriaData, setCategoriaData] = useState([]);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  console.log("categoria seleccionada", categoriaSeleccionada);
  const datosFitrados = productosData.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      producto.categoria.nombre
        .toLowerCase()
        .includes(categoriaSeleccionada.toLowerCase())
  );
  console.log("datos filtrados", datosFitrados);

  const obtenerInventario = async () => {
    try {
      const data = await consultaInventario();
      if (Array.isArray(data)) {
        setProductosData(data);
      } else {
        setError("Error al acceder al inventario");
        console.error("Respuesta inesperada:", data);
      }
    } catch (err) {
      setError("Error al consultar el inventario");
      console.error("Error en la consulta:", err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerExistencias = async () => {
    try {
      const data = await consultaExistencias();
      if (Array.isArray(data)) {
        setExistencias(data);
      } else {
        setError("Error al acceder a las Existencias de los productos porximos a terminar");
        console.error("Respuesta inesperada:", data);
      }
    } catch (err) {
      setError("Error al acceder a las Existencias de los productos porximos a terminar");
      console.error("Error en la consulta:", err);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const provedoresD = await consultaProveedores();
      if (Array.isArray(provedoresD)) {
        setProveedoresData(provedoresD);
      } else {
        setError("Error al acceder a los proveedores");
        console.error("Respuesta inesperada:", provedoresD);
      }
    } catch (error) {
      setError("Error al consultar los proveedores");
      console.error("Error en la consulta:", error);
    }
  };

  const obtenerCategoria = async () => {
    try {
      const categorias = await consultaCategoria();
      if (Array.isArray(categorias)) {
        setCategoriaData(categorias);
      } else {
        setError("Error al acceder a la categoria");
        console.error("Respuesta inesperada:", categorias);
      }
    } catch (error) {
      setError("Error al consultar las categorias");
      console.error("Error en la consulta:", error);
    }
  };

  useEffect(() => {
    obtenerInventario();
    obtenerProveedores();
    obtenerCategoria();
    obtenerExistencias();
  }, []);

  console.log("Hijueputa",existencias);

  // Logica para verificar los cambios del formulario y guardar el nuevo producto

  const [datosForm, setdatosForm] = useState({
    nombre: "",
    precio: "",
    tope: "",
    proveedor: "",
    categoria: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    const { nombre, precio, tope, proveedor, categoria } = datosForm;
    console.log("estos son los datos: ", datosForm);

    if (!nombre || !precio || !tope) {
      setError("Por favor complete todos los campos.");
      return;
    }

    if (!proveedor) {
      setError("Debe seleccionar un proveedor del producto");
      return;
    }

    if (!categoria) {
      setError("Debe seleccionar una categoria del producto");
      return;
    }

    // Agregar el producto a la tabla

    const data = {
      nombre: nombre,
      precio: precio,
      cantidad_actual: 0,
      cantidad_inicial: 0,
      foto: null,
      topeMin: tope,
      categoriaid: categoria,
      proveedorid: proveedor,
    };

    try {
      const response = await crearProductos(data);
      if (response.status === 201) {
        toast.success("¡Producto guardado exitosamente!");
        obtenerInventario();
      }
    } catch (error) {
      console.error("Excepcion al crear el producto", error);
      toast.error("Error al crear el producto");
    }

    // Reset
    setdatosForm({
      nombre: "",
      precio: "",
      tope: "",
      proveedor: "",
      categoria: "",
    });
    setError("");
    cerrarModalAgregar();
  };

  // Logica para el cambio de imagen

  const inputRef = useRef(null);

  // Logica para el modal de agregar

  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => {
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    inputRef.current.value = null;
    setdatosForm({
      nombre: "",
      precio: "",
      proveedor: "",
      categoria: "",
    });
    setError("");
  };

  // Filas de tabla seleccionadas

  const [seleccionados, setSeleccionados] = useState([]);

  // Logica para el modal de eliminar

  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    const Seleccionados = productosData.filter((p) =>
      seleccionados.includes(p.id)
    );
    if (Seleccionados.length === 0) {
      toast.warning("No hay ningun producto seleccionado");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const eliminarProdSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarProductos(data);
      if (response.status === 204) {
        toast.success("¡Productos eliminados exitosamente!");
        obtenerInventario();
      }
    } catch (error) {
      console.error("Excepcion al eliminar el producto", error);
      toast.error("Error al eliminar el producto");
    }

    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  // Logica para la edicion del producto

  const [edicion, setEdicion] = useState(false);
  const [ProdEditadoID, setProdEditadoID] = useState(null);
  const [ProdEditado, setProdEditado] = useState({});

  const verEdicion = () => {
    const ProdSeleccionado = productosData.filter((p) =>
      seleccionados.includes(p.id)
    );

    if (ProdSeleccionado.length === 0) {
      toast.warning("No hay ningun producto seleccionado");
      return;
    }

    if (ProdSeleccionado.length > 1) {
      toast.warning("Selecciona solo un producto para editar");
      return;
    }

    const productoSeleccionado = ProdSeleccionado[0];

    setEdicion(true);
    Editar(productoSeleccionado);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const Editar = (producto) => {
    setProdEditadoID(producto.id);
    setProdEditado({ ...producto });
  };

  const CancelarEdicion = () => {
    setProdEditadoID(null);
    setProdEditado({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    const productoFormateado = {
      nombre: ProdEditado.nombre,
      precio: ProdEditado.precio,
      cantidad_actual: 0,
      cantidad_inicial: 0,
      foto: null,
      topeMin: 10,
      categoriaid: ProdEditado.categoria.id,
      proveedorid: ProdEditado.proveedor.id,
    };

    console.log("producto editado", productoFormateado);

    try {
      const response = await editarProductos(productoFormateado, ProdEditadoID);
      if (response.status === 200) {
        toast.success("¡Producto actualizado exitosamente!");
        obtenerInventario();
      } else {
        console.log("respuesta :", response);
      }
    } catch (error) {
      console.error("Excepcion al actualizar el producto", error);
      toast.error("Error al actualizar el producto");
    }

    setProdEditadoID(null);
    setProdEditado({});
    ocultarEdicion();
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;

    if (name === "categoria") {
      const categoriaSelec = categoriaData.find(
        (cat) => cat.id === parseInt(value)
      );
      setProdEditado((prev) => ({
        ...prev,
        categoria: categoriaSelec,
      }));
    } else if (name === "proveedor") {
      const proveedorSelec = proveedoresData.find(
        (p) => p.id === parseInt(value)
      );
      setProdEditado((prev) => ({
        ...prev,
        proveedor: proveedorSelec,
      }));
    } else {
      setProdEditado((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //****************************************************************************************************** */
  // Notificacion de existencias

  const [noti, setNoti] = useState(false);
  const [condicion, setCondicion] = useState(false);

  //const productosP = [];

  useEffect(() => {
    if (existencias.length === 0) {
      setCondicion(false);
    } else {
      setCondicion(true);
    }
  }, [existencias]);

  const verNoti = () => {
    setNoti(true);
  };

  const ocultarNoti = () => {
    setNoti(false);
  };

  // /////////////////////////////////////////////////////////////////////////////////////////////////////

  if (cargando) {
    return (
      <div className="modal-cargando">
        <div className="modal-contenido-c">
          <div class="loader"></div>
        </div>
      </div>
    );
  }

  // /////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <section className="inventario">
        <div className="iconoti">
          <h1>INVENTARIO</h1>
          {condicion && (
            <svg  
              xmlns="http://www.w3.org/2000/svg"  
              width="60"  
              height="60"  
              viewBox="0 0 24 24"  
              fill="#7c0000ff"  
              className="alertIcon"
              onClick={verNoti}
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 2c5.523 0 10 4.477 10 10a10 
                10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 
                -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 
                1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 
                -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0
                1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" 
              />
            </svg>
          )}
        </div>
        <div id="cont">
          <div className="buscador">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-search"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div id="cont-select">
            <select
              id="select"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Todas</option>
              {[...categoriaData]
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((categoria) => (
                  <option key={categoria.id} value={categoria.nombre}>
                    {categoria.nombre}
                  </option>
                ))}
            </select>
          </div>
          <Button variant="rojo" onClick={abrirModalEliminar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            Eliminar
          </Button>
          <Button variant="azul" onClick={verEdicion}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-edit"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
            Editar
          </Button>
          <Button variant="verde" onClick={abrirModalAgregar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
              <path d="M15 12h-6" />
              <path d="M12 9v6" />
            </svg>
            Agregar
          </Button>
        </div>
        <br />
        <div className="inventario-tabla">
          <table className="tabla">
            <thead className="t">
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Unitario</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {(categoriaSeleccionada
                ? datosFitrados.filter(
                    (p) => p.categoria.nombre === categoriaSeleccionada
                  )
                : datosFitrados
              ).map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(producto.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados([...seleccionados, producto.id]);
                        } else {
                          setSeleccionados(
                            seleccionados.filter((id) => id !== producto.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td>
                    {ProdEditadoID === producto.id ? (
                      <input
                        className="inputs"
                        type="text"
                        name="nombre"
                        value={ProdEditado.nombre}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      producto.nombre
                    )}
                  </td>
                  <td>
                    {ProdEditadoID === producto.id ? (
                      <select
                        id="select-form-e"
                        name="categoria"
                        value={ProdEditado.categoria?.id || ""}
                        onChange={handleChangeEdicion}
                      >
                        {categoriaData.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      producto.categoria.nombre
                    )}
                  </td>
                  <td>
                    {ProdEditadoID === producto.id ? (
                      <input
                        className="inputs"
                        type="number"
                        name="precio"
                        value={ProdEditado.precio}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      producto.precio
                    )}
                  </td>
                  <td>
                    {ProdEditadoID === producto.id ? (
                      <select
                        id="select-form-e"
                        name="proveedor"
                        value={ProdEditado.proveedor?.id || ""}
                        onChange={handleChangeEdicion}
                      >
                        {proveedoresData.map((proveedor) => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      producto.proveedor.nombre
                    )}
                  </td>
                  <td>
                    {ProdEditadoID === producto.id ? (
                      <input
                        className="inputs"
                        type="number"
                        name="cantidad"
                        value={ProdEditado.cantidad_actual}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      producto.cantidad_actual
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edicion && (
          <div id="botoness-edicion">
            <Button variant="verde" onClick={GuardarEdicion}>
              {" "}
              Guardar{" "}
            </Button>
            <Button variant="rojo" onClick={CancelarEdicion}>
              {" "}
              Cancelar{" "}
            </Button>
          </div>
        )}

        {/* Modal de agregar producto */}
        {showModalAgregar && (
          <div className="modal" onClick={cerrarModalAgregar}>
            <div
              className="modal-contenedor"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-contenido">
                <h2>Agregar nuevo producto</h2>
                <form className="formulario" onSubmit={handleSubmit}>
                  <div className="bloque">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      name="nombre"
                      value={datosForm.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque">
                    <label>Precio Unitario</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      name="precio"
                      value={datosForm.precio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque">
                    <label>Tope minimo</label>
                    <input
                      type="number"
                      placeholder="Cantidad minima"
                      name="tope"
                      value={datosForm.tope}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque">
                    <label>Proveedor</label>
                    <div id="cont-select-form">
                      <select
                        id="select-form"
                        name="proveedor"
                        value={datosForm.proveedor}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedoresData.map((provedor) => (
                          <option key={provedor.id} value={provedor.id}>
                            {provedor.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bloque">
                    <label>Categoría</label>
                    <div id="cont-select-form">
                      <select
                        id="select-form"
                        name="categoria"
                        value={datosForm.categoria}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione una categoria</option>
                        {categoriaData.map((categoria) => (
                          <option
                            selected
                            key={categoria.id}
                            value={categoria.id}
                          >
                            {categoria.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && <p className="error">{error}</p>}

                  <div className="botones">
                    <Button type="submit" variant="verde" className="btn">
                      {" "}
                      Guardar{" "}
                    </Button>
                    <Button
                      variant="rojo"
                      onClick={cerrarModalAgregar}
                      className="btn"
                    >
                      {" "}
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showModalEliminar && (
          <div className="modal" onClick={cerrarModalEliminar}>
            <div
              className="modal-contenedor-eliminar"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>
                {" "}
                ¿Está completamente seguro que desea eliminar el/los productos?{" "}
              </h2>
              <div id="botoness">
                <Button variant="verde" onClick={eliminarProdSelec}>
                  {" "}
                  Aceptar{" "}
                </Button>
                <Button variant="rojo" onClick={cerrarModalEliminar}>
                  {" "}
                  Cancelar{" "}
                </Button>
              </div>
            </div>
          </div>
        )}

        {noti && (
          <div className="modal-noti-p" onClick={ocultarNoti}>
            <div className="modal-noti" onClick={(e) => e.stopPropagation()}>
              <div className="modal-noti-header">
                <svg  
                  xmlns="http://www.w3.org/2000/svg"  
                  width="50"  
                  height="50"  
                  viewBox="0 0 24 24"  
                  fill="none"  
                  stroke="#000000"  
                  strokeWidth="2"  
                  strokeLinecap="round"  
                  strokeLinejoin="round"  
                  className="closeIcon"
                  onClick={ocultarNoti}
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 21a9 9 0 0 0 9 -9a9 9 0 0 0 -9 -9a9 9 0 0 0 -9 9a9 9 0 0 0 9 9z" />
                  <path d="M9 8l6 8" />
                  <path d="M15 8l-6 8" />
                </svg>
                <h1>Productos con existencias próximas a terminar</h1>
              </div>
              <div className="modal-body-noti">
                {existencias.map((producto) => (
                  <div className="noti-prod" key={producto.producto.id}>
                    <p>{producto.producto.nombre}</p>
                    <svg  
                      xmlns="http://www.w3.org/2000/svg"  
                      width="30"  
                      height="30"  
                      viewBox="0 0 24 24"  
                      fill="none"  
                      stroke="#000000"  
                      strokeWidth="2"  
                      strokeLinecap="round"  
                      strokeLinejoin="round"  
                      className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M5 12l14 0" />
                      <path d="M13 18l6 -6" />
                      <path d="M13 6l6 6" />
                    </svg>
                    <p>{producto.producto.cantidad_actual}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default Inventario;
