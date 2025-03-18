import jwt from 'jsonwebtoken'
export const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token) return res.json({success:false,message:"Not Authorized Login Again"});
    try {
        // Decode the token and get the id
        const decodeToken = jwt.verify(token,process.env.TOKEN_SECRET);
        // console.log(decodeToken)

        if(decodeToken.id){
            req.body.userId = decodeToken.id;
        }
        else{
            return res.json({success:false,message:"Not Authorized User Login Again"});
        }
        // now make it middleware and sent this to mext function
        next();
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}


export const isUserAuthenticate = async(req,res,next)=>{
    try {
        return res.json({success:true,message:"User is Authenticate"})
    } catch (error) {
        return res.json({success:false,message:"User is Not Authenticate"})
    }
}