import { useEffect } from 'react';
import L from 'leaflet';
import { Circle, Marker, Popup, useMap } from 'react-leaflet';
import { formatString } from '../utils/formatters';
import { popupRowStyle, popupTitleStyle } from './popupStyles';

// Layer phụ trách POI đang chọn: marker riêng, popup POI và vòng bán kính dùng để lọc BĐS.
const selectedPoiIcon = L.divIcon({
  className: 'poi-selected-marker',
  html: '<span><b>📍</b></span>',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -36],
});

function SelectedPoiFocus({ selectedPoi }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoi?.position) {
      // Khi chọn POI, tự flyTo để người dùng thấy ngay tâm bán kính trên bản đồ.
      map.flyTo(selectedPoi.position, Math.max(map.getZoom(), 15), {
        duration: 0.7,
      });
    }
  }, [map, selectedPoi]);

  return null;
}

function PoiPopupContent({ poi, getPoiName, getPoiCategory, getPoiAddress }) {
  const properties = poi?.properties ?? {};

  return (
    <div style={{ minWidth: '210px', maxWidth: '280px' }}>
      <h3 style={popupTitleStyle}>{getPoiName(properties)}</h3>
      <p style={popupRowStyle}>📍 <strong>Loại POI:</strong> {formatString(getPoiCategory(properties))}</p>
      {getPoiAddress(properties) && (
        <p style={popupRowStyle}>Khu vực: {getPoiAddress(properties)}</p>
      )}
    </div>
  );
}

export default function PoiRadiusLayer({
  selectedPoi,
  radius,
  getPoiName,
  getPoiCategory,
  getPoiAddress,
}) {
  return (
    <>
      <SelectedPoiFocus selectedPoi={selectedPoi} />

      {selectedPoi && (
        <>
          {/* Circle thể hiện bán kính tìm kiếm quanh POI được chọn. */}
          <Circle
            center={selectedPoi.position}
            radius={radius}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#93c5fd',
              fillOpacity: 0.18,
              opacity: 0.85,
              weight: 2,
            }}
          />
          {/* Marker POI được chọn dùng icon riêng để phân biệt với marker BĐS. */}
          <Marker position={selectedPoi.position} icon={selectedPoiIcon}>
            <Popup>
              <PoiPopupContent
                poi={selectedPoi}
                getPoiName={getPoiName}
                getPoiCategory={getPoiCategory}
                getPoiAddress={getPoiAddress}
              />
            </Popup>
          </Marker>
        </>
      )}
    </>
  );
}
