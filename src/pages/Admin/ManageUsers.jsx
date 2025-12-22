import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import "./ManageUsers.css";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Method 1: Try to get current session and use admin API
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // Since we can't access auth.users directly from client,
      // we'll use a workaround by fetching CVs to get user info
      // Better approach: Create an RPC function in backend

      // For now, let's fetch unique user_ids from cvs table
      const { data: cvsData, error: cvsError } = await supabase
        .from("cvs")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });

      if (cvsError) {
        console.error("Error fetching from cvs:", cvsError);
      }

      // Get unique user IDs
      const uniqueUserIds = [
        ...new Set(cvsData?.map((cv) => cv.user_id) || []),
      ];

      // Get user details from auth (this will work for current user)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // Create users array with what we know
      const formattedUsers = [];

      // Add current user first
      if (currentUser) {
        formattedUsers.push({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.user_metadata?.role || "user",
          emailVerified: currentUser.email_confirmed_at ? true : false,
          createdAt: new Date(currentUser.created_at).toLocaleDateString(),
        });
      }

      // Add other users (we have limited info)
      uniqueUserIds.forEach((userId) => {
        if (userId !== currentUser?.id) {
          formattedUsers.push({
            id: userId,
            email: `user-${userId.substring(0, 8)}@...`, // Partial ID
            role: "user", // Default
            emailVerified: false,
            createdAt: "N/A",
          });
        }
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);

      // Fallback: Just show current user
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUsers([
            {
              id: user.id,
              email: user.email,
              role: user.user_metadata?.role || "user",
              emailVerified: user.email_confirmed_at ? true : false,
              createdAt: new Date(user.created_at).toLocaleDateString(),
            },
          ]);
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        alert("Unable to fetch users. Please check your permissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      // Update user metadata via auth admin API
      // Note: This requires service role key on backend
      alert(
        "Role update requires backend API implementation. Please use SQL for now:\n\n" +
          `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"${newRole}"}' WHERE id = '${editingUser.id}';`
      );

      setEditingUser(null);
      setNewRole("");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role: " + error.message);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-users">
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="container py-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="back-btn"
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
            <p className="text-muted">
              View user accounts (Limited client-side access)
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <div
          className="alert alert-info mb-4"
          style={{
            background: "#dbeafe",
            padding: "1rem",
            borderRadius: "8px",
            color: "#1e40af",
            marginBottom: "1rem",
          }}
        >
          <strong>Note:</strong> User management from client-side is limited.
          For full user management, please use Supabase Dashboard or backend
          API.
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
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="users-stats mb-4">
          <div className="stat-item">
            <strong>{users.length}</strong> Total Users
          </div>
          <div className="stat-item">
            <strong>{filteredUsers.length}</strong> Filtered Results
          </div>
          <div className="stat-item">
            <strong>{users.filter((u) => u.role === "admin").length}</strong>{" "}
            Admins
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.email.split("@")[0]}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge-role ${
                          user.role === "admin" ? "badge-admin" : "badge-user"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          user.emailVerified
                            ? "badge-verified"
                            : "badge-unverified"
                        }
                      >
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td>{user.createdAt}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewRole(user.role);
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User Role</h3>
            <div className="user-info">
              <p>
                <strong>Email:</strong> {editingUser.email}
              </p>
              <p>
                <strong>Current Role:</strong> {editingUser.role}
              </p>
            </div>
            <div className="form-group">
              <label>New Role</label>
              <select
                className="form-control"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div
              className="alert-warning"
              style={{
                background: "#fef3c7",
                padding: "0.75rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              Please use SQL command or Supabase Dashboard to update user roles.
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setEditingUser(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={handleUpdateRole} className="btn-confirm">
                Show SQL Command
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
