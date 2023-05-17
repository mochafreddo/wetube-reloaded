import multer from 'multer';
import multerS3 from 'multer-s3';

import { S3Client } from '@aws-sdk/client-s3';
// Set the Region
const REGION = 'us-east-1';
// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: REGION,
});

const isProduction = process.env.NODE_ENV === 'production';

const s3ImageUploader = multerS3({
  s3: s3Client,
  bucket: 'wetube-y8rv',
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, `images/${Date.now().toString()}`);
  },
});

const s3VideoUploader = multerS3({
  s3: s3Client,
  bucket: 'wetube-y8rv',
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, `videos/${Date.now().toString()}`);
  },
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteNmae = 'wetube';
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isProduction = isProduction;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  req.flash('error', 'Log in first.');
  return res.redirect('/login');
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  }
  req.flash('error', 'Not authorized');
  return res.redirect('/');
};

export const avatarUpload = multer({
  dest: 'uploads/avatars/',
  limits: { fileSize: 3000000 },
  storage: isProduction ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: 'uploads/videos/',
  limits: { fileSize: 10000000 },
  storage: isProduction ? s3VideoUploader : undefined,
});
