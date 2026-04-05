import api from "./api";

export const consultarIngresosExternos = async () => {
  try {
    const response = await api.get("ingresosExternos/");
    return response.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const editarIngresosExternos = async (ingresoExterno, id) => {
  try {
    const response = await api.put(`ingresosExternos/${id}/`, ingresoExterno);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const crearIngresosExternos = async (ingresosExternosData) => {
  try {
    const response = await api.post("ingresosExternos/", ingresosExternosData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const eliminarIngresosExternos = async (ingresosExternosIds) => {
  try {
    const response = await api.post(
      "ingresosExternos/bulk_delete/",
      ingresosExternosIds,
    );
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
