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
    console.log(hashedPassword);

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

    // // Sending Welecome Email
    // const mailOption = {
    //   from :process.env.SMTP_SENDER_EMAIL,
    //   to:email,
    //   subject: "Hello ✔ Welcome to MERN Auth APP-1", // Subject line
    // text: "User Registration Successfully Done", // plain text body
    // html: `Welcome ${fullName} to CodeWithUday you Successfully Register with this email: ${email} `, // html body
    // }
    // await transporter.sendMail(mailOption);
    // console.log(`Email Send Successfully from ${process.env.SMTP_SENDER_EMAIL} to ${email}`)

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
  console.log(username,email,password)
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
    console.log(isMatch)
    
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
    console.log(token)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Production_ENV",
      sameSite: process.env.NODE_ENV === "Production_ENV" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dayes
    });

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

    res.json({ success: true, message: "User Successfully Logout" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
