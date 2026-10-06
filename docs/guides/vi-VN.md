# Stremio Local Debrid — Tiếng Việt

Máy tính tải và lưu đệm torrent từ các tiện ích Stremio, rồi truyền video tới TV qua mạng cục bộ.

## Vì sao có dự án này

TV chậm có thể khó tải torrent và phát video cùng lúc. Stremio Local Debrid chuyển việc tải và lưu trữ sang máy tính. TV nhận video HTTP qua mạng gia đình. Bạn quản lý bộ nhớ đệm mà không cần tài khoản debrid đám mây trả phí.

## Cách hoạt động

Máy chủ lấy nguồn từ các tiện ích đã cài tương thích, giữ nguyên địa chỉ và cấu hình của chúng. Mã băm torrent, magnet và liên kết .torrent trở thành nguồn Bộ nhớ đệm cục bộ. Chọn nguồn sẽ bắt đầu tải trên máy tính. Tệp trùng dùng chung bộ nhớ đệm và được gộp tracker. Liên kết video trực tiếp và dịch vụ bên ngoài không được chuyển đổi.

## Yêu cầu

Cần Node.js 24 trở lên, đủ dung lượng trống, máy tính và TV trong cùng mạng có thể kết nối. Tự động phát hiện tài khoản hỗ trợ Stremio 5 trên macOS. Linux và Windows dùng danh sách tiện ích nhập thủ công. Android TV, Google TV và Fire TV là mục tiêu chính; ứng dụng khác có thể cần HTTPS và codec tương thích.

## Thiết lập máy chủ

Chạy npm run setup để tạo config.json và cấu hình khởi động trên macOS, Linux hoặc Windows. Trên macOS, đăng nhập Stremio 5 bằng tài khoản TV; trên Linux/Windows, nhập URL addon trong trình hướng dẫn. --yes chấp nhận mặc định, --no-service chỉ lưu cấu hình và --lang chọn ngôn ngữ. Token và nội dung đã tải được giữ nguyên.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run setup
```

```sh
npm run setup -- --no-service
npm start
```

## Kết nối TV

Mở địa chỉ trong state/status-url.txt, chọn ngôn ngữ rồi nhấn Cài vào Stremio, hoặc dán địa chỉ tiện ích vào ô cài đặt. Làm mới tiện ích hoặc mở lại Stremio trên TV bằng cùng tài khoản. Chọn nguồn Bộ nhớ đệm cục bộ cho phim hay tập phim. Nguồn gốc chạy trên thiết bị mở chúng. Tiện ích tài khoản được đồng bộ mỗi 60 giây.

## Bộ nhớ đệm và phát video

Việc tải tiếp tục sau khi đóng trình phát và tiếp nối khi máy chủ khởi động lại. Chỉ tệp đã chọn được tải. Mặc định bộ nhớ đệm 100 GiB, giữ trống 10 GiB; torrent hoàn tất ít dùng nhất bị xóa khi cần chỗ. Thời gian bắt đầu tùy thuộc peer và mạng. TV vẫn giải mã video; không chuyển mã. Giữ máy tính thức và có thể truy cập. Nếu IP thay đổi, cập nhật baseUrl và cài lại tiện ích.

## Quyền riêng tư và giấy phép

URL tiện ích có mã truy cập; giữ bí mật. Việc phát hiện tài khoản đọc hồ sơ Stremio cục bộ và chỉ gửi khóa phiên tới API chính thức, không lưu bản sao. Địa chỉ tiện ích được lưu riêng. Dự án không có danh mục nội dung hay đo lường từ xa. Peer BitTorrent nhìn thấy IP máy tính. Dùng nội dung bạn có quyền truy cập. MIT-PoU yêu cầu hệ thống tự động ghi nhận việc sử dụng và ghi công.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
