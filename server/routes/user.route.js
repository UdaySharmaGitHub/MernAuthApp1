import express, { Router } from 'express'
import {login, logout, register, sendVerifyOtp, verfyEmail} from '../controller/auth.controller.js'
import { isUserAuthenticate, userAuth } from '../middleware/user.middleware.js';
const router = Router();

router.route('/register').post(register);
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/send-verify-otp').post(userAuth,sendVerifyOtp);
router.route('/verify-account').post(userAuth,verfyEmail);
router.route('/is-auth').post(userAuth,isUserAuthenticate);


//  Exporting the default so we can call this to anothername on the server.js file
export default router;