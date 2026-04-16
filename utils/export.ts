import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toPng } from 'html-to-image';

export async function generatePDF(bill: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 12, isBold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
  };

  drawText('JOELIAA BILLING', 50, height - 50, 20, true);
  drawText('Premium Homemade Treats', 50, height - 70, 10);
  
  drawText(`Bill ID: ${bill._id.substring(0, 8)}`, 50, height - 110, 10, true);
  drawText(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 50, height - 125, 10);
  drawText(`Customer: ${bill.customerName}`, 50, height - 140, 12, true);

  drawText('Items', 50, height - 180, 12, true);
  let currentY = height - 200;

  bill.items.forEach((item: any) => {
    drawText(`${item.name} (x${item.quantity})`, 50, currentY, 10);
    drawText(`₹${item.total}`, 300, currentY, 10, true);
    currentY -= 20;
  });

  currentY -= 10;
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: 350, y: currentY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  currentY -= 30;
  drawText('Subtotal:', 50, currentY, 12);
  drawText(`₹${bill.subtotal}`, 300, currentY, 12, true);
  
  currentY -= 20;
  drawText('Delivery:', 50, currentY, 12);
  drawText(`₹${bill.deliveryCharge}`, 300, currentY, 12, true);

  currentY -= 30;
  drawText('GRAND TOTAL:', 50, currentY, 16, true);
  drawText(`₹${bill.grandTotal}`, 280, currentY, 18, true);

  currentY -= 50;
  drawText('Thank you for your order!', width / 2 - 60, currentY, 10);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Bill_${bill.customerName}_${bill._id.substring(0, 8)}.pdf`;
  link.click();
}

export async function exportToImage(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const dataUrl = await toPng(element, { backgroundColor: '#fff', cacheBust: true });
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}
