import { formatMillionPerM2 } from '../utils/formatters';

// Panel filter nhận state từ App để người dùng lọc BĐS theo thuộc tính mà không fetch lại dữ liệu.
function formatCount(value) {
  return Number.isFinite(value) ? value.toLocaleString('vi-VN') : '0';
}

function formatTopGroup(group) {
  if (!group) {
    return 'Chưa đủ dữ liệu';
  }

  return `${group.label} (${formatCount(group.count)})`;
}

export default function FilterPanel({
  filterTypeOptions,
  districtFilterOptions,
  filterType,
  filterDistrict,
  filterPrice,
  filterUnitPrice,
  filterArea,
  filterSummary,
  filteredCount,
  totalCount,
  onBack,
  onTypeChange,
  onDistrictChange,
  onPriceChange,
  onUnitPriceChange,
  onAreaChange,
  onApplyFilters,
  onClearFilters,
}) {
  // Panel này là controlled component: state filter và callback đều được truyền từ App xuống.
  const visibleCount = filterSummary?.visibleCount ?? filteredCount;
  const summaryTotalCount = filterSummary?.totalCount ?? totalCount;
  const hasVisibleResults = visibleCount > 0;

  return (
    <div className="sidebar-screen">
      <button className="sidebar-back" type="button" onClick={onBack}>
        ⬅ Quay lại Menu
      </button>

      <div className="filter-panel__header">
        <span className="filter-panel__eyebrow">Lọc BĐS</span>
        <div className="filter-panel__title-row">
          <h2>Bộ lọc BĐS</h2>
          <span className="filter-panel__count">
            {filteredCount}/{totalCount} điểm
          </span>
        </div>
      </div>

      {/* Các input filter BĐS chỉ cập nhật state tạm; nút Áp dụng mới đổi appliedFilters. */}
      <label className="filter-field">
        <span>Loại BĐS</span>
        <select value={filterType} onChange={(event) => onTypeChange(event.target.value)}>
          {filterTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Quận/huyện</span>
        <select value={filterDistrict} onChange={(event) => onDistrictChange(event.target.value)}>
          {(districtFilterOptions ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-field">
        <span>Giá (Tỷ VNĐ)</span>
        <div className="filter-range-row">
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Từ"
            value={filterPrice.min}
            onChange={(event) => onPriceChange('min', event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Đến"
            value={filterPrice.max}
            onChange={(event) => onPriceChange('max', event.target.value)}
          />
        </div>
      </div>

      <div className="filter-field">
        <span>Đơn giá (triệu/m²)</span>
        <div className="filter-range-row">
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Từ"
            value={filterUnitPrice.min}
            onChange={(event) => onUnitPriceChange('min', event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Đến"
            value={filterUnitPrice.max}
            onChange={(event) => onUnitPriceChange('max', event.target.value)}
          />
        </div>
      </div>

      <div className="filter-field">
        <span>Diện tích (m²)</span>
        <div className="filter-range-row">
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Từ"
            value={filterArea.min}
            onChange={(event) => onAreaChange('min', event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Đến"
            value={filterArea.max}
            onChange={(event) => onAreaChange('max', event.target.value)}
          />
        </div>
      </div>

      <div className="filter-summary" aria-label="Tóm tắt kết quả lọc">
        <div className="filter-summary__topline">
          <span>Kết quả lọc</span>
          <strong>
            {formatCount(visibleCount)}/{formatCount(summaryTotalCount)} BĐS
          </strong>
        </div>

        {hasVisibleResults ? (
          <div className="filter-summary__grid">
            <div>
              <span>Trung vị/m²</span>
              <strong>{formatMillionPerM2(filterSummary?.unitPriceMedian)}</strong>
            </div>
            <div>
              <span>Trung bình/m²</span>
              <strong>{formatMillionPerM2(filterSummary?.unitPriceAverage)}</strong>
            </div>
            <div>
              <span>Quận/huyện nhiều nhất</span>
              <strong>{formatTopGroup(filterSummary?.mostCommonDistrict)}</strong>
            </div>
            <div>
              <span>Loại phổ biến nhất</span>
              <strong>{formatTopGroup(filterSummary?.mostCommonType)}</strong>
            </div>
          </div>
        ) : (
          <div className="filter-summary__empty">
            Chưa có BĐS phù hợp. Hãy nới khoảng giá, diện tích hoặc chọn lại khu vực.
          </div>
        )}
      </div>

      <div className="filter-actions">
        <button className="filter-button filter-button--apply" type="button" onClick={onApplyFilters}>
          Áp dụng
        </button>
        <button className="filter-button filter-button--clear" type="button" onClick={onClearFilters}>
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
