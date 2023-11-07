const { IS_ACTIVE, apiCode, MEDIA_TYPE } = require('@utils/constant');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('public', 'images'));
  },
  filename: (req, file, cb) => {
    const id = uuidv4().replace(/-/g, '');
    cb(null, `${file.fieldname}_${id}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (req.asset_type == MEDIA_TYPE.VIDEO) {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Vui lòng chọn ảnh theo định dạng jpg/jpeg hoặc png'), false);
    }
  } else if (req.asset_type == MEDIA_TYPE.IMAGE) {
    if (
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'video/mp4'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Vui lòng chọn ảnh theo định dạng jpg/jpeg hoặc png'), false);
    }
  } else {
    cb(null, true);
  }
};

const imageUploader = multer({ storage, fileFilter });

async function handleSingleFile(request, name, mediaType) {
  request.asset_type = mediaType;
  const multerSingle = imageUploader.single(name);
  return new Promise((resolve, reject) => {
    multerSingle(request, undefined, async (error) => {
      if (error) {
        reject(error);
      }
      resolve({});
    });
  });
}

async function handleFiles(request, name, mediaType) {
  request.asset_type = mediaType;
  const multerSingles = imageUploader.array(name);
  return new Promise((resolve, reject) => {
    multerSingles(request, undefined, async (error) => {
      if (error) {
        reject(error);
      }
      resolve({});
    });
  });
}

module.exports = {
  handleFiles,
  handleSingleFile,
};
