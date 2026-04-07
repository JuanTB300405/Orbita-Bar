import api from "./api";

export const ConsultarInformes = async () => {
  try {
    const response = await api.get("informes/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al consultar informes:",
      error.response?.data || error.message
    );
    return { success: false, data: [], error: error.message };
  }
};
