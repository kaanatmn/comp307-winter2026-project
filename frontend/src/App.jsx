import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorBookingPage from './pages/ProfessorBookingPage'; // NEW IMPORT

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* We keep the transparent styling here so the global gradient works everywhere! */}
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              {/* NEW: The custom professor booking link route */}
              <Route path="/book/:email" element={<ProfessorBookingPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;