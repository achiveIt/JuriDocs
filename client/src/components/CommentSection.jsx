import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { SERVER_URL } from '../constants';

export default function CommentSection({ pdfId, shareLink }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [text, setText] = useState('');
  const TINY_MCE_API_KEY = import.meta.env.VITE_TINY_MCE_API_KEY; 

  const fetchComments = async () => {
    try {
      const res = await fetch(
        shareLink
          ? `${SERVER_URL}/api/shared/${shareLink}/comments`
          : `${SERVER_URL}/api/comment/${pdfId}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (res.ok) {
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
  }, [pdfId, shareLink]);

  const submitComment = async (commentText, parentId = null, onSuccess) => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const payload = shareLink
        ? { text: commentText, userName, userEmail, parentId }
        : { text: commentText, parentId };

      const res = await fetch(
        shareLink
          ? `${SERVER_URL}/api/shared/${shareLink}/comments`
          : `${SERVER_URL}/api/comment/${pdfId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setText('');
        onSuccess?.();
        fetchComments();
      } else {
        alert(data.message || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/comment/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        fetchComments();
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
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
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: comment.text }}></p>
        </div>

        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setReplyBoxOpen(!replyBoxOpen)}
            className="text-blue-600 hover:underline" >
            Reply
          </button>
          <button
            onClick={() => deleteComment(comment._id)}
            className="text-red-600 hover:underline">
            Delete
          </button>
        </div>

        {replyBoxOpen && (
          <div className="mt-2">
            <Editor
              apiKey={TINY_MCE_API_KEY}
              value={replyText}
              init={{
                height: 150,
                menubar: false,
                plugins: 'lists link',
                toolbar: 'bold italic | bullist',
              }}
              onEditorChange={(content) => setReplyText(content)}/>
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

  return (
    <div className="mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </ul>

      <div className="mt-6">
        {shareLink && (
          <>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-2 border rounded mb-2"/>
            <input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full p-2 border rounded mb-2"
            />
          </>
        )}
        <Editor
          apiKey={TINY_MCE_API_KEY}
          value={text}
          init={{
            height: 200,
            menubar: false,
            plugins: 'lists link',
            toolbar: 'bold italic | bullist',
          }}
          onEditorChange={(content) => setText(content)}/>
        <button
          onClick={() => submitComment(text)}
          disabled={loading}
          className={`mt-2 px-4 py-2 rounded text-white font-medium transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}
