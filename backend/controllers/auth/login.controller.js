import User from "../../models/users.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (password !== user.password)
      return res.status(400).json({ message: "Invalid Credentials" });

    // 🔑 Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        state_access: user.state_access 
      },
      process.env.JWT_SECRET || "secretkey", // use your secret from .env
      { expiresIn: "10h" } // token valid for 2 hours
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        unique_id: user.unique_id,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        whatsapp_no: user.whatsapp_no,
        gender: user.gender,
        emp_image: user.emp_image,
        manager: user.manager,
        state_access: user.state_access,
        city: user.city,
        project: user.project,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Destroy session (if using session)
    req.session?.destroy?.();

    // Send success response
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

