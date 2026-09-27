# Báo Cáo Code Review Toàn Diện: Dự Án AIGym

Dưới góc độ chuyên gia, mình đã phân tích cấu trúc, mã nguồn và cấu hình của cả hai hệ thống Backend (Spring Boot) và Frontend (Flutter). Nhìn chung, dự án có kiến trúc khá rõ ràng, áp dụng các công nghệ hiện đại. Tuy nhiên, vẫn tồn tại nhiều vấn đề nghiêm trọng về bảo mật, hiệu suất và các tính năng còn thiếu cần được khắc phục trước khi đưa lên môi trường Production.

Dưới đây là phần "vạch lá tìm sâu":

---

## 1. Các Vấn Đề Bảo Mật Nghiêm Trọng (Security)

> [!CAUTION]
> Các lỗi sau có thể dẫn đến việc rò rỉ dữ liệu, bị tấn công chiếm quyền hệ thống. Cần sửa ngay!

### Backend (Spring Boot)
- **Hardcode Secrets trong file cấu hình (`application-dev.yml`)**: 
  - Khóa API của Gemini (`gemini.api.key`), mật khẩu ứng dụng Gmail (`spring.mail.password`), mật khẩu MySQL đều được lưu dưới dạng plain text.
  - Khóa `jwt.secret` đang sử dụng một chuỗi mặc định dễ bị đoán.
  - *Giải pháp:* Sử dụng biến môi trường (Environment Variables) hoặc hệ thống quản lý Secret (như Vault, AWS Secrets Manager).
- **CORS bị mở hoàn toàn (`SecurityConfig.java`)**: 
  - Cấu hình `config.setAllowedOriginPatterns(List.of("*"));` kết hợp với `config.setAllowCredentials(true);` là cực kỳ nguy hiểm, dễ dính lỗi bảo mật CSRF và rò rỉ session. 
  - *Giải pháp:* Chỉ cho phép các origin cụ thể của Frontend.
- **Tài khoản mặc định dễ đoán (`AppSecurityConfig.java`)**: 
  - Mã nguồn tự động tạo tài khoản Admin với mật khẩu `admin123` mỗi khi khởi động. Kẻ xấu có thể dùng tài khoản này để quét và chiếm quyền.
  - *Giải pháp:* Xóa logic này khi lên Production, hoặc ép buộc đổi mật khẩu ở lần đăng nhập đầu.
- **Rate Limiting chưa triệt để (`AuthController.java`)**: 
  - Đã có chống spam, nhưng chỉ áp dụng ở endpoint `/register`. Các endpoint `/login`, `/verify-email`, `/forgot-password`, `/reset-password` bị bỏ ngỏ, rất dễ bị **Brute-force (dò mật khẩu/OTP)** hoặc **Email Bombing**.
  - Việc lấy IP qua `X-FORWARDED-FOR` có thể bị giả mạo dễ dàng nếu không kiểm tra địa chỉ IP của Proxy có hợp lệ hay không.

### Frontend (Flutter)
- **Lưu trữ Token không an toàn (`auth_service.dart`)**:
  - JWT Token được lưu trữ bằng `SharedPreferences` (lưu plain text). Trên Android/iOS đã root/jailbreak, hacker có thể đọc file này và đánh cắp phiên đăng nhập.
  - *Giải pháp:* Thay thế bằng package `flutter_secure_storage` để mã hóa Token tại Keychain (iOS) và Keystore (Android).

---

## 2. Các Tính Năng Thiếu Sót & Lỗ Hổng Logic (Missing & Flawed Features)

> [!WARNING]
> Các lỗ hổng dưới đây ảnh hưởng tới trải nghiệm người dùng và tính toàn vẹn của ứng dụng.

### Quản Lý Phiên (Session & Token)
- **Không có cơ chế Revoke (Vô hiệu hóa) Token**: Chức năng Logout hiện tại chỉ xóa token trên thiết bị (Frontend). Backend KHÔNG CÓ danh sách token bị cấm (Blacklist) hoặc quản lý refresh token trong DB một cách triệt để. Token cũ vẫn có thể dùng được nếu bị trộm cho tới khi nó tự hết hạn.

### Phân Trang (Pagination)
- **Không sử dụng phân trang cho các API liệt kê**:
  - Các Controller như `ExerciseController`, `FoodItemController`, `ProgressPhotoController` đang gọi `.getAll()` hoặc tìm kiếm và trả về nguyên một `List`.
  - *Hậu quả:* Khi số lượng bài tập, thức ăn, hình ảnh lên tới hàng vạn, RAM của Server sẽ bị quá tải (OOM) và API sẽ bị timeout.
  - *Giải pháp:* Bắt buộc dùng `Pageable` của Spring Data JPA.

### Quản Lý Tệp (File Management)
- Backend không có API xử lý việc tải ảnh lên, Frontend đang tải ảnh trực tiếp lên **Firebase Storage**. Điều này không sai, nhưng Backend chỉ lưu trữ đường dẫn `imageUrl` (String) mà không kiểm duyệt file đó có an toàn không, có thật sự thuộc về người dùng đó hay không. Không có logic xóa ảnh trên Firebase khi người dùng xóa ảnh tiến độ (`/progress-photo/{id}`).

---

## 3. Mã Nguồn và Code Smell (Code Quality)

> [!TIP]
> Các tinh chỉnh nhỏ giúp code sạch sẽ, dễ mở rộng và chuyên nghiệp hơn.

### Backend
- **Context AI Quá Cồng Kềnh (`ContextGathererServiceImpl.java`)**:
  - Việc cộng chuỗi (`StringBuilder`) tạo prompt định dạng JSON bằng tay đang được hardcode sâu vào Java (hơn 250 dòng). Nó rất khó bảo trì và dễ bị lỗi cú pháp JSON.
  - *Giải pháp:* Nên tách cấu trúc Prompt này ra thành một file template (như `.ftl` FreeMarker hoặc `.txt` resources) để load động.
- **Tự động cập nhật DB (`ddl-auto: update`)**: Dùng cho Dev thì được, nhưng không được dùng trên Prod. Cần áp dụng **Flyway** hoặc **Liquibase** để quản lý version schema cơ sở dữ liệu.

### Frontend
- **Hardcode Base URL (`api_client.dart`)**: 
  - `baseUrl` đang bị fix cứng là `http://192.168.1.10:8080/api`. Code này build ra máy khác mạng LAN sẽ "chết" ngay.
  - *Giải pháp:* Sử dụng `flutter_dotenv` hoặc `--dart-define` để tiêm biến môi trường động tùy theo (Dev, Staging, Prod).
- **Xử lý Exception sơ sài (`auth_service.dart`)**: 
  - Hầu như các khối `catch (e)` đều trả về một thông báo lỗi chung chung là "Có lỗi bất ngờ xảy ra". Điều này khiến UI không thể làm những tính năng UX thông minh như: Báo cho user biết mạng yếu, báo bảo trì hệ thống, token hết hạn... Nên parse lỗi từ Dio bài bản hơn.

---

### Tổng kết

Dự án AIGym được triển khai cơ bản tốt (ứng dụng Riverpod, Dio, JWT, Clean Architecture). AI Fallback Mechanism rất hay khi tự động switch qua các model Gemini khác nếu bị quá tải.

**Ưu tiên sửa ngay lập tức:**
1. Dời tất cả secret (API Key, Mật khẩu) ra biến môi trường.
2. Sửa lại cấu hình CORS trên Spring Boot.
3. Thay `SharedPreferences` bằng `flutter_secure_storage`.
4. Bổ sung Rate Limit cho API Login.
5. Sửa BaseURL trên Flutter thành biến động.

Bạn có muốn mình tạo kế hoạch (Implementation Plan) để tiến hành fix tự động một trong các phần trên không?
