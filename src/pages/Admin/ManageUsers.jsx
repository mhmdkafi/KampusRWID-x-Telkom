import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import Notification from "../../components/Notification/Notification";
import { useNotification } from "../../hooks/useNotification";
import "./ManageUsers.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000/api";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showNotification("You must be logged in", "error");
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users");
      }

      const formattedUsers = result.users.map((user) => ({
        id: user.id,
        email: user.email || "N/A",
        role: user.role || "user",
        createdAt: user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "N/A",
        fullName: user.full_name || user.email?.split("@")[0] || "Unknown",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);

      if (
        error.message?.includes("Admin access required") ||
        error.message?.includes("403")
      ) {
        showNotification(
          "You don't have permission to view users. Admin access required.",
          "error"
        );
        navigate("/admin/dashboard");
      } else {
        showNotification("Failed to fetch users: " + error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/users/${editingUser.id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update role");
      }

      showNotification(`Role updated successfully to ${newRole}`, "success");
      await fetchUsers();
      setEditingUser(null);
      setNewRole("");
      setIsSelectOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      showNotification("Failed to update role: " + error.message, "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      showNotification("User deleted successfully", "success");
      await fetchUsers();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user: " + error.message, "error");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-users">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="container-fluid px-3 px-lg-4">
        {/* Header */}
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="back-btn mb-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1>Manage Users</h1>
            <p className="text-muted">View and manage user accounts</p>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="users-stats mb-4">
          <div className="stat-item">
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
          <div className="stat-item">
            <strong>{filteredUsers.length}</strong>
            <span>Filtered Results</span>
          </div>
          <div className="stat-item">
            <strong>{users.filter((u) => u.role === "admin").length}</strong>
            <span>Admins</span>
          </div>
        </div>

        {/* Table for Desktop */}
        <div className="users-table-wrapper d-none d-md-block">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="py-4">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{ margin: "0 auto", opacity: 0.3 }}
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <p className="mt-3 mb-0">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>
                        <span
                          className={`badge-role ${
                            user.role === "admin" ? "badge-admin" : "badge-user"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.createdAt}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                              setIsSelectOpen(false);
                            }}
                            className="btn-action btn-edit"
                            title="Edit Role"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            className="btn-action btn-delete"
                            title="Delete User"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Layout for Mobile */}
        <div className="users-cards d-md-none">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ margin: "0 auto", opacity: 0.3 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="mt-3 mb-0 text-muted">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-info">
                    <h3>{user.fullName}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>

                <div className="user-card-body">
                  <div className="user-card-details">
                    <div className="detail-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span
                        className={`badge-role ${
                          user.role === "admin" ? "badge-admin" : "badge-user"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="detail-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-muted">
                        Joined {user.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-card-actions">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setNewRole(user.role);
                      setIsSelectOpen(false);
                    }}
                    className="btn-card-action btn-card-edit"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Role
                  </button>
                  <button
                    onClick={() => setConfirmDelete(user)}
                    className="btn-card-action btn-card-delete"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div
          className="modal-overlay"
          onClick={() => {
            setEditingUser(null);
            setIsSelectOpen(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User Role</h3>
            <div className="user-info">
              <p>
                <strong>Full Name:</strong> {editingUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {editingUser.email}
              </p>
              <p>
                <strong>Current Role:</strong> {editingUser.role}
              </p>
            </div>
            <div className="form-group">
              <label>New Role</label>
              <div className="custom-select-wrapper">
                <div
                  className={`custom-select ${isSelectOpen ? "open" : ""}`}
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  <div className="custom-select-trigger">
                    <span>
                      {roleOptions.find((opt) => opt.value === newRole)
                        ?.label || "Select Role"}
                    </span>
                    <svg
                      className="chevron-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {isSelectOpen && (
                    <div className="custom-select-options">
                      {roleOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`custom-select-option ${
                            newRole === option.value ? "selected" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewRole(option.value);
                            setIsSelectOpen(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsSelectOpen(false);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={handleUpdateRole} className="btn-confirm">
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete user:{" "}
              <strong>{confirmDelete.email}</strong>?
            </p>
            <p className="text-danger">⚠️ This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete.id)}
                className="btn-danger"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
