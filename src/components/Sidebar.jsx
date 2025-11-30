import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">

      {/* COMMON FOR ALL USERS */}
      <NavLink to="/" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h4v8H3zM10 7h11v14H10z" fill="currentColor" opacity="0.9"/></svg>
        Dashboard
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" fill="currentColor"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="currentColor" opacity="0.85"/></svg>
        Profile
      </NavLink>

      {/* STUDENT ONLY */}
      {user.role === "student" && (
        <>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.9"/></svg>
            My Projects
          </NavLink>

          <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v6H4z" fill="currentColor"/><path d="M4 14h16v6H4z" fill="currentColor" opacity="0.9"/></svg>
            Portfolio
          </NavLink>
        </>
      )}

      {/* ADMIN ONLY */}
      {user.role === "admin" && (
        <>
          <NavLink to="/admin/review" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v2H4zM4 11h10v2H4zM4 16h7v2H4z" fill="currentColor"/></svg>
            Review Submissions
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z" fill="currentColor"/></svg>
            User Management
          </NavLink>
        </>
      )}

    </aside>
  );
};

export default Sidebar;
