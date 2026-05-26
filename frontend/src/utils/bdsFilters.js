import { distanceBetweenLatLng } from './geometry';

// Helper filter BĐS: chuẩn hóa text/số, loại bản ghi lỗi vị trí và áp điều kiện thuộc tính + POI.
export const allDistrictFilterValue = '__all_districts__';
export const allDistrictFilterLabel = 'Tất cả quận/huyện';

// Fallback cho các bản ghi QA đã xác minh sai tọa độ, dùng khi WFS chưa expose location_status.
export const INVALID_BDS_IDS = new Set([1132, 2111, 131363616]);

export const loaiBdsMap = {
  nha_rieng: 'Nhà riêng',
  can_ho: 'Căn hộ chung cư',
  nha_mat_pho: 'Nhà mặt phố',
  nha_neng: 'Nhà nền / Đất nền',
  biet_thu: 'Biệt thự',
};

const filterTypePatterns = {
  'Nhà đất': ['nha dat', 'nha rieng', 'nha mat pho', 'biet thu'],
  'Chung cư': ['chung cu', 'can ho'],
  'Đất nền': ['dat nen', 'nha nen', 'nha neng'],
  'Mặt bằng': ['mat bang'],
};

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();
}

export function parseNumber(value) {
  // Giữ nguyên cách parse số hiện tại vì dữ liệu nguồn có thể lẫn dấu phẩy và đơn vị.
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(String(value).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(number) ? number : null;
}

function getBdsProperties(record = {}) {
  if (record?.properties && typeof record.properties === 'object') {
    return record.properties;
  }

  return record ?? {};
}

export function getBdsRecordId(record = {}) {
  // ID có thể nằm ở feature id hoặc properties; fallback này giúp loại đúng bản ghi invalid_location.
  const properties = getBdsProperties(record);
  const rawId = properties.id_0 ?? properties.id ?? record?.id_0 ?? record?.id;

  if (rawId === null || rawId === undefined || rawId === '') {
    return null;
  }

  const numericId = Number(rawId);
  if (Number.isInteger(numericId)) {
    return numericId;
  }

  const trailingNumericId = String(rawId).trim().match(/(?:^|[^\d])(\d+)$/);
  return trailingNumericId ? Number(trailingNumericId[1]) : rawId;
}

export function isValidBdsRecord(record = {}) {
  if (!record) {
    return false;
  }

  const properties = getBdsProperties(record);
  const locationStatus = String(properties.location_status ?? '').trim().toLowerCase();

  if (locationStatus === 'invalid_location') {
    return false;
  }

  return !INVALID_BDS_IDS.has(getBdsRecordId(record));
}

function getPriceBillion(properties) {
  const priceMillion = parseNumber(properties.gia_trieu);

  if (priceMillion !== null) {
    return priceMillion / 1000;
  }

  return parseNumber(properties.gia_ty ?? properties.gia_ti ?? properties.price_billion);
}

export function getBdsUnitPriceM2(properties = {}) {
  return parseNumber(
    properties.gia_m2_trieu ??
      properties.gia_m2_trieu_mock ??
      properties.gia_m2_trieu_goc ??
      properties.unit_price_m2 ??
      properties.price_m2,
  );
}

export function getBdsDistrictLabel(properties = {}) {
  const district = properties.quan_huyen ?? properties.quan ?? properties.huyen ?? properties.district;
  return String(district ?? '').trim();
}

export function normalizeBdsDistrictName(value) {
  return normalizeText(value)
    .replace(/\b(quan|huyen|thi xa|thanh pho|tp|q|h|tx)\b\.?/g, ' ')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildDistrictFilterOptions(items = []) {
  // Tạo dropdown quận/huyện động từ dữ liệu BĐS hợp lệ để bộ lọc luôn khớp dữ liệu WFS hiện tại.
  const districtMap = new Map();
  const validItems = items.filter(isValidBdsRecord);

  validItems.forEach((item) => {
    const district = getBdsDistrictLabel(item?.properties);
    const districtKey = normalizeBdsDistrictName(district);

    if (!districtKey) {
      return;
    }

    const currentDistrict = districtMap.get(districtKey) ?? {
      value: districtKey,
      label: district,
      count: 0,
    };
    currentDistrict.count += 1;
    districtMap.set(districtKey, currentDistrict);
  });

  return [
    {
      value: allDistrictFilterValue,
      label: allDistrictFilterLabel,
      count: validItems.length,
    },
    ...Array.from(districtMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi')),
  ];
}

function getAreaM2(properties) {
  return parseNumber(properties.dien_tich_m2 ?? properties.area_m2 ?? properties.area);
}

function matchesRange(value, range) {
  const min = parseNumber(range.min);
  const max = parseNumber(range.max);

  if (min === null && max === null) {
    return true;
  }

  if (value === null) {
    return false;
  }

  return (min === null || value >= min) && (max === null || value <= max);
}

function matchesType(properties, selectedType) {
  if (selectedType === 'Tất cả') {
    return true;
  }

  const rawType = properties.loai_bds ?? properties.loai ?? properties.type ?? '';
  // Chuẩn hóa cả mã loại và tên hiển thị để filter chịu được khác biệt dấu/underscore.
  const displayType = loaiBdsMap[rawType] ?? rawType;
  const searchableType = normalizeText(`${rawType} ${displayType}`);
  const patterns = filterTypePatterns[selectedType] ?? [];

  return patterns.some((pattern) => searchableType.includes(pattern));
}

function matchesDistrict(properties, selectedDistrict) {
  if (!selectedDistrict || selectedDistrict === allDistrictFilterValue) {
    return true;
  }

  return normalizeBdsDistrictName(getBdsDistrictLabel(properties)) === selectedDistrict;
}

export function matchesBdsFilters(record, filters) {
  // Lọc BĐS theo các điều kiện người dùng nhập ở sidebar: loại, khu vực, giá, đơn giá và diện tích.
  const properties = getBdsProperties(record);

  return (
    isValidBdsRecord(record) &&
    matchesType(properties, filters.type) &&
    matchesDistrict(properties, filters.district) &&
    matchesRange(getPriceBillion(properties), filters.price) &&
    matchesRange(getBdsUnitPriceM2(properties), filters.unitPrice ?? {}) &&
    matchesRange(getAreaM2(properties), filters.area)
  );
}

export function matchesPoiRadius(position, selectedPoi, radiusMeters) {
  // Nếu chưa chọn POI thì không áp điều kiện bán kính.
  if (!selectedPoi?.position) {
    return true;
  }

  if (!position) {
    return false;
  }

  const radius = Math.max(0, parseNumber(radiusMeters) ?? 0);
  // So khoảng cách từ BĐS đến POI được chọn với bán kính người dùng nhập.
  return distanceBetweenLatLng(position, selectedPoi.position) <= radius;
}

export function filterBdsByAttributeFilters(items, filters) {
  return items.filter((item) => matchesBdsFilters(item, filters));
}

export function filterBdsByPoiRadius(items, selectedPoi, radiusMeters) {
  return items.filter((item) => matchesPoiRadius(item.position, selectedPoi, radiusMeters));
}

export function applyAllBdsFilters(items, filters, selectedPoi, radiusMeters) {
  // Đây là điểm gom toàn bộ điều kiện lọc để App chỉ cần gọi một hàm duy nhất.
  return filterBdsByPoiRadius(filterBdsByAttributeFilters(items, filters), selectedPoi, radiusMeters);
}
