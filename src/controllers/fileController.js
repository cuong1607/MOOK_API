const db = require('../models');
const { color } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const uploadMiddleware = require('@middlewares/uploadMiddleware');
const utils = require('@utils/util');

async function uploadSingleFile(req, res) {
  const { id } = req.params;
  await uploadMiddleware.handleSingleFile(req, 'file', id);
  //return { data: rows, paging: { page, count, limit } };
  const relPath = `${req.file.destination.replace('\\', '/')}/${req.file.filename}`;
  return { filename: req.file.filename, url: utils.getFullUrl(relPath), path: `${relPath}` };
}

// async function uploadMultipleFile(req, res) {
//   const { id } = req.params;
//   await uploadMiddleware.handleFiles(req, 'file', id);
//   let return_arr = [];

//   if (req.files) {
//     req.files.forEach((file) => {
//       return_arr.push({
//         filename: file.filename,
//         url: utils.getFullUrl(file.path),
//         path: `${file.path}`,
//       });
//     });
//   }
//   return return_arr;
// }

module.exports = {
  uploadSingleFile,
  // uploadMultipleFile,
};
