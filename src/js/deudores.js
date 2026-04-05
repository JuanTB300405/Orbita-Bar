import api from "./api";

export const consultarDeudores = async () => {
  try {
    const response = await api.get("deudores/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const editarDeudores = async (deudor, id) => {
  try {
    const response = await api.put(`deudores/${id}/`, deudor);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const crearDeudores = async (deudoresData) => {
  try {
    const response = await api.post("deudores/", deudoresData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const eliminarDeudores = async (deudoresIds) => {
  try {
    const response = await api.post("deudores/bulk_delete/", deudoresIds);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
