var jwt = require('jsonwebtoken');
require('dotenv').config();
function verifyJWTToken(token) {
  return new Promise((resolve, reject) => {
    console.log('verifyJWTToken ', process.env.SECRET);

    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        reject(err);
      }
      resolve(decodedToken);
    });
  });
}

function createJWToken(payload) {
  console.log('createJWToken ', process.env.SECRET);
  return jwt.sign(
    {
      data: payload,
    },
    process.env.SECRET,
    {
      expiresIn: 10000000000,
      algorithm: 'HS256',
    },
  );
}
module.exports = {
  verifyJWTToken,
  createJWToken,
};
