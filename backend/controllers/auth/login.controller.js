import User from "../../models/users.model.js";
import RolePermission from "../../models/RolePermission.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (
  req,
  res
) => {

  try {

    const { email, password } =
      req.body;

    // =====================================
    // FIND USER
    // =====================================
    const user = await User.findOne({
      email,
    }).populate("role");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =====================================
    // CHECK PASSWORD
    // =====================================
    if (password !== user.password) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid Credentials",
      });
    }

    // =====================================
    // FETCH ROLE PERMISSIONS
    // =====================================
    const rolePermissions =
      await RolePermission.find({
        role_id: user.role._id,
      }).populate("permission_id");

    const permissions =
      rolePermissions.map(
        (item) =>
          item.permission_id?.label
      );

    // =====================================
    // GENERATE TOKEN
    // =====================================
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role._id,
        company_id:
          user.company_id,
        state_access:
          user.state_access,
      },
      process.env.JWT_SECRET ||
        "secretkey",
      {
        expiresIn: "7d",
      }
    );

    res.json({

      success: true,

      message:
        "Login successful",

      token,

      user: {

        id: user._id,

        first_name:
          user.first_name,

        unique_id:
          user.unique_id,

        last_name:
          user.last_name,

        email: user.email,

        role: user.role,

        company_id:
          user.company_id,

        whatsapp_no:
          user.whatsapp_no,

        gender: user.gender,

        emp_image:
          user.emp_image,

        manager:
          user.manager,

        state_access:
          user.state_access,

        city: user.city,

        project:
          user.project,
      },

      permissions,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,
    });
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


