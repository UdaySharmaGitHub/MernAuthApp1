import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
// Api Endpoints import
import authRouter from './routes/user.route.js'
import userRouter from './routes/userData.route.js'
//  Connect DB
import connectDB from './db/db.js'

const app =express()
const port = process.env.PORT || 4001

connectDB();

// CORS
app.use(cors({
    credentials:true,
    origin:process.env.CORS_ORIGIN,
}))
// Setting the JSON Limit
app.use(express.json({
    limit:"50kb"
}))
// URL DATA
app.use(express.urlencoded({
    extended:true,limit:"50kb"}))
// Public Assest in Express
app.use(express.static('public'));
//  Cookie Parser
app.use(cookieParser())

// API Endpoint
// localhost:4000  || localhost:4000/
app.get('/',(req,res)=>{
    res.send("API Working");
})

// User and Auth Routes and API
app.use('/api/auth',authRouter)

// User Data routes
app.use('/api/user',userRouter)

app.listen(port,()=>{
    console.log(`Port Listing at:${port} port`)
})