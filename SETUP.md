# SETUP - WebGIS BĐS Hà Nội

Tài liệu này hướng dẫn dựng lại môi trường chạy đầy đủ project WebGIS BĐS Hà Nội phục vụ nộp/bảo vệ đồ án.

Project được định vị là công cụ phân tích, hay "Radar thị trường BĐS Hà Nội". Frontend React/Vite chỉ là giao diện hiển thị bản đồ, bộ lọc, dashboard và biểu đồ. Dữ liệu bản đồ không lấy từ backend riêng trong repo, mà được frontend gọi trực tiếp từ GeoServer local qua WMS/WFS.

## 1. Phần mềm cần có

- Node.js 20 LTS hoặc mới hơn.
- npm.
- PostgreSQL/PostGIS.
- GeoServer chạy tại `http://localhost:8080`.
- Trình duyệt hiện đại như Chrome, Edge hoặc Firefox.

## 2. Database PostGIS

Database cần có:

- Database: `webgis_bds_hanoi`
- Bảng BĐS chính: `public.bds_hanoi_real_data`
- Bảng trend mock: `public.bds_price_trend_mock`
- View trend mock: `public.v_bds_price_trend_mock_geom`

Bảng `public.bds_hanoi_real_data` là nguồn dữ liệu BĐS chính của project. Bảng này cần được import trước từ dữ liệu đã xử lý bằng QGIS/PostGIS hoặc nguồn dữ liệu GIS đã chuẩn bị. Repo hiện chưa có migration đầy đủ để tạo toàn bộ database, import toàn bộ dữ liệu GIS và cấu hình đầy đủ GeoServer.

Repo đã có file SQL riêng cho dữ liệu xu hướng giá mock:

```text
database/create_price_trend_mock.sql
```

File này tạo bảng `public.bds_price_trend_mock` và view `public.v_bds_price_trend_mock_geom`. View trend có geometry giả để GeoServer publish WFS/GeoJSON; frontend chỉ dùng phần thuộc tính để vẽ biểu đồ xu hướng giá.

## 3. Backup/Restore database PostGIS

Repo hiện có full backup database PostGIS:

```text
database/webgis_bds_hanoi_full.backup
```

File này là bản backup dạng Custom của database `webgis_bds_hanoi`, dùng để restore database PostGIS trên máy khác bằng pgAdmin Restore. Nếu file này không đi kèm khi gửi repo, cần tạo lại hoặc nộp/gửi kèm riêng theo hướng dẫn bên dưới.

### Backup bằng pgAdmin

Trên máy đang có database đầy đủ:

1. Mở pgAdmin và kết nối tới PostgreSQL.
2. Chuột phải database `webgis_bds_hanoi`.
3. Chọn `Backup`.
4. Chọn `Format: Custom`.
5. Chọn `Filename: database/webgis_bds_hanoi_full.backup`.
6. Trong phần tùy chọn backup, nên bật `Do not save Owner`, `Do not save Privileges` và `Do not save Tablespaces` để restore trên máy khác ít lỗi role/quyền hơn.
7. Chạy backup và kiểm tra file `.backup` được tạo thành công.

### Restore bằng pgAdmin trên máy khác

Trên máy nhận project:

1. Cài PostgreSQL/PostGIS.
2. Tạo database rỗng tên `webgis_bds_hanoi`.
3. Bật extension PostGIS cho database nếu cần:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

4. Chuột phải database `webgis_bds_hanoi`.
5. Chọn `Restore`.
6. Chọn file `database/webgis_bds_hanoi_full.backup`.
7. Chạy restore và kiểm tra các bảng/view chính đã có, đặc biệt là `public.bds_hanoi_real_data`, `public.bds_price_trend_mock` và `public.v_bds_price_trend_mock_geom`.

Full database backup giúp tái lập phần PostGIS tốt hơn so với chỉ có SQL trend mock. Tuy nhiên backup này không thay thế cấu hình GeoServer. Sau khi restore database, vẫn cần cấu hình workspace, datastore, layer, raster store Heatmap/IDW và CORS theo các mục bên dưới.

## 4. GeoServer

GeoServer cần chạy local tại:

```text
http://localhost:8080
```

Workspace cần có:

```text
doan_webgis
```

Frontend đang gọi GeoServer qua workspace:

```text
http://localhost:8080/geoserver/doan_webgis
```

Các service WMS/WFS cần bật và cho phép frontend gọi được từ browser:

- WMS: `http://localhost:8080/geoserver/doan_webgis/wms`
- WFS/OWS: `http://localhost:8080/geoserver/doan_webgis/ows`

Nếu trình duyệt chặn request từ `http://localhost:5173`, cần cấu hình CORS cho GeoServer để cho phép frontend Vite gọi WMS/WFS.

## 5. Layer GeoServer cần publish

Các layer cần được publish đúng workspace và đúng tên sau:

| Layer | Dịch vụ | Mục đích |
| --- | --- | --- |
| `doan_webgis:bds_hanoi_real_data` | WFS/WMS | Điểm BĐS chính, marker, filter và GetFeatureInfo |
| `doan_webgis:hanoi_pois` | WFS | POI phục vụ tìm kiếm và lọc BĐS theo bán kính |
| `doan_webgis:hanoi_roads` | WMS | Mạng lưới giao thông |
| `doan_webgis:ranh_gioi_hanoi` | WMS | Ranh giới hành chính Hà Nội |
| `doan_webgis:Heatmap_BDS_HaNoi` | WMS | Raster Heatmap phân bố/độ nóng BĐS |
| `doan_webgis:IDW_BDS_HaNoi` | WMS | Raster nội suy IDW giá BĐS |
| `doan_webgis:v_bds_price_trend_mock_geom` | WFS | Dữ liệu xu hướng giá mock cho biểu đồ |

Không đổi tên workspace hoặc layer nếu không đồng thời sửa cấu hình frontend. Tên layer hiện được frontend dùng trực tiếp.

## 6. Dữ liệu GIS và raster

Thư mục `data/` chứa dữ liệu GIS, file QGIS và raster Heatmap/IDW phục vụ publish lên GeoServer. Tuy nhiên `data/` có thể không được push đầy đủ vì đang bị ignore trong repo. Nếu clone repo mà thiếu `data/`, cần nhận dữ liệu kèm theo từ nhóm hoặc import lại dữ liệu GIS từ nguồn đã xử lý.

Raster store cho Heatmap/IDW nên trỏ tới path không dấu:

```text
file:///D:/webgis_hanoi/data/Heatmap_BDS_HaNoi.tif
file:///D:/webgis_hanoi/data/IDW_BDS_HaNoi.tif
```

Không nên dùng đường dẫn có tiếng Việt, dấu hoặc ký tự đặc biệt như:

```text
D:\Đồ án
```

GeoServer/Java/GDAL có thể lỗi encoding hoặc không đọc được raster khi store trỏ tới path có dấu. Nên đặt repo và raster ở path ASCII không dấu như `D:\webgis_hanoi`.

## 7. Chạy frontend

Sau khi GeoServer/PostGIS đã sẵn sàng, chạy frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Nếu chỉ chạy frontend mà chưa cấu hình GeoServer/PostGIS, giao diện có thể mở được nhưng marker BĐS, POI, Heatmap, IDW hoặc biểu đồ trend có thể không hiển thị đầy đủ.

## 8. Kiểm tra nhanh WFS

Kiểm tra layer BĐS chính:

```text
http://localhost:8080/geoserver/doan_webgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=doan_webgis:bds_hanoi_real_data&outputFormat=application/json&srsName=EPSG:4326
```

Kiểm tra layer trend mock:

```text
http://localhost:8080/geoserver/doan_webgis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=doan_webgis:v_bds_price_trend_mock_geom&outputFormat=application/json&srsName=EPSG:4326
```

Kết quả đúng nên là GeoJSON `FeatureCollection`. Nếu response là XML `ServiceExceptionReport`, cần kiểm tra lại workspace, layer name, datastore, quyền truy cập WFS hoặc schema database.

## 9. Lỗi thường gặp

### Frontend mở được nhưng không có marker/POI/chart

Nguyên nhân thường gặp:

- GeoServer chưa chạy tại `http://localhost:8080`.
- Sai workspace `doan_webgis`.
- Sai tên layer WFS.
- Thiếu bảng `public.bds_hanoi_real_data`.
- Thiếu bảng/view trend mock `public.bds_price_trend_mock` hoặc `public.v_bds_price_trend_mock_geom`.
- CORS bị browser chặn.

### Heatmap/IDW không hiện dù WMS trả HTTP 200

HTTP 200 không bảo đảm GeoServer trả ảnh PNG hợp lệ. Cần kiểm tra body response có phải XML `ServiceExceptionReport` hay không.

Nguyên nhân thường gặp:

- Raster store trỏ sai path.
- Path raster có tiếng Việt/dấu/ký tự đặc biệt.
- GeoServer không tạo được raster reader.
- File `Heatmap_BDS_HaNoi.tif` hoặc `IDW_BDS_HaNoi.tif` không tồn tại trong `data/`.

### GeoServer trả XML ServiceExceptionReport thay vì GeoJSON/PNG

Nguyên nhân thường gặp:

- Sai `typeName` hoặc layer chưa publish.
- Sai workspace.
- Datastore PostGIS lỗi kết nối.
- Bảng/view trong database không tồn tại.
- Layer raster store lỗi đường dẫn hoặc format.
- Request WFS/WMS thiếu tham số bắt buộc.

### CORS bị chặn

Nếu console trình duyệt báo CORS khi frontend ở `http://localhost:5173` gọi GeoServer ở `http://localhost:8080`, cần bật CORS trong GeoServer hoặc servlet container đang chạy GeoServer.

### Sai workspace/layer name

Frontend dùng tên layer cố định. Cần publish đúng:

```text
doan_webgis:bds_hanoi_real_data
doan_webgis:hanoi_pois
doan_webgis:hanoi_roads
doan_webgis:ranh_gioi_hanoi
doan_webgis:Heatmap_BDS_HaNoi
doan_webgis:IDW_BDS_HaNoi
doan_webgis:v_bds_price_trend_mock_geom
```

### Thiếu database/table/view

Nếu layer PostGIS không publish được hoặc WFS trả lỗi, kiểm tra:

- Database `webgis_bds_hanoi` tồn tại.
- Extension PostGIS đã được bật.
- Bảng `public.bds_hanoi_real_data` đã được import.
- Script `database/create_price_trend_mock.sql` đã được chạy nếu cần dữ liệu trend mock.
- View `public.v_bds_price_trend_mock_geom` tồn tại và có geometry hợp lệ để GeoServer publish.

## 10. Checklist trước khi gửi repo cho người khác

- Có `README.md` để hướng dẫn tổng quan/chạy nhanh.
- Có `SETUP.md` để hướng dẫn setup đầy đủ GeoServer/PostGIS/data/raster/layer/CORS.
- Có `database/create_price_trend_mock.sql`.
- Có hoặc nộp/gửi kèm `database/webgis_bds_hanoi_full.backup`.
- `npm install` chạy được trong thư mục `frontend/`.
- `npm run dev` chạy được trong thư mục `frontend/`.
- GeoServer chạy ở `http://localhost:8080`.
- Workspace `doan_webgis` tồn tại.
- GeoServer workspace/layer publish đúng tên.
- Các layer WFS/WMS trả dữ liệu đúng.
- Raster store Heatmap/IDW trỏ tới path không dấu trong `D:/webgis_hanoi/data/`.
- Dữ liệu/raster Heatmap/IDW nằm ở đường dẫn không dấu, tránh path như `D:\Đồ án`.
- Frontend `http://localhost:5173` hiển thị marker BĐS.
- Frontend hiển thị POI và tìm kiếm POI hoạt động.
- Frontend bật được Heatmap/IDW.
- Biểu đồ trend hiển thị dữ liệu từ `doan_webgis:v_bds_price_trend_mock_geom`.
