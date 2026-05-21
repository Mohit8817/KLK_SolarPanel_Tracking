import express from 'express'
import { loginUser, logoutUser} from '../../controllers/auth/login.controller.js';

const router = express.Router();


router.post('/loginuser',loginUser)
router.get('/logout', logoutUser)

export default router

