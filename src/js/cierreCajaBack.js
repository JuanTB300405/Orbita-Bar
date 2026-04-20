import api from "./api";

export const ConsultarRegistros = async () => {
  try {
    const response = await api.get("cierreCaja/");
    return response.data;
  } catch (error) {
    console.log(
      "Error al obtener registros",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};

export const CrearRegistro = async (cierreData) => {
  try {
    const response = await api.porst("cierreCaja/", cierreData);
    return response.data;
  } catch (error) {
    console.log(
      "Error al obtener registros",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
