import api from "./api";

export const consultaDashboard = async () => {
  try {
    const response = await api.get("dashboard/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
