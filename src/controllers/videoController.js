import Video from '../models/Video';
import Comment from '../models/Comment';
import User from '../models/User';

/**
 * home - Renders the home page with a list of videos.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: 'desc' })
      .populate('owner');
    return res.render('home', { pageTitle: 'Home', videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to fetch videos.',
      });
  }
};

/**
 * watch - Renders the watch page for a specific video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const watch = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findById(id)
      .populate('owner')
      .populate('comments');
    if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found.' });
    }
    return res.render('watch', { pageTitle: video.title, video });
  } catch (error) {
    console.error('Error fetching video:', error);
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to fetch video.',
      });
  }
};

/**
 * getEdit - Renders the edit page for a specific video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found.' });
    }
    if (String(video.owner) !== String(_id)) {
      req.flash('error', 'Not authorized');
      return res.status(403).redirect('/');
    }
    return res.render('edit', { pageTitle: `Edit: ${video.title}`, video });
  } catch (error) {
    console.error('Error fetching video for editing:', error);
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to fetch video for editing.',
      });
  }
};

/**
 * postEdit - Processes the submitted form for editing a video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  try {
    const video = await Video.exists({ _id: id });
    if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found.' });
    }
    if (String(video.owner) !== String(_id)) {
      req.flash('error', 'You are not the owner of the video.');
      return res.status(403).redirect('/');
    }
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    req.flash('success', 'Changes saved.');
    return res.redirect(`/videos/${id}`);
  } catch (error) {
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to update video.',
      });
  }
};

/**
 * getUpload - Renders the upload page for uploading a video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const getUpload = (req, res) =>
  res.render('upload', { pageTitle: 'Upload Video' });

/**
 * postUpload - Processes the submitted form for uploading a video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect('/');
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(400).render('upload', {
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    });
  }
};

/**
 * deleteVideo - Deletes a specific video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found.' });
    }
    if (String(video.owner) !== String(_id)) {
      return res.status(403).redirect('/');
    }
    await Video.findByIdAndDelete(id);
    return res.redirect('/');
  } catch (error) {
    console.error('Error deleting video:', error);
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to delete video.',
      });
  }
};

/**
 * search - Renders the search page with search results.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  try {
    if (keyword) {
      videos = await Video.find({
        title: {
          $regex: new RegExp(`${keyword}$`, 'i'),
        },
      }).populate('owner');
    }
    return res.render('search', { pageTitle: 'Search', videos });
  } catch (error) {
    console.error('Error searching for videos:', error);
    return res
      .status(500)
      .render('error', {
        pageTitle: 'Error',
        errorMessage: 'Failed to search for videos.',
      });
  }
};

/**
 * registerView - Increments the view count of a specific video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const registerView = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.sendStatus(404);
    }
    video.meta.views += 1;
    await video.save();
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error registering view:', error);
    return res.sendStatus(500);
  }
};

/**
 * createComment - Adds a comment to a specific video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const createComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { text },
    params: { id },
  } = req;
  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.sendStatus(404);
    }
    const comment = await Comment.create({
      text,
      owner: _id,
      video: id,
    });
    video.comments.push(comment._id);
    await video.save();
    return res.status(201).json({ newCommentId: comment._id });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.sendStatus(500);
  }
};

/**
 * deleteComment - Deletes a comment on a video.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const deleteComment = async (req, res) => {
  // `req`에서 `id`와 `user` 정보를 추출합니다.
  const { commentId } = req.params;
  const {
    user: { _id },
  } = req.session;

  try {
    // 주어진 `id`를 사용하여 댓글을 찾습니다.
    // 없으면 404 상태 코드와 함께 에러 메시지를 반환합니다.
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // 댓글의 작성자와 현재 사용자를 비교하여 권한이 있는지 확인합니다.
    // 권한이 없으면 403 상태 코드와 함께 에러 메시지를 반환합니다.
    if (String(comment.owner) !== String(_id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this comment.' });
    }

    // 1. `Video.updateOne()`: Mongoose를 사용하여 데이터베이스를 저장된 Video 모델의 문서를 업데이트합니다. 이 메서드는 첫 번째 인자로
    // 필터를, 두 번째 인자로 업데이트 작업을 받습니다.
    // 2. `{ comment: id }`: 첫 번째 인자로 전달되는 필터 객체입니다. 이 필터는 `comments` 필드에 `id`를 포함하고 있는 Video 문서를 찾는
    // 역할을 합니다.여기서 `id`는 삭제할 댓글의 ID입니다.
    // 3. `{ $pull: { comments: id } }`: 두 번째 인자로 전달되는 업데이트 객체입니다. `$pull` 연산자는 배열에서 특정 요소를 제거하는 데
    // 사용됩니다. 여기서는 `comments` 배열에서 `id` 값을 가진 요소를 제거하라는 명령입니다.
    // 댓글이 속한 비디오에서 해당 댓글을 제거합니다.
    await Video.updateOne(
      { comments: commentId },
      { $pull: { comments: commentId } },
    );
    // 주어진 `id`를 사용하여 댓글을 삭제합니다.
    await Comment.findByIdAndDelete(commentId);

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Failed to delete comment.' });
  }
};
