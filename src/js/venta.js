import api from "./api";

export const venderProducto = async (data) => {
  try {
    const response = await api.post("ventas/", data);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
