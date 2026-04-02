import api from "./api";

export const consultaMesas = async () => {
  try {
    const response = await api.get("mesas/");
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
