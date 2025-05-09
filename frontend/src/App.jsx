import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import StudentReport from './pages/StudentReport';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState({ exists: false, count: 0, maxReached: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check admin status
    fetch('http://localhost:5000/api/auth/check-admin')
      .then(res => res.json())
      .then(data => {
        setAdminInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && <Sidebar user={user} />}
        <div className="lg:pl-64">
          <main className="min-h-screen">
            <Routes>
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
              <Route 
                path="/register" 
                element={
                  !user && !adminInfo.maxReached ? (
                    <Register setUser={setUser} adminCount={adminInfo.count} />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/attendance" element={user?.role === 'teacher' ? <Attendance /> : <Navigate to="/" />} />
              <Route path="/reports" element={user?.role === 'teacher' ? <Reports /> : <Navigate to="/" />} />
              <Route path="/students" element={user?.role === 'admin' ? <StudentManagement /> : <Navigate to="/" />} />
              <Route path="/teachers" element={user?.role === 'admin' ? <TeacherManagement /> : <Navigate to="/" />} />
              <Route path="/student/:studentId/report" element={user ? <StudentReport /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
