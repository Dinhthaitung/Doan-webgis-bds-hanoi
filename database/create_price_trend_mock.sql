-- Migration dữ liệu xu hướng giá mock cho TrendChart.
--
-- Dữ liệu trong bảng public.bds_price_trend_mock là dữ liệu mock có kiểm soát,
-- được tạo vì dữ liệu BĐS gốc thiếu trường thời gian đăng tin thật.
-- Bảng này phục vụ biểu đồ TrendChart trong frontend, không đại diện cho
-- chuỗi thời gian thị trường thật.
--
-- View public.v_bds_price_trend_mock_geom thêm geometry giả chỉ để GeoServer
-- có thể publish WFS/GeoJSON. Frontend chỉ dùng các properties của layer trend
-- để vẽ biểu đồ, không dùng geometry này để phân tích không gian.
--
-- Lưu ý: database cần bật PostGIS trước khi tạo view có geometry.

DROP VIEW IF EXISTS public.v_bds_price_trend_mock_geom;
DROP VIEW IF EXISTS public.v_bds_price_trend_mock;
DROP TABLE IF EXISTS public.bds_price_trend_mock;

CREATE TABLE public.bds_price_trend_mock (
  id SERIAL PRIMARY KEY,
  loai_bds TEXT NOT NULL,
  thang DATE NOT NULL,
  so_luong_tin INTEGER,
  gia_m2_trung_vi NUMERIC,
  gia_m2_trung_binh NUMERIC,
  ghi_chu TEXT
);

INSERT INTO public.bds_price_trend_mock (
  loai_bds,
  thang,
  so_luong_tin,
  gia_m2_trung_vi,
  gia_m2_trung_binh,
  ghi_chu
) VALUES
  ('biet_thu', DATE '2025-12-01', 149, 80.00, 105.00, 'Mock trend biệt thự/liền kề phân hóa'),
  ('chung_cu', DATE '2025-12-01', 376, 225.00, 235.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2025-12-01', 160, 295.00, 315.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2025-12-01', 376, 69.00, 72.00, 'Mock trend nhà riêng đi ngang'),
  ('biet_thu', DATE '2026-01-01', 146, 82.00, 108.00, 'Mock trend biệt thự/liền kề phân hóa'),
  ('chung_cu', DATE '2026-01-01', 366, 230.00, 240.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2026-01-01', 155, 285.00, 305.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2026-01-01', 365, 69.50, 72.50, 'Mock trend nhà riêng đi ngang'),
  ('biet_thu', DATE '2026-02-01', 132, 84.00, 110.00, 'Mock trend biệt thự/liền kề phân hóa'),
  ('chung_cu', DATE '2026-02-01', 357, 236.00, 248.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2026-02-01', 148, 272.00, 292.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2026-02-01', 350, 70.00, 73.00, 'Mock trend nhà riêng đi ngang'),
  ('biet_thu', DATE '2026-03-01', 154, 86.00, 112.00, 'Mock trend biệt thự/liền kề phân hóa'),
  ('chung_cu', DATE '2026-03-01', 382, 242.00, 255.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2026-03-01', 152, 260.00, 280.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2026-03-01', 370, 70.50, 73.50, 'Mock trend nhà riêng đi ngang'),
  ('biet_thu', DATE '2026-04-01', 145, 83.00, 108.00, 'Mock trend biệt thự/liền kề điều chỉnh'),
  ('chung_cu', DATE '2026-04-01', 355, 238.00, 250.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2026-04-01', 145, 248.00, 265.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2026-04-01', 360, 68.50, 71.50, 'Mock trend nhà riêng điều chỉnh nhẹ'),
  ('biet_thu', DATE '2026-05-01', 74, 81.00, 106.00, 'Mock trend biệt thự/liền kề điều chỉnh'),
  ('chung_cu', DATE '2026-05-01', 172, 234.00, 246.00, 'Mock trend theo kịch bản thị trường phân hóa'),
  ('dat_nen', DATE '2026-05-01', 70, 235.00, 250.00, 'Mock trend theo kịch bản đất nền điều chỉnh'),
  ('nha_rieng', DATE '2026-05-01', 175, 67.00, 70.00, 'Mock trend nhà riêng điều chỉnh nhẹ');

CREATE INDEX idx_bds_price_trend_mock_thang
  ON public.bds_price_trend_mock (thang);

CREATE INDEX idx_bds_price_trend_mock_loai_bds
  ON public.bds_price_trend_mock (loai_bds);

CREATE VIEW public.v_bds_price_trend_mock_geom AS
SELECT
  id,
  loai_bds,
  thang,
  to_char(thang, 'MM/YYYY') AS thang_label,
  so_luong_tin,
  gia_m2_trung_vi,
  gia_m2_trung_binh,
  ghi_chu,
  ST_SetSRID(ST_MakePoint(105.8542, 21.0285), 4326)::geometry(Point, 4326) AS geom
FROM public.bds_price_trend_mock;