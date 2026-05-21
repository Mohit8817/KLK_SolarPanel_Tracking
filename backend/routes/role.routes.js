import express from 'express'
import { getAllRole , fetchRole, createrole, updateRole, fetchPermission, createPermission, getAllPermissions, updatePermission, createRolePermission, fetchPermissionsByRole } from '../controllers/role.controller.js';


const router = express.Router();


// Create Role
router.post(
    "/create",
    createrole
);

// Get All Roles
router.get(
    "/get-roles",
    getAllRole
);

// Fetch Single Role
router.get(
    "/fetch-role/:id",
    fetchRole
);

// Update Role
router.put(
    "/update-role/:id",
    updateRole
);



/* ======================================================
   PERMISSION ROUTES
====================================================== */

// Create Permission
router.post(
    "/permission/create",
    createPermission
);

// Get All Permissions
router.get(
    "/permissions",
    getAllPermissions
);

// Fetch Single Permission
router.get(
    "/permission/:id",
    fetchPermission
);

// Update Permission
router.put(
    "/permission/update/:id",
    updatePermission
);



/* ======================================================
   ROLE PERMISSION ROUTES
====================================================== */

// Assign Permissions To Role
router.post(
    "/role-permission/create",
    createRolePermission
);

// Fetch Permissions By Role
router.get(
    "/role-permission/role/:role_id",
    fetchPermissionsByRole
);


export default router;