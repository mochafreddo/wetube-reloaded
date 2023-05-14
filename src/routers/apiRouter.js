/**
 * apiRouter.js
 *
 * This module exports an Express router that handles API routes related to video views and comments.
 * It uses the videoController functions to handle the actual logic.
 *
 * @module apiRouter
 */

import express from 'express';
import { body, param } from 'express-validator';
import {
  registerView,
  createComment,
  deleteComment,
} from '../controllers/videoController';

const apiRouter = express.Router();

// Regular expression pattern for MongoDB ObjectId validation
const objectIdPattern = '^[0-9a-fA-F]{24}$';

/**
 * Route for registering a video view.
 * Validates video ID using the objectIdPattern.
 */
apiRouter.post(
  '/videos/:id([0-9a-f]{24})/view',
  param('id', 'Invalid video ID').matches(objectIdPattern),
  registerView,
);

/**
 * Route for creating a comment on a video.
 * Validates video ID and comment text.
 */
apiRouter.post(
  '/videos/:id([0-9a-f]{24})/comment',
  [
    param('id', 'Invalid video ID').matches(objectIdPattern),
    body('text', 'Comment text must not be empty').notEmpty(),
  ],
  createComment,
);

/**
 * Route for deleting a comment on a video.
 * Validates video ID and comment ID.
 * Follows RESTful conventions by including the video ID and comment ID in the route.
 */
apiRouter.delete(
  '/videos/:id([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})',
  [
    param('id', 'Invalid video ID').matches(objectIdPattern),
    param('commentId', 'Invalid comment ID').matches(objectIdPattern),
  ],
  deleteComment,
);

export default apiRouter;
