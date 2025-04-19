import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SERVER_URL } from '../constants';
import CommentSection from '../components/CommentSection';

export default function SharedPDFView() {
  const { shareLink } = useParams();
  const location = useLocation();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/shared/invite/${shareLink}?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (res.ok) {
          setPdf(data.pdf);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch PDF');
        }
      } catch (err) {
        console.error(err);
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();
  }, [shareLink, email]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen p-8 bg-gray-100 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{pdf.title}</h1>
      <div className="w-full max-w-[1400px] flex gap-6">
        <div className="flex-1">
          <iframe
            src={pdf.url}
            title={pdf.title}
            className="w-full max-w-5xl h-[80vh] border rounded"
          />
        </div>
        <div className="w-[400px] overflow-y-auto">
          <CommentSection pdfId={pdf.id} shareLink={`invite/${shareLink}`} />
        </div>
      </div>
    </div>
  );
}