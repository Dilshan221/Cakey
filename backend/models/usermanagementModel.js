import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userManagementSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // hashed in pre-save
    birthday: { type: Date },
    newsletter: { type: Boolean, default: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "usermanagement" }
);

userManagementSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userManagementSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

const UserManagement = mongoose.model("UserManagement", userManagementSchema);
export default UserManagement;
