# Luyện tập trắc nghiệm

Ứng dụng React Native, Expo SDK 57, TypeScript và Expo Router. Không cần backend.

## Chạy ứng dụng

```sh
npm install
npm start
npm run android
npm run web
```

Nhập họ tên và MSSV thật trên màn hình bắt đầu; thông tin được lưu khi bắt đầu lượt.

Có 12 câu thuộc Toán học và Tin học. Mỗi lượt chọn ngẫu nhiên 5 câu không trùng, thời gian 3 phút, mỗi câu đúng 2 điểm. Có chuyển câu, thay đổi lựa chọn, xác nhận nộp, tự nộp hết giờ, kết quả và xem lại chỉ đọc. Lịch sử hiển thị mới nhất trước, tổng lượt và điểm trung bình.

## Cấu trúc

- `src/app/`: màn hình và điều hướng.
- `src/components/ui.tsx`: component tái sử dụng với props và callback.
- `src/quiz/types.ts`: kiểu câu hỏi, lượt làm, kết quả.
- `src/quiz/questions.ts`: câu hỏi tĩnh.
- `src/quiz/logic.ts`: chọn câu, chấm điểm, thời gian.
- `src/quiz/storage.ts`: AsyncStorage.
- `src/quiz/context.tsx`: trạng thái và hàng đợi lưu tuần tự.

Bài đang làm lưu nguyên bộ câu hỏi, lựa chọn và thời hạn tuyệt đối. Mở lại không đặt lại đồng hồ; bài hết hạn tự ghi nhận kết quả. Lịch sử và bài đang làm được ghi trong cùng một bản ghi, kiểm tra ID hoàn thành để tránh nộp trùng. Lỗi lưu/đọc được hiển thị và không xóa dữ liệu cũ.

## Kiểm tra

```sh
npm run typecheck
npx expo lint
node tests/quiz.cjs
npx expo export --platform web
```

Cần nghiệm thu trên thiết bị thật: đóng/mở trước và sau thời hạn, hủy nộp bài, nộp đúng lúc hết giờ và mở lại lịch sử. Đồng hồ dựa vào giờ hệ thống; ứng dụng offline không chống việc thay đổi giờ thiết bị.