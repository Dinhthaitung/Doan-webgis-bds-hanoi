import { formatString } from '../utils/formatters';

// Panel tìm POI client-side; App giữ state để đồng bộ kết quả tìm kiếm với bán kính trên bản đồ.
export default function PoiSearchPanel({
  poiResults,
  poiTotal,
  selectedPoi,
  radius,
  activeRadius,
  poiSearchInput,
  filteredBdsCount,
  onBack,
  onRadiusChange,
  onSearchChange,
  onSelectPoi,
  onClearSelectedPoi,
  getPoiName,
  getPoiCategory,
  getPoiAddress,
}) {
  // Search POI xử lý client-side từ dữ liệu App truyền xuống; chỉ render 50 kết quả để sidebar không lag.
  const visiblePoiData = poiResults.slice(0, 50);

  return (
    <div className="sidebar-screen">
      <button className="sidebar-back" type="button" onClick={onBack}>
        ⬅ Quay lại Menu
      </button>

      <div className="filter-panel__header">
        <span className="filter-panel__eyebrow">Bán kính POI</span>
        <div className="filter-panel__title-row">
          <h2>Tìm kiếm xung quanh</h2>
          <span className="filter-panel__count">
            {visiblePoiData.length}/{poiTotal} POI
          </span>
        </div>
      </div>

      <div className="poi-controls">
        <label className="filter-field">
          <span>Bán kính (m)</span>
          <input
            type="number"
            min="0"
            step="100"
            value={radius}
            onChange={(event) => onRadiusChange(event.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>Tìm kiếm POI</span>
          <input
            type="search"
            placeholder="Nhập tên hoặc loại POI"
            value={poiSearchInput}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>

      {selectedPoi && (
        <div className="poi-selected-card">
          <span className="poi-selected-card__title">{getPoiName(selectedPoi.properties)}</span>
          <span className="poi-selected-card__meta">
            Bán kính lọc: {activeRadius.toLocaleString('vi-VN')} m
          </span>
          <button className="poi-clear-button" type="button" onClick={onClearSelectedPoi}>
            Xóa chọn
          </button>
        </div>
      )}

      <div className="poi-selected-card">
        <span className="poi-selected-card__meta">
          Tìm thấy {filteredBdsCount} bất động sản trong bán kính {activeRadius}m
        </span>
      </div>

      <div className="poi-summary">
        <span>Danh sách POI</span>
        <span>{visiblePoiData.length} kết quả</span>
      </div>

      <div className="poi-list">
        {visiblePoiData.length > 0 ? (
          visiblePoiData.map((poi) => {
            const poiName = getPoiName(poi.properties);
            const poiMeta = [formatString(getPoiCategory(poi.properties)), getPoiAddress(poi.properties)]
              .filter(Boolean)
              .join(' • ');

            // Callback chọn POI được xử lý ở App để đồng bộ marker, radius và danh sách BĐS.
            return (
              <button
                className={`poi-item${selectedPoi?.id === poi.id ? ' poi-item--selected' : ''}`}
                key={poi.id}
                type="button"
                onClick={() => onSelectPoi(poi)}
              >
                <span className="poi-item__icon" aria-hidden="true">📍</span>
                <span className="poi-item__content">
                  <span className="poi-item__title">{poiName}</span>
                  <span className="poi-item__meta">{poiMeta || 'Điểm tiện ích'}</span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="poi-empty">Không có POI phù hợp.</div>
        )}
      </div>
    </div>
  );
}
