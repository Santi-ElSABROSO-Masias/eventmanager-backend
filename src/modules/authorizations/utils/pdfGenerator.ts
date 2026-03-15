import { jsPDF } from 'jspdf';

export function generateAuthorizationPDF(data: {
    nombre: string;
    dni: string;
    empresa: string;
    tiposTrabajo: string[];
    vigencia: string;
    codigoUnico: string;
    fechaEmision: string;
}): Buffer {
    const doc = new jsPDF({ orientation: 'portrait', format: 'a5' });

    // Configuración base de fuente
    doc.setFont('helvetica', 'normal');

    // Fondo y cabeceras
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 148, 25, 'F');
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 25, 148, 185, 'F');

    // Título Principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AUTORIZACIÓN TRABAJOS', 74, 12, { align: 'center' });
    doc.text('ALTO RIESGO - CATH', 74, 18, { align: 'center' });

    // Cuadro Foto (Placeholder)
    doc.setDrawColor(30, 58, 95);
    doc.setFillColor(255, 255, 255);
    doc.rect(54, 30, 40, 50, 'FD'); // 4x5 ratio
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text('FOTO', 74, 55, { align: 'center' });

    // Datos Principales
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.nombre.toUpperCase(), 74, 90, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DNI:', 20, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(data.dni, 50, 105);

    doc.setFont('helvetica', 'bold');
    doc.text('EMPRESA:', 20, 115);
    doc.setFont('helvetica', 'normal');
    const cName = data.empresa.length > 25 ? data.empresa.substring(0, 25) + '...' : data.empresa;
    doc.text(cName, 50, 115);

    doc.setFont('helvetica', 'bold');
    doc.text('VIGENCIA:', 20, 125);
    doc.setFont('helvetica', 'normal');
    doc.text(data.vigencia, 50, 125);

    // Tipos de Habilitación
    doc.setFillColor(30, 58, 95);
    doc.rect(10, 135, 128, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('HABILITACIONES APROBADAS', 74, 141, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let yPos = 152;
    data.tiposTrabajo.forEach(tipo => {
        doc.text(`• ${tipo}`, 25, yPos);
        yPos += 7;
    });

    // Código y Emisión
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Emisión: ${data.fechaEmision}`, 74, 195, { align: 'center' });
    doc.text(`UID: ${data.codigoUnico}`, 74, 200, { align: 'center' });

    // Output as Buffer
    return Buffer.from(doc.output('arraybuffer'));
}
