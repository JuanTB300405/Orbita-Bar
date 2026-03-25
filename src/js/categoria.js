import api from "./api";

export const consultaCategoria = async () => {
  try {
    const categoria = await api.get("categorias/");
    return categoria.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const editarCategoria = async (categoria, id) => {
  try {
    const response = await api.put(`categorias/${id}/`, categoria);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const crearCategoria = async (CategoriaData) => {
  try {
    const response = await api.post("categorias/", CategoriaData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const eliminarCategoria = async (categoriaIds) => {
  try {
    const response = await api.post("categorias/bulk_delete/", categoriaIds);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
