import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutApi } from "../../api/auth/auth";
import {
  Users,
  BedDouble,
  FileText,
  LayoutDashboard,
  LogOut,
  UserPlus,
} from "lucide-react";
import "../../style/dashboard.css";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: string[]; // Allowed roles for this item (empty or undefined means allowed for all)
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
}) => {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const userRole = user?.role?.toUpperCase(); // Standardize role string matching

  const displayFacilityCode =
    localStorage.getItem("facilityCode") ||
    user?.facilities?.[0]?.code ||
    "N/A";

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

  // Define Navigation Items with Role Restrictions
  const navItems: NavItem[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/user-register",
      label: "Register User",
      icon: <UserPlus size={18} />,
      allowedRoles: ["ADMIN", "SUPER_ADMIN", "FACILITY_ADMIN"],
    },
    {
      to: "/patients",
      label: "Patients",
      icon: <Users size={18} />,
      allowedRoles: ["ADMIN", "DOCTOR", "NURSE", "REGISTRATION_CLERK"],
    },
    {
      to: "/wards",
      label: "Ward & Beds",
      icon: <BedDouble size={18} />,
      allowedRoles: ["ADMIN", "DOCTOR", "NURSE"],
    },
    {
      to: "/billing",
      label: "Billing",
      icon: <FileText size={18} />,
      allowedRoles: ["ADMIN", "ACCOUNTANT", "BILLING_CLERK"],
    },
  ];

  // Filter links based on current user role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return item.allowedRoles.includes(userRole);
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">CP</div>
          <span className="brand-title"> EMR</span>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
          <h2 className="header-title">{pageTitle}</h2>

          <div className="user-profile">
            <div className="user-badge">
              <div className="user-name">
                {user?.email ? `${user.email}` : "Staff Member"}
              </div>
              <div className="user-role">{user?.role || "Clinical Staff"}</div>
              <div className="user-facility">{displayFacilityCode}</div>
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
