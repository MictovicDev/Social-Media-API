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


function getAllProperties(obj) {
  const properties = new Set();
  while (obj) {
      Object.getOwnPropertyNames(obj).forEach(prop => properties.add(prop));
      obj = Object.getPrototypeOf(obj);
  }
  return [...properties];
}


const loginUser = async(req, res) =>{
  try{
    // console.log(dir(User));
    // console.log(Object.keys(req))
    // console.log(getAllProperties(req))
    // console.log(JSON.stringify(getAllProperties(req), null, 2));
    // console.dir(req);
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


const followUnfollowUser = async (req, res) =>{
       try{
         const {id} = req.params;
         const userToFollow = await User.findById(id);
         const currentUser = await User.findById(req.user._id);
         if(id === req.user._id.toString()) return res.status(400).json({message: "You cannot follow/unfollow yourself"});
         if(!userToFollow || !currentUser) return res.status(400).json({message: "User not Found"});
         const isFollowing = currentUser.following.includes(id);

         if(isFollowing){
           //unfollow user
           await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
           await User.findByIdAndUpdate(id, {$pull: {follower: req.user._id}});
           res.status(200).json({message: "User unfollowed successfully"});
         }
         else{
          await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
          await User.findByIdAndUpdate(id, {$pull: {follower: req.user._id}});
          res.status(200).json({message: "User followed successfully"});
         }
       }
       catch (error){
        res.status(500).json({message: error.message});
        console.log("Error in Following User: ", error.message)
      }
}

const updateUser = async (req, res) =>{
  const {name,username, profilePic, bio} = req.body
  const userId = req.user._id;
     try{
      let user = await User.findById(userId);
      if (!user) return res.status(400).json({message: "User not found"})
      if(req.params.id !== userId.toString()){
        return res.status(400).json({message:"You cannot update someone elses profile"});
      }
      user.name = name || user.name;
      user.username = username || user.username;
      user.profilePic = profilePic || user.profilePic;
      user.bio = bio || user.bio

      user = await user.save();
      res.status(200).json({message:"Profile has been updated succesfully", user})
     }
     catch (error){
         res.status(500).json({message: error.message})
         console.log("Error in Updating User:", error.message)
     }
}

const getUserProfile = async (req, res) =>{
  const {username} = req.params;
     try{
        const user = await User.findOne({username}).select("-password").select("-updatedAt");
        if (!user) return res.status(400).json({message:"User not found"});
        res.status(200).json(user);
      }
     catch (error){
         res.status(500).json({message: error.message})
         console.log("Error in Getting User Profile:", error.message)
     }
}


export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile }; 