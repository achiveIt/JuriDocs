import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVER_URL } from '../constants';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/pdf/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert('PDF uploaded successfully!');
        fetchPdfs();
      } else {
        alert(data.message || 'Upload failed.');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Error uploading file.');
    }
  };

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Your PDFs</h1>
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition text-center">
            {loading ? 'Uploading...' : 'Upload PDF'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              hidden
            />
          </label>
        </div>
        <input
          type="text"
          placeholder="Search PDFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mt-4 px-4 py-2 border rounded shadow-sm"
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