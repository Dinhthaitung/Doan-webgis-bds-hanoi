import {
  bdsLayerName,
  geoserverWfsUrl,
  geoserverWmsUrl,
  poisLayerName,
  trendLayerName,
} from '../config/geoserver';

// Service tập trung toàn bộ request GeoServer để component không phải tự ghép URL WFS/WMS.
async function fetchGeoJson(url, params, options = {}, errorPrefix = 'Request failed') {
  const response = await fetch(`${url}?${params.toString()}`, options);

  if (!response.ok) {
    throw new Error(`${errorPrefix} with status ${response.status}`);
  }

  return response.json();
}

export function fetchBdsFeatures(options = {}) {
  // Lấy dữ liệu BĐS qua WFS để frontend tự lọc theo loại, giá, diện tích và POI.
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: bdsLayerName,
    // GeoJSON giúp React/Leaflet xử lý feature trực tiếp mà không cần parse XML/GML.
    outputFormat: 'application/json',
    // EPSG:4326 giữ lat/lng đúng hệ tọa độ quen dùng với Leaflet và dữ liệu GeoJSON.
    srsName: 'EPSG:4326',
  });

  return fetchGeoJson(geoserverWfsUrl, params, options, 'WFS request failed');
}

export function fetchPoiFeatures(options = {}) {
  // Lấy POI qua WFS để search client-side và chọn điểm làm tâm bán kính.
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: poisLayerName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
  });

  return fetchGeoJson(geoserverWfsUrl, params, options, 'POI WFS request failed');
}

function toTrendNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(String(value).replace(',', '.'));

  return Number.isFinite(numericValue) ? numericValue : null;
}

function toMonthLabel(value) {
  if (!value) {
    return '';
  }

  const text = String(value);
  const monthMatch = text.match(/\d{4}-\d{2}/);

  return monthMatch?.[0] ?? text;
}

function normalizeTrendProperties(properties = {}) {
  // Chuẩn hóa properties của layer trend để chart chỉ xử lý field đã biết và giá trị số hợp lệ.
  const thang = toMonthLabel(properties.thang);

  return {
    loai_bds: properties.loai_bds ?? '',
    thang,
    thang_label: properties.thang_label || thang,
    so_luong_tin: toTrendNumber(properties.so_luong_tin),
    gia_m2_trung_vi: toTrendNumber(properties.gia_m2_trung_vi),
    gia_m2_trung_binh: toTrendNumber(properties.gia_m2_trung_binh),
    ghi_chu: properties.ghi_chu ?? '',
  };
}

export async function fetchPriceTrendData(options = {}) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: trendLayerName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
  });

  try {
    const geojson = await fetchGeoJson(
      geoserverWfsUrl,
      params,
      options,
      'Price trend WFS request failed',
    );

    return (geojson.features ?? [])
      .map((feature) => normalizeTrendProperties(feature.properties ?? {}))
      .sort((a, b) => a.thang.localeCompare(b.thang) || a.loai_bds.localeCompare(b.loai_bds));
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      `Không thể tải dữ liệu xu hướng giá từ WFS layer ${trendLayerName}: ${error.message}`,
      { cause: error },
    );
  }
}

export function getBdsFeatureInfo({ bbox, width, height, x, y }, options = {}) {
  // Khi click bản đồ, WMS GetFeatureInfo hỏi GeoServer feature BĐS nằm dưới pixel được click.
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    layers: bdsLayerName,
    query_layers: bdsLayerName,
    info_format: 'application/json',
    // WMS 1.1.1 dùng tham số srs; giữ EPSG:4326 để bbox khớp với bounds của Leaflet.
    srs: 'EPSG:4326',
    bbox,
    width,
    height,
    x,
    y,
  });

  return fetchGeoJson(geoserverWmsUrl, params, options);
}
