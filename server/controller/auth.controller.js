// import { ApiError } from "../util/ApiError.js";
import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import transporter of the NodeMailer
import transporter from '../util/nodemailer.js';

//  localhost:4000/user/UserRegister
export const register = async (req, res) => {
  const { fullName, username, email, password } = req.body;
  // console.log(username,fullName,email,password);

  if (!username || !fullName || !email || !password) {
    // throw new ApiError(400,"All field are Required")
    return res.json({ success: false, message: "All field are Required" });
  }
  try {
    // Check if there is An Existing user or not
    const findUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    console.log(findUser);

    if (findUser) {
      return res.json({ success: false, message: "User already Exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    const newUser = new userModel({
      username,
      fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Assigning the Token in the Cookie of the site
    const token = jwt.sign(
      {
        id: newUser._id,
        fullName: fullName,
        username: username,
        email: email,
        password: password,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRY,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Production_ENV",
      sameSite: process.env.NODE_ENV === "Production_ENV" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dayes
    });

    // Sending Welecome Email using Nodemail and Brevo SMTP Server
    const mailOption = {
      from :process.env.SMTP_SENDER_EMAIL,
      to:email,
      subject: "Hello ✔ Welcome to MERN Auth APP-1", // Subject line
    text: `Welcome ${fullName} to CodeWithUday you Successfully Register with this email: ${email} `, // plain text body
    }
    await transporter.sendMail(mailOption);
    console.log(`Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${email}`)

    return res.json({ success: true, message: "User Register Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};




//  localhost:4000/user/login
export const login = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "All field Required" });
  }
  try {
    // check if User Exist of Not
    const existingUser =await userModel.findOne({
      $or: [{username},{email}],
    });
    // console.log(existingUser)
    if (!existingUser) {
      return res.json({ success: false, message: "User Don't Exit" });
    }
    if (existingUser.username !== username || existingUser.email !== email) {
      return res.json({ success: false, message: "Username or password is incorrect" });
    }

    // Check if the password matches or not;
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch)
      return res.json({ success: false, message: "Password is Incorrect" });
    // console.log(isMatch)
    
    // Assiging the User With New of Refreshed Token
    const token = jwt.sign(
      {
        id: existingUser._id,
        fullName: existingUser.fullName,
        username: username,
        email: email,
        password: password,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRY,
      }
    );
    // console.log(token)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Production_ENV",
      sameSite: process.env.NODE_ENV === "Production_ENV" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dayes
    });
    console.log("logged In Successfully")
    res.json({ success: true,message:"User LoggedIn Successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



//  localhost:4000/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Production_ENV",
      sameSite: process.env.NODE_ENV === "Production_ENV" ? "none" : "strict",
    });

    console.log("logged OUT Successfully")
    res.json({ success: true, message: "User Successfully Logout" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Sending A Verification OTP
//  localhost:4000/user/
export const sendVerifyOtp = async(req,res)=>{
  try {
    const {userId} = req.body;
    console.log(userId)
    const user = await userModel.findById(userId);
    console.log(user.isAccountVerified)
    if(user.isAccountVerified) return res.json({success:false,message:"Account Already Verified"});
    
    // Generate Random OTP
    const otp = String(Math.floor(100000+Math.random() *900000))
    console.log(otp)
    // save the opt in the database
    user.verifyOtp = otp;
    // add Expires Time of the OTP
    user.verifyOtpExpireAt = Date.now()+24*60*60*1000
    // save the database
    await user.save();

    // sent the opt to the mail
    const mailOption = {
      from :process.env.SMTP_SENDER_EMAIL,
      to:user.email,
      subject: "Account Verification of MERN Auth APP-1", // Subject line
    text: `Your OTP is ${otp}. Verify your account using this otp `, // plain text body
    }
    await transporter.sendMail(mailOption);
    console.log(`OTP Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${user.email}`)
    
    return res.json({success:true,message:"Verfication OTP Sent on Email"}) ;
  } catch (error) {
    return res.json({succes:false,message:error.message})
  }
}


// Now verift the Email using Previously send the OPT
export const verfyEmail = async(req,res)=>{
  const {userId,otp} = req.body;
  console.log(userId,otp);

  if(!userId || !otp) return res.json({succes:false,message:"Missing Detail"});
  else{
    try {
      const user = await userModel.findById(userId);
      // if user Desn't Exist
      if(!user){
        return res.json({succes:false,message:"User Doesn't Exist"});
      }
      // if doesn't match the OTP
      if(user.verifyOtp===''|| user.verifyOtp !== otp){
        return res.json({succes:false,message:"Invalid OTP"});
      }
      // Check if the OTP is EXpired or Not
      if(user.verifyOtpExpireAt < Date.now()){
        return res.json({succes:false,message:"OTP Expired"})
      }
      user.isAccountVerified = true;
      user.verifyOtp ='';
      user.verifyOtpExpireAt = 0;
      await user.save();
      // sent the opt to the mail
    const mailOption = {
      from :process.env.SMTP_SENDER_EMAIL,
      to:user.email,
      subject: "Account Verified Successfully of MERN Auth APP-1", // Subject line
    text: `Your Account is ${user.email} with username ${user.username}.Is Verified Successfully `, // plain text body
    }
    await transporter.sendMail(mailOption);
    console.log(`OTP Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${user.email}`)
    
      return res.json({succes:true,message:"Email Verifed Successfully"});
    } catch (error) {
      return res.json({succes:false,message:error.message})
    }
  }
}


// Send Reset Password OTP
export const sendResetOTP = async(req,res)=>{
  const {email} = req.body;
  // if email is not available
  if(!email) return res.json({succes:false,message:"Email is Required"});

  try {
    // find the user
    const user = await userModel.findOne({email});
    // check if user not found
    if(!user)    return res.json({succes:false,message:"User not Found"})

    // Now we have to generate the otp 
    // and send this to mail
     // Generate Random OTP
     const otp = String(Math.floor(100000+Math.random() *900000))
     console.log(otp)
     // save the opt in the database
     user.resetOtp = otp;
     // add Expires Reset OTP Time is 15 min Time of the OTP
     user.resetOtpExpireAt = Date.now()+5*60*1000
     // save the database
     await user.save();
 
     // sent the opt to the mail
     const mailOption = {
       from :process.env.SMTP_SENDER_EMAIL,
       to:user.email,
       subject: "Password Reset OTP of MERN Auth APP-1", // Subject line
     text: `Your OTP for resetting your password is ${otp}. Use this OTP to resetting your account password `, // plain text body
     }
     await transporter.sendMail(mailOption);
     console.log(`OTP Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${user.email}`)
     
     return res.json({success:true,message:"Password Reset OTP Sent on Email"}) ;
   
    } catch (error) {
    return res.json({succes:false,message:error.message})
  }
}

// Reset User Password using the Reset OTP;
export const resetPassword = async(req,res)=>{
  const {email,otp,newPassword} = req.body;
  if(!email || !otp || !newPassword) return res.json({succes:false,message:"All field is required"});

  try {
    const user = await userModel.findOne({email});
    // check if user not found
    if(!user)    return res.json({succes:false,message:"User not Found"})

    // if doesn't match the OTP
    if(user.resetOtp===''|| user.resetOtp !== otp){
      return res.json({succes:false,message:"Invalid OTP"});
    }
    // Check if the OTP is EXpired or Not
    if(user.resetOtpExpireAt < Date.now()){
      return res.json({succes:false,message:"OTP Expired"})
    }
    // after all the authentication
    // wehave to hashed the password
    const hashedPassword = await bcrypt.hash(newPassword,10);
    console.log(hashedPassword);
    // now save the new password in the database
    user.password = hashedPassword;
    user.resetOtp ='';
    user.resetOtpExpireAt = 0;
    await user.save();

    // sent message opt to the mail
  const mailOption = {
    from :process.env.SMTP_SENDER_EMAIL,
    to:user.email,
    subject: "Password Reset Successfully of MERN Auth APP-1", // Subject line
  text: `Your Account is ${user.email} with username ${user.username}.Is Password Reset Successfully `, // plain text body
  }
  await transporter.sendMail(mailOption);
  console.log(`OTP Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${user.email}`)
  
    return res.json({succes:true,message:"Password Reset Successfully"});
  
  } catch (error) {
    
  }
}
