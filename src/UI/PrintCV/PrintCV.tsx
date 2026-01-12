import { DownloadButton } from '../pages/CV/CV.styles';

const PrintCV = () => {
  const generatePDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.querySelector<HTMLElement>('.cv-container');

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'Ian_Hamblin_CV_2025.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        dpi: 192,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
      },
    };

    try {
      if (!element) {
        throw new Error('CV container not found');
      }
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <DownloadButton
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      aria-label="Export CV as PDF"
    >
      <span>Download PDF</span>
    </DownloadButton>
  );
};

export default PrintCV;
