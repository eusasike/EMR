import React, {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { fetchStaffUsersApi, type UserItem } from "../../api/user/user";
import { Plus } from "lucide-react";
import { RegisterStaffModal } from "./register-user.modal";
import "../../style/component.css";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🆕 State to track which user is being edited (null means creating a new user)
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserItem | null>(
    null,
  );

  // Manual refresh / callback trigger
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchStaffUsersApi();
      setUsers(data);
    } catch (err: unknown) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Safe initial fetch on mount
  useEffect(() => {
    let isMounted = true;

    fetchStaffUsersApi()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load staff users:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedUserToEdit(null); // Clear editing state after success
    setLoading(true);
    loadUsers();
  };

  const handleOpenRegisterModal = () => {
    setSelectedUserToEdit(null); // Ensure it's in registration mode
    setIsModalOpen(true);
  };

  const handleOpenManageModal = (user: UserItem) => {
    setSelectedUserToEdit(user); // Set user data for editing mode
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const fullName =
      `${u.firstName} ${u.middleName || ""} ${u.lastName}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    return (
      fullName.includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout pageTitle="User Directory & Staff Registration">
      <div className="page-actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search staff by name, email, or role..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <button
          className="btn-primary"
          style={{ width: "auto" }}
          onClick={handleOpenRegisterModal}
        >
          <Plus size={16} style={{ marginRight: 6 }} /> Register New Staff
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            Loading staff records...
          </div>
        ) : (
          <table className="emr-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Role</th>
                <th>Contact Info</th>
                <th>Facility</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "#64748b",
                    }}
                  >
                    No staff records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const fullName = [
                    user.firstName,
                    user.middleName,
                    user.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{fullName}</strong>
                      </td>
                      <td>
                        <span className="code-badge">
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span>{user.email}</span>
                          {user.phone && (
                            <small className="text-muted">{user.phone}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        {user.facility ? (
                          <span>
                            {user.facility.name} ({user.facility.code})
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => handleOpenManageModal(user)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <RegisterStaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        onSuccess={handleSuccess}
        userToEdit={selectedUserToEdit} // 🆕 Pass the user data into your modal
      />
    </AppLayout>
  );
};
