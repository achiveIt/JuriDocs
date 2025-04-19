import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '../constants';

export default function CommentSection({ pdfId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/comment/${pdfId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        console.log('Fetched comments:', data.message.comments); 
        setComments(data.message.comments || []);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [pdfId]);

  const submitComment = async (text, parentId = null, onSuccess) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/comment/${pdfId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, parentId }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchComments();
        onSuccess?.();
      } else {
        alert(data.message || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const Comment = ({ comment }) => {
    const [replyBoxOpen, setReplyBoxOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReply = () => {
      submitComment(replyText, comment._id, () => {
        setReplyText('');
        setReplyBoxOpen(false);
      });
    };

    return (
      <li className="bg-white p-4 rounded shadow mb-2">
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <strong>{comment.user?.name || 'Unknown User'}</strong>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{comment.text}</p>
        </div>

        <button
          onClick={() => setReplyBoxOpen(!replyBoxOpen)}
          className="text-sm text-blue-600 hover:underline" >
          Reply
        </button>

        {replyBoxOpen && (
          <div className="mt-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="2"
              className="w-full p-2 border rounded mt-2"
              placeholder="Write a reply..."/>
            <button
              onClick={handleReply}
              disabled={loading}
              className={`mt-1 px-3 py-1 rounded text-white text-sm ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
              {loading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        )}

        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <ul className="ml-4 mt-4 border-l-2 border-gray-200 pl-4">
            {comment.replies.map((reply) => (
              <Comment key={reply._id} comment={reply} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  const [newComment, setNewComment] = useState('');

  const handleNewCommentSubmit = () => {
    submitComment(newComment, null, () => setNewComment(''));
  };

  return (
    <div className="mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </ul>

      <div className="mt-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows="3"
          placeholder="Write a comment..."
          className="w-full p-3 border rounded"/>

        <button
          onClick={handleNewCommentSubmit}
          disabled={loading}
          className={`mt-2 px-4 py-2 rounded text-white font-medium transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`} >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}
