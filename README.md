# Farmart - Expo Web

Website bán thực phẩm theo mẫu Farmart, được khởi tạo bằng `create-expo-app` (TypeScript). Giao diện web nằm trong `App.web.tsx`; Expo tự chọn file này khi chạy web. `App.tsx` là entry native mặc định, chưa triển khai ứng dụng Android/iOS.

## Chạy dự án

Yêu cầu Node.js 24 LTS (sử dụng `node:sqlite`).

```sh
npm install
npm run api
```

Mở terminal thứ hai:

```sh
npm run web -- --port 8081
```

Truy cập http://localhost:8081. API chạy tại http://localhost:3001. Database tự tạo tại `server/data/farmart.db`, có 8 sản phẩm và một tài khoản quản trị mẫu:

Trang quản trị Node.js chạy trực tiếp trên cùng máy chủ API: mở http://localhost:3001/admin sau khi `npm run api` khởi động. Đăng nhập bằng tài khoản quản trị mẫu bên dưới. Trang này độc lập với giao diện Expo và dùng chung API/SQLite hiện tại.

API mặc định chỉ bind `127.0.0.1:3001`. Khi thử trên điện thoại cùng mạng, đặt `API_HOST=0.0.0.0`, dùng địa chỉ IP máy tính cho `EXPO_PUBLIC_API_URL` và thêm origin Expo vào `CORS_ORIGINS`. CORS mặc định cho các cổng Expo local; khi triển khai, đặt `CORS_ORIGINS` thành danh sách origin cho phép, phân cách bằng dấu phẩy. Có thể đặt `API_PORT` theo môi trường.

Màn hình Expo Android/iOS dùng React Native trong `App.tsx` và có đăng nhập admin, thêm/sửa/xóa sản phẩm, đổi vai trò/xóa người dùng. Android emulator mặc định gọi API qua `10.0.2.2`; thiết bị thật cần cấu hình `EXPO_PUBLIC_API_URL` thành IP máy tính và chạy API với `API_HOST=0.0.0.0`. Ví dụ PowerShell:

```powershell
$env:API_HOST = "0.0.0.0"
npm run api
```

Trong terminal thứ hai, thay IP dưới đây bằng địa chỉ LAN của máy tính:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.10:3001"
npm run android
```

- Email: `admin@farmart.vn`
- Mật khẩu: `Admin@12345`

Tài khoản đăng ký mới có quyền khách hàng. Chỉ admin được thêm, sửa, xóa sản phẩm và quản lý quyền/xóa người dùng. Không được tự xóa hoặc đổi quyền bản thân. Tài khoản có đơn hàng không được xóa để giữ lịch sử.

## Chức năng

- Trang chủ responsive, danh mục, tìm kiếm, sắp xếp, chi tiết sản phẩm và yêu thích.
- Giỏ hàng thêm/xóa/tăng/giảm; lưu giỏ và yêu thích bằng localStorage.
- Đăng ký, đăng nhập, đăng xuất; session có thời hạn 7 ngày, mật khẩu băm bằng scrypt với salt riêng.
- Hồ sơ sửa họ tên, điện thoại, địa chỉ; xem lịch sử đơn hàng.
- Đặt hàng COD, giá được tính lại tại server; transaction kiểm tra và trừ kho, không tin giá từ trình duyệt.
- Trang quản trị có bảng sản phẩm, form thêm/sửa, xóa xác nhận, bảng người dùng và đổi quyền.

## Cấu trúc và ghi chú

| File | Vai trò |
| --- | --- |
| `App.web.tsx` | State, API helper, các trang, modal và form |
| `src/store.css` | Thiết kế desktop/mobile, breakpoint 1000px và 700px |
| `server/index.cjs` | Schema, seed, auth, phân quyền, API CRUD, transaction đặt hàng |
| `server/admin/index.html` | Khung trang quản trị Node.js độc lập |
| `server/admin/admin.js` | Đăng nhập, gọi API và thao tác quản lý sản phẩm/người dùng |
| `server/admin/admin.css` | Giao diện responsive cho trang quản trị |
| `server/smoke.cjs` | Kiểm tra API: auth, phân quyền, hồ sơ, sản phẩm, đặt hàng |
| `tests/admin.cjs` | Kiểm tra đăng nhập và CRUD của trang admin độc lập |

Code có ghi chú ở các điểm quan trọng; tên hàm và biến diễn đạt trực tiếp trách nhiệm. SQLite dùng prepared statements cho dữ liệu đầu vào. API và frontend cần chạy cùng lúc. Ảnh mẫu từ Unsplash đã lưu trong `public/images`, không cần Internet khi chạy; ảnh HTTPS do admin thêm cần Internet.

```sh
npm run typecheck
npm run test:api
npm run test:admin
npm run test:ui
npx expo export --platform web
```

Kiểm thử UI dùng Playwright với Microsoft Edge đã cài trên Windows; ảnh kiểm tra lưu trong `artifacts/`. Script typecheck tăng stack cho TypeScript khi kiểm tra cây JSX lớn.

## Phạm vi

Đây là dự án chạy local, có database thật và quy trình COD. Chưa tích hợp cổng thanh toán, email xác thực/khôi phục mật khẩu, vận chuyển hoặc triển khai production. Trước khi public cần HTTPS, cấu hình origin/API theo tên miền, đổi tài khoản mẫu, giới hạn đăng nhập và dùng cookie HttpOnly thay cho token localStorage. Có thể cấu hình `EXPO_PUBLIC_API_URL` khi build frontend; API hiện chỉ lắng nghe loopback để phát triển trên máy.

Expo Web: https://docs.expo.dev/workflow/web/

Kiểm tra dependency hiện báo 23 advisory trong chuỗi thư viện Expo/React Native (7 moderate, 16 high). Không chạy `npm audit fix --force` vì npm đề xuất hạ Expo xuống phiên bản không tương thích; cần rà soát/cập nhật dependency trước triển khai công khai.
