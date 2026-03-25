import api from "./api";

export const consultaProveedores = async () => {
  try {
    const proveedores = await api.get("proveedores/");
    return proveedores.data;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const editarProveedor = async (proveedor, id) => {
  try {
    const response = await api.put(`proveedores/${id}/`, proveedor);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const crearProveedores = async (proveedoresData) => {
  try {
    const response = await api.post("proveedores/", proveedoresData);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};

export const eliminarProveedores = async (proveedoresIds) => {
  try {
    const response = await api.post("proveedores/bulk_delete/", proveedoresIds);
    return response;
  } catch (error) {
    console.error(
      "Error al enviar datos:",
      error.response?.data || error.message
    );
    return error.response || error.message;
  }
};
