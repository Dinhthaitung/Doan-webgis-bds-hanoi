import {
  getBdsDistrictLabel,
  getBdsUnitPriceM2,
  loaiBdsMap,
  normalizeBdsDistrictName,
  normalizeText,
  parseNumber,
} from './bdsFilters';
import { formatString } from './formatters';

// Helper thống kê BĐS: tính median/average/phân bố từ danh sách đã lọc, bỏ qua giá trị thiếu.
const unknownLabel = 'Chưa rõ';

function getProperties(item) {
  return item?.properties ?? {};
}

function getValidNumbers(items, getter) {
  const values = [];

  items.forEach((item) => {
    const value = getter(getProperties(item));

    // Dữ liệu GeoServer có thể thiếu/null hoặc lẫn text; chỉ giữ số parse được để tránh làm sai thống kê.
    if (Number.isFinite(value)) {
      values.push(value);
    }
  });

  return values;
}

function median(values) {
  if (!values.length) {
    return null;
  }

  // Median ít bị kéo lệch bởi outlier giá/diện tích hơn average; sort bản sao để không đổi dữ liệu gốc.
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  }

  return sortedValues[middleIndex];
}

function average(values) {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getAreaM2(properties) {
  return parseNumber(properties.dien_tich_m2 ?? properties.area_m2 ?? properties.area);
}

function getTypeLabel(properties) {
  const rawType = properties.loai_bds ?? properties.loai ?? properties.type;

  if (!rawType) {
    return unknownLabel;
  }

  const mappedType = loaiBdsMap[rawType] ?? rawType;
  return formatString(mappedType);
}

function getDistrictLabel(properties) {
  const district = getBdsDistrictLabel(properties);

  if (!district) {
    return unknownLabel;
  }

  return formatString(district);
}

export function normalizeDistrictName(value) {
  return normalizeBdsDistrictName(value);
}

function countBy(items, getLabel, getKey = normalizeText) {
  // Group theo nhãn đã chuẩn hóa để các biến thể dấu/underscore vẫn được gom cùng một nhóm.
  const groupMap = new Map();

  items.forEach((item) => {
    const label = getLabel(getProperties(item));

    if (!label || label === unknownLabel) {
      return;
    }

    const key = getKey(label);
    const currentGroup = groupMap.get(key) ?? { label, count: 0 };
    currentGroup.count += 1;
    groupMap.set(key, currentGroup);
  });

  return Array.from(groupMap.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'),
  );
}

function getHighestMedianDistrict(items) {
  // Tính median giá/m² trong từng quận/huyện rồi chọn nhóm có median cao nhất.
  const districtMap = new Map();

  items.forEach((item) => {
    const properties = getProperties(item);
    const district = getDistrictLabel(properties);
    const unitPrice = getBdsUnitPriceM2(properties);

    if (!district || district === unknownLabel || !Number.isFinite(unitPrice)) {
      return;
    }

    const key = normalizeDistrictName(district);
    const currentGroup = districtMap.get(key) ?? { label: district, values: [] };
    currentGroup.values.push(unitPrice);
    districtMap.set(key, currentGroup);
  });

  const rankedDistricts = Array.from(districtMap.values())
    .map((group) => ({
      label: group.label,
      count: group.values.length,
      medianPrice: median(group.values),
    }))
    .filter((group) => Number.isFinite(group.medianPrice))
    .sort(
      (a, b) =>
        b.medianPrice - a.medianPrice ||
        b.count - a.count ||
        a.label.localeCompare(b.label, 'vi'),
    );

  return rankedDistricts[0] ?? null;
}

export function buildDistrictComparisonStats(items = [], targetDistricts = []) {
  // Gom BĐS theo quận/huyện rồi tính các chỉ số dùng cho module so sánh khu vực.
  const validItems = Array.isArray(items) ? items.filter((item) => item?.properties) : [];
  const districtGroups = new Map();
  const hasTargetDistricts = targetDistricts.length > 0;

  targetDistricts.forEach((district) => {
    const key = normalizeDistrictName(district);

    if (!key) {
      return;
    }

    districtGroups.set(key, {
      key,
      label: district,
      items: [],
      unitPrices: [],
      areas: [],
      typeCounts: new Map(),
    });
  });

  validItems.forEach((item) => {
    const properties = getProperties(item);
    const district = getDistrictLabel(properties);

    if (!district || district === unknownLabel) {
      return;
    }

    const districtKey = normalizeDistrictName(district);
    let group = districtGroups.get(districtKey);

    if (!group && hasTargetDistricts) {
      return;
    }

    if (!group) {
      group = {
        key: districtKey,
        label: district,
        items: [],
        unitPrices: [],
        areas: [],
        typeCounts: new Map(),
      };
      districtGroups.set(districtKey, group);
    }

    const unitPrice = getBdsUnitPriceM2(properties);
    const area = getAreaM2(properties);
    const typeLabel = getTypeLabel(properties);

    group.items.push(item);

    if (Number.isFinite(unitPrice)) {
      group.unitPrices.push(unitPrice);
    }

    if (Number.isFinite(area)) {
      group.areas.push(area);
    }

    if (typeLabel && typeLabel !== unknownLabel) {
      const typeKey = normalizeText(typeLabel);
      const currentType = group.typeCounts.get(typeKey) ?? { label: typeLabel, count: 0 };
      currentType.count += 1;
      group.typeCounts.set(typeKey, currentType);
    }
  });

  return Array.from(districtGroups.values()).map((group) => {
    const typeDistribution = Array.from(group.typeCounts.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'),
    );
    const unitPriceMedian = median(group.unitPrices);
    const unitPriceAverage = group.unitPrices.length >= 2 ? average(group.unitPrices) : null;
    const areaMedian = median(group.areas);

    return {
      districtKey: group.key,
      district: group.label,
      listingCount: group.items.length,
      unitPriceMedian,
      unitPriceAverage,
      medianPricePerM2: unitPriceMedian,
      averagePricePerM2: unitPriceAverage,
      unitPriceSampleCount: group.unitPrices.length,
      areaMedian,
      medianArea: areaMedian,
      areaSampleCount: group.areas.length,
      mostCommonType: typeDistribution[0] ?? null,
      typeDistribution,
    };
  });
}

export function buildBdsStats(items = []) {
  // Điểm gom logic tính dashboard: component UI chỉ gọi hàm này và render kết quả.
  const validItems = Array.isArray(items) ? items.filter((item) => item?.properties) : [];
  const unitPrices = getValidNumbers(validItems, getBdsUnitPriceM2);
  const areas = getValidNumbers(validItems, getAreaM2);
  const typeDistribution = countBy(validItems, getTypeLabel);
  const districtDistribution = countBy(validItems, getDistrictLabel, normalizeDistrictName);

  return {
    totalCount: validItems.length,
    unitPriceMedian: median(unitPrices),
    unitPriceAverage: average(unitPrices),
    areaMedian: median(areas),
    mostCommonType: typeDistribution[0] ?? null,
    mostCommonDistrict: districtDistribution[0] ?? null,
    highestMedianDistrict: getHighestMedianDistrict(validItems),
    typeDistribution,
  };
}

export function buildBdsFilterSummary(items = [], totalCount = 0) {
  const stats = buildBdsStats(items);

  return {
    visibleCount: stats.totalCount,
    totalCount: Number.isFinite(totalCount) ? totalCount : 0,
    unitPriceMedian: stats.unitPriceMedian,
    unitPriceAverage: stats.unitPriceAverage,
    mostCommonDistrict: stats.mostCommonDistrict,
    mostCommonType: stats.mostCommonType,
  };
}
