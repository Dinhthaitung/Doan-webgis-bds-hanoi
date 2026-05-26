import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import BdsPopup from './BdsPopup';

// Render lớp điểm BĐS đã lọc lên Leaflet, dùng marker cluster để giữ bản đồ dễ đọc.
export default function BdsMarkers({ items }) {
  return (
    // MarkerClusterGroup gom nhiều điểm BĐS lại để bản đồ không bị rối khi zoom thấp.
    <MarkerClusterGroup>
      {items.map((item) => (
        <Marker key={item.id} position={item.position}>
          <Popup>
            {/* Mỗi marker mở popup chi tiết, dữ liệu hiển thị nằm trong BdsPopup. */}
            <BdsPopup properties={item.properties} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
