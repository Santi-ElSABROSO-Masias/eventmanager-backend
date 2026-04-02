
export class ExternalService {
  async getDniData(dni: string) {
    const token = process.env.RENIEC_API_TOKEN;
    
    if (!token) {
      throw new Error('RENIEC_API_TOKEN no configurado en el servidor');
    }

    try {
      const response = await fetch(`https://apiperu.dev/api/dni/${dni}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data: any = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al consultar DNI en la API externa');
      }

      // Devolvemos solo lo necesario para el autocompletado
      return {
        nombre_completo: data.data.nombre_completo,
        nombres: data.data.nombres,
        apellido_paterno: data.data.apellido_paterno,
        apellido_materno: data.data.apellido_materno
      };
    } catch (error: any) {
      console.error('[ExternalService] Error lookup DNI:', error.message);
      throw error;
    }
  }
}
