import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'SecureAdmin2026!') {
      localStorage.setItem('quickvault_admin_auth', 'true');
      navigate('/admin');
    } else {
      alert('Invalid administrative password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="mb-6">
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Internal Security</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">QuickVault Admin Portal</h2>
          <p className="text-sm text-gray-500">Authorized underwriting and risk personnel only.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Access Password</label>
          <input 
            type="password" 
            placeholder="••••••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
            required 
          />
        </div>

        <button type="submit" className="w-full py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors">
          Authenticate & Access
        </button>
      </form>
    </div>
  );
}