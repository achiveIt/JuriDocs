import React, { useState } from 'react';
import { SERVER_URL } from '../constants';

export default function ChangePassword({ onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        alert(data.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Old Password"
          className="w-full border px-3 py-2 mb-2 rounded"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full border px-3 py-2 mb-4 rounded"
        />
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Change
          </button>
        </div>
      </div>
    </div>
  );
}
