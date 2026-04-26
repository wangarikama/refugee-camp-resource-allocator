import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  const [role, setRole] = useState('Camp Administrator');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save the selected role so the Dashboard can see it
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Left Side: UN Branding & Info */}
        <div className="bg-un-blue p-10 text-white flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Refugee Camp Resource Allocator</h1>
          <p className="text-lg mb-6 text-blue-100">
            A centralized, real-time platform for managing aid distribution across critical sectors.
          </p>
          <ul className="space-y-2 font-medium">
            <li>✓ Food & Logistics</li>
            <li>✓ Healthcare & Medicine</li>
            <li>✓ Shelter Coordination</li>
            <li>✓ Education Access</li>
          </ul>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-10 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-un-blue font-semibold hover:underline"
            >
              {isLogin ? 'Register instead' : 'Login instead'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
              <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-un-blue focus:outline-none" />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-un-blue focus:outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-un-blue focus:outline-none" />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input required type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-un-blue focus:outline-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-un-blue focus:outline-none"
              >
                <option value="Camp Administrator">Camp Administrator</option>
                <option value="Health Officer">Health Officer</option>
                <option value="Logistics Officer">Logistics Officer</option>
                <option value="Education Officer">Education Officer</option>
                <option value="Finance Manager">Finance Manager</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-un-blue text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">
              {isLogin ? 'Login to Dashboard' : 'Register Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}