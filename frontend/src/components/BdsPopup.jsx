import { getBdsRecordId, loaiBdsMap } from '../utils/bdsFilters';
import { displayValue, formatPrice, formatString } from '../utils/formatters';
import { popupRowStyle } from './popupStyles';

// Popup BĐS chỉ hiển thị các trường phục vụ phân tích, tránh biến app thành trang rao vặt.
export default function BdsPopup({ properties = {} }) {
  // Popup hiển thị các thuộc tính chính của BĐS; field name giữ đúng theo dữ liệu hiện có.
  const dataId = getBdsRecordId(properties);

  return (
    <div style={{ minWidth: '240px', maxWidth: '320px' }}>
      {dataId !== null && (
        <p style={popupRowStyle}>
          <strong>Mã dữ liệu:</strong> {dataId}
        </p>
      )}
      <p style={popupRowStyle}>
        🏡 <strong>Loại BĐS:</strong> {loaiBdsMap[properties.loai_bds] || formatString(properties.loai_bds)}
      </p>
      <p style={popupRowStyle}>
        📍 <strong>Khu vực:</strong> {displayValue(properties.phuong_xa)}, {displayValue(properties.quan_huyen)}
      </p>
      <p style={popupRowStyle}>💰 <strong>Giá:</strong> {formatPrice(properties.gia_trieu)}</p>
      <p style={popupRowStyle}>📏 <strong>Diện tích:</strong> {displayValue(properties.dien_tich_m2)} m²</p>
      <p style={popupRowStyle}>💵 <strong>Đơn giá:</strong> {displayValue(properties.gia_m2_trieu)} Triệu/m²</p>
    </div>
  );
}
