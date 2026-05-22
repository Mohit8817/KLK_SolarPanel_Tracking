import mongoose from "mongoose";
import Role from "../models/Role.model.js";
import Permission from "../models/Permission.model.js";
import RolePermission from "../models/RolePermission.model.js";

// ================= ROLE =================

// Create Role
export const createrole = async (req, res) => {
    try {

        const role = await Role.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Role Created Successfully !!",
            data: role
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Get All Roles
export const getAllRole = async (req, res) => {
    try {

        const roles = await Role.find();

        return res.status(200).json({
            success: true,
            data: roles
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Fetch Single Role
export const fetchRole = async (req, res) => {
    try {

        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role does not exist !!"
            });
        }

        return res.status(200).json({
            success: true,
            data: role
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Update Role
export const updateRole = async (req, res) => {
    try {

        const existingRole = await Role.findById(req.params.id);

        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role does not exist !!!"
            });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Role updated Successfully !!!",
            data: updatedRole
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ================= PERMISSION =================

// Create Permission
export const createPermission = async (req, res) => {
    try {

        // Optional Duplicate Check
        const existingPermission = await Permission.findOne({
            name: req.body.name
        });

        if (existingPermission) {
            return res.status(409).json({
                success: false,
                message: "Permission already exists !!"
            });
        }

        const permission = await Permission.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Permission Created Successfully !!",
            data: permission
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAllPermissions = async (
  req,
  res
) => {

  try {

    const permissions =
      await Permission.find().sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: permissions,
    });

  } catch (error) {

    console.log(
      "Get Permission Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch permissions",
      error: error.message,
    });
  }
};


// Fetch Single Permission
export const fetchPermission = async (req, res) => {
    try {

        const permission = await Permission.findById(req.params.id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found !!"
            });
        }

        return res.status(200).json({
            success: true,
            data: permission
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Update Permission
export const updatePermission = async (req, res) => {
    try {

        const existingPermission = await Permission.findById(req.params.id);

        if (!existingPermission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found !!"
            });
        }

        const updatedPermission = await Permission.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Permission Updated Successfully !!",
            data: updatedPermission
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// Delete Permission
export const deletePermission = async (req, res) => {
    try {

        const existingPermission = await Permission.findById(req.params.id);

        if (!existingPermission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found !!"
            });
        }

        await Permission.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Permission Deleted Successfully !!"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ================= ROLE PERMISSION =================


// Create / Update Role Permission
export const createRolePermission = async (
  req,
  res
) => {

  try {

    const {
      role_id,
      permission_ids,
    } = req.body;

    // VALIDATION
    if (
      !role_id ||
      !permission_ids ||
      !Array.isArray(permission_ids)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "role_id and permission_ids are required !!",
      });
    }

    // DELETE OLD PERMISSIONS
    await RolePermission.deleteMany({
      role_id,
    });

    // PREPARE DATA
    const permissionData =
      permission_ids.map(
        (permission_id) => ({
          role_id,
          permission_id,
        })
      );

    // INSERT NEW
    const createdPermissions =
      await RolePermission.insertMany(
        permissionData
      );

    return res.status(201).json({
      success: true,
      message:
        "Role Permissions Saved Successfully !!",
      data: createdPermissions,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// Fetch Permissions By Role
export const fetchPermissionsByRole = async (req, res) => {
    try {

        const role_id = req.params.role_id;

        const rolePermissions = await RolePermission.find({
            role_id
        }).populate("permission_id");

        return res.status(200).json({
            success: true,
            data: rolePermissions
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};