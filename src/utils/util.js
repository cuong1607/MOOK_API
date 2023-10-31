function generateCode(id) {
  const paddedId = id.toString().padStart(4, '0'); // Thêm số 0 vào đầu nếu id không đủ 4 chữ số
  const code = `DH${paddedId}`;
  return code;
}

module.exports = {
  generateCode,
};
