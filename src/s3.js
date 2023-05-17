import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const REGION = 'us-east-1';
const s3Client = new S3Client({ region: REGION });

export function createS3Uploader(path) {
  return multerS3({
    s3: s3Client,
    bucket: 'wetube-y8rv',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${path}/${Date.now().toString()}`);
    },
  });
}
