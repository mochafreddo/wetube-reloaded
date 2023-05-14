// Encapsulate the code in an IIFE (Immediately Invoked Function Expression)
// to avoid polluting the global scope with variables and functions
(() => {
  // Get DOM elements required for handling comments
  const videoContainer = document.getElementById('videoContainer');
  const commentForm = document.getElementById('commentForm');
  const deleteCommentBtns = document.querySelectorAll('.delete-comment-btn');

  /**
   * Handle click event on delete comment button.
   * This function sends a request to delete the comment and
   * removes the comment from the UI if successful.
   *
   * @param {Event} event - The click event object of the delete button.
   */
  const handleDeleteComment = async (event) => {
    const { target } = event;
    const commentId = target.dataset.id;
    const videoId = videoContainer.dataset.id;

    try {
      const response = await fetch(
        `/api/videos/${videoId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        target.parentElement.remove();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  /**
   * Add a new comment to the DOM.
   *
   * @param {string} text - The content of the comment.
   * @param {string} id - The unique ID of the comment.
   */
  const addCommentToDOM = (text, id) => {
    const videoComments = document.querySelector('.video__comments ul');
    const newComment = document.createElement('li');
    newComment.dataset.id = id;
    newComment.className = 'video__comment';

    const icon = document.createElement('i');
    icon.className = 'fas fa-comment';

    const commentText = document.createElement('span');
    commentText.textContent = ` ${text}`;

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('delete-comment-btn');
    deleteBtn.textContent = ' ❌';
    deleteBtn.dataset.id = id;

    deleteBtn.addEventListener('click', handleDeleteComment);

    newComment.appendChild(icon);
    newComment.appendChild(commentText);
    newComment.appendChild(deleteBtn);
    videoComments.prepend(newComment);
  };

  /**
   * Handle comment form submission.
   * This function sends a request to add the comment and
   * updates the UI with the new comment if successful.
   *
   * @param {Event} event - The submit event object of the form.
   */
  const handleAddComment = async (event) => {
    event.preventDefault();
    const textarea = commentForm.querySelector('textarea');
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;

    if (text === '') {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.status === 201) {
        textarea.value = '';
        const { newCommentId } = await response.json();
        addCommentToDOM(text, newCommentId);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Attach the handleAddComment event listener if the commentForm element exists
  if (commentForm) {
    commentForm.addEventListener('submit', handleAddComment);
  }

  // Attach the handleDeleteComment event listener to the delete buttons
  deleteCommentBtns.forEach((btn) => {
    btn.addEventListener('click', handleDeleteComment);
  });
})();
