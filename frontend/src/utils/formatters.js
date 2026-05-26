// Formatter hiển thị dữ liệu BĐS theo tiếng Việt, dùng chung cho popup, filter summary và dashboard.
export function displayValue(value) {
  // Dữ liệu thực tế có thể thiếu/null, nên popup cần fallback rõ ràng thay vì hiện trống.
  return value ?? 'Chưa có dữ liệu';
}

export function formatPrice(value) {
  // Format giá theo triệu/tỷ để popup dễ đọc hơn số thô từ GeoServer.
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return displayValue(value);
  }

  if (price > 1000) {
    const billionValue = (price / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return `${billionValue} Tỷ VNĐ`;
  }

  return `${price} Triệu VNĐ`;
}

export function formatArea(value) {
  // Giữ đơn vị m² ở formatter để component popup không phải lặp lại logic hiển thị.
  return `${displayValue(value)} m²`;
}

export function formatUnitPrice(value) {
  // Đơn giá được hiển thị theo triệu/m², đúng với schema dữ liệu BĐS hiện có.
  return `${displayValue(value)} Triệu/m²`;
}

export function formatNumberVi(value, maximumFractionDigits = 1, fallback = 'Chưa đủ dữ liệu') {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return value.toLocaleString('vi-VN', {
    maximumFractionDigits,
  });
}

export function formatMillionPerM2(value, fallback = 'Chưa đủ dữ liệu') {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return `${formatNumberVi(value)} triệu/m²`;
}

export function formatString(value) {
  if (!value) {
    return displayValue(value);
  }

  const text = String(value).replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
