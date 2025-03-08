import mongoose,{Schema} from "mongoose";

const UserSchema = new Schema({
    username:{type:String,required:true,unique:true,lowercase:true,},
    fullName:{type:String,required:true,},
    email:{type:String,required:true,unique:true,},
    password:{type:String,required:true,},
    verifyOtp:{type:String,default:'',},
    verifyOtpExpireAt:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOtp:{type:String,default:''},
    resetOtpExpireAt:{type:Number,default:0},

})

// Check it User Model is Available if it is not available its create a new One
const userModel =mongoose.models.user || mongoose.model('user',UserSchema);

export default userModel;