import express from 'express';
import { getAllUser, fetchUser, createUser, updateUser, deleteUser , getAllVendor} from '../controllers/user.controller.js';
import upload from "../middleware/uploads.js";

const router = express.Router();

router.get('/user-list', getAllUser); 
router.post('/create-user',upload.single('emp_image'), createUser);
router.get('/fetch-user/:id', fetchUser);
router.put('/update-user/:id',upload.single('emp_image'), updateUser);
router.get('/delete-user/:id', deleteUser);
router.get('/vendor-list', getAllVendor);

export default router;
