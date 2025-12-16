import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import JobList from "./pages/JobList/JobList";
import JobDetail from "./pages/jobDetail/JobDetail";
import JobMatching from "./pages/JobMatching/JobMatching";
import AddJob from "./pages/Admin/AddJob";
import AccuracyDashboard from "./components/AccuracyDashboard/AccuracyDashboard";
import { AdminRoute } from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/matching" element={<JobMatching />} />
          <Route
            path="/admin/add-job"
            element={
              <AdminRoute>
                <AddJob />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/accuracy"
            element={
              <AdminRoute>
                <AccuracyDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
