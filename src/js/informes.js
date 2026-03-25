import api from "./api";

export const ConsultarInformes = async () => {
  try {
    const informes = await api.get("informes/");
    return informes.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
