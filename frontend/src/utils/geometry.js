import L from 'leaflet';

// Helper GIS nhỏ cho frontend: đọc tọa độ GeoJSON/properties và tính khoảng cách bằng Leaflet.
function parseCoordinateNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(String(value).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(number) ? number : null;
}

export function isValidCoordinate(lat, lng) {
  // Kiểm tra tọa độ trước khi đưa vào Leaflet để tránh marker lỗi hoặc bay ra ngoài bản đồ.
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function getFeatureLatLng(feature = {}) {
  const { geometry, properties = {} } = feature;

  if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates)) {
    // GeoJSON lưu tọa độ theo [lng, lat], còn Leaflet nhận [lat, lng].
    const [lng, lat] = geometry.coordinates.map(Number);
    return isValidCoordinate(lat, lng) ? [lat, lng] : null;
  }

  if (geometry?.type === 'MultiPoint' && Array.isArray(geometry.coordinates?.[0])) {
    // Với MultiPoint chỉ lấy điểm đầu tiên vì dữ liệu BĐS/POI cần một vị trí đại diện.
    const [lng, lat] = geometry.coordinates[0].map(Number);
    return isValidCoordinate(lat, lng) ? [lat, lng] : null;
  }

  // Fallback cho trường hợp GeoServer trả tọa độ trong properties thay vì geometry chuẩn.
  const lat = parseCoordinateNumber(properties.lat ?? properties.latitude ?? properties.vi_do);
  const lng = parseCoordinateNumber(properties.lng ?? properties.lon ?? properties.longitude ?? properties.kinh_do);

  return isValidCoordinate(lat, lng) ? [lat, lng] : null;
}

export function distanceBetweenLatLng(firstPosition, secondPosition) {
  if (!firstPosition || !secondPosition) {
    return Number.POSITIVE_INFINITY;
  }

  const [firstLat, firstLng] = firstPosition.map(Number);
  const [secondLat, secondLng] = secondPosition.map(Number);

  if (!isValidCoordinate(firstLat, firstLng) || !isValidCoordinate(secondLat, secondLng)) {
    return Number.POSITIVE_INFINITY;
  }

  // Dùng distanceTo của Leaflet để tính khoảng cách theo mét giữa POI và điểm BĐS.
  return L.latLng(firstLat, firstLng).distanceTo(L.latLng(secondLat, secondLng));
}
