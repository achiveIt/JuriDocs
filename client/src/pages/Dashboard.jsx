import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVER_URL } from '../constants';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/pdf`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
          setPdfs(data);
        } else {
          console.error('Failed to fetch PDFs:', data.message);
        }
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      }
    };

    fetchPdfs();
  }, []);

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your PDFs</h1>
        <input
          type="text"
          placeholder="Search PDFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded shadow-sm"
        />
      </header>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredPdfs.map(pdf => (
          <Link
            to={`/pdf/${pdf._id}`}
            key={pdf._id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center justify-center h-32 bg-red-100 text-red-600 text-3xl font-bold rounded">
              PDF
            </div>
            <h3 className="mt-4 font-semibold text-lg truncate">{pdf.title}</h3>
            <p className="text-sm text-gray-500">
              Uploaded: {new Date(pdf.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}