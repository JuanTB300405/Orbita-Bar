import api from "./api";

export const consultaInventario = async () => {
  try {
    const productos = await api.get("productos/");
    return productos.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const crearProductos = async (productoData) => {
  try {
    const response = await api.post("productos/", productoData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const editarProductos = async (producto, id) => {
  try {
    const response = await api.put(`productos/${id}/`, producto);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const eliminarProductos = async (productoIds) => {
  try {
    const response = await api.post("productos/eliminar_productos/", productoIds);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

// Notificacion de existencias de productos

export const consultaExistencias = async () => {
  try {
    const ExistProductos = await api.get("notificaciones/");
    return ExistProductos.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
