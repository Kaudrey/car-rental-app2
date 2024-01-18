const { compare, genSalt, hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const Post = require("../models/post.model.js")
const {sendWelcomeEmail} = require("../utils/emailConfig.js")
const {
  createSuccessResponse,
  errorResponse,
  serverErrorResponse,
  successResponse,
} = require("../utils/api.response.js");
const _ = require("lodash");

exports.registerUser = async (req, res) => {
    try {
      let checkEmail = await User.findOne({ email: req.body.email });
      if (checkEmail) return errorResponse("Email is already registered!", res);
  
      let user = new User(
        _.pick(req.body, ["username", "phone", "email", "password"])
      );
  
      // user.role = "user";
  
      const salt = await genSalt(10);
      user.password = await hash(user.password, salt);
  
      try {
        await user.save();
        await sendWelcomeEmail(user.email, user.username);
        return createSuccessResponse(
          "User registered successfully. You can now login",
          {},
          res
        );
      } catch (ex) {
        return errorResponse(ex.message, res);
      }
    } catch (ex) {
      return serverErrorResponse(ex, res);
    }
  };

  exports.login = async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email }).select(
        "_id role password"
      );
      if (!user) return errorResponse("Invalid email or password!", res);
  
      const validPassword = await compare(req.body.password, user.password);
      if (!validPassword) return errorResponse("Invalid email or password!", res);
      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT);
  
      return successResponse("Login successfully", { access_token: token }, res);
    } catch (ex) {
      console.log(ex);
      return serverErrorResponse(ex, res);
    }
  };

  exports.updateUser = async (req, res) =>{
    try {
        
        const { userId } = req.params;
        const { username, phone, email,password } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            
          userId,
          { username, phone, email,password },
          { new: true }
        );
    
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    }catch (ex) {
        return serverErrorResponse(ex, res);
    }
}


exports.deleteUser = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const { userId } = req.params;
    if (authUserId !== userId) {
      return res.status(403).json({ message: "Permission denied. You can only delete your own account." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Post.deleteMany({ userId });
    await user.deleteOne();

    res.status(200).json({ message: "User and associated posts removed from the system" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing user and associated from the system" });
  }
};

exports.getUserSuggestions = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const suggestedUsers = await User.find({ _id: { $ne: authUserId } })
      .select("username createdAt")
      .limit(5);

    res.status(200).json({ suggestions: suggestedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting user suggestions" });
  }
};

