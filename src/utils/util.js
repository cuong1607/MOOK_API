function generateCode(id) {
  const paddedId = id.toString().padStart(4, '0'); // Thêm số 0 vào đầu nếu id không đủ 4 chữ số
  const code = `DH${paddedId}`;
  return code;
}
let SERVER_URL = process.env.BASE_API_URL || '';
function getFullUrl(path) {
  if (!path) {
    return null;
  }

  if (!path.startsWith('http')) {
    return `${SERVER_URL}/${path}`;
  }
  return path;
}

function convertDateToUTC(fromDateInput, toDateInput) {
  const fDate = Date.parse(fromDateInput);
  const tDate = Date.parse(toDateInput);
  const fromDate = new Date(fDate - 7 * 60 * 60 * 1000);
  const toDate = new Date(tDate + 86400000 - 7 * 60 * 60 * 1000);
  return { fromDate, toDate };
}

module.exports = {
  generateCode,
  getFullUrl,
  getUrl: () => `${SERVER_URL}/`,
  convertDateToUTC,
};
