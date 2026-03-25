import api from "./api";

export const ConsultarVentas = async () => {
  try {
    const ventas = await api.get("ventas/");
    return ventas.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
