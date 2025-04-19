import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SERVER_URL } from '../constants';
import CommentSection from '../components/CommentSection';

export default function PdfViewer() {
  const { id } = useParams();
  const [pdf, setPdf] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/pdf/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (res.ok) {
          setPdf(data);
        } else {
          console.error('Failed to load PDF:', data.message);
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPdf();
  }, [id]);

  if (!pdf) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen p-8 bg-gray-100 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{pdf.title}</h1>
      <div className="w-full max-w-[1400px] flex gap-6">
        <div className="flex-1">
        <iframe
            src={pdf.url}
            title={pdf.title}
            className="w-full max-w-5xl h-[80vh] border rounded"/>
        </div>
        <div className="w-[400px] overflow-y-auto">
          <CommentSection pdfId={id} />
        </div>
      </div>
    </div>
  );
}
