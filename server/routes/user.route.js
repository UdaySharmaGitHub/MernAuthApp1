import express, { Router } from 'express'
import {login, logout, register} from '../controller/auth.controller.js'
const router = Router();

router.route('/register').post(register);
router.route('/login').post(login)
router.route('/logout').post(logout)


//  Exporting the default so we can call this to anothername on the server.js file
export default router;