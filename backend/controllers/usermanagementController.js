import jwt from "jsonwebtoken";
import UserManagement from "../models/usermanagementModel.js";

/* ------------------------------ helpers ------------------------------ */
const signToken = (user) =>
  jwt.sign(
    { sub: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );

/* ------------------------------ auth ------------------------------ */
// POST /api/usermanagement/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }
    const user = await UserManagement.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    const ok = await user.matchPassword(password);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        newsletter: user.newsletter,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------ create ------------------------------ */
// POST /api/usermanagement/register
export const registerUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, birthday, newsletter } =
      req.body || {};

    if (!firstname || !lastname || !email || !password) {
      res.status(400);
      throw new Error("Missing required fields");
    }

    const existing = await UserManagement.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const user = await UserManagement.create({
      firstname,
      lastname,
      email,
      password, // hashed in pre-save
      birthday,
      newsletter: !!newsletter,
    });

    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      birthday: user.birthday,
      newsletter: user.newsletter,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------ read ------------------------------ */
// GET /api/usermanagement/all
export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await UserManagement.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/usermanagement/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await UserManagement.findById(req.params.id).select(
      "-password"
    );
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/* ------------------------------ update ------------------------------ */
// PUT /api/usermanagement/:id
export const updateUser = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      birthday,
      newsletter,
      role,
      isActive,
    } = req.body || {};
    const user = await UserManagement.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (email && email !== user.email) {
      const taken = await UserManagement.findOne({ email });
      if (taken) {
        res.status(409);
        throw new Error("Email already in use");
      }
      user.email = email;
    }

    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.birthday = birthday ?? user.birthday;
    if (typeof newsletter === "boolean") user.newsletter = newsletter;
    user.role = role ?? user.role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    if (password) user.password = password; // will be re-hashed in pre-save

    const saved = await user.save();
    res.json({
      _id: saved._id,
      firstname: saved.firstname,
      lastname: saved.lastname,
      email: saved.email,
      birthday: saved.birthday,
      newsletter: saved.newsletter,
      role: saved.role,
      isActive: saved.isActive,
      updatedAt: saved.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------ delete ------------------------------ */
// DELETE /api/usermanagement/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await UserManagement.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
