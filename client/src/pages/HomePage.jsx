import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Home() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to JuriDocs</h1>
      <p className="text-lg text-gray-700 mb-6">Upload, share, and comment on PDF files with ease.</p>

      {user ? (
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Go to Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-black text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700 transition">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
