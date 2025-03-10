const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./AwsConfig'); // Now using AWS SDK v3 properly

const BUCKET_NAME = 'leagueiiitr';

const upload = multer({
    storage: multerS3({
        s3: s3, // Ensure this is the correct S3Client instance
        bucket: BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const timestamp = Date.now();
            cb(null, `${timestamp}-${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid File Type!'));
        }
    }
});

module.exports = upload;
