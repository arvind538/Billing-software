import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Frontend aur backend alag domain/port pe hain to cross-site cookie chahiye
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // Cross-origin setup (frontend aur backend alag domain) ke liye zaroori:
  // production mein HTTPS ke saath "none" + secure use karo,
  // agar dono same domain pe hain (same-origin) to "lax" bhi chalega
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction, // sameSite: "none" ke liye secure: true mandatory hai
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role });

    // Register par cookie set NAHI karte — account sirf banega,
    // login user ko manually /login page se hi karna hoga
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email or password incorrect" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logoutUser = (req, res) => {
  // clearCookie ko bhi wahi options chahiye jo set karte waqt diye the,
  // warna kuch browsers (especially mobile) cookie clear nahi karte
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};



// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const generateToken = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: "Email already registered" });

//     const user = await User.create({ name, email, password, role });
//     const token = generateToken(user._id);

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });
//     res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await user.matchPassword(password))) {
//       return res.status(401).json({ message: "Email or password incorrect" });
//     }
//     const token = generateToken(user._id);
//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });
//     res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const logoutUser = (req, res) => {
//   res.clearCookie("token");
//   res.json({ message: "Logged out" });
// };

// export const getMe = async (req, res) => {
//   res.json(req.user);
// };