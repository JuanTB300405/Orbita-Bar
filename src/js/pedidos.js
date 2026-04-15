import api from "./api";

export const consultarPedidos = async () => {
  try {
    const response = await api.get("pedidos/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al consultar pedidos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const consultarPedido = async (id) => {
  try {
    const response = await api.get(`pedidos/${id}/`);
    return response.data;
  } catch (error) {
    console.error(
      "Error al consultar pedido:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const crearPedido = async (pedidoData) => {
  try {
    const response = await api.post("pedidos/", pedidoData);
    return response;
  } catch (error) {
    console.error(
      "Error al crear pedido:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const agregarProducto = async (id, detalleData) => {
  try {
    const response = await api.post(
      `pedidos/${id}/agregar_producto/`,
      detalleData,
    );
    return response;
  } catch (error) {
    console.error(
      "Error al agregar producto al pedido:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const quitarProducto = async (id, detalleData) => {
  try {
    const response = await api.delete(`pedidos/${id}/quitar_producto/`, {
      data: detalleData,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al quitar producto del pedido:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const confirmarPago = async (id, pagoData) => {
  try {
    const response = await api.post(`pedidos/${id}/confirmar_pago/`, pagoData);
    return response;
  } catch (error) {
    console.error(
      "Error al confirmar pago:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const cancelarPedido = async (id) => {
  try {
    const response = await api.post(`pedidos/${id}/cancelar/`);
    return response;
  } catch (error) {
    console.error(
      "Error al cancelar pedido:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
