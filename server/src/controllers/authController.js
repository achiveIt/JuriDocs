import {User} from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../utils/sendMail.js';

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        //console.log("user toh yae rha ", user);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        //console.log("reached line 13..");
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error while generating tokens");
    }
};

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "All fields are required"));
    }
    
    try {
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res
                .status(409)
                .json(new ApiResponse(409, {}, "User with this email already exists"));
        }
        
        const user = await User.create({
            name,
            email,
            password
        });
        
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    201, 
                    { user: { _id: user._id, name: user.name, email: user.email } },
                    "User registered successfully"
                )
            );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Error while registering user");
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email) {
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "Email field is required"));
    }
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res
                .status(400)
                .json(new ApiResponse(400, {}, "User not found"));
        }
        
        const isPasswordValid = await user.matchPassword(password);
        
        if (!isPasswordValid) {
            return res
                .status(401)
                .json(new ApiResponse(401, {}, "Incorrect password"));
        }
        
        const { accessToken, refreshToken } = await generateTokens(user._id);
        
        const options = {
            httpOnly: true,
            secure: false
        };
        
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    { user: { _id: user._id, name: user.name, email: user.email } },
                    "Logged in successfully!!"
                )
            );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Error while login");
    }
};

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $unset: { refreshToken: 1 }
            },
            { new: true }
        );
        
        const options = {
            httpOnly: true,
            secure: false
        };
        
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Logged out successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Error while logging out");
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;
        
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh token not found");
        }
        
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        
        const user = await User.findById(decodedToken._id);
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
        
        const { accessToken, refreshToken } = await generateTokens(user._id);
        
        const options = {
            httpOnly: true,
            secure: false
        };
        
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        console.error(error);
        
        throw new ApiError(500, "Error while refreshing access token");
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    { user },
                    "User fetched successfully"
                )
            );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Error while fetching user");
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            throw new ApiError(400, "Old password and new password are required");
        }
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        const isPasswordValid = await user.matchPassword(oldPassword);
        
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid old password");
        }
        
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Password changed successfully"
                )
            );
    } catch (error) {
        console.error(error);
        
        throw new ApiError(500, "Error while changing password");
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            throw new ApiError(400, "Name is required");
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    name
                }
            },
            { new: true }
        ).select("-password -refreshToken");
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user },
                    "Profile updated successfully"
                )
            );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Error while updating profile");
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) return res.status(400).json({ message: 'Email is required' });
  
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = Date.now() + 10 * 60 * 1000;
  
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiry;
    await user.save();
  
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
    try {
      await sendResetPasswordEmail(user.email, resetUrl);
      res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Failed to send reset email.' });
    }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
};
