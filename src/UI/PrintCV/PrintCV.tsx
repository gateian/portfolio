import { DownloadButton } from '../pages/CV/CV.styles';

const PrintCV = () => {
  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/Ian_Hamblin_CV.pdf';
    link.download = 'Ian_Hamblin_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DownloadButton
      onClick={downloadPdf}
      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      aria-label="Export CV as PDF"
    >
      <span>Download PDF Version</span>
    </DownloadButton>
  );
};

export default PrintCV;
