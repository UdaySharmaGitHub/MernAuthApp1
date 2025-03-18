import express, { Router } from 'express'
import { getUserData } from '../controller/user.controller.js';
import { userAuth } from '../middleware/user.middleware.js';
const userRouter = Router();

userRouter.route('/data').get(userAuth,getUserData)
export default userRouter; 