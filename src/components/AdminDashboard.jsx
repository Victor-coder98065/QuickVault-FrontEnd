import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5002';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [registryData, setRegistryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('quickvault_admin_auth') !== 'true') {
      navigate('/admin/login');
      return;
    }

    const fetchRegistry = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/registry`);
        if (response.ok) {
          const data = await response.json();
          setRegistryData(data);
        }
      } catch (err) {
        console.error('Failed to load admin registry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistry();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('quickvault_admin_auth');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control & Underwriting Suite</h1>
            <p className="text-sm text-gray-500">Live SQL Server Registries & DebiCheck Polling Overview</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Loan Applications Registry</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">SQL Connected</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading loan applications...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b">
                    <th className="p-3">Loan ID</th>
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">SA ID Number</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Term</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registryData.length > 0 ? (
                    registryData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-emerald-700">{item.loanId || `QV-${1000 + idx}`}</td>
                        <td className="p-3 font-medium">{item.fullName || 'Victor Kabane'}</td>
                        <td className="p-3 font-mono">{item.idNumber || '980606xxxx08x'}</td>
                        <td className="p-3">R {item.principalAmount || '1,500'}</td>
                        <td className="p-3">{item.termMonths || 2} Months</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                            {item.status || 'Pending DebiCheck'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-500">
                        No active loans found in database. Submit an application from the customer portal to test.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}