import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import JobList from "./pages/JobList/JobList";
import JobDetail from "./pages/jobDetail/JobDetail";
import JobMatching from "./pages/JobMatching/JobMatching";
import SavedJobs from "./pages/SavedJobs/SavedJobs";
import AddJob from "./pages/Admin/AddJob";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageJobs from "./pages/Admin/ManageJobs";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageCVs from "./pages/Admin/ManageCVs";
import { AdminRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/matching" element={<JobMatching />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <AdminRoute>
                  <ManageJobs />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-job"
              element={
                <AdminRoute>
                  <AddJob />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-job/:id"
              element={
                <AdminRoute>
                  <AddJob />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <ManageUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cvs"
              element={
                <AdminRoute>
                  <ManageCVs />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
