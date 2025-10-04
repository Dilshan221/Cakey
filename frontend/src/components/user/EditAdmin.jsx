import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminServices";
import AdminForm from "./AdminForm";

const EditAdmin = () =>
{
    const { id } = useParams();
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        const fetchAdmin = async () =>
        {
            try
            {
                const admin = await adminService.getAdminById(id); // response is admin object
                setAdminData(admin);
            } catch (err)
            {
                alert(err.message || "Failed to fetch admin");
            } finally
            {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, [id]);

    const handleFormSubmit = () =>
    {
        navigate("/adminmanager"); // go back after update
    };

    const handleCancel = () =>
    {
        navigate("/adminmanager");
    };

    if (loading) return <p>Loading admin data...</p>;

    return (
        <AdminForm
            editingAdmin={adminData}
            onFormSubmit={handleFormSubmit}
            onCancel={handleCancel}
        />
    );
};

export default EditAdmin;
