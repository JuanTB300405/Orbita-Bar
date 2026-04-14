import api from "./api";

export const authentication = async (datos) => {
  try {
    const response = await api.post("usuarios/login/", datos);
    console.log("Respuesta del backend:", response);
    if (response.status === 200) {
      // Guardar el token en el almacenamiento local
      localStorage.setItem("token", response.data.token);
    }
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message,
    );
    return error.response || error.message;
  }
};
