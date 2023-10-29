require('dotenv').config();
const debug = require('debug');

class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}
class AppBaseError extends AppError {
  constructor({ code, message }) {
    super(code, message);
  }
}
Error.create = function ({ code, message }) {
  const err = new AppError(code, message);
  // err.code = code;
  return err;
};
Error.errorInvalidParam = (message) => Error.create({ code: 9, message });
Error.prototype.withMessage = function withMessage(msg) {
  return Error.create({ code: this.code, message: msg });
};

module.exports = Object.freeze({
  AppError,
  AppBaseError,
  PLACE_TYPES: {
    PROVINCE: 'region',
    DISTRICT: 'locality',
    WARD: 'extended-address',
  },
  // error code
  statusCode: {
    OK: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 403,
    MULTIPLE_CHOICES: 300,
    FORBIDDEN: 403,
  },
  apiCode: {
    SUCCESS: Error.create({ code: 1, message: 'Thành công' }),
    DB_ERROR: Error.create({ code: 2, message: 'Truy vấn lỗi' }),
    ACCOUNT_EXIST: Error.create({ code: 5, message: 'Tài khoản đã tồn tại' }),
    PHONE_EXIST: Error.create({ code: 5, message: 'Số điện thoại đã tồn tại' }),
    LOGIN_FAIL: Error.create({ code: 6, message: 'Số điện thoại không tồn tại' }),
    PASSWORD_FAIL: Error.create({ code: 6, message: 'Sai mật khẩu' }),
    NOT_FOUND: Error.create({ code: 11, message: 'Dữ liệu không tồn tại ' }),
    CUSTOMER_NOT_FOUND: Error.create({ code: 11, message: 'Khách hàng không tồn tại ' }),
    PRODUCT_NOT_FOUND: Error.create({ code: 56, message: 'Bạn phải chọn ít nhất một sản phẩm để tạo cơ hội ' }),
    PRODUCT_OPPO_NOT_FOUND: Error.create({ code: 56, message: 'Sản phẩm trong cơ hội không tồn tại ' }),
    JOB_TYPE_NOT_DELETE: Error.create({ code: 11, message: 'Đã có công việc thuộc loại công việc này ' }),
    FB_ERROR: Error.create({ code: 12, message: '' }),
    UNAUTHORIZED: Error.create({ code: 403, message: 'Không có quyền truy cập' }),
    INVALID_ACCESS_TOKEN: Error.create({ code: 404, message: 'Token không hợp lệ' }),
    NO_PERMISSION: Error.create({ code: 13, message: 'Không có quyền thực hiện chức năng' }),
    NOT_ACCOUNT_EXIST: Error.create({ code: 14, message: 'Tài khoản không tồn tại' }),
    UPDATE_USER_ERROR: Error.create({ code: 15, message: 'Lỗi cập nhật tài khoản' }),
    PAGE_ERROR: Error.create({ code: 16, message: 'Lỗi truyền trang' }),
    PLACE_ERROR: Error.create({ code: 17, message: 'Không thể lấy được địa chỉ' }),
    UPDATE_FAIL: Error.create({ code: 18, message: 'Cập nhật không thành công' }),
    DATA_EXIST: Error.create({ code: 19, message: 'Dữ liệu đã tồn tại' }),
    REGISTER_FAIL: Error.create({ code: 20, message: 'Bạn không thể đăng ký tài khoản' }),
    CV_APPROVING: Error.create({
      code: 21,
      message: 'CV của bạn đang được phê duyệt vui lòng đợi kết quả',
    }),
    CHANGE_SALE_STATUS_FAIL: Error.create({
      code: 22,
      message: 'Bạn không thể chuyển trạng thái',
    }),
    REASON_NOT_FOUND: Error.create({ code: 23, message: 'Vui lòng điền lí do từ chối' }),
    REASON_FAIL: Error.create({ code: 24, message: 'Vui lòng bỏ lí do từ chối' }),
    DELETE_USER_ERROR: Error.create({ code: 25, message: 'Bạn không thể xóa tài khoản này này' }),
    FAIL_CHANGE_PASS: Error.create({ code: 26, message: 'Sai mật khẩu' }),
    CANNOT_DEACTIVATE: Error.create({
      code: 27,
      message: 'Tài khoản này khổng thể ngừng hoạt động do còn công việc chưa hoàn thành',
    }),
    DELETE_ERROR: Error.create({ code: 28, message: 'Bạn không thể xóa' }),
    ERROR_IS_CALLING: Error.create({ code: 29, message: 'Khách hàng đang được gọi bởi Sale khác' }),
    ERROR_FORM_RESULT_SUBMITED: Error.create({ code: 30, message: 'Bạn không được phép cập nhật lại phiếu kết quả' }),
    ERROR_REQUIRE_QUESTION: Error.create({ code: 31, message: 'Vui lòng trả lời hết những câu hỏi bắt buộc' }),
    ERROR_CALL_NOT_FOUND: Error.create({ code: 32, message: 'Không tìm thấy thông tin cuộc gọi' }),
    REVIEW_CALL_REQUIRE_OPTION: Error.create({ code: 33, message: 'Vui lòng chọn thông tin bạn muốn đánh giá' }),
    CALL_REVIEWER_NOT_FOUND: Error.create({ code: 34, message: 'Bạn không được phân công đánh giá cuộc gọi này' }),
    CALL_HAS_REVIEWED: Error.create({ code: 35, message: 'Cuộc gọi này đã được đánh giá trước đây rồi' }),
    TIME_OUT_UPDATE_FORM: Error.create({ code: 36, message: 'Đã hết thời gian cập nhật kết quả cuộc gọi' }),
    ERROR_ASSIGN_SUB_JOB: Error.create({ code: 37, message: 'Không được phép giao công việc chung' }),
    ERROR_CALL_COMPLETED: Error.create({ code: 38, message: 'Công việc đã được hoàn thành. Không được phép gọi' }),
    CAN_NOT_CALL: Error.create({ code: 39, message: 'Bạn không thể thực hiện cuộc gọi lúc này' }),
    OPPORTUNITY_CATEGORY_NOT_FOUND: Error.create({ code: 40, message: 'Dữ liệu nhu cầu không tồn tại' }),
    KPI_ERROR: Error.create({ code: 45, message: 'Bạn không thể cập nhật KPI cho tháng tiếp theo' }),
    REQUIRE_CUSTOMER_NAME: Error.create({ code: 41, message: 'Vui lòng nhập tên khách hàng' }),
    REQUIRE_JOB_ID: Error.create({ code: 42, message: 'Vui lòng chọn công việc phù hợp với khách hàng' }),
    REQUIRE_PROVINCE_ID: Error.create({ code: 43, message: 'Vui lòng chọn tỉnh thành của khách hàng' }),
    INVALID_CALL_TYPE: Error.create({ code: 44, message: 'Cập nhật sai loại cuộc gọi' }),
    DONT_HAVE_HOTLINE: Error.create({ code: 45, message: 'Hotline chưa được đăng ký trên stringee' }),
    DELETE_JOB_ERROR: Error.create({ code: 46, message: 'Bạn không thể xóa công việc này' }),
    POINT_EXAM_FALSE: Error.create({ code: 46, message: 'Số điểm của bạn không đủ đề vượt qua bài thi này' }),
    EMAIL_EXIST: Error.create({ code: 47, message: 'Email đã tồn tại' }),
    CHECK_ENTERPRISE_ERROR: Error.create({
      code: 48,
      message: 'Bạn dã hết phút gọi vui lòng liên hệ với admin để tiếp tục thực hiện cuộc gọi',
    }),
    CHECK_HOTLINE_EXISTS: Error.create({
      code: 49,
      message: 'Hotline đã tồn tại',
    }),
    UPDATE_REQUIRED_ACCEPT_FAIL: Error.create({
      code: 50,
      message: 'Không thể bắt buộc sale nhận công việc này',
    }),
    JOB_FULL_SALE: Error.create({ code: 51, message: 'Công việc đã giao việc hết cho sale' }),
    GROUP_NAME_EXIST: Error.create({ code: 52, message: 'Tên nhóm khách hàng đã tồn tại' }),
    JOB_NOT_FOUND: Error.create({ code: 53, message: 'Giao việc không tồn tại hoặc đã bị thu hồi' }),
    JOB_DEACTIVE: Error.create({
      code: 53,
      message: 'Giao việc đã bị ngưng hoạt động không thể cập nhật lại phiếu kết quả',
    }),
    E_VOUCHER: Error.create({ code: 57, message: '' }),
    SMS_ERROR: Error.create({ code: 58, message: '' }),
    EMAIL_NOT_EXIST: Error.create({ code: 59, message: 'Email không tồn tại ' }),
    PRODUCT_OPPO_NOT_EXITS: Error.create({ code: 60, message: 'Cơ hội không được phép tạo nhiều sản phẩm giống nhau' }),
    CODE_NOT_EXITS: Error.create({ code: 62, message: 'Mã thuộc tính đã tồn tại trong hệ thống' }),
    ZALO_ACCOUNT_NOT_DELETE: Error.create({
      code: 61,
      message: 'Bạn không thể xóa tài khoản này vì nó đang gán trong công việc ',
    }),
    LOGIN_ERROR: Error.create({
      code: 62,
      message: 'Tài khoản quý khách đã bị khoá. Vui lòng liên hệ với admin của EZsale để được hỗ trợ!',
    }),
    UNIT_EXITS: Error.create({ code: 65, message: 'Đơn vị tính đã tồn tại' }),
    NAME_UNIT_NOTFOUND: Error.create({ code: 66, message: 'Tên đơn vị không được phép để trống' }),
    MAX_DEPARTMENT_NOT_EXITS: Error.create({
      code: 67,
      message: 'Công ty của bạn đã vượt quá số lượng tài khoản Trưởng phòng ban. Vui lòng liên hệ admin EZsale !',
    }),
    LOGIN_ZALO_FAIL: Error.create({ code: 67, message: 'Tài khoản gửi tin nhắn zalo hết hạn đăng nhập' }),
  },

  MEDIA_TYPE: {
    IMAGE: 0,
    VIDEO: 1,
  },
  config: {
    CRYPT_SALT: 10,
    PAGING_LIMIT: 12,
    RESET_PASSWORD: 'Vimid123a@',
    MAX_IMAGE: 5,
    TIME_UPDATE_FORM_QUESTION: 10,
    TIME_KEEPING: '2021-01-01',
  },
  debug: {
    db: debug('app:dbquery'),
    log: debug('app:log'),
    debug: debug('app:debug'),
    error: debug('app:error'),
    email: debug('app:email'),
  },
  IS_ACTIVE: {
    ACTIVE: 1,
    INACTIVE: 0,
    DEACTIVE: 2,
  },
  ROLE: {
    ADMIN: 1,
    USER: 2,
  },

  GENDER: {
    WOMAN: 0,
    MAN: 1,
  },
});
