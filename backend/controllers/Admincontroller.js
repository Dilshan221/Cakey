import Admin from "../models/Adminmodel.js";
import bcrypt from "bcryptjs";

// Get all admins
export const getAllAdmins = async (req, res) => {
    let admins;
    try {
        admins = await Admin.find().select('-password'); // Don't return passwords
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching admins" });
    }

    if (!admins || admins.length === 0) {
        return res.status(404).json({ message: "No admins found" });
    }

    return res.status(200).json({ admins });
};

// Add new admin
export const addAdmin = async (req, res, next) => {
    const { fullName, contactNumber, email, password, reEnterPassword, role } = req.body;

    // Validate password match
    if (password !== reEnterPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate required fields
    if (!fullName || !contactNumber || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let admin;

    try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        admin = new Admin({
            fullName,
            contactNumber,
            email,
            password: hashedPassword,
            role
        });

        await admin.save();
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Error while adding admin" });
    }

    if (!admin) {
        return res.status(404).json({ message: "Unable to add admin" });
    }

    // Don't return password in response
    const { password: _, ...adminResponse } = admin.toObject();
    return res.status(201).json({ admin: adminResponse });
};

// Get admin by ID
export const getById = async (req, res, next) => {
    const id = req.params.id;

    let admin;
    try {
        admin = await Admin.findById(id).select('-password');
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching admin" });
    }

    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ admin });
};

// Update admin
export const updateAdmin = async (req, res, next) => {
    const id = req.params.id;
    const { fullName, contactNumber, email, role, password } = req.body;

    let updateData = {
        fullName,
        contactNumber,
        email,
        role
    };

    if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
    }

    let admin;
    try {
        admin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Error while updating admin" });
    }

    if (!admin) {
        return res.status(404).json({ message: "Unable to update admin" });
    }

    return res.status(200).json({ admin });
};

// Delete admin
export const deleteAdmin = async (req, res, next) => {
    const id = req.params.id;

    let admin;
    try {
        admin = await Admin.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error while deleting admin" });
    }

    if (!admin) {
        return res.status(404).json({ message: "Unable to delete admin" });
    }

    return res.status(200).json({ message: "Admin deleted successfully" });
};

// Get admins by role
export const getAdminsByRole = async (req, res) => {
    const { role } = req.params;

    let admins;
    try {
        admins = await Admin.find({ role }).select('-password');
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching admins by role" });
    }

    if (!admins || admins.length === 0) {
        return res.status(404).json({ message: `No admins found with role: ${role}` });
    }

    return res.status(200).json({ admins });
};
