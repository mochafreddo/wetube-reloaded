import multer from 'multer';
import multerS3 from 'multer-s3';

var AWS = require('aws-sdk'); // Load the SDK for Javascript
AWS.config.update({ region: 'us-east-1' }); // Set the Region

// Create S3 service object
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isProduction = process.env.NODE_ENV === 'production';

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: 'wetube-y8rv/images',
  acl: 'public-read',
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: 'wetube-y8rv/videos',
  acl: 'public-read',
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
