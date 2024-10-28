import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";


const  signupUser = async(req, res) => {
   try{
    //   console.log(req.body)
      const {name, email, username, password} = req.body;
      console.log(name, email, username, password)
    //   console.log(name)
    const user = await User.findOne({
        $or: [{ email }, { username }]
      });
      console.log(user)

      if(user){
        return res.status(400).json({message: "User already exists"})
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        username,
        password: hashedPassword
      })
      if (newUser){
        generateTokenAndSetCookie(newUser._id, res);
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
        });
        await newUser.save();
      }
      else{
        res.status(400).json({message: "Invalid user data"}) 
      }
   }
   catch(error){
    res.status(500).json({message: error.message})
    console.log("Error in signupuser", error.message)
   }
}


const loginUser = async(req, res) =>{
  try{
    const {username, password} = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    console.log(isPasswordCorrect)
    if (user && isPasswordCorrect){
      generateTokenAndSetCookie(user._id, res);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      });
    }
    else{
      return res.status(400).json({message: "Invalid username or password"})
    }
  }
  catch(error){

  }
}

const logoutUser = (req, res)=> {
     try{
       res.cookie("jwt", "",{maxAge:1});
       res.status(200).json({message: "User logged out successfully"})
     }catch (error){
        res.status(500).json({message: error.message});
        console.log("Error in signupUser: ", error.message)
     }
};


const followUnfollowUser = async  (req, res) =>{
       try{
         const {id} = req.params;
         
       }
       catch (error){
        res.status(500).json({message: error.message});
        console.log("Error in Following User: ", error.message)
       }
}


export { signupUser, loginUser, logoutUser, followUnfollowUser }; 