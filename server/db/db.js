import mongoose from "mongoose";
import {DB_NAME} from '../constant.js'

const connectDB = async()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Successfully Connected to the MONGODB ${connection}`);
    } catch (error) {
        console.log(`Unable to Connected the MONGODB ${error}`)
        process.exit(1);
    }
}
export default connectDB;