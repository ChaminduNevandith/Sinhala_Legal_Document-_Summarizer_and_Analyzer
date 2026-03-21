import React from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = React.useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center bg-slate-100 dark:bg-slate-900">
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="p-4">Loading PDF...</div>}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} width={400} />
        ))}
      </Document>
    </div>
  );
}

export default PDFViewer;
