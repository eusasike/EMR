import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutApi } from "../../api/auth/auth";
import {
  Users,
  BedDouble,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import "../../style/dashboard.css";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
}) => {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (err) {
        console.warn("Logout error:", err);
      }
    }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">CP</div>
          <span className="brand-title"> EMR</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/patients"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Patients</span>
          </NavLink>
          <NavLink
            to="/wards"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <BedDouble size={18} />
            <span>Ward & Beds</span>
          </NavLink>
          <NavLink
            to="/billing"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <FileText size={18} />
            <span>Billing</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
          <h2 className="header-title">{pageTitle}</h2>

          <div className="user-profile">
            <div className="user-badge">
              <div className="user-name">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "Staff Member"}
              </div>
              <div className="user-role">{user?.role || "Clinical Staff"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="workspace-container">{children}</main>
      </div>
    </div>
  );
};
