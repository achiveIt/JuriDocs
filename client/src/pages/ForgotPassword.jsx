import React, { useState } from 'react';
import { SERVER_URL } from '../constants';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessage('Reset link sent to your email.');
      } else {
        setMessage(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      setMessage('Server error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border px-3 py-2 rounded mb-4"/>
        {message && <p className="text-sm mb-3 text-blue-700">{message}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-blue-600 hover:underline">
          Back to Home
        </button>
      </div>
    </div>
  );
}
