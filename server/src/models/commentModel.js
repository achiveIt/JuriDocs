import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    pdfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PDF',
        required: true
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    text: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


export const Comment = mongoose.model('Comment', commentSchema);