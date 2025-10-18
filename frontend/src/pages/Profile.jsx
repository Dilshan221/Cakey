// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authStorage, useAuth } from "../utils/authStorage";
import { apiService } from "../services/api";

const ProfilePage = () =>
{
    const { logout, getUser } = useAuth();
    const [user, setUser] = useState(getUser() || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() =>
    {
        const fetchUser = async () =>
        {
            try
            {
                const storedUser = getUser();
                if (storedUser?._id)
                {
                    const freshUser = await apiService.getUser(storedUser._id);
                    setUser(freshUser);
                    authStorage.setUser(freshUser);
                } else
                {
                    setUser(storedUser);
                }
            } catch (err)
            {
                setError("Unable to load user profile.");
                console.error(err);
            } finally
            {
                setLoading(false);
            }
        };
        fetchUser();
    }, [getUser]);

    const handleLogout = () =>
    {
        authStorage.logout();
        logout();
        navigate("/login");
    };

    if (loading)
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading your profile...</p>
            </div>
        );

    if (!user)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    backgroundColor: "#f9f9f9",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        padding: "40px 30px",
                        maxWidth: "400px",
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: "#888",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "50%",
                            width: "80px",
                            height: "80px",
                            lineHeight: "80px",
                            margin: "0 auto 20px",
                        }}
                    >
                        ?
                    </div>
                    <p
                        style={{
                            fontSize: "16px",
                            color: "#333",
                            marginBottom: "24px",
                        }}
                    >
                        No user data found. Please log in again.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: "#ff6b35",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 20px",
                            fontSize: "15px",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#e35b2f")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#ff6b35")}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="error-page">
                <div className="error-card">
                    <div className="error-icon gray">?</div>
                    <p className="error-text">No user data found. Please log in again.</p>
                    <button className="btn-orange" onClick={handleLogout}>Go to Login</button>
                </div>
            </div>
        );

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <h1>Your Profile</h1>
                    <p>Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="profile-card">
                    {/* Profile Top */}
                    <div className="profile-top">
                        <div className="profile-avatar">
                            {user.firstname ? user.firstname[0].toUpperCase() : "U"}
                        </div>
                        <div className="profile-info">
                            <h2>{user.firstname} {user.lastname}</h2>
                            <p>{user.email}</p>
                            <span>{user.role || "User"}</span>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="profile-fields">
                        <div className="field">
                            <span className="field-icon">👤</span>
                            <div className="field-info">
                                <span className="field-label">First Name</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">{user.firstname || "N/A"}</span>
                        </div>

                        <div className="field">
                            <span className="field-icon">👥</span>
                            <div className="field-info">
                                <span className="field-label">Last Name</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">{user.lastname || "N/A"}</span>
                        </div>

                        <div className="field">
                            <span className="field-icon">🎂</span>
                            <div className="field-info">
                                <span className="field-label">Birthday</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">
                                {user.birthday ? new Date(user.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not Provided"}
                            </span>
                        </div>

                        <div className="field">
                            <span className="field-icon">📰</span>
                            <div className="field-info">
                                <span className="field-label">Newsletter Subscription</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">{user.newsletter ? "Subscribed ✅" : "Not Subscribed ❌"}</span>
                        </div>

                        <div className="field">
                            <span className="field-icon">🎭</span>
                            <div className="field-info">
                                <span className="field-label">Account Role</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">{user.role || "User"}</span>
                        </div>

                        <div className="field">
                            <span className="field-icon">📅</span>
                            <div className="field-info">
                                <span className="field-label">Member Since</span>
                                <span className="field-sub">Personal Information</span>
                            </div>
                            <span className="field-value">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="logout-section">
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </div>

            {/* ---------- CSS Styles ---------- */}
            <style jsx>{`
                /* Page background */
                .profile-page {
    background: #f9fafb;
    min-height: 100vh;
    padding: 3rem 0;
    overflow-y: auto; /* enables vertical scrolling */
    -webkit-overflow-scrolling: touch; /* smooth scrolling on mobile */
}

/* Optional: limit the container height to viewport to allow scroll */
.profile-container {
    max-width: 1200px;
    margin: auto;
    padding: 0 1rem;
    max-height: 100vh; /* ensures the container doesn't exceed viewport */
}

                .profile-container { max-width: 1200px; margin: auto; padding: 0 1rem; }

                /* Header */
                .profile-header { text-align: center; margin-bottom: 4rem; }
                .profile-header h1 { font-size: 3rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
                .profile-header p { font-size: 1.125rem; color: #6b7280; }

                /* Card */
                .profile-card { background: white; border-radius: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }

                /* Top section */
                .profile-top { display: flex; flex-direction: column; align-items: center; gap: 2rem; background: linear-gradient(135deg, #FF7B54, #FF8E6E, #FFB6A1); padding: 3rem; color: white; position: relative; }
                .profile-avatar { width: 9rem; height: 9rem; border-radius: 50%; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; font-weight: 800; backdrop-filter: blur(10px); }
                .profile-info { text-align: center; }
                .profile-info h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
                .profile-info p { font-size: 1.125rem; margin-bottom: 0.5rem; opacity: 0.9; }
                .profile-info span { background: rgba(255,255,255,0.2); padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600; font-size: 1rem; border: 1px solid rgba(255,255,255,0.3); }

                /* Fields */
                .profile-fields { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 3rem; }
                @media (min-width: 1280px) { .profile-fields { grid-template-columns: 1fr 1fr; } }

                .field { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, #f9fafb, #f3f4f6); padding: 1.5rem; border-radius: 1.5rem; box-shadow: 0 8px 16px rgba(0,0,0,0.05); border: 1px solid rgba(209,213,219,0.5); transition: all 0.3s; }
                .field:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); border-color: rgba(156,163,175,0.5); }

                .field-icon { font-size: 2rem; padding: 1rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

                .field-info { display: flex; flex-direction: column; margin-left: 1rem; flex: 1; }
                .field-label { font-weight: 800; font-size: 1.5rem; color: #111827; margin-bottom: 0.25rem; }
                .field-sub { font-size: 0.875rem; color: #6b7280; }

                .field-value { min-width: 12rem; text-align: center; background: white; padding: 0.75rem 1.5rem; border-radius: 1rem; border: 1px solid rgba(156,163,175,0.3); font-weight: 600; color: #111827; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }

                /* Logout */
                .logout-section { display: flex; justify-content: center; padding-top: 2.5rem; border-top: 1px solid #e5e7eb; }
                .btn-logout { background: linear-gradient(to right, #ef4444, #dc2626); padding: 1rem 3.5rem; border-radius: 1.5rem; color: white; font-weight: 800; font-size: 1.25rem; box-shadow: 0 12px 24px rgba(0,0,0,0.1); transition: all 0.3s; }
                .btn-logout:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 32px rgba(0,0,0,0.15); }

                /* Loading */
                .loading-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; background: linear-gradient(to bottom, #f3f4f6, #e5e7eb); }
                .loading-spinner { width: 4rem; height: 4rem; border-top: 4px solid #FF7B54; border-bottom: 4px solid #FF7B54; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
                .loading-text { font-size: 1.5rem; font-weight: 700; color: #FF7B54; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Error card */
                .error-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; }
                .error-card { background: white; border-radius: 1.5rem; padding: 2rem; text-align: center; max-width: 400px; box-shadow: 0 12px 24px rgba(0,0,0,0.1); border: 1px solid #f87171; }
                .error-icon { width: 6rem; height: 6rem; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; color: #b91c1c; margin: auto 0 1.5rem; }
                .error-icon.gray { background: #e5e7eb; color: #6b7280; }
                .error-text { font-size: 1.5rem; font-weight: 700; color: #b91c1c; margin-bottom: 1.5rem; }
                .btn-red { background: #ef4444; padding: 0.75rem 2.5rem; border-radius: 1rem; color: white; font-weight: 700; transition: all 0.3s; }
                .btn-red:hover { background: #dc2626; }
                .btn-orange { background: #FF7B54; padding: 0.75rem 2.5rem; border-radius: 1rem; color: white; font-weight: 700; }
                .btn-orange:hover { background: #FF6B42; }
            `}</style>
        </div>
    );
};

export default ProfilePage;
