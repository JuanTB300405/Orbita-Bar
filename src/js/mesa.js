import api from "./api";

export const consultaMesas = async () => {
  try {
    const response = await api.get("mesas/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const editarMesas = async (mesa, id) => {
  try {
    const response = await api.put(`mesas/${id}/`, mesa);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const crearMesas = async (MesaData) => {
  try {
    const response = await api.post("mesas/", MesaData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const eliminarMesas = async (mesaIds) => {
  try {
    const response = await api.post("mesas/bulk_delete/", mesaIds);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
