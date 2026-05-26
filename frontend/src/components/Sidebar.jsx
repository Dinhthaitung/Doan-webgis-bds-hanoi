import FilterPanel from './FilterPanel';
import DistrictComparison from './DistrictComparison';
import PoiSearchPanel from './PoiSearchPanel';
import StatsDashboard from './StatsDashboard';
import TrendChart from './TrendChart';

// Sidebar là vỏ điều hướng cho các công cụ phân tích; dữ liệu vẫn được quản lý ở App.
const sidebarMenuItems = [
  {
    id: 'filter',
    icon: '🏠',
    title: 'Lọc Bất Động Sản',
    description: 'Lọc theo khu vực, loại, giá và diện tích',
  },
  {
    id: 'poi',
    icon: '📍',
    title: 'Tìm kiếm xung quanh (POI)',
    description: 'Tìm tiện ích gần vị trí quan tâm',
  },
  {
    id: 'stats',
    icon: '📊',
    title: 'Thống kê BĐS',
    description: 'Tổng hợp dữ liệu và chỉ số thị trường',
  },
];

export default function Sidebar({
  isOpen,
  activeMenu,
  bdsItems,
  filteredBdsCount,
  totalBdsCount,
  filterPanelProps,
  poiSearchPanelProps,
  onToggle,
  onClose,
  onActiveMenuChange,
}) {
  // Sidebar chỉ gom công cụ điều khiển bản đồ, không fetch dữ liệu trực tiếp.
  function handleToggle() {
    if (!isOpen) {
      onActiveMenuChange('main');
    }

    onToggle();
  }

  function handleBack() {
    onActiveMenuChange('main');
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={isOpen ? 'Đóng menu chức năng' : 'Mở menu chức năng'}
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        ☰
      </button>

      <aside className="filter-sidebar" aria-hidden={!isOpen}>
        <div className="filter-panel" aria-label="Menu chức năng bản đồ">
          <button
            className="sidebar-close"
            type="button"
            aria-label="Đóng menu chức năng"
            onClick={onClose}
          >
            &times;
          </button>

          {activeMenu === 'main' && (
            <div className="sidebar-screen">
              <div className="filter-panel__header">
                <span className="filter-panel__eyebrow">MENU</span>
                <div className="filter-panel__title-row">
                  <h2>Chức năng</h2>
                  <span className="filter-panel__count">
                    {filteredBdsCount}/{totalBdsCount} điểm
                  </span>
                </div>
              </div>

              <div className="sidebar-menu-list">
                {sidebarMenuItems.map((item) => (
                  <button
                    className="sidebar-menu-button"
                    key={item.id}
                    type="button"
                    onClick={() => onActiveMenuChange(item.id)}
                  >
                    <span className="sidebar-menu-button__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="sidebar-menu-button__text">
                      <span className="sidebar-menu-button__title">{item.title}</span>
                      <span className="sidebar-menu-button__description">{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'filter' && (
            <FilterPanel
              {...filterPanelProps}
              filteredCount={filteredBdsCount}
              totalCount={totalBdsCount}
              onBack={handleBack}
            />
          )}

          {activeMenu === 'poi' && (
            <PoiSearchPanel
              {...poiSearchPanelProps}
              filteredBdsCount={filteredBdsCount}
              onBack={handleBack}
            />
          )}

          {activeMenu === 'stats' && (
            <div className="sidebar-screen">
              <button className="sidebar-back" type="button" onClick={handleBack}>
                ⬅ Quay lại Menu
              </button>

              <div className="filter-panel__header">
                <span className="filter-panel__eyebrow">Thống kê thị trường</span>
                <div className="filter-panel__title-row">
                  <h2>Thống kê BĐS</h2>
                </div>
              </div>

              {/* Dashboard nhận danh sách BĐS đã lọc từ App; component này không tự gọi GeoServer. */}
              <StatsDashboard bdsItems={bdsItems} />
              <DistrictComparison bdsItems={bdsItems} />
              <TrendChart />
            </div>
          )}

          {activeMenu !== 'main' && activeMenu !== 'filter' && activeMenu !== 'poi' && activeMenu !== 'stats' && (
            <div className="sidebar-screen">
              <button className="sidebar-back" type="button" onClick={handleBack}>
                ⬅ Quay lại Menu
              </button>

              <div className="filter-panel__header">
                <span className="filter-panel__eyebrow">Đang phát triển</span>
                <div className="filter-panel__title-row">
                  <h2>Tính năng</h2>
                </div>
              </div>

              <div className="sidebar-placeholder">Tính năng đang phát triển...</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
