import {Comment} from '../models/commentModel.js';
import {PDF} from '../models/pdfModel.js';
import { User } from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getCommentsByPdfId = async (req, res, next) => {
    try {
        const { pdfId } = req.params;
        
        const pdf = await PDF.findById(pdfId);
        
        if (!pdf) {
            return next(new ApiError(404, "PDF not found"));
        }
        
        
        if (req.user && pdf.uploadedBy.toString() !== req.user.id && !pdf.sharedWith.includes(req.user.id)) {
            return next(new ApiError(403, "Not authorized to access this PDF"));
        }
        
        const comments = await Comment.find({ pdfId }).sort({ createdAt: 1 });
        
        const parentComments = comments.filter(comment => !comment.parentId);
        const replies = comments.filter(comment => comment.parentId);
        
        const commentsWithReplies = parentComments.map(comment => {
            const commentReplies = replies.filter(reply => 
                reply.parentId && reply.parentId.toString() === comment._id.toString()
            );
        
            return {
                    ...comment.toObject(),
                    replies: commentReplies
            };
        });
        
        return res.status(200).json(
            new ApiResponse(
                200,
                { comments: commentsWithReplies },
                "Comments retrieved successfully"
            )
        );
    } catch (error) {
        return next(new ApiError(500, "Error retrieving comments", [error.message]));
    }
};


export const addComment = async (req, res, next) => {
  try {
    const { pdfId } = req.params;
    const { text, parentId } = req.body;
    
    if (!text || text.trim() === '') {
      return next(new ApiError(400, "Comment text is required"));
    }
    
    const pdf = await PDF.findById(pdfId);
    
    if (!pdf) {
      return next(new ApiError(404, "PDF not found"));
    }
    
    
    if (req.user && pdf.uploadedBy.toString() !== req.user.id && 
        !pdf.sharedWith.includes(req.user.id)) {
      return next(new ApiError(403, "Not authorized to access this PDF"));
    }
    
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      
      if (!parentComment) {
        return next(new ApiError(404, "Parent comment not found"));
      }
      
      if (parentComment.pdfId.toString() !== pdfId) {
        return next(new ApiError(400, "Parent comment does not belong to this PDF"));
      }
    }

    const userInfo = await User.findById(req.user.id)
        
    const newComment = await Comment.create({
        pdfId,
        text,
        parentId: parentId || null,
        user: {
            id: req.user.id,
            name: userInfo.name,
            email: req.user.email
        }
    });
    
    if (req.body.isGuest && req.body.userName && req.body.userEmail) {
        newComment.user = {
            name: req.body.userName,
            email: req.body.userEmail
        };
        await newComment.save();
    }
    
    return res.status(201).json(
        new ApiResponse(
            201,
            { comment: newComment },
            "Comment added successfully"
        )
    );
  } catch (error) {
    return next(new ApiError(500, "Error adding comment", [error.message]));
  }
};


export const updateComment = async (req, res, next) => {
  try {
        const { commentId } = req.params;
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return next(new ApiError(400, "Comment text is required"));
        }
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return next(new ApiError(404, "Comment not found"));
        }
        
        if (req.user && comment.user.id && comment.user.id.toString() !== req.user.id) {
            return next(new ApiError(403, "Not authorized to update this comment"));
        }
        
        comment.text = text;
        await comment.save();
        
        return res.status(200).json(
            new ApiResponse(
                200,
                { comment },
                "Comment updated successfully"
            )
        );
  } catch (error) {
    return next(new ApiError(500, "Error updating comment", [error.message]));
  }
};


export const deleteComment = async (req, res, next) => {
  try {
        const { commentId } = req.params;
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return next(new ApiError(404, "Comment not found"));
        }
        
        if (req.user && comment.user.id && comment.user.id.toString() !== req.user.id) {
            const pdf = await PDF.findById(comment.pdfId);
            
            if (!pdf || pdf.uploadedBy.toString() !== req.user.id) {
                return next(new ApiError(403, "Not authorized to delete this comment"));
            }
        }
        
        await Comment.findByIdAndDelete(commentId);
        
        await Comment.deleteMany({ parentId: commentId });
        
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Comment deleted successfully"
            )
        );
  } catch (error) {
        return next(new ApiError(500, "Error deleting comment", [error.message]));
  }
};


export const getCommentsByShareLink = async (req, res, next) => {
  try {
        const { shareLink } = req.params;
        
        const pdf = await PDF.findOne({ shareLink });
        
        if (!pdf) {
            return next(new ApiError(404, "PDF not found or link is invalid"));
        }
        
        const comments = await Comment.find({ pdfId: pdf._id }).sort({ createdAt: 1 });
        
        const parentComments = comments.filter(comment => !comment.parentId);
        const replies = comments.filter(comment => comment.parentId);
        
        const commentsWithReplies = parentComments.map(comment => {
            const commentReplies = replies.filter(reply => reply.parentId && reply.parentId.toString() === comment._id.toString());
            
            return {
                ...comment.toObject(),
                replies: commentReplies
            };
        });
        
        return res.status(200).json(
            new ApiResponse(
                200,
                { comments: commentsWithReplies },
                "Comments retrieved successfully"
            )
        );
  } catch (error) {
        return next(new ApiError(500, "Error retrieving comments", [error.message]));
  }
};


export const addCommentByShareLink = async (req, res, next) => {
  try {
        const { shareLink } = req.params;
        const { text, userName, userEmail, parentId } = req.body;
        
        if (!text || text.trim() === '') {
            return next(new ApiError(400, "Comment text is required"));
        }
        
        if (!userName || !userEmail) {
            return next(new ApiError(400, "User name and email are required for guest comments"));
        }
        
        const pdf = await PDF.findOne({ shareLink });
        
        if (!pdf) {
            return next(new ApiError(404, "PDF not found or link is invalid"));
        }
        
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            
            if (!parentComment) {
                return next(new ApiError(404, "Parent comment not found"));
            }
            
            if (parentComment.pdfId.toString() !== pdf._id.toString()) {
                return next(new ApiError(400, "Parent comment does not belong to this PDF"));
            }
        }
        
        const newComment = await Comment.create({
        pdfId: pdf._id,
        text,
        parentId: parentId || null,
            user: {
                name: userName,
                email: userEmail
            }
        });
        
        return res.status(201).json(
            new ApiResponse(
                201,
                { comment: newComment },
                "Comment added successfully"
            )
        );
  } catch (error) {
        return next(new ApiError(500, "Error adding comment", [error.message]));
  }
};