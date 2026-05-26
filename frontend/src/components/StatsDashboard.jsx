import { useMemo } from 'react';
import { buildBdsStats } from '../utils/bdsStats';

// Dashboard tổng quan chuyển danh sách BĐS đã lọc thành các chỉ số trình bày trong sidebar.
function formatNumber(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) {
    return 'Chưa đủ dữ liệu';
  }

  return value.toLocaleString('vi-VN', {
    maximumFractionDigits,
  });
}

function formatUnitPrice(value) {
  if (!Number.isFinite(value)) {
    return 'Chưa đủ dữ liệu';
  }

  return `${formatNumber(value)} triệu/m²`;
}

function formatArea(value) {
  if (!Number.isFinite(value)) {
    return 'Chưa đủ dữ liệu';
  }

  return `${formatNumber(value, 0)} m²`;
}

function formatTopGroup(group) {
  if (!group) {
    return 'Chưa đủ dữ liệu';
  }

  return group.label;
}

function StatMetric({ label, value, hint }) {
  return (
    <article className="stats-metric">
      <span className="stats-metric__label">{label}</span>
      <strong className="stats-metric__value">{value}</strong>
      {hint && <span className="stats-metric__hint">{hint}</span>}
    </article>
  );
}

export default function StatsDashboard({ bdsItems }) {
  // Dashboard chỉ render dữ liệu đã lọc được App truyền xuống qua Sidebar, không fetch thêm GeoServer.
  const stats = useMemo(() => buildBdsStats(bdsItems), [bdsItems]);
  const maxTypeCount = stats.typeDistribution[0]?.count ?? 0;

  if (stats.totalCount === 0) {
    return (
      <section className="stats-dashboard" aria-label="Dashboard thống kê bất động sản">
        <div className="stats-dashboard__header">
          <h3>Tổng quan thị trường</h3>
          <p>Chưa có bất động sản phù hợp với bộ lọc hiện tại.</p>
        </div>
        <div className="stats-empty">Hãy nới bộ lọc hoặc bỏ chọn bán kính POI để xem thống kê tổng quan.</div>
      </section>
    );
  }

  return (
    <section className="stats-dashboard" aria-label="Dashboard thống kê bất động sản">
      <div className="stats-dashboard__header">
        <h3>Tổng quan thị trường</h3>
        <p>Thống kê từ danh sách BĐS đang hiển thị trên bản đồ.</p>
      </div>

      <div className="stats-metric-grid">
        <StatMetric label="Tổng số BĐS" value={stats.totalCount.toLocaleString('vi-VN')} hint="đang xét" />
        <StatMetric label="Giá trung vị/m²" value={formatUnitPrice(stats.unitPriceMedian)} />
        <StatMetric label="Giá trung bình/m²" value={formatUnitPrice(stats.unitPriceAverage)} />
        <StatMetric label="Diện tích trung vị" value={formatArea(stats.areaMedian)} />
        <StatMetric
          label="Loại phổ biến nhất"
          value={formatTopGroup(stats.mostCommonType)}
          hint={stats.mostCommonType ? `${stats.mostCommonType.count.toLocaleString('vi-VN')} BĐS` : ''}
        />
        <StatMetric
          label="Quận/huyện nhiều nhất"
          value={formatTopGroup(stats.mostCommonDistrict)}
          hint={stats.mostCommonDistrict ? `${stats.mostCommonDistrict.count.toLocaleString('vi-VN')} BĐS` : ''}
        />
      </div>

      {stats.highestMedianDistrict && (
        <div className="stats-highlight">
          <span className="stats-highlight__label">Khu vực giá trung vị/m² cao nhất</span>
          <strong>{stats.highestMedianDistrict.label}</strong>
          <span>
            {formatUnitPrice(stats.highestMedianDistrict.medianPrice)} từ{' '}
            {stats.highestMedianDistrict.count.toLocaleString('vi-VN')} BĐS có đơn giá hợp lệ
          </span>
        </div>
      )}

      {stats.typeDistribution.length > 0 && (
        <div className="stats-distribution">
          <div className="stats-distribution__header">
            <span>Số lượng theo loại BĐS</span>
            <span>{stats.typeDistribution.length} nhóm</span>
          </div>

          <div className="stats-distribution__list">
            {stats.typeDistribution.map((group) => {
              // Thanh phân bố chuẩn hóa theo nhóm có số lượng lớn nhất để so sánh nhanh trong sidebar.
              const ratio = maxTypeCount > 0 ? (group.count / maxTypeCount) * 100 : 0;

              return (
                <div className="stats-distribution__row" key={group.label}>
                  <div className="stats-distribution__meta">
                    <span>{group.label}</span>
                    <strong>{group.count.toLocaleString('vi-VN')}</strong>
                  </div>
                  <div className="stats-distribution__track" aria-hidden="true">
                    <span style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
