# AGENTS.md

## 1. Vai trò của Codex trong repo

Codex là trợ lý kỹ thuật cho đồ án WebGIS BĐS Hà Nội.

Tên đề tài: "Ứng dụng WebGIS trong phân tích phân bố và xu hướng giá bất động sản thành phố Hà Nội".

Sản phẩm được định vị là "Radar thị trường BĐS", không phải website rao vặt bất động sản. Mục tiêu chính là hỗ trợ phân tích:
- Bất động sản phân bố ở đâu?
- Giá bất động sản khoảng bao nhiêu?
- Khu vực nào đắt/nóng?
- Xu hướng giá tăng hay giảm theo thời gian?

## 2. Tài liệu phải đọc trước khi làm việc

Trước khi sửa code, Codex phải đọc:

1. `PROJECT_CONTEXT.md`
2. `AGENTS.md`
3. Các file liên quan trực tiếp đến task được giao

Không được đoán kiến trúc project nếu thông tin đã có trong `PROJECT_CONTEXT.md`.

## 3. Nguyên tắc làm việc bắt buộc

- Không tự ý đổi mục tiêu sản phẩm.
- Không biến project thành web đăng tin/rao bán bất động sản.
- Không xoá hoặc thay đổi lớn dữ liệu, layer, tên bảng, tên cột nếu chưa được yêu cầu.
- Không sửa lan man ngoài phạm vi task.
- Ưu tiên thay đổi nhỏ, dễ review, dễ rollback.
- Nếu phát hiện lỗi ngoài phạm vi task, chỉ ghi chú lại, không tự ý sửa trừ khi lỗi đó chặn task hiện tại.
- Không đưa secret, mật khẩu, token, connection string nhạy cảm vào code.
- Không tạo thêm thư viện lớn nếu không thật sự cần.

## 4. Quy tắc frontend

Frontend dùng React/Vite.

Các nguyên tắc cần giữ:
- Giữ kiến trúc đã refactor.
- Không gom toàn bộ logic ngược lại vào `frontend/src/App.jsx`.
- Ưu tiên tách code theo nhóm:
  - `components/` cho component UI/map
  - `services/` cho logic gọi WFS/WMS/API
  - `utils/` cho helper xử lý dữ liệu, GIS, format
  - `config/` cho constants, layer names, base maps
  - `styles/` cho CSS riêng
- Giữ phong cách UI Glassmorphism.
- Giữ font Inter và đảm bảo tiếng Việt hiển thị đúng UTF-8.
- Không làm hỏng tương tác bản đồ Leaflet.
- Không để overlay/sidebar chặn thao tác bản đồ ngoài ý muốn.

## 5. Quy tắc Leaflet / GIS

Project dùng:
- Leaflet
- react-leaflet
- react-leaflet-cluster
- GeoServer WMS/WFS
- PostgreSQL/PostGIS
- QGIS cho xử lý dữ liệu

Khi sửa phần GIS:
- Không đổi tên GeoServer workspace/layer nếu không được yêu cầu.
- Không đổi CRS/SRID nếu không hiểu rõ tác động.
- Với dữ liệu bản đồ, ưu tiên EPSG:4326 như project hiện tại.
- Khi tính khoảng cách POI, có thể dùng Leaflet `distanceTo` như logic hiện tại.
- Với POI dạng polygon đã chuyển centroid, giữ giả định này trừ khi task yêu cầu xử lý lại dữ liệu.
- Nếu thêm filter không gian mới, phải đảm bảo không làm mất chức năng tìm kiếm quanh POI hiện có.

## 6. Quy tắc database / SQL

Bảng chính hiện dùng cho BĐS là `bds_hanoi_real_data`.

Khi viết SQL:
- Luôn kiểm tra tên cột thực tế trước khi dùng.
- Không đoán tên cột như `dien_tich` nếu schema đang dùng `dien_tich_m2`.
- Không xoá cột hoặc ghi đè dữ liệu gốc nếu chưa được yêu cầu.
- Nếu tạo dữ liệu mock, phải giữ lại giá trị gốc ở cột riêng.
- Dữ liệu thời gian mock hiện phục vụ phân tích xu hướng giá từ 12/2025 đến 05/2026.
- Các cột liên quan có thể gồm:
  - `posted_date_mock`
  - `gia_trieu_goc`
  - `gia_m2_trieu_goc`
  - `gia_trieu_mock`
  - `gia_m2_trieu_mock`

Nếu schema khác với giả định, phải báo lại và đề xuất SQL đã chỉnh theo schema thật.

## 7. Quy tắc chức năng phân tích

Các chức năng ưu tiên phát triển:
1. Biểu đồ xu hướng giá trung bình theo tháng.
2. Thống kê số lượng tin/BĐS theo tháng.
3. Giá trung bình, trung vị, min, max.
4. So sánh giá theo quận/huyện.
5. Heatmap.
6. Choropleth giá trung bình theo quận/huyện.
7. Dashboard thống kê BĐS.

Khi làm biểu đồ:
- Ưu tiên dùng `recharts` nếu project chưa có lựa chọn khác.
- Dữ liệu hiển thị phải format dễ hiểu:
  - tỷ VNĐ
  - triệu/m²
  - tháng/năm
- Không bịa kết luận phân tích nếu dữ liệu chưa đủ.
- Có thể ghi rõ dữ liệu thời gian là dữ liệu mock phục vụ demo đồ án nếu cần.

## 8. Quy tắc Git

- Không tự ý commit nếu người dùng chưa yêu cầu.
- Không tự ý push nếu người dùng chưa yêu cầu.
- Trước khi đề xuất commit, phải chạy hoặc hiển thị:
  - `git status`
  - `git diff`
- Commit message nên ngắn gọn, đúng nội dung, ví dụ:
  - `docs: add Codex agent instructions`
  - `feat: add price trend chart`
  - `fix: correct Vietnamese encoding`
  - `refactor: split map components`

## 9. Quy tắc kiểm tra sau khi sửa

Sau khi sửa frontend, ưu tiên chạy:

```bash
cd frontend
npm run lint
npm run build
```

Nếu không chạy được vì thiếu môi trường, thiếu dependency, GeoServer/PostgreSQL không bật, phải nói rõ.

Không được báo là đã test thành công nếu chưa chạy test/lint/build thật.

## 10. Quy tắc báo cáo kết quả

Khi hoàn thành task, Codex phải báo cáo ngắn gọn:

- Đã sửa/tạo file nào.
- Đã thay đổi gì.
- Đã chạy lệnh kiểm tra nào.
- Kết quả kiểm tra ra sao.
- Có rủi ro hoặc việc cần làm tiếp không.

Không cần giải thích dài nếu task nhỏ.

## 11. Những điều tuyệt đối tránh

- Không làm hỏng tiếng Việt UTF-8.
- Không đưa lại lỗi encoding kiểu `TÃ¬m kiáº¿m`, `Báº¥t Ä‘á»™ng sáº£n`.
- Không xoá chức năng POI search quanh bán kính.
- Không xoá Marker Cluster.
- Không xoá base map switcher.
- Không xoá overlay WMS Heatmap/IDW nếu không được yêu cầu.
- Không đổi project thành dashboard thuần không có bản đồ.
- Không thêm authentication, backend, payment, listing CRUD nếu chưa được yêu cầu.
- Không tự ý sửa dữ liệu trong thư mục `data/` nếu task chỉ liên quan frontend.
