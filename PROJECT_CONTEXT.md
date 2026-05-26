# PROJECT CONTEXT

## Tổng quan

Repo này là một project WebGIS về bất động sản Hà Nội. Phần code hiện có là một frontend React/Vite hiển thị bản đồ Leaflet, lấy dữ liệu không gian từ GeoServer qua WMS/WFS và dùng các lớp dữ liệu GIS trong thư mục `data/` làm nguồn xuất bản/biên tập bằng QGIS/GeoServer.

Sản phẩm được định hướng là công cụ phân tích thị trường BĐS Hà Nội, hay "Radar thị trường BĐS", không phải website rao vặt hoặc đăng tin bất động sản.

Không thấy backend application source trong repo. API runtime hiện được giả định là GeoServer chạy local tại `http://localhost:8080/geoserver/doan_webgis`.

## Cấu trúc thư mục

```text
D:\webgis_hanoi
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── README.md
├── SETUP.md
├── data/
│   ├── DoAn_WebGIS_HaNoi.qgz
│   ├── PhanTich_KDE_HaNoi.qgz
│   ├── duong_giao_thong_hanoi.gpkg
│   ├── ranh_gioi_hanoi.gpkg
│   ├── hanoi_pois_full.*
│   ├── hanoi_roads_full.*
│   ├── hanoi_pois_vip.geojson
│   ├── Heatmap_BDS_HaNoi.tif / .sld / .aux.xml
│   └── IDW_BDS_HaNoi.tif / .sld / .aux.xml
├── database/
│   ├── create_price_trend_mock.sql
│   ├── price_trend_mock_export.csv
│   └── webgis_bds_hanoi_full.backup
├── frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── vite-dev.err.log
│   ├── vite-dev.out.log
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── dist/
│   │   └── build output hiện có, không liệt kê chi tiết
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── components/
│       │   ├── BdsMarkers.jsx
│       │   ├── BdsPopup.jsx
│       │   ├── FilterPanel.jsx
│       │   ├── LayerTogglePanel.jsx
│       │   ├── MapView.jsx
│       │   ├── PoiRadiusLayer.jsx
│       │   ├── PoiSearchPanel.jsx
│       │   ├── popupStyles.js
│       │   ├── Sidebar.jsx
│       │   ├── DistrictComparison.jsx
│       │   ├── StatsDashboard.jsx
│       │   └── TrendChart.jsx
│       ├── config/
│       │   ├── baseMaps.js
│       │   └── geoserver.js
│       ├── services/
│       │   └── geoserverApi.js
│       ├── styles/
│       │   └── appStyles.js
│       └── utils/
│           ├── bdsStats.js
│           ├── bdsFilters.js
│           ├── formatters.js
│           └── geometry.js
└── .gitignore
```

Root `.gitignore` đang ignore `data/`, dù thư mục `data/` đang tồn tại trong workspace hiện tại.

Các file/tài liệu quan trọng ở root:

- `README.md`: README chính của repo, giới thiệu đồ án WebGIS BĐS Hà Nội, phạm vi sản phẩm, chức năng, stack, cách chạy, layer GeoServer, dữ liệu trend mock và các giới hạn dữ liệu/môi trường.
- `SETUP.md`: hướng dẫn dựng môi trường chạy đầy đủ, gồm PostgreSQL/PostGIS, GeoServer local, workspace/layer, dữ liệu GIS/raster, CORS, kiểm tra WFS, lỗi thường gặp, backup/restore database và checklist tái lập.
- `PROJECT_CONTEXT.md`: tài liệu ngữ cảnh kỹ thuật của repo, dùng để đồng bộ kiến trúc, dữ liệu, layer, rủi ro và tiến độ cho các lần làm việc tiếp theo.
- `AGENTS.md`: quy tắc làm việc cho Codex/agent trong repo.
- `database/create_price_trend_mock.sql`: SQL setup/version hóa dữ liệu trend mock, tạo bảng `public.bds_price_trend_mock` và view `public.v_bds_price_trend_mock_geom` phục vụ `TrendChart`.
- `database/webgis_bds_hanoi_full.backup`: full backup database PostGIS `webgis_bds_hanoi` dạng pgAdmin Custom backup, dùng để restore database trên máy khác nếu file được gửi kèm/tracked cùng repo.

Các thư mục frontend quan trọng sau refactor:

- `frontend/src/components/`: chứa component giao diện và bản đồ như sidebar, panel lọc, POI search, marker cluster, popup, `MapView`, `TrendChart` và style popup dùng chung.
- `frontend/src/config/`: chứa cấu hình nền bản đồ, endpoint GeoServer và tên layer WMS/WFS.
- `frontend/src/services/`: chứa hàm gọi GeoServer WFS/WMS/API.
- `frontend/src/styles/`: chứa CSS tách riêng cho shell/sidebar/basemap switcher theo phong cách Glassmorphism.
- `frontend/src/utils/`: chứa helper format dữ liệu, lọc BĐS, xử lý geometry/tọa độ/khoảng cách GIS.
- `frontend/src/assets/`: chứa asset tĩnh đang có như `hero.png`, `react.svg`, `vite.svg`.

## Frontend

Frontend nằm trong `frontend/`, dùng:

- React `19.2.5`
- Vite `^8.0.10` trong `package.json` (lockfile hiện resolve `8.0.11`)
- Leaflet `1.9.4`
- React Leaflet `5.0.0`
- `react-leaflet-cluster` để gom marker bất động sản
- `recharts` `3.8.1` để vẽ biểu đồ xu hướng giá trong sidebar
- ESLint config tiêu chuẩn cho React Hooks và React Refresh

Entry point:

- `frontend/src/main.jsx`: mount React app vào `#root`.
- `frontend/src/App.jsx`: file điều phối chính của app, quản lý state cấp app, load dữ liệu WFS, nối sidebar, map, layer, filter, POI và các module đã tách.
- `frontend/src/index.css`: reset layout để `html`, `body`, `#root` chiếm toàn màn hình.

Frontend hiện đã được refactor tốt hơn bản `App.jsx` nguyên khối ban đầu. Component map/sidebar/panel, cấu hình layer/base map, service gọi GeoServer, helper filter/GIS/format và CSS chính đã được tách ra các module riêng. `App.jsx` vẫn giữ vai trò orchestration/state chính nhưng không còn là nơi chứa toàn bộ logic UI, API, GIS helper và style.

UI đang dùng phong cách Glassmorphism, giữ font Inter trong `frontend/src/index.css` và đã sửa lỗi font tiếng Việt để hiển thị đúng UTF-8.

## Chức năng hiện có

Ứng dụng hiển thị một bản đồ toàn màn hình trung tâm Hà Nội (`[21.0285, 105.8542]`, zoom `11`) với sidebar chức năng.

Các chức năng đang có:

- Chọn nền bản đồ:
  - CARTO light
  - CARTO dark
  - OpenStreetMap
- Hiển thị điểm bất động sản dưới dạng marker cluster.
- Popup chi tiết bất động sản đã ẩn title/tin rao crawl từ web để giữ định hướng công cụ phân tích, không phải website rao vặt. Popup hiện chỉ giữ các thông tin cần cho phân tích/rà soát: mã dữ liệu, loại BĐS, khu vực, giá, diện tích và đơn giá.
- Lọc BĐS theo:
  - loại: `Tất cả`, `Nhà đất`, `Chung cư`, `Đất nền`, `Mặt bằng`
  - quận/huyện, lấy động từ dữ liệu BĐS đã tải
  - khoảng giá, nhập theo tỷ VNĐ
  - khoảng đơn giá, nhập theo triệu/m²
  - khoảng diện tích, m2
  - box tóm tắt kết quả lọc trong `FilterPanel`, gồm số lượng BĐS đang lọc/tổng số, giá trung vị/m², giá trung bình/m², quận/huyện nhiều nhất và loại phổ biến nhất
  - bộ lọc vẫn chạy client-side trên dữ liệu BĐS đã tải từ WFS, chưa có filter server-side qua WFS CQL/API trung gian
- Tìm kiếm POI:
  - load POI từ WFS
  - search client-side theo tên/loại/địa chỉ
  - giới hạn hiển thị 50 POI đầu
  - chọn POI, vẽ marker và vòng bán kính
  - lọc BĐS nằm trong bán kính bằng `Leaflet LatLng.distanceTo`
  - tự động `flyTo` POI được chọn
- Click bản đồ gọi WMS `GetFeatureInfo` để lấy thông tin feature BĐS tại vị trí click, sau đó vẫn áp dụng filter BĐS, filter bán kính POI và rule loại dữ liệu `invalid_location` trước khi mở popup.
- Bật/tắt các overlay WMS:
  - điểm bất động sản
  - mạng lưới giao thông
  - ranh giới hành chính
  - heatmap
  - IDW

- Module `Thống kê BĐS` trong sidebar:
  - hiển thị theo thứ tự: `StatsDashboard`, `DistrictComparison`, `TrendChart`
  - `StatsDashboard` và `DistrictComparison` dùng danh sách BĐS đã lọc từ `App.jsx` (`filteredBDS`), nên số liệu thay đổi theo bộ lọc loại, quận/huyện, giá, đơn giá/m², diện tích và bán kính POI hiện tại
  - các thống kê trong dashboard và so sánh quận/huyện không gọi thêm GeoServer layer mới, không sửa database và không sửa PostGIS
  - dashboard tổng quan `Tổng quan thị trường` hiển thị các chỉ số:
    - tổng số BĐS đang xét
    - giá trung vị/m²
    - giá trung bình/m²
    - diện tích trung vị
    - loại BĐS phổ biến nhất
    - quận/huyện có nhiều BĐS nhất
    - khu vực có giá trung vị/m² cao nhất nếu đủ dữ liệu hợp lệ
    - phân bố số lượng theo loại BĐS
  - khi tính median/average, dashboard bỏ qua giá trị thiếu/null/không parse được để tránh làm sai số liệu
  - `DistrictComparison` cung cấp chức năng so sánh giá theo quận/huyện tương tác, không còn là danh sách cố định 5 quận/huyện
  - danh sách quận/huyện của `DistrictComparison` được lấy động từ `bdsItems` hiện tại; vẫn ưu tiên các khu vực mẫu để demo/phân tích: Cầu Giấy, Hà Đông, Nam Từ Liêm, Đông Anh, Hoài Đức
  - `DistrictComparison` có bộ lọc/tùy chọn phân tích nội bộ:
    - chọn quận/huyện bằng pill
    - chọn chỉ số chính: giá trung vị/m², giá trung bình/m², số lượng tin, diện tích trung vị
    - chọn sắp xếp: cao đến thấp, thấp đến cao, tên A-Z
    - chọn số lượng hiển thị: Top 5, Top 10, Tất cả
  - nếu không chọn pill nào, candidate list của `DistrictComparison` là toàn bộ quận/huyện trong dữ liệu BĐS đang lọc
  - pipeline logic cuối cùng của `DistrictComparison`: `allDistrictStats` → `candidateDistrictStats` → `sortedDistrictStats` → `visibleDistrictStats`; JSX render card từ `visibleDistrictStats` và `displayLimit` được apply sau khi lọc/sắp xếp
  - `DistrictComparison` xử lý dữ liệu thiếu/null/NaN, hiển thị `Không đủ dữ liệu` khi cần và có dòng tóm tắt kiểu `Đang hiển thị X/Y khu vực`
  - hiển thị card biểu đồ `Xu hướng giá BĐS`
  - dùng Recharts `LineChart`
  - lấy dữ liệu trend qua WFS từ layer `doan_webgis:v_bds_price_trend_mock_geom`
  - hiển thị giá trung vị theo m² theo tháng, giai đoạn mock `12/2025 - 05/2026`
  - so sánh 4 loại hình: Chung cư, Đất nền, Nhà riêng, Biệt thự
  - có ghi chú rõ dữ liệu xu hướng là mô phỏng có kiểm soát do dữ liệu gốc thiếu trường thời gian đăng tin; chỉ số dùng là giá trung vị để giảm ảnh hưởng của ngoại lai
  - chart đã render được trong sidebar trên desktop/mobile và không phá layout bản đồ chính

## API và map layer

Các endpoint/layer hiện được gom trong `frontend/src/config/geoserver.js`:

```js
const geoserverWmsUrl = 'http://localhost:8080/geoserver/doan_webgis/wms';
const geoserverWfsUrl = 'http://localhost:8080/geoserver/doan_webgis/ows';
const bdsLayerName = 'doan_webgis:bds_hanoi_real_data';
const poisLayerName = 'doan_webgis:hanoi_pois';
const roadsLayerName = 'doan_webgis:hanoi_roads';
const boundaryLayerName = 'doan_webgis:ranh_gioi_hanoi';
const heatmapLayerName = 'doan_webgis:Heatmap_BDS_HaNoi';
const idwLayerName = 'doan_webgis:IDW_BDS_HaNoi';
const trendLayerName = 'doan_webgis:v_bds_price_trend_mock_geom';
```

WFS được dùng để tải dữ liệu vector dạng GeoJSON:

- `GetFeature typeName=doan_webgis:bds_hanoi_real_data outputFormat=application/json srsName=EPSG:4326`
- `GetFeature typeName=doan_webgis:hanoi_pois outputFormat=application/json srsName=EPSG:4326`
- `GetFeature typeName=doan_webgis:v_bds_price_trend_mock_geom outputFormat=application/json srsName=EPSG:4326`

Layer trend `doan_webgis:v_bds_price_trend_mock_geom` trả GeoJSON phục vụ biểu đồ xu hướng giá. Frontend chỉ dùng `properties` của feature, không dùng geometry để vẽ bản đồ.

Layer trend này đã được test lại qua GeoServer WFS sau khi bổ sung SQL setup dữ liệu mock. WFS trả `FeatureCollection` hợp lệ với `totalFeatures`/`numberReturned = 24`. Các properties quan trọng frontend cần gồm:

- `id`
- `loai_bds`
- `thang`
- `thang_label`
- `so_luong_tin`
- `gia_m2_trung_vi`
- `gia_m2_trung_binh`
- `ghi_chu`

Geometry trả về là point giả tại `[105.8542, 21.0285]`, chỉ để GeoServer publish WFS/GeoJSON.

WMS được dùng để render overlay raster/vector từ GeoServer:

- Roads: `doan_webgis:hanoi_roads`
- Boundary: `doan_webgis:ranh_gioi_hanoi`
- Heatmap: `doan_webgis:Heatmap_BDS_HaNoi`
- IDW: `doan_webgis:IDW_BDS_HaNoi`

WMS `GetFeatureInfo` dùng version `1.1.1`, `srs=EPSG:4326`, `info_format=application/json` và tính `bbox/width/height/x/y` từ viewport Leaflet.

## Database và dữ liệu GIS

Repo chưa có migration/setup đầy đủ cho toàn bộ database, import dữ liệu GIS, GeoServer, raster store và publish layer. Tuy nhiên hiện đã có SQL setup riêng cho dữ liệu trend mock tại `database/create_price_trend_mock.sql`. File QGIS `data/DoAn_WebGIS_HaNoi.qgz` có tham chiếu đến PostgreSQL/PostGIS:

- database: `webgis_bds_hanoi`
- host: `localhost`
- port: `5432`
- table: `public.bds_hanoi_real_data`
- geometry: `geom`
- key: `id_0`
- SRID: `4326`
- type: `Point`

Bảng gốc `public.bds_hanoi_real_data` vẫn là nguồn dữ liệu BĐS chính. Bảng này đã từng được bổ sung các cột phục vụ mock thời gian/giá:

- `posted_date_mock`
- `gia_trieu_goc`
- `gia_m2_trieu_goc`
- `gia_trieu_mock`
- `gia_m2_trieu_mock`
- `data_type`
- `mock_note`

Bảng `public.bds_hanoi_real_data` hiện cũng đã có các cột QA vị trí:

- `location_status`
- `qa_note`
- `geom_original`

Đã xác minh 2 bản ghi sai tọa độ/thuộc tính hành chính:

- `id_0 = 1132`
- `id_0 = 2111`

Hai bản ghi này ghi Phường Nghĩa Đô, Quận Cầu Giấy nhưng tọa độ hiển thị lạc ra ngoài khu vực phù hợp. Database đã đánh dấu `location_status = invalid_location` cho 2 bản ghi trên. Frontend đã có rule loại các bản ghi `invalid_location` khỏi marker/filter/dashboard/thống kê/so sánh quận huyện và có fallback theo `id_0` `1132`, `2111` trong trường hợp WFS chưa expose cột `location_status`.

Không xử lý hàng loạt 381 bản ghi `ward_mismatch_review` ở thời điểm hiện tại vì có thể bị ảnh hưởng bởi dữ liệu ranh giới/sáp nhập hành chính; nhóm này được để lại cho bước QA dữ liệu vị trí thủ công sau.

Để vẽ biểu đồ xu hướng ổn định hơn, project đã tạo bảng tổng hợp riêng:

- `public.bds_price_trend_mock`

Repo hiện đã version hóa setup dữ liệu trend mock bằng file:

- `database/create_price_trend_mock.sql`

SQL này:

- Drop trước các view phụ thuộc nếu tồn tại: `public.v_bds_price_trend_mock_geom` và `public.v_bds_price_trend_mock`, sau đó drop bảng `public.bds_price_trend_mock` để script có thể chạy lại.
- Tạo bảng `public.bds_price_trend_mock`.
- Insert 24 dòng dữ liệu trend mock, tương ứng 4 loại BĐS x 6 tháng, giai đoạn `12/2025` đến `05/2026`.
- Tạo index theo `thang`.
- Tạo index theo `loai_bds`.
- Tạo view `public.v_bds_price_trend_mock_geom` để GeoServer publish WFS/GeoJSON.

Bảng trend này chứa dữ liệu xu hướng giá mock tổng hợp theo:

- `loai_bds`
- `thang`
- `so_luong_tin`
- `gia_m2_trung_vi`
- `gia_m2_trung_binh`
- `ghi_chu`

GeoServer đã publish dữ liệu trend qua view có geometry giả:

- `public.v_bds_price_trend_mock_geom`
- GeoServer layer: `doan_webgis:v_bds_price_trend_mock_geom`

View này thêm `geom` giả tại trung tâm Hà Nội bằng `ST_SetSRID(ST_MakePoint(105.8542, 21.0285), 4326)::geometry(Point, 4326)` để GeoServer chấp nhận publish và WFS trả GeoJSON. View cũng có `thang_label` dạng `MM/YYYY` để khớp schema GeoServer/frontend hiện tại. Geometry của layer trend không dùng để vẽ bản đồ hoặc phân tích không gian; frontend chỉ dùng `properties` để vẽ biểu đồ.

Repo hiện có full backup database PostGIS:

- `database/webgis_bds_hanoi_full.backup`

File backup này là pgAdmin Custom backup của database `webgis_bds_hanoi`, dùng để restore database PostGIS trên máy khác bằng pgAdmin Restore. Backup giúp tái lập phần PostGIS tốt hơn, đặc biệt là bảng chính `public.bds_hanoi_real_data`, bảng trend `public.bds_price_trend_mock` và view `public.v_bds_price_trend_mock_geom`. Tuy nhiên backup database không tự động hóa cấu hình GeoServer; workspace `doan_webgis`, datastore/layer, raster store Heatmap/IDW và CORS vẫn phải cấu hình theo `SETUP.md`.

Các nguồn dữ liệu GIS trong `data/`:

- `duong_giao_thong_hanoi.gpkg`
  - layer: `hanoi_roads`
  - CRS/SRID: `4326`
  - geometry: line
  - count đọc từ GeoPackage: `122539`
  - fields chính: `fid`, `geom`, `osm_id`, `code`, `fclass`, `name`, `ref`, `oneway`, `maxspeed`, `layer`, `bridge`, `tunnel`
- `ranh_gioi_hanoi.gpkg`
  - layer: `gadm41_vnm__adm_adm_2`
  - CRS/SRID: `4326`
  - geometry: polygon
  - count đọc từ GeoPackage: `30`
  - fields chính: `fid`, `geom`, `GID_2`, `COUNTRY`, `NAME_1`, `NAME_2`, `TYPE_2`, `ENGTYPE_2`, `HASC_2`
- `hanoi_pois_full.shp`
  - record count đọc từ DBF: `12388`
  - fields: `osm_id`, `code`, `fclass`, `name`
- `hanoi_roads_full.shp`
  - record count đọc từ DBF: `195079`
  - fields: `osm_id`, `code`, `fclass`, `name`, `ref`, `oneway`, `maxspeed`, `layer`, `bridge`, `tunnel`
- `hanoi_pois_vip.geojson`
  - `403` Point features
  - fields mẫu: `name`, `name:en`, `name:vi`, `amenity`, `building`, `healthcare`, `healthcare:speciality`, `operator:type`, `capacity:persons`, `addr:full`, `addr:city`, `source`, `osm_id`, `osm_type`, `layer`, `path`
- `Heatmap_BDS_HaNoi.tif`
  - GeoTIFF float raster
  - size: `1427x1512`
  - CRS tag: WGS 84
- `IDW_BDS_HaNoi.tif`
  - GeoTIFF float raster
  - size: `1464x1642`
  - CRS tag: WGS 84

`DoAn_WebGIS_HaNoi.qgz` là QGIS project version `3.40.10-Bratislava`, saved `2026-05-13T14:17:03`, project CRS `EPSG:4326`. Project có cả layer local, layer memory, layer PostGIS, raster heatmap/IDW và một số datasource ngoài repo như HOTOSM, Excel phường/xã và file trong `C:/Users/Dinh Tung/...`.

## GIS processing layer

Không thấy script xử lý GIS tự động trong repo. Dấu vết xử lý nằm chủ yếu trong QGIS project và các output data:

- Heatmap/KDE:
  - `PhanTich_KDE_HaNoi.qgz`
  - `Heatmap_BDS_HaNoi.tif`
  - `Heatmap_BDS_HaNoi.sld`
  - `Heatmap_BDS_HaNoi.tif.aux.xml`
- IDW:
  - `IDW_BDS_HaNoi.tif`
  - `IDW_BDS_HaNoi.sld`
  - `IDW_BDS_HaNoi.tif.aux.xml`
- QGIS project còn tham chiếu các layer tạm:
  - `Clipped (mask)` từ `C:/Users/Dinh Tung/AppData/Local/Temp/processing_.../OUTPUT.tif`
  - `Interpolated` từ `C:/Users/Dinh Tung/AppData/Local/Temp/processing_.../OUTPUT.tif`

Điều này cho thấy quá trình KDE/IDW/clipping đang được thực hiện thủ công hoặc qua QGIS Processing, chưa được version hóa thành script reproducible trong repo.

## Các file quan trọng

- `AGENTS.md`
  - luật làm việc bắt buộc cho Codex khi sửa repo này
  - nhấn mạnh phải đọc `PROJECT_CONTEXT.md`, giữ kiến trúc refactor và không biến project thành web rao vặt
- `PROJECT_CONTEXT.md`
  - bộ nhớ/bối cảnh kỹ thuật của đồ án WebGIS BĐS Hà Nội
- `README.md`
  - tài liệu tổng quan/chạy nhanh frontend, đã có mục liên kết sang `SETUP.md`
- `SETUP.md`
  - hướng dẫn dựng môi trường đầy đủ cho GeoServer/PostGIS/data/raster/layer/CORS, backup/restore database, kiểm tra WFS, lỗi thường gặp và checklist tái lập
- `database/create_price_trend_mock.sql`
  - SQL tạo lại bảng `public.bds_price_trend_mock` và view `public.v_bds_price_trend_mock_geom` phục vụ biểu đồ xu hướng giá mock
- `database/webgis_bds_hanoi_full.backup`
  - full backup database PostGIS `webgis_bds_hanoi` dạng pgAdmin Custom backup, dùng để restore database trên máy khác; vẫn cần cấu hình GeoServer thủ công sau restore
- `frontend/src/App.jsx`
  - file điều phối chính của ứng dụng
  - load dữ liệu BĐS/POI qua service, giữ state filter/POI/layer/sidebar, tính dữ liệu đã lọc rồi truyền props xuống component con
  - truyền `bdsItems={filteredBDS}` xuống `Sidebar` để dashboard thống kê dùng đúng danh sách marker đang hiển thị
  - giữ state bộ lọc quận/huyện và đơn giá/m², build danh sách quận/huyện động từ BĐS đã tải
  - loại bản ghi BĐS `invalid_location` ngay sau khi chuẩn hóa dữ liệu WFS thành marker
  - có cleanup nhỏ để dữ liệu BĐS đã lọc là derived data bằng `useMemo`, giúp lint pass và không đổi luồng filter/POI
- `frontend/src/components/MapView.jsx`
  - chứa `MapContainer`, base tile, WMS overlays, marker cluster layer và logic click bản đồ gọi WMS `GetFeatureInfo`
  - luồng WMS `GetFeatureInfo` không mở popup nếu feature trả về có `location_status = invalid_location` hoặc thuộc fallback ID sai tọa độ đã xác minh
- `frontend/src/components/BdsMarkers.jsx`
  - render marker BĐS bằng `react-leaflet-cluster`
- `frontend/src/components/BdsPopup.jsx`
  - popup chi tiết BĐS, dùng formatter để hiển thị mã dữ liệu, loại, khu vực, giá, diện tích và đơn giá
  - không render `title`/tin rao crawl từ web để tránh làm sản phẩm giống website rao vặt
  - có cleanup nhỏ để dùng style popup tách riêng, giúp lint pass
- `frontend/src/components/Sidebar.jsx`
  - menu chức năng chính, nối panel lọc, POI search và module `Thống kê BĐS`
  - menu `Thống kê BĐS` đã gắn thứ tự `<StatsDashboard />`, `<DistrictComparison />`, `<TrendChart />`
- `frontend/src/components/StatsDashboard.jsx`
  - component dashboard tổng quan BĐS trong tab `Thống kê BĐS`
  - nhận `bdsItems` qua props từ `Sidebar`, không tự fetch GeoServer
  - dùng `useMemo` gọi `buildBdsStats()` để tính số liệu từ danh sách BĐS đã lọc
  - hiển thị trạng thái trống thân thiện khi không có BĐS phù hợp với bộ lọc hiện tại
- `frontend/src/components/DistrictComparison.jsx`
  - component so sánh giá theo quận/huyện trong tab `Thống kê BĐS`
  - nhận `bdsItems` đã lọc từ `Sidebar`, không tự fetch GeoServer và không dùng layer trend
  - lấy danh sách quận/huyện động từ dữ liệu BĐS đang lọc; vẫn ưu tiên hiển thị các khu vực mẫu Cầu Giấy, Hà Đông, Nam Từ Liêm, Đông Anh, Hoài Đức trong danh sách pill để tiện demo
  - có tùy chọn nội bộ: chọn quận/huyện bằng pill, chọn chỉ số chính, sắp xếp và giới hạn hiển thị Top 5/Top 10/Tất cả
  - pipeline render: `allDistrictStats` → `candidateDistrictStats` → `sortedDistrictStats` → `visibleDistrictStats`; card được render từ `visibleDistrictStats`
  - hiển thị giá trung vị/m², giá trung bình/m², số lượng tin, diện tích trung vị và loại BĐS phổ biến nhất; dữ liệu thiếu/null/không hợp lệ được hiển thị là `Không đủ dữ liệu`
- `frontend/src/components/TrendChart.jsx`
  - component Recharts `LineChart` cho chức năng xu hướng giá BĐS
  - gọi `fetchPriceTrendData()`, có state loading/error/data
  - transform dữ liệu WFS từ long format sang wide format để vẽ nhiều đường
  - hiển thị legend tiếng Việt cho Chung cư, Đất nền, Nhà riêng, Biệt thự
- `frontend/src/components/FilterPanel.jsx`
  - controlled component cho bộ lọc loại BĐS, quận/huyện, khoảng giá, đơn giá/m² và diện tích
  - có box tóm tắt kết quả lọc, hiển thị số lượng BĐS đang lọc/tổng số, giá trung vị/m², giá trung bình/m², quận/huyện nhiều nhất và loại phổ biến nhất
- `frontend/src/components/PoiSearchPanel.jsx`
  - panel tìm POI client-side, giới hạn hiển thị 50 kết quả và chọn POI làm tâm bán kính
- `frontend/src/components/PoiRadiusLayer.jsx`
  - render marker POI được chọn, vòng bán kính và tự `flyTo` POI trên bản đồ
  - có cleanup nhỏ để dùng style popup tách riêng, giúp lint pass
- `frontend/src/components/LayerTogglePanel.jsx`
  - control đổi nền bản đồ từ danh sách base map
- `frontend/src/components/popupStyles.js`
  - tách style inline dùng chung cho popup BĐS/POI khỏi file component để đáp ứng rule Fast Refresh của ESLint
- `frontend/src/config/geoserver.js`
  - endpoint WMS/WFS và tên layer GeoServer (`bds_hanoi_real_data`, `hanoi_pois`, roads, boundary, Heatmap, IDW, trend)
  - có `trendLayerName = 'doan_webgis:v_bds_price_trend_mock_geom'`
- `frontend/src/config/baseMaps.js`
  - cấu hình nền CARTO light, CARTO dark và OpenStreetMap
- `frontend/src/services/geoserverApi.js`
  - hàm gọi WFS lấy BĐS/POI, WFS trend và WMS `GetFeatureInfo`
  - có `fetchPriceTrendData()` gọi WFS `GetFeature` từ `trendLayerName`, parse GeoJSON `features[].properties` và convert số liệu trend sang number
- `frontend/src/utils/bdsFilters.js`
  - normalize text, parse number, map loại BĐS, lọc theo loại/quận huyện/giá/đơn giá/diện tích và lọc theo bán kính POI
  - có helper `isValidBdsRecord()`, `getBdsRecordId()` và fallback `INVALID_BDS_IDS = new Set([1132, 2111])` để loại dữ liệu QA sai tọa độ khỏi toàn bộ luồng frontend khi WFS chưa expose `location_status`
- `frontend/src/utils/bdsStats.js`
  - helper tính thống kê dashboard tổng quan từ danh sách BĐS frontend đã có
  - tính tổng số BĐS, giá trung vị/trung bình theo m², diện tích trung vị, top loại BĐS, top quận/huyện, khu vực có median giá/m² cao nhất và phân bố số lượng theo loại
  - có `buildDistrictComparisonStats()` để gom thống kê theo quận/huyện cho `DistrictComparison`, chuẩn hóa mềm biến thể như `Quận Cầu Giấy`/`Cầu Giấy` và `Huyện Đông Anh`/`Đông Anh`
  - có `buildBdsFilterSummary()` để cấp số liệu cho box tóm tắt kết quả trong `FilterPanel`
  - bỏ qua dữ liệu thiếu/null/không parse được khi tính median/average
- `frontend/src/utils/geometry.js`
  - lấy tọa độ Leaflet từ GeoJSON/properties, validate tọa độ và tính khoảng cách bằng Leaflet `distanceTo`
- `frontend/src/utils/formatters.js`
  - format giá, diện tích, đơn giá, số tiếng Việt và chuỗi hiển thị trong UI/popup/dashboard/filter summary
- `frontend/src/styles/appStyles.js`
  - CSS chính cho sidebar, panel, filter summary, POI list, basemap switcher, dashboard thống kê, `DistrictComparison`, trend chart/card và responsive UI Glassmorphism
- `frontend/src/index.css`
  - import font Inter và setup viewport full-screen
- `frontend/package.json`
  - scripts chạy/lint/build và dependencies frontend/mapping/chart, gồm `recharts`
- `frontend/package-lock.json`
  - lockfile dependency frontend, hiện có `recharts` `3.8.1`
- `frontend/vite.config.js`
  - Vite React plugin, chưa có proxy hoặc env config
- `data/DoAn_WebGIS_HaNoi.qgz`
  - QGIS project chính, liên kết PostGIS và nhiều nguồn layer
- `data/duong_giao_thong_hanoi.gpkg`
  - layer đường đã lọc/chuẩn bị cho Hà Nội
- `data/ranh_gioi_hanoi.gpkg`
  - layer ranh giới hành chính
- `data/hanoi_pois_vip.geojson`
  - POI đã merge/lọc cho ứng dụng
- `data/Heatmap_BDS_HaNoi.tif`, `data/IDW_BDS_HaNoi.tif`
  - raster phân tích không gian được publish qua GeoServer

## Lệnh chạy project

Trong `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

Ứng dụng frontend mặc định của Vite thường chạy tại `http://localhost:5173`.

`README.md` là tài liệu tổng quan/chạy nhanh. `SETUP.md` là tài liệu setup chi tiết để dựng lại GeoServer/PostGIS, dữ liệu GIS/raster, layer cần publish, CORS, backup/restore database và checklist tái lập môi trường.

Điều kiện runtime ngoài frontend:

- GeoServer phải chạy tại `http://localhost:8080`.
- GeoServer cần có workspace `doan_webgis`.
- Các layer trong `frontend/src/config/geoserver.js` phải tồn tại và publish đúng tên.
- GeoServer cần cấu hình raster store Heatmap/IDW trỏ đúng tới file GeoTIFF trong path hiện tại:
  - `file:///D:/webgis_hanoi/data/Heatmap_BDS_HaNoi.tif`
  - `file:///D:/webgis_hanoi/data/IDW_BDS_HaNoi.tif`
- Nếu GeoServer đọc từ PostGIS, PostgreSQL/PostGIS cần có database `webgis_bds_hanoi`, bảng `public.bds_hanoi_real_data`, bảng trend `public.bds_price_trend_mock` và view `public.v_bds_price_trend_mock_geom`.
- Có thể restore phần PostGIS từ `database/webgis_bds_hanoi_full.backup` bằng pgAdmin Restore nếu cần dựng trên máy khác.
- WFS/WMS cần cho phép CORS để frontend Vite gọi từ browser.

## Lỗi, rủi ro và TODO còn tồn tại

- Không có backend source trong repo; frontend phụ thuộc trực tiếp vào GeoServer localhost và layer name hard-code.
- Không có `.env` hoặc config theo môi trường cho GeoServer URL/layer names.
- Không có script setup GeoServer, publish layers hoặc style SLD. Việc dựng lại GeoServer/raster/CORS vẫn phụ thuộc vào thao tác thủ công/QGIS.
- Đã có SQL setup riêng cho dữ liệu trend mock tại `database/create_price_trend_mock.sql` và có full backup `database/webgis_bds_hanoi_full.backup`, giúp giảm rủi ro thiếu database PostGIS khi dựng trên máy khác.
- Full database backup chỉ xử lý phần PostGIS; vẫn còn rủi ro GeoServer workspace/layer/raster store/CORS phải cấu hình thủ công theo `SETUP.md`.
- `data/` đang bị ignore ở root `.gitignore`; nếu clone repo từ Git có thể thiếu toàn bộ dữ liệu GIS.
- Heatmap/IDW phụ thuộc vào GeoServer raster store. Lỗi không hiển thị trước đây đã được khắc phục sau khi sửa raster store từ path cũ có dấu sang path hiện tại:
  - `file:///D:/webgis_hanoi/data/Heatmap_BDS_HaNoi.tif`
  - `file:///D:/webgis_hanoi/data/IDW_BDS_HaNoi.tif`
- Bài học môi trường: không nên publish GeoTIFF từ đường dẫn có tiếng Việt/dấu/ký tự đặc biệt như `D:\Đồ án` vì GeoServer/Java/QGIS/GDAL/CLI có thể lỗi encoding hoặc không đọc được file raster. Nên giữ repo/raster store ở path ASCII không dấu như `D:\webgis_hanoi`.
- Nếu Heatmap/IDW không hiển thị nhưng WMS request vẫn trả HTTP 200, cần kiểm tra body response có phải XML `ServiceExceptionReport` thay vì ảnh PNG không. Lỗi lịch sử từng khoanh vùng là GeoServer không tạo được raster reader do store trỏ tới path cũ có dấu.
- `frontend/dist/` đang tồn tại và có nhiều bundle JS/CSS build cũ; thường nên ignore build output nếu không có lý do deploy tĩnh trực tiếp.
- `README.md` ở root đã là README chính mô tả project thật; `frontend/README.md` hiện không còn tồn tại.
- Dashboard thống kê BĐS tổng quan cơ bản đã có và tự phản ánh theo `filteredBDS`; có thể polish thêm UI hoặc mở rộng chỉ số nếu cần cho báo cáo.
- Bộ lọc BĐS đã đủ tốt cho demo/bảo vệ mức tạm ổn, gồm loại, quận/huyện, giá, đơn giá/m², diện tích và bán kính POI, nhưng vẫn là client-side nên có thể chậm nếu dữ liệu WFS lớn.
- So sánh giá theo quận/huyện đã có trong `DistrictComparison` và tự phản ánh theo `filteredBDS`; có thể polish thêm UI/QA trình diễn sau nhưng không còn là blocker chức năng.
- Chưa có Choropleth giá trung bình/trung vị theo quận/huyện.
- Đã có cơ chế frontend cơ bản để loại bản ghi BĐS có `location_status = invalid_location` khỏi marker/filter/dashboard/thống kê/so sánh quận huyện; fallback tạm thời theo `id_0` `1132`, `2111` vẫn giữ để phòng trường hợp WFS chưa expose cột QA mới.
- Vẫn còn TODO QA dữ liệu vị trí hàng loạt sau: chưa tự động cập nhật các candidate nghi vấn như nhóm `ward_mismatch_review` nếu chưa review thủ công, vì có thể chịu ảnh hưởng bởi dữ liệu ranh giới hoặc thay đổi/sáp nhập hành chính.
- Dữ liệu xu hướng hiện là mock/tổng hợp có kiểm soát, cần ghi rõ trong báo cáo và không trình bày như dữ liệu thị trường thật.
- Layer trend dùng geometry giả để publish qua GeoServer; frontend chỉ dùng `properties`.
- SQL tạo `bds_price_trend_mock` và `v_bds_price_trend_mock_geom` đã được version hóa ở mức riêng cho trend mock trong `database/create_price_trend_mock.sql`; phần setup tổng thể cho PostGIS/GeoServer/raster store vẫn chưa tự động hóa đầy đủ.
- Error handling ở nhiều luồng cũ vẫn chủ yếu `console.error` và set mảng rỗng; riêng `TrendChart` đã có trạng thái loading/error trong UI.
- WFS load toàn bộ BĐS/POI rồi filter client-side; với dữ liệu lớn có thể chậm. Nên cân nhắc filter server-side qua WFS CQL/filter hoặc API trung gian nếu mở rộng quy mô dữ liệu.
- `GetFeatureInfo` chỉ lấy `features?.[0]`; nếu nhiều feature trùng vị trí sẽ bỏ qua các feature còn lại.
- Có datasource absolute/outside-repo trong QGIS project (`C:/Users/Dinh Tung/...`, `../Công việc/...`, temp processing output), làm project khó reproducible trên máy khác.
- Chưa thấy test tự động cho helper filter/geometry hoặc smoke test frontend.
- Đã có `SETUP.md` cho setup thủ công GeoServer/PostGIS/data/raster/layer/CORS, nhưng chưa có script tự động deploy/cấu hình GeoServer/PostGIS/SLD.

## Nhật ký tiến độ / Agent Memory

### 2026-05-25 - Bổ sung tài liệu setup và backup database

- README chính đã được cập nhật để hướng dẫn chạy project rõ hơn, ghi rõ frontend chạy tại `http://localhost:5173`, phụ thuộc GeoServer local `http://localhost:8080/geoserver/doan_webgis` và có liên kết sang `SETUP.md`.
- Đã tạo `SETUP.md` ở root repo để hướng dẫn dựng môi trường đầy đủ cho WebGIS BĐS Hà Nội: vai trò frontend React/Vite, PostgreSQL/PostGIS, GeoServer local, workspace `doan_webgis`, layer cần publish, WMS/WFS, CORS, raster store Heatmap/IDW, lỗi thường gặp và checklist trước khi gửi repo.
- Đã chuẩn hóa hướng dẫn backup full database `webgis_bds_hanoi` bằng pgAdmin Custom backup, file chuẩn `database/webgis_bds_hanoi_full.backup`.
- Đã ghi rõ file backup giúp restore phần PostGIS trên máy khác nhưng không thay thế cấu hình GeoServer workspace/layer/raster store/CORS.
- Đã kiểm tra thực tế có file `database/webgis_bds_hanoi_full.backup` trong workspace.
- Không sửa source frontend, không đổi endpoint GeoServer, không đổi tên layer, không commit/push.
- Kiểm tra đã chạy trong lượt cập nhật tài liệu: đọc tài liệu nền, kiểm tra tồn tại/dung lượng file backup, `git status`, `git diff -- SETUP.md PROJECT_CONTEXT.md README.md`.

### 2026-05-25 - Bổ sung README chính và SQL setup dữ liệu trend mock

- README chính của repo `README.md` đã được viết/cập nhật để mô tả đồ án WebGIS BĐS Hà Nội, phạm vi sản phẩm, chức năng, stack, cách chạy, layer GeoServer, dữ liệu trend mock và giới hạn dữ liệu/môi trường.
- Đã tạo `database/create_price_trend_mock.sql`.
- File SQL tạo lại `public.bds_price_trend_mock`, insert 24 dòng trend mock, tạo index theo `thang` và `loai_bds`, rồi tạo `public.v_bds_price_trend_mock_geom`.
- Đã xử lý lỗi phụ thuộc view `public.v_bds_price_trend_mock` khi drop table bằng cách drop view này trước nếu tồn tại.
- Đã bổ sung `thang_label` vào view để khớp schema GeoServer/frontend hiện tại.
- Đã test SQL bằng transaction `BEGIN`/`ROLLBACK` trong pgAdmin và chạy thật thành công.
- Đã test GeoServer WFS layer `doan_webgis:v_bds_price_trend_mock_geom` trả GeoJSON hợp lệ với 24 features.
- `npm run lint` pass.
- `npm run build` pass, còn warning Vite chunk `>500kB` như trước.
- Không commit/push vì người dùng chưa yêu cầu.

### 2026-05-14 - Cập nhật tiến độ đồ án

Các việc đã hoàn thành:
- Ôn lại Git/GitHub và đã đẩy được đồ án lên GitHub.
- Refactor `frontend/src/App.jsx`: tách bớt chức năng ra các folder/file riêng để code dễ quản lý hơn.
- Tách CSS/logic UI ra khỏi file lớn ban đầu, tổ chức lại cấu trúc frontend rõ ràng hơn.
- Sửa lỗi font chữ bị mã hoá sai trong code, ví dụ các chuỗi tiếng Việt từng bị mojibake.
- Sửa lỗi font chữ hiển thị trên UI/UX, đảm bảo tiếng Việt hiển thị đúng.
- Comment code để dễ đọc, dễ bảo trì và dễ giải thích khi bảo vệ đồ án.
- Chỉnh sửa database bảng `bds_hanoi_real_data` để hỗ trợ dữ liệu giá bất động sản theo mốc thời gian từ 12/2025 đến 05/2026.
- Đã thêm/cập nhật các trường mock thời gian và giá như `posted_date_mock`, `gia_trieu_goc`, `gia_m2_trieu_goc`, `gia_trieu_mock`, `gia_m2_trieu_mock` nếu chúng đã tồn tại hoặc cần dùng cho phân tích xu hướng giá.

Trạng thái hiện tại:
- Project đã có nền tảng dữ liệu thời gian để làm chức năng phân tích xu hướng giá BĐS.
- Frontend đã được refactor tốt hơn so với bản `App.jsx` nguyên khối ban đầu.
- UI đã sửa được lỗi font tiếng Việt.
- Git/GitHub đã được thiết lập để lưu tiến độ đồ án.

Hướng phát triển tiếp theo:
- Commit/push mốc hoàn thành TrendChart nếu người dùng yêu cầu.
- Làm dashboard thống kê tổng quan: tổng số BĐS, giá trung vị/m², giá trung bình/m², diện tích trung vị, phân bố theo loại BĐS.
- Làm so sánh giá theo quận/huyện.
- Làm Choropleth giá trung vị theo quận/huyện.
- Có thể thêm bộ lọc trong `TrendChart` theo loại BĐS hoặc bật/tắt từng line.
- Có thể thêm mô tả phương pháp mock data vào README hoặc báo cáo.
- SQL tạo bảng/view trend mock đã được version hóa trong `database/create_price_trend_mock.sql`; nếu cần reproducible hơn, có thể tiếp tục bổ sung migration/setup cho toàn bộ database và GeoServer.
- Khi sửa code tiếp theo, ưu tiên giữ kiến trúc đã refactor, không gom toàn bộ logic ngược lại vào `App.jsx`.

### 2026-05-16 - Đồng bộ lại cấu trúc repo sau refactor

- Đã rà soát lại cấu trúc thư mục thực tế của repo.
- Đã cập nhật `PROJECT_CONTEXT.md` để phản ánh kiến trúc frontend sau refactor.
- `App.jsx` không còn được mô tả là file nguyên khối chứa toàn bộ logic.
- Cấu trúc mới ưu tiên tách component, config, service, utils và styles.
- Các lần Codex sau phải dựa trên cấu trúc mới này, không được gom logic ngược lại vào `App.jsx`.

### 2026-05-16 - Hoàn thành chức năng Xu hướng giá BĐS

- Xác nhận dữ liệu gốc `bds_hanoi_real_data` thiếu trường thời gian đăng tin thật.
- Đã thử hướng mock record-level bằng `posted_date_mock`/`gia_m2_trieu_mock`, nhưng dữ liệu theo tháng bị nhiễu do outlier và cơ cấu mẫu random.
- Đã chuyển sang hướng phù hợp hơn cho dashboard: tạo bảng tổng hợp `bds_price_trend_mock`.
- Dữ liệu trend mô phỏng theo kịch bản thị trường phân hóa:
  - Chung cư neo cao/tăng đến Q1 rồi chững nhẹ.
  - Đất nền giảm dần.
  - Nhà riêng đi ngang rồi giảm nhẹ.
  - Biệt thự phân hóa, dao động nhẹ.
- Đã tạo view `v_bds_price_trend_mock_geom` có geom giả để publish trên GeoServer.
- Đã publish GeoServer layer `doan_webgis:v_bds_price_trend_mock_geom`.
- Đã cài Recharts và thêm dependency `recharts` vào `frontend/package.json`/`frontend/package-lock.json`.
- Đã thêm `frontend/src/components/TrendChart.jsx`.
- Đã thêm `trendLayerName` vào `frontend/src/config/geoserver.js`.
- Đã thêm `fetchPriceTrendData()` vào `frontend/src/services/geoserverApi.js`.
- Đã gắn `TrendChart` vào `Sidebar` trong menu `Thống kê BĐS`.
- Đã thêm style chart trong `frontend/src/styles/appStyles.js`.
- Đã cleanup nhỏ `App.jsx`, `BdsPopup.jsx`, `PoiRadiusLayer.jsx` và tách `popupStyles.js` để lint pass.
- `npm run lint` pass.
- `npm run build` pass.
- Playwright/manual test: mở app, vào menu `Thống kê BĐS`, chart render được trên desktop/mobile, console không có error/warning.
- Không commit/push vì người dùng chưa yêu cầu.

### 2026-05-21 - Đổi path repo và khắc phục Heatmap/IDW

- Đã đổi repo từ `D:\Đồ án` sang `D:\webgis_hanoi` để tránh lỗi encoding.
- Git hoạt động bình thường ở path mới.
- Frontend chạy bình thường ở path mới.
- Marker BĐS hiển thị khi GeoServer chạy.
- Phát hiện Heatmap/IDW không hiển thị do GeoServer store vẫn trỏ tới đường dẫn cũ có dấu.
- Sửa GeoServer raster store IDW sang `file:///D:/webgis_hanoi/data/IDW_BDS_HaNoi.tif`.
- Sửa GeoServer raster store Heatmap sang `file:///D:/webgis_hanoi/data/Heatmap_BDS_HaNoi.tif`.
- IDW và Heatmap đã hiển thị lại trên frontend.
- `npm run lint` pass.
- `npm run build` pass.

### 2026-05-21 - Hoàn thành Dashboard thống kê tổng quan BĐS

- Đã thêm `frontend/src/components/StatsDashboard.jsx`.
- Đã thêm `frontend/src/utils/bdsStats.js`.
- Đã gắn `StatsDashboard` vào `Sidebar` trong tab `Thống kê BĐS`, đặt trước `TrendChart`.
- Dashboard dùng `filteredBDS` từ `App.jsx` nên số liệu thay đổi theo bộ lọc loại, giá, diện tích và bán kính POI.
- Dashboard không tự fetch GeoServer, không thêm layer mới, không sửa database/PostGIS.
- Dashboard hiển thị tổng số BĐS, giá trung vị/m², giá trung bình/m², diện tích trung vị, loại phổ biến nhất, quận/huyện nhiều nhất, khu vực có giá trung vị/m² cao nhất nếu đủ dữ liệu, và phân bố số lượng theo loại BĐS.
- Đã kiểm tra/sửa tiếng Việt UTF-8 để tránh mojibake.
- `npm run lint` pass.
- `npm run build` pass.
- Vite có warning chunk `>500kB` nhưng build vẫn thành công, chưa cần xử lý ngay.

### 2026-05-23 - Hoàn thành So sánh giá theo quận/huyện

- Đã thêm `frontend/src/components/DistrictComparison.jsx`.
- Đã mở rộng `frontend/src/utils/bdsStats.js` với `buildDistrictComparisonStats()` để tính thống kê theo quận/huyện từ `bdsItems` đã lọc, không fetch thêm GeoServer.
- Đã gắn `DistrictComparison` vào tab `Thống kê BĐS` theo thứ tự `StatsDashboard` → `DistrictComparison` → `TrendChart`.
- `DistrictComparison` dùng dữ liệu `filteredBDS` từ `App.jsx` qua `Sidebar`, nên số liệu thay đổi theo filter loại BĐS, khoảng giá, diện tích và bán kính POI.
- Đã thêm filter nội bộ cho so sánh quận/huyện:
  - chọn quận/huyện bằng pill
  - chọn chỉ số chính: giá trung vị/m², giá trung bình/m², số lượng tin, diện tích trung vị
  - chọn sắp xếp: cao đến thấp, thấp đến cao, tên A-Z
  - chọn số lượng hiển thị: Top 5, Top 10, Tất cả
- Danh sách quận/huyện được lấy động từ dữ liệu BĐS hiện tại, không còn hard-code 5 quận cố định; vẫn ưu tiên Cầu Giấy, Hà Đông, Nam Từ Liêm, Đông Anh, Hoài Đức để demo/phân tích.
- Pipeline render cuối cùng: `allDistrictStats` → `candidateDistrictStats` → `sortedDistrictStats` → `visibleDistrictStats`; JSX render card từ `visibleDistrictStats`, `displayLimit` apply sau khi lọc và sắp xếp.
- Đã sửa bug dropdown `Hiển thị` để Top 5/Top 10/Tất cả hoạt động đúng cả khi không chọn pill và khi đã chọn nhiều quận/huyện.
- Đã thêm style liên quan trong `frontend/src/styles/appStyles.js`, giữ phong cách Glassmorphism và gọn trong sidebar.
- `npm run lint` pass.
- `npm run build` pass.
- Vite còn warning chunk `>500kB` nhưng build thành công, chưa xử lý.
- Không commit/push vì người dùng chưa yêu cầu.

### 2026-05-24 - Hoàn thành nâng cấp lọc BĐS và QA vị trí

- Đã nâng cấp bộ lọc BĐS: thêm lọc theo quận/huyện, thêm lọc theo đơn giá/m² và giữ các filter loại, giá, diện tích, bán kính POI hiện có.
- Đã thêm box tóm tắt kết quả lọc trong `FilterPanel`, hiển thị số lượng BĐS đang lọc/tổng số, giá trung vị/m², giá trung bình/m², quận/huyện nhiều nhất và loại phổ biến nhất.
- Bộ lọc vẫn chạy client-side trên dữ liệu BĐS đã tải từ WFS; `StatsDashboard` và `DistrictComparison` tiếp tục nhận `filteredBDS` nên tự phản ánh theo bộ lọc mới.
- Database đã có các cột QA `location_status`, `qa_note`, `geom_original` trong `public.bds_hanoi_real_data`.
- Đã xác minh và đánh dấu `location_status = invalid_location` cho 2 bản ghi sai tọa độ Cầu Giấy/Nghĩa Đô: `id_0 = 1132` và `id_0 = 2111`.
- Frontend đã loại bản ghi `invalid_location` khỏi marker cluster, kết quả filter, dashboard thống kê, so sánh quận/huyện và popup click map từ WMS `GetFeatureInfo`.
- Đã thêm fallback frontend theo `id_0` `1132`, `2111` trong `INVALID_BDS_IDS` để phòng trường hợp WFS chưa expose `location_status`.
- Không xử lý hàng loạt 381 bản ghi `ward_mismatch_review`; nhóm này để lại cho bước QA dữ liệu vị trí thủ công sau.
- Popup BĐS đã thêm dòng `Mã dữ liệu` để hỗ trợ debug/rà soát data.
- Popup BĐS đã ẩn title/tin rao crawl từ web, chỉ giữ thông tin phân tích cần thiết như mã dữ liệu, loại BĐS, khu vực, giá, diện tích và đơn giá.
- Sau khi loại invalid location, 2 điểm BĐS Cầu Giấy/Nghĩa Đô bị lạc tọa độ không còn hiển thị khi lọc Cầu Giấy; bộ lọc Cầu Giấy ổn hơn cho demo/bảo vệ.
- `npm run lint` pass.
- `npm run build` pass.
- Vite còn warning chunk `>500kB` nhưng build thành công, chưa xử lý.

## Ghi chú kiểm tra

Path làm việc hiện tại của repo là `D:/webgis_hanoi`.

Ở lần rà soát cũ và lần cập nhật context ngày 2026-05-16, Git từng báo `dubious ownership` với thư mục `D:/Đồ án` khi chạy trực tiếp `git status`/`git diff`. Đây chỉ là ghi chú lịch sử trước khi đổi path. Nếu sau này Git báo `dubious ownership` ở path mới, có thể kiểm tra một lần bằng `git -c safe.directory='D:/webgis_hanoi' ...` hoặc cấu hình safe.directory cho `D:/webgis_hanoi` nếu thật sự cần.

Máy không có `ogrinfo`, `gdalinfo`, `sqlite3` CLI trong PATH. Metadata GIS ở trên được đọc bằng Python stdlib/Pillow và XML trong QGIS project, nên đủ để mô tả repo nhưng chưa thay thế được một báo cáo GDAL đầy đủ.
