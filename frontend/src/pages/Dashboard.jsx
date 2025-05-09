import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttendance: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsResponse, attendanceResponse] = await Promise.all([
        fetch('http://localhost:5000/api/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/api/attendance/summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (!studentsResponse.ok || !attendanceResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const students = await studentsResponse.json();
      const attendance = await attendanceResponse.json();

      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(report => {
        const lastAttendance = report.attendance?.[0];
        return lastAttendance && new Date(lastAttendance.date).toISOString().split('T')[0] === today;
      });

      const presentToday = todayAttendance.filter(report => 
        report.attendance?.[0]?.status === 'present'
      ).length;

      const absentToday = todayAttendance.filter(report => 
        report.attendance?.[0]?.status === 'absent'
      ).length;

      setStats({
        totalStudents: students.length,
        totalAttendance: attendance.length,
        presentToday,
        absentToday
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Attendance Records</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalAttendance}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Present Today</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.presentToday}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Absent Today</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{stats.absentToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;