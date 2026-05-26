import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchPriceTrendData } from '../services/geoserverApi';

// TrendChart đọc dữ liệu trend mock từ WFS và vẽ biểu đồ giá trung vị/m² theo tháng bằng Recharts.
const trendSeries = [
  { key: 'chung_cu', label: 'Chung cư', color: '#2563eb' },
  { key: 'dat_nen', label: 'Đất nền', color: '#0f766e' },
  { key: 'nha_rieng', label: 'Nhà riêng', color: '#f97316' },
  { key: 'biet_thu', label: 'Biệt thự', color: '#7c3aed' },
];

function formatPricePerSquareMeter(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Chưa có dữ liệu';
  }

  return `${numericValue.toLocaleString('vi-VN', {
    maximumFractionDigits: 1,
  })} triệu đồng/m²`;
}

function buildChartData(records) {
  // Chuyển dữ liệu trend dạng long format (tháng, loại, giá) sang wide format cho Recharts LineChart.
  const monthMap = new Map();

  records.forEach((record) => {
    if (!record.thang_label || !trendSeries.some((series) => series.key === record.loai_bds)) {
      return;
    }

    const currentMonth = monthMap.get(record.thang_label) ?? {
      thang: record.thang_label,
      sortKey: record.thang || record.thang_label,
    };

    currentMonth[record.loai_bds] = record.gia_m2_trung_vi;
    currentMonth[`${record.loai_bds}_so_luong_tin`] = record.so_luong_tin;
    monthMap.set(record.thang_label, currentMonth);
  });

  return Array.from(monthMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const visiblePayload = payload.filter((item) => item.value !== null && item.value !== undefined);

  if (!visiblePayload.length) {
    return null;
  }

  return (
    <div className="trend-tooltip">
      <div className="trend-tooltip__label">{label}</div>
      {visiblePayload.map((item) => {
        const listingCount = item.payload?.[`${item.dataKey}_so_luong_tin`];

        return (
          <div className="trend-tooltip__row" key={item.dataKey}>
            <span className="trend-tooltip__series" style={{ color: item.color }}>
              {item.name}
            </span>
            <span>{formatPricePerSquareMeter(item.value)}</span>
            {Number.isFinite(Number(listingCount)) && (
              <span className="trend-tooltip__count">
                {Number(listingCount).toLocaleString('vi-VN')} tin
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrendChart() {
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const chartData = useMemo(() => buildChartData(trendData), [trendData]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrendData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const records = await fetchPriceTrendData({
          signal: controller.signal,
        });

        setTrendData(records);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErrorMessage(error.message || 'Không thể tải dữ liệu xu hướng giá.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadTrendData();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="trend-card" aria-label="Biểu đồ xu hướng giá bất động sản">
      <div className="trend-card__header">
        <div>
          <h3>Xu hướng giá BĐS</h3>
          <p>Giá trung vị theo m², giai đoạn 12/2025 - 05/2026</p>
        </div>
      </div>

      {isLoading && <div className="trend-state">Đang tải dữ liệu xu hướng...</div>}

      {!isLoading && errorMessage && <div className="trend-state trend-state--error">{errorMessage}</div>}

      {!isLoading && !errorMessage && chartData.length === 0 && (
        <div className="trend-state">Chưa có dữ liệu xu hướng để hiển thị.</div>
      )}

      {!isLoading && !errorMessage && chartData.length > 0 && (
        <div className="trend-chart">
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.32)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="thang"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)' }}
                minTickGap={8}
              />
              <YAxis
                width={42}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => Number(value).toLocaleString('vi-VN')}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ color: '#334155', fontSize: 12, fontWeight: 700, paddingTop: 8 }}
              />
              {trendSeries.map((series) => (
                <Line
                  activeDot={{ r: 5 }}
                  dataKey={series.key}
                  dot={{ r: 3 }}
                  key={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2.4}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="trend-note">
        Dữ liệu xu hướng được mô phỏng có kiểm soát do dữ liệu gốc thiếu trường thời gian đăng tin.
        Chỉ số sử dụng là giá trung vị nhằm giảm ảnh hưởng của ngoại lai.
      </p>
    </section>
  );
}
