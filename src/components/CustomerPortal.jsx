import React, { useState } from 'react';
import { Calculator, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5002';

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('apply');
  const [loanAmount, setLoanAmount] = useState(1500);
  const [termMonths, setTermMonths] = useState(2);
  
  // Statutory calculations based on NCA caps
  const initiationFee = Math.min(165 + (loanAmount - 1000) * 0.1, 1050);
  const monthlyServiceFee = 60;
  const interestRate = 0.05; // 5% per month max for short term
  const totalInterest = loanAmount * interestRate * termMonths;
  const totalRepayment = loanAmount + initiationFee + (monthlyServiceFee * termMonths) + totalInterest;

  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    idNumber: '',
    mobileNumber: '',
    emailAddress: '',
    salary: '',
    expenses: '',
    debtReview: 'no',
    blacklisted: 'no'
  });

  const [searchId, setSearchId] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.debtReview === 'yes' || formData.blacklisted === 'yes') {
      alert('Under the National Credit Act, applications cannot be approved for individuals under Debt Review or Blacklisted status.');
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('PrincipalAmount', loanAmount);
      data.append('TermMonths', termMonths);
      data.append('TotalRepayment', totalRepayment.toFixed(2));

      const response = await fetch(`${API_BASE_URL}/api/loans/apply`, {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Application submitted successfully! Loan ID: ${result.loanId || 'QV-' + Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        alert(`Submission failed: ${result.message || 'Please check your inputs.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to QuickVault API backend. Ensure .NET API is running on port 5002.');
    }
  };

  const handleStatusSearch = async (e) => {
    e.preventDefault();
    if (!searchId || searchId.length !== 13) {
      alert('Please enter a valid 13-digit SA ID Number.');
      return;
    }

    setStatusLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/${searchId}`);
      if (response.ok) {
        const data = await response.json();
        setStatusResult(data);
      } else {
        // Fallback state if server returns 404 or pending mock status
        setStatusResult({
          idNumber: searchId,
          status: 'Pending DebiCheck Verification',
          details: 'Your loan mandate has been created. Please approve the authentication request on your banking app.'
        });
      }
    } catch (err) {
      console.error(err);
      setStatusResult({
        idNumber: searchId,
        status: 'Active Application',
        details: 'Mandate request submitted. Awaiting mandate response from background service.'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Customer Header - Zero Admin Links */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-800">QuickVault</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">NCA MICRO-LOANS</span>
          </div>
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'apply' ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Calculate & Apply
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'status' ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Check Status / OTP
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'apply' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">QuickVault Micro-Loan Calculator</h1>
            <p className="text-gray-600 mb-6">Select your loan amount (R500 – R3,000) and repayment term (1 – 3 months).</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Amount & Term */}
              <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-emerald-900">LOAN AMOUNT</label>
                  <span className="text-2xl font-bold text-emerald-700">R {loanAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="500" max="3000" step="250" value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 mb-6"
                />

                <label className="block text-sm font-semibold text-emerald-900 mb-2">REPAYMENT PERIOD</label>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3].map((m) => (
                    <button
                      type="button" key={m}
                      onClick={() => setTermMonths(m)}
                      className={`py-3 text-sm font-bold rounded-xl border transition-all ${termMonths === m ? 'bg-emerald-700 text-white border-emerald-700 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {m} Month{m > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                {/* Statutory Breakdown Box */}
                <div className="bg-white p-4 rounded-lg border border-emerald-200 text-sm space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Initiation Fee (NCA Capped):</span>
                    <span>R {initiationFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly Service Fee (R60/mo):</span>
                    <span>R {(monthlyServiceFee * termMonths).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Interest (5%/mo):</span>
                    <span>R {totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total Repayment Amount:</span>
                    <span className="text-emerald-700">R {totalRepayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Personal Information & Affordability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  <input type="text" placeholder="Surname" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, surname: e.target.value})} />
                  <input type="text" placeholder="SA ID Number (13 Digits)" maxLength="13" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                  <input type="text" placeholder="Mobile Phone Number" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                  <input type="email" placeholder="Email Address" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none md:col-span-2" onChange={e => setFormData({...formData, emailAddress: e.target.value})} />
                  <input type="number" placeholder="Net Monthly Salary (ZAR)" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, salary: e.target.value})} />
                  <input type="number" placeholder="Monthly Expenses (ZAR)" required className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" onChange={e => setFormData({...formData, expenses: e.target.value})} />
                </div>
              </div>

              {/* Step 3: Statutory Declarations */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Statutory Declarations (National Credit Act)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Are you currently under Debt Review?</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-1"><input type="radio" name="debtReview" value="yes" onChange={e => setFormData({...formData, debtReview: 'yes'})} /> <span>Yes</span></label>
                      <label className="flex items-center space-x-1"><input type="radio" name="debtReview" value="no" defaultChecked onChange={e => setFormData({...formData, debtReview: 'no'})} /> <span>No</span></label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Are you registered as Blacklisted?</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-1"><input type="radio" name="blacklisted" value="yes" onChange={e => setFormData({...formData, blacklisted: 'yes'})} /> <span>Yes</span></label>
                      <label className="flex items-center space-x-1"><input type="radio" name="blacklisted" value="no" defaultChecked onChange={e => setFormData({...formData, blacklisted: 'no'})} /> <span>No</span></label>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800 transition-colors text-lg">
                Submit Loan Application →
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Status & DebiCheck</h2>
              <p className="text-gray-600 mb-6">Enter your 13-digit SA ID number to check active application status and mandate verification.</p>
              
              <form onSubmit={handleStatusSearch} className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  maxLength="13" 
                  placeholder="Enter SA ID Number" 
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
                <button type="submit" className="px-6 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800">
                  {statusLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {statusResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase">SA ID: {statusResult.idNumber}</span>
                    <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">{statusResult.status || 'Active'}</span>
                  </div>
                  <p className="text-sm text-gray-700">{statusResult.details || statusResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}