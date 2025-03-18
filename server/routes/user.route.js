import express, { Router } from 'express'
import {login, logout, register,resetPassword, sendResetOTP, sendVerifyOtp, verfyEmail} from '../controller/auth.controller.js'
import { isUserAuthenticate, userAuth } from '../middleware/user.middleware.js';
const router = Router();

router.route('/register').post(register);
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/send-verify-otp').post(userAuth,sendVerifyOtp);
router.route('/verify-account').post(userAuth,verfyEmail);
router.route('/is-auth').post(userAuth,isUserAuthenticate);

// password Reset
router.route('/send-reset-otp').post(userAuth,sendResetOTP);
router.route('/reset-password').post(userAuth,resetPassword);


//  Exporting the default so we can call this to anothername on the server.js file
export default router;