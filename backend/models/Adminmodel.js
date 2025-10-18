import mongoose from "mongoose";
const { Schema } = mongoose;
const adminSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: [
            "Product & Inventory Manager",
            "Order & Delivery Manager",
            "Finance Manager",
            "Service & Complaint Manager"
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Admin = mongoose.model("Adminmodel", adminSchema);
export default Admin;
