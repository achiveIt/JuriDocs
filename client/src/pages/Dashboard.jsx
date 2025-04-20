import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deletePDFById } from '../services/pdfService';
import { SERVER_URL } from '../constants';
import ChangePassword from './ChangePassword.jsx';

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareLinks, setShareLinks] = useState({});
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [showModel, setshowModel] = useState(false);
  const [showPasswordModel, setShowPasswordModel] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;

    const result = await deletePDFById(pdfId);

    if (result.success) {
      alert('PDF deleted successfully.');
      setPdfs(prev => prev.filter(pdf => pdf._id !== pdfId));
    } else {
      alert(result.message || 'Error deleting PDF.');
    }
  };

  const openShareModel = (pdfId) => {
    setSelectedPdfId(pdfId);
    setshowModel(true);
    setEmails([]);
    setEmailInput('');
  };

  const handleSendEmailInvite = async () => {
    try {
      addEmail();
      const res = await fetch(`${SERVER_URL}/api/shared/invite/${selectedPdfId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        
        setShareLinks(prev => ({ ...prev, [selectedPdfId]: data.shareUrl }));
        setshowModel(false);
        setSuccessMessage('Invitation email sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Failed to send email invites.');
      }
    } catch (error) {
      console.error('Error sending invites:', error);
      alert('Server error.');
    }
  };

  const handleGenerateOnlyLink = async (pdfId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/pdf/${pdfId}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setShareLinks(prev => ({ ...prev, [pdfId]: data.shareUrl }));
        setshowModel(false);
      } else {
        alert(data.message || 'Failed to generate share link.');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Server error.');
    }
  };

  const addEmail = () => {
    console.log("email input, ", emailInput);
    
    const trimmed = emailInput.trim();
    console.log("Current emails:", emails);
    console.log("Adding email:", trimmed);
    
    if (trimmed && !emails.includes(trimmed)) {
      setEmails(prevEmails => {
        const newEmails = [...prevEmails, trimmed];
        console.log("New emails array:", newEmails);
        return newEmails;
      });
      setEmailInput('');
    }
  };

  const handleLogout = async () => {
    await fetch(`${SERVER_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/');
  };

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

            
         
  return (
    <div className="min-h-screen p-8 bg-gray-100">
     <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Your PDFs</h1>
          <div className="flex gap-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition text-center">
              {loading ? 'Uploading...' : 'Upload PDF'}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                hidden/>
            </label>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
            <button
              onClick={() => setShowPasswordModel(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Change Password
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search PDFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mt-4 px-4 py-2 border rounded shadow-sm"/>
      </header>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded">
          {successMessage}
        </div>
      )}
      {showPasswordModel && (
        <ChangePassword
          onClose={() => setShowPasswordModel(false)}
          setSuccessMessage={setSuccessMessage}
        />
      )}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredPdfs.map(pdf => (
          <div
            key={pdf._id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between" >
            <Link to={`/pdf/${pdf._id}`} className="flex-1">
              <div className="flex items-center justify-center h-32 bg-red-100 text-red-600 text-3xl font-bold rounded">
                PDF
              </div>
              <h3 className="mt-4 font-semibold text-lg truncate">{pdf.title}</h3>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(pdf.createdAt).toLocaleDateString()}
              </p>
            </Link>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleDelete(pdf._id)}
                className="w-full bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition">
                Delete
              </button>

              <button
                onClick={() => {
                  if (shareLinks[pdf._id]) {
                    setShareLinks(prev => {
                      const updated = { ...prev };
                      delete updated[pdf._id];
                      return updated;
                    });
                  } else {
                    handleGenerateOnlyLink(pdf._id);
                  }
                }}
                className="w-full bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition">
                 Generate Share Link
              </button>

              <button
                onClick={() => openShareModel(pdf._id)}
                className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition">
                Send invite via mail
              </button>

              {shareLinks[pdf._id] && (
                <div className="text-sm mt-2 break-all bg-gray-100 p-2 rounded text-blue-600">
                  <a
                    href={shareLinks[pdf._id]}
                    target="_blank"
                    rel="noopener noreferrer" >
                    {shareLinks[pdf._id]}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Invite via Email</h3>
            <div className="flex mb-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
                className="flex-1 border px-3 py-2 rounded-l" />
              <button type="button" onClick={() => addEmail()} className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700">
                Add
              </button>
            </div>
            {emails.length > 0 && (
              <div className="mb-4 text-sm">
                <p className="mb-1 font-semibold">Inviting:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {emails.map((email, i) => <li key={i}>{email}</li>)}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setshowModel(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={handleSendEmailInvite}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}