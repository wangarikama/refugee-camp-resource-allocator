import { useState, useEffect } from 'react';
import axios from 'axios';
// Import Clerk's secure user hook and the logout button
import { useUser, SignOutButton } from "@clerk/clerk-react"; 

import AdminDashboard from './AdminDashboard'; 
import FinanceDashboard from './FinanceDashboard';
import HealthDashboard from './HealthDashboard';
import LogisticsDashboard from './LogisticsDashboard';
import EducationDashboard from './EducationDashboard';

const ALL_SECTORS = [
  { label: 'All Sectors', value: 'All' },
  { label: 'Food', value: 'Food' },
  { label: 'Shelter', value: 'Shelter' },
  { label: 'Health', value: 'Health' },
  { label: 'Education', value: 'Education' },
];

export default function Dashboard() {
  // 1. ASK CLERK WHO IS LOGGED IN
  const { user, isLoaded } = useUser();
  const [campData, setCampData] = useState({ total_refugees: 0, total_pupils: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCamp] = useState('Kakuma');

  // State variables
  const [adminView, setAdminView] = useState('physical'); 
  const [isEditingPop, setIsEditingPop] = useState(false);
  const [newPopValue, setNewPopValue] = useState("");
  const [selectedSector, setSelectedSector] = useState('All');

  // Fetch data
  const fetchData = () => {
    axios.get(`http://localhost:5000/api/analysis/${selectedCamp}`)
      .then((response) => {
        setCampData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to connect to backend.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedCamp]);

  // Automatically switch the default sector based on the user's role
  useEffect(() => {
    if (isLoaded && user) {
      const role = (user.publicMetadata?.role || "guest").toLowerCase();
      if (role.includes('health')) setSelectedSector('Health');
      else if (role.includes('education')) setSelectedSector('Education');
      else if (role.includes('logistics')) setSelectedSector('LogisticsAll');
    }
  }, [isLoaded, user]);

  // Restored function to handle population updates
  const handlePopUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/population/${selectedCamp}`, {
        total_refugees: Number(newPopValue)
      });
      setIsEditingPop(false);
      fetchData(); 
    } catch (err) {
      console.error(err);
      alert("Failed to update population.");
    }
  };

  // If Clerk is still loading the profile, show a loading screen
  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold text-xl">Loading Secure Systems...</div>;
  }

  // 2. READ THE SECURE ROLE FROM CLERK
  const normalizedRole = (user?.publicMetadata?.role || "guest").toLowerCase();

  // 3. THE WAITING ROOM (If they have no role, stop them here!)
  if (normalizedRole === "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg text-center border-t-4 border-blue-600">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Account Pending</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Welcome, <strong>{user?.firstName || 'User'}</strong>! Your account has been securely verified, but you have not yet been assigned a sector clearance.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-8 font-medium">
            Please contact the Camp Administrator to unlock your dashboard.
          </div>
          <SignOutButton>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  // 4. SET UP THE SIDEBAR FOR APPROVED USERS
  let allowedSectors = ALL_SECTORS;
  if (normalizedRole.includes('health')) {
    allowedSectors = ALL_SECTORS.filter(btn => btn.value === 'Health');
  } else if (normalizedRole.includes('education')) {
    allowedSectors = ALL_SECTORS.filter(btn => btn.value === 'Education');
  } else if (normalizedRole.includes('logistics')) {
    // Logistics gets the combined Overview button
    allowedSectors = [
      { label: 'Logistics Overview', value: 'LogisticsAll' },
      { label: 'Food', value: 'Food' },
      { label: 'Shelter', value: 'Shelter' }
    ];
  }

  // 5. FILTER THE DATA FOR THE MAIN SCREEN
  let filteredItems = [];
  if (campData && campData.items) {
    if (selectedSector === 'All') {
      filteredItems = campData.items;
    } else if (selectedSector === 'LogisticsAll') {
      // Show both Food and Shelter
      filteredItems = campData.items.filter(item => item.sector === 'Food' || item.sector === 'Shelter');
    } else {
      filteredItems = campData.items.filter(item => item.sector && item.sector.toLowerCase() === selectedSector.toLowerCase());
    }
  }

  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-blue-600 text-white flex flex-col py-8 px-6 shadow-lg z-10">
        <h1 className="text-2xl font-bold mb-8">Refugee Resource Allocator</h1>
        <nav className="flex flex-col gap-2">
          {allowedSectors.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setSelectedSector(btn.value)}
              className={`py-3 px-4 rounded-lg text-left font-bold transition ${selectedSector === btn.value ? 'bg-blue-800 shadow-inner' : 'hover:bg-blue-500 hover:text-white'}`}
            >
              {btn.label}
            </button>
          ))}
        </nav>
        <div className="flex-grow" />
        
        {/* CLERK SECURE SIGNOUT BUTTON */}
        <SignOutButton>
          <button className="mt-10 text-sm text-red-200 hover:text-white font-bold text-left px-4 transition">
            Sign Out Securely
          </button>
        </SignOutButton>
      </aside>

      <main className="flex-1 bg-gray-50 min-h-screen px-6 py-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">{selectedCamp} Camp Allocation</h1>
              <p className="text-gray-600 mt-1 font-medium text-capitalize">Logged in as: <span className="text-gray-800 uppercase font-bold">{normalizedRole}</span></p>
            </div>
            
            <div className="text-right">
              {isEditingPop ? (
                <div className="flex items-center space-x-2 mb-2">
                  <input type="number" value={newPopValue} onChange={(e) => setNewPopValue(e.target.value)} className="border-2 border-blue-500 rounded px-2 py-1 w-32 font-bold text-gray-800" />
                  <button onClick={handlePopUpdate} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-bold">Save</button>
                  <button onClick={() => setIsEditingPop(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded font-bold">X</button>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-3 mb-1">
                  <p className="text-lg font-bold text-gray-800">Total Population: {campData?.total_refugees.toLocaleString()}</p>
                  {normalizedRole.includes('admin') && (
                    <button onClick={() => { setIsEditingPop(true); setNewPopValue(campData.total_refugees); }} className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200 transition">Edit</button>
                  )}
                </div>
              )}
              <p className="text-sm font-bold text-blue-600">School Pupils: {campData?.total_pupils.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-between items-end mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-800">Sector Overview: {selectedSector === 'All' ? 'All Sectors' : selectedSector === 'LogisticsAll' ? 'Logistics Overview' : selectedSector}</h2>
            {normalizedRole.includes('admin') && (
              <div className="flex bg-gray-200 p-1 rounded-lg">
                <button onClick={() => setAdminView('physical')} className={`px-4 py-2 rounded-md font-bold text-sm transition ${adminView === 'physical' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>Physical Stock</button>
                <button onClick={() => setAdminView('financial')} className={`px-4 py-2 rounded-md font-bold text-sm transition ${adminView === 'financial' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>Financial Budget</button>
              </div>
            )}
          </div>

          {normalizedRole.includes('finance') || (normalizedRole.includes('admin') && adminView === 'financial') ? (
            <FinanceDashboard filteredItems={filteredItems} chartOptions={chartOptions} />
          ) : normalizedRole.includes('health') ? (
            <HealthDashboard filteredItems={filteredItems} refreshData={fetchData} />
          ) : normalizedRole.includes('logistics') ? (
            <LogisticsDashboard filteredItems={filteredItems} refreshData={fetchData} />
          ) : normalizedRole.includes('education') ? (
            <EducationDashboard filteredItems={filteredItems} refreshData={fetchData} />
          ) : (
            <AdminDashboard filteredItems={filteredItems} chartOptions={chartOptions} />
          )}
        </div>
      </main>
    </div>
  );
}