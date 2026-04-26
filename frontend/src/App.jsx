import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* THE WAITING ROOM: If they are logged out, force them to the SignIn portal */}
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <SignIn routing="hash" />
        </div>
      </SignedOut>

      {/* THE SECURE ZONE: If they are logged in, load the Dashboard routes */}
      <SignedIn>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </SignedIn>

    </div>
  );
}