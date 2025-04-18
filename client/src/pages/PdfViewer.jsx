import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SERVER_URL } from '../constants';
import CommentSection from '../components/CommentSection';

export default function PdfViewer() {
  const { id, shareLink } = useParams();
  const location = useLocation();
  const [pdf, setPdf] = useState(null);

  const isShared = location.pathname.startsWith('/shared');

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const endpoint = isShared
          ? `${SERVER_URL}/api/shared/${shareLink}`
          : `${SERVER_URL}/api/pdf/${id}`;
        
        const res = await fetch(endpoint, {
          credentials: isShared ? 'omit' : 'include',
        });

        const data = await res.json();
        
        if (res.ok) {
          setPdf(data.pdf || data);
        } else {
          console.error('Failed to load PDF:', data.message);
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPdf();
  }, [id, shareLink, isShared]);

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
          <CommentSection pdfId={id} shareLink={shareLink}/>
        </div>
      </div>
    </div>
  );
}
