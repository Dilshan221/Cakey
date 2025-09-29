import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [markFormData, setMarkFormData] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "present",
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
    fetchUsers();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAttendanceRecords();
      setAttendanceData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch attendance data");
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const filteredData = attendanceData.filter(
    (record) =>
      record.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userId.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "present":
        return "status present";
      case "late":
        return "status late";
      case "absent":
        return "status absent";
      default:
        return "status";
    }
  };

  const handleMarkInputChange = (e) => {
    const { name, value } = e.target;
    setMarkFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.markAttendance(markFormData);
      setMarkFormData({
        userId: "",
        date: new Date().toISOString().split("T")[0],
        checkIn: "",
        checkOut: "",
        status: "present",
      });
      setShowMarkForm(false);
      fetchAttendanceData(); // Refresh the list
    } catch (err) {
      setError("Failed to mark attendance");
      console.error("Error marking attendance:", err);
    }
  };

  if (loading)
    return <div className="attendance-list">Loading attendance data...</div>;
  if (error) return <div className="attendance-list">Error: {error}</div>;

  return (
    <section className="attendance">
      <div className="attendance-list">
        <div className="attendance-header">
          <h1>Attendance List</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowMarkForm(!showMarkForm)}
            >
              {showMarkForm ? "Cancel" : "Mark Attendance"}
            </button>
          </div>
        </div>

        {showMarkForm && (
          <div className="mark-attendance-form">
            <h3>Mark Attendance</h3>
            <form onSubmit={handleMarkSubmit}>
              <div className="form-group">
                <select
                  name="userId"
                  value={markFormData.userId}
                  onChange={handleMarkInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <input
                  type="date"
                  name="date"
                  value={markFormData.date}
                  onChange={handleMarkInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="time"
                  name="checkIn"
                  placeholder="Check-In Time"
                  value={markFormData.checkIn}
                  onChange={handleMarkInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="time"
                  name="checkOut"
                  placeholder="Check-Out Time"
                  value={markFormData.checkOut}
                  onChange={handleMarkInputChange}
                />
              </div>
              <div className="form-group">
                <select
                  name="status"
                  value={markFormData.status}
                  onChange={handleMarkInputChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Mark Attendance
              </button>
            </form>
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={record._id}>
                <td>{record.userId.name}</td>
                <td>{record.userId.department}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.checkIn || "--"}</td>
                <td>{record.checkOut || "--"}</td>
                <td>
                  <span className={getStatusClass(record.status)}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AttendanceList;
