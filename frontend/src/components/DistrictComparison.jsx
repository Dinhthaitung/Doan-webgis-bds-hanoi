import { useMemo, useState } from 'react';
import { buildDistrictComparisonStats, normalizeDistrictName } from '../utils/bdsStats';

// Module so sánh quận/huyện dùng chính danh sách BĐS đã lọc từ bản đồ, không gọi thêm GeoServer.
const defaultDistricts = ['Cầu Giấy', 'Hà Đông', 'Nam Từ Liêm', 'Đông Anh', 'Hoài Đức'];

const metricOptions = [
  { key: 'medianPricePerM2', label: 'Giá trung vị/m²', type: 'unitPrice' },
  { key: 'averagePricePerM2', label: 'Giá trung bình/m²', type: 'unitPrice' },
  { key: 'listingCount', label: 'Số lượng tin', type: 'count' },
  { key: 'medianArea', label: 'Diện tích trung vị', type: 'area' },
];

const sortOptions = [
  { key: 'desc', label: 'Cao đến thấp' },
  { key: 'asc', label: 'Thấp đến cao' },
  { key: 'name', label: 'Theo tên A-Z' },
];

const limitOptions = [
  { key: '5', label: 'Top 5' },
  { key: '10', label: 'Top 10' },
  { key: 'all', label: 'Tất cả' },
];

const defaultDistrictKeys = defaultDistricts.map((district) => normalizeDistrictName(district));

function formatNumber(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) {
    return 'Không đủ dữ liệu';
  }

  return value.toLocaleString('vi-VN', {
    maximumFractionDigits,
  });
}

function formatUnitPrice(value) {
  if (!Number.isFinite(value)) {
    return 'Không đủ dữ liệu';
  }

  return `${formatNumber(value)} triệu/m²`;
}

function formatArea(value) {
  if (!Number.isFinite(value)) {
    return 'Không đủ dữ liệu';
  }

  return `${formatNumber(value, 0)} m²`;
}

function formatListingCount(value) {
  if (!Number.isFinite(value)) {
    return 'Không đủ dữ liệu';
  }

  return `${value.toLocaleString('vi-VN')} tin`;
}

function formatCommonType(group) {
  if (!group) {
    return 'Không đủ dữ liệu';
  }

  return group.label;
}

function getMetricOption(metricKey) {
  return metricOptions.find((option) => option.key === metricKey) ?? metricOptions[0];
}

function getMetricValue(district, metricKey) {
  return district?.[metricKey] ?? null;
}

function formatMetricValue(value, metricType) {
  if (metricType === 'count') {
    return formatListingCount(value);
  }

  if (metricType === 'area') {
    return formatArea(value);
  }

  return formatUnitPrice(value);
}

function sortDistrictStats(stats, metricKey, sortMode) {
  // Sắp xếp trên bản sao để không làm đổi thứ tự mảng thống kê gốc từ useMemo.
  const sortedStats = [...stats];

  return sortedStats.sort((a, b) => {
    if (sortMode === 'name') {
      return a.district.localeCompare(b.district, 'vi');
    }

    const firstValue = getMetricValue(a, metricKey);
    const secondValue = getMetricValue(b, metricKey);
    const firstHasValue = Number.isFinite(firstValue);
    const secondHasValue = Number.isFinite(secondValue);

    if (firstHasValue && secondHasValue) {
      return sortMode === 'asc'
        ? firstValue - secondValue || a.district.localeCompare(b.district, 'vi')
        : secondValue - firstValue || a.district.localeCompare(b.district, 'vi');
    }

    if (firstHasValue) {
      return -1;
    }

    if (secondHasValue) {
      return 1;
    }

    return a.district.localeCompare(b.district, 'vi');
  });
}

function limitDistrictStats(stats, limitKey) {
  if (limitKey === 'all') {
    return stats;
  }

  const limit = Number(limitKey);

  if (!Number.isFinite(limit)) {
    return stats;
  }

  return stats.slice(0, limit);
}

export default function DistrictComparison({ bdsItems }) {
  const [selectedMetric, setSelectedMetric] = useState('medianPricePerM2');
  const [sortMode, setSortMode] = useState('desc');
  const [displayLimit, setDisplayLimit] = useState('5');
  const [selectedDistrictKeys, setSelectedDistrictKeys] = useState([]);

  // Pipeline dữ liệu: gom thống kê theo quận/huyện -> lọc theo pill chọn -> sắp xếp -> giới hạn Top N.
  const allDistrictStats = useMemo(() => buildDistrictComparisonStats(bdsItems), [bdsItems]);
  const districtOptions = useMemo(
    () =>
      [...allDistrictStats].sort((a, b) => {
        const firstDefaultIndex = defaultDistrictKeys.indexOf(a.districtKey);
        const secondDefaultIndex = defaultDistrictKeys.indexOf(b.districtKey);
        const firstIsDefault = firstDefaultIndex !== -1;
        const secondIsDefault = secondDefaultIndex !== -1;

        if (firstIsDefault && secondIsDefault) {
          return firstDefaultIndex - secondDefaultIndex;
        }

        if (firstIsDefault) {
          return -1;
        }

        if (secondIsDefault) {
          return 1;
        }

        return a.district.localeCompare(b.district, 'vi');
      }),
    [allDistrictStats],
  );
  const selectedDistrictKeySet = useMemo(() => new Set(selectedDistrictKeys), [selectedDistrictKeys]);
  const candidateDistrictStats = useMemo(
    () =>
      selectedDistrictKeys.length > 0
        ? allDistrictStats.filter((district) => selectedDistrictKeySet.has(district.districtKey))
        : allDistrictStats,
    [allDistrictStats, selectedDistrictKeySet, selectedDistrictKeys.length],
  );
  const sortedDistrictStats = useMemo(
    () => sortDistrictStats(candidateDistrictStats, selectedMetric, sortMode),
    [candidateDistrictStats, selectedMetric, sortMode],
  );
  const visibleDistrictStats = useMemo(
    () => limitDistrictStats(sortedDistrictStats, displayLimit),
    [displayLimit, sortedDistrictStats],
  );
  const metricOption = getMetricOption(selectedMetric);

  const maxMetricValue = Math.max(
    0,
    ...visibleDistrictStats
      .map((district) => getMetricValue(district, selectedMetric))
      .filter((value) => Number.isFinite(value)),
  );

  function handleDistrictToggle(districtKey) {
    setSelectedDistrictKeys((currentDistrictKeys) => {
      const nextSelectedKeys = new Set(currentDistrictKeys);

      if (nextSelectedKeys.has(districtKey)) {
        nextSelectedKeys.delete(districtKey);
      } else {
        nextSelectedKeys.add(districtKey);
      }

      return Array.from(nextSelectedKeys);
    });
  }

  return (
    <section className="district-comparison" aria-label="So sánh giá theo quận huyện">
      <div className="district-comparison__header">
        <h3>So sánh quận/huyện</h3>
        <p>So sánh theo giá trung vị/m², số lượng tin và loại hình phổ biến từ dữ liệu BĐS đang được lọc.</p>
      </div>

      <div className="district-controls" aria-label="Bộ lọc so sánh quận huyện">
        <div className="district-controls__heading">
          <strong>Bộ lọc so sánh</strong>
          <span>{allDistrictStats.length.toLocaleString('vi-VN')} khu vực</span>
        </div>

        <div className="district-control-grid">
          <label className="district-control-field">
            <span>Chỉ số chính</span>
            <select value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value)}>
              {metricOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="district-control-field">
            <span>Sắp xếp</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="district-control-field">
            <span>Hiển thị</span>
            <select value={displayLimit} onChange={(event) => setDisplayLimit(event.target.value)}>
              {limitOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="district-picker" aria-label="Chọn quận huyện để so sánh">
          {allDistrictStats.length === 0 && (
            <div className="district-picker__empty">Không có quận/huyện phù hợp với bộ lọc hiện tại.</div>
          )}

          {districtOptions.map((district) => {
            const isSelected = selectedDistrictKeySet.has(district.districtKey);

            return (
              <button
                className={`district-pill${isSelected ? ' district-pill--active' : ''}`}
                key={district.districtKey}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleDistrictToggle(district.districtKey)}
              >
                <span>{district.district}</span>
                <small>{district.listingCount.toLocaleString('vi-VN')}</small>
              </button>
            );
          })}
        </div>

        <div className="district-result-summary">
          Đang hiển thị {visibleDistrictStats.length.toLocaleString('vi-VN')}/
          {sortedDistrictStats.length.toLocaleString('vi-VN')} khu vực sau khi lọc và sắp xếp.
        </div>
      </div>

      <div className="district-comparison__list">
        {visibleDistrictStats.map((district) => {
          const metricValue = getMetricValue(district, selectedMetric);
          const hasMetricValue = Number.isFinite(metricValue);
          const barWidth = maxMetricValue > 0 && hasMetricValue
            ? Math.max(8, (metricValue / maxMetricValue) * 100)
            : 0;

          return (
            <article className="district-card" key={district.districtKey}>
              <div className="district-card__topline">
                <strong>{district.district}</strong>
                <span>{formatListingCount(district.listingCount)}</span>
              </div>

              <div className="district-card__primary">
                <span>{metricOption.label}</span>
                <strong>{formatMetricValue(metricValue, metricOption.type)}</strong>
              </div>

              <div className="district-card__bar" aria-hidden="true">
                <span style={{ width: `${barWidth}%` }} />
              </div>

              <div className="district-card__grid">
                <div>
                  <span>Giá trung vị/m²</span>
                  <strong>{formatUnitPrice(district.medianPricePerM2)}</strong>
                </div>
                <div>
                  <span>Giá trung bình/m²</span>
                  <strong>{formatUnitPrice(district.averagePricePerM2)}</strong>
                </div>
                <div>
                  <span>Số lượng tin</span>
                  <strong>{formatListingCount(district.listingCount)}</strong>
                </div>
                <div>
                  <span>Diện tích trung vị</span>
                  <strong>{formatArea(district.medianArea)}</strong>
                </div>
                <div className="district-card__wide">
                  <span>Loại phổ biến</span>
                  <strong>{formatCommonType(district.mostCommonType)}</strong>
                </div>
              </div>
            </article>
          );
        })}

        {visibleDistrictStats.length === 0 && (
          <div className="district-empty">Không có dữ liệu quận/huyện để so sánh với bộ lọc hiện tại.</div>
        )}
      </div>
    </section>
  );
}
