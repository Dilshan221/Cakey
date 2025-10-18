import React, { useEffect, useState } from "react";
import { ComplaintsAPI } from "../../services/api";

const OrderDeliveryComplaints = () =>
{
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priorityFilter, setPriorityFilter] = useState("All");

    useEffect(() =>
    {
        const fetchComplaints = async () =>
        {
            try
            {
                const allComplaints = await ComplaintsAPI.list();
                const filtered = allComplaints.filter(
                    (c) => c.adminType === "Order & Delivery"
                );
                setComplaints(filtered);
                setFilteredComplaints(filtered);
            } catch (err)
            {
                console.error(err);
                setError(err.message || "Failed to load complaints");
            } finally
            {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handlePriorityFilter = (level) =>
    {
        setPriorityFilter(level);
        if (level === "All")
        {
            setFilteredComplaints(complaints);
        } else
        {
            setFilteredComplaints(
                complaints.filter((c) => c.priority?.toLowerCase() === level.toLowerCase())
            );
        }
    };

    if (loading) return <p style={{ textAlign: "center" }}>Loading complaints...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
    if (!complaints.length) return <p style={{ textAlign: "center" }}>No Order & Delivery complaints found.</p>;

    const styles = {
        main: {
            display: "flex",
            minHeight: "100vh",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            background: "#f5f6fa",
            overflow: "hidden",
        },
        sidebar: {
            width: "260px",
            background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
            height: "100vh",
            padding: "0",
            position: "fixed",
            top: 0,
            left: 0,
            color: "white",
            overflowY: "auto",
        },
        logoContainer: {
            padding: "30px 20px",
            borderBottom: "1px solid #405365",
            textAlign: "center",
        },
        logoTitle: {
            fontFamily: "'Pacifico', cursive",
            fontSize: "30px",
            color: "#e74c3c",
            margin: "0",
        },
        logoSubtitle: {
            fontSize: "12px",
            color: "#bdc3c7",
            letterSpacing: "1px",
            fontWeight: "300",
        },
        navLink: {
            display: "block",
            padding: "15px 25px",
            color: "#bdc3c7",
            textDecoration: "none",
            fontSize: "15px",
            transition: "all 0.3s ease",
        },
        navLinkHover: {
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
        },
        content: {
            marginLeft: "260px",
            padding: "30px 50px",
            width: "calc(100% - 260px)",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "25px",
        },
        filterSelect: {
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            fontSize: "14px",
            cursor: "pointer",
        },
        cardGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
        },
        card: {
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "20px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
        },
        cardHover: {
            transform: "translateY(-5px)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        },
        badge: (priority) => ({
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor:
                priority === "High"
                    ? "#e74c3c"
                    : priority === "Medium"
                        ? "#f1c40f"
                        : "#2ecc71",
            color: "white",
        }),
    };

    return (
        <div style={styles.main}>
            <aside style={styles.sidebar}>
                <div style={styles.logoContainer}>
                    <h2 style={styles.logoTitle}>Cake & Bake</h2>
                    <div style={styles.logoSubtitle}>Admin Dashboard</div>
                </div>
                <nav>
                    <a href="http://localhost:3000/normal-order-dash" style={styles.navLink}>
                        Default Orders
                    </a>
                    <a href="http://localhost:3000/custom-order-dash" style={styles.navLink}>
                        Custom Orders
                    </a>
                    <a href="http://localhost:3000/ordercomplaint" style={{ ...styles.navLink, ...styles.navLinkHover }}>
                        Complaints
                    </a>
                </nav>
            </aside>

            <main style={styles.content}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>Order & Delivery Complaints</h2>
                    <select
                        style={styles.filterSelect}
                        value={priorityFilter}
                        onChange={(e) => handlePriorityFilter(e.target.value)}
                    >
                        <option value="All">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div style={styles.cardGrid}>
                    {filteredComplaints.map((c) => (
                        <div
                            key={c._id}
                            style={styles.card}
                            onMouseEnter={(e) =>
                                Object.assign(e.currentTarget.style, styles.cardHover)
                            }
                            onMouseLeave={(e) =>
                                Object.assign(e.currentTarget.style, {
                                    transform: "none",
                                    boxShadow: styles.card.boxShadow,
                                })
                            }
                        >
                            <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{c.title || "Order & Delivery Complaint"}</h3>
                            <p><strong>Name:</strong> {c.name}</p>
                            <p><strong>Email:</strong> {c.email}</p>
                            <p><strong>Phone:</strong> {c.phone || "N/A"}</p>
                            <p><strong>Complaint Type:</strong> {c.complaintType}</p>
                            <p><strong>Complaint:</strong> {c.complaint}</p>
                            <p><strong>Status:</strong> {c.status}</p>
                            <span style={styles.badge(c.priority)}>{c.priority}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default OrderDeliveryComplaints;
