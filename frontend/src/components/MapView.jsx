import {
  LayersControl,
  MapContainer,
  Popup,
  TileLayer,
  useMapEvents,
  WMSTileLayer,
} from 'react-leaflet';
import BdsMarkers from './BdsMarkers';
import BdsPopup from './BdsPopup';
import PoiRadiusLayer from './PoiRadiusLayer';
import {
  boundaryLayerName,
  geoserverWmsUrl,
  heatmapLayerName,
  idwLayerName,
  roadsLayerName,
} from '../config/geoserver';
import { getBdsFeatureInfo } from '../services/geoserverApi';
import { isValidBdsRecord, matchesBdsFilters, matchesPoiRadius } from '../utils/bdsFilters';
import { getFeatureLatLng } from '../utils/geometry';

// MapView gom các lớp Leaflet: nền bản đồ, marker BĐS, bán kính POI và overlay WMS từ GeoServer.
function MapClickHandler({ setPopupData, appliedFilters, selectedPoi, radius }) {
  useMapEvents({
    async click(event) {
      // Click bản đồ sẽ gọi WMS GetFeatureInfo để lấy feature BĐS ở đúng pixel người dùng bấm.
      const map = event.target;
      const { latlng } = event;
      const bounds = map.getBounds();
      const size = map.getSize();
      const point = map.latLngToContainerPoint(latlng);

      // WMS GetFeatureInfo cần bbox hiện tại và pixel x/y của điểm click trong viewport Leaflet.
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ].join(',');

      try {
        const data = await getBdsFeatureInfo({
          bbox,
          width: String(size.x),
          height: String(size.y),
          x: String(Math.round(point.x)),
          y: String(Math.round(point.y)),
        });
        const feature = data.features?.[0];
        const featureProperties = feature?.properties ?? {};

        // Popup chỉ hiện nếu feature click vào vẫn thỏa bộ lọc BĐS và bán kính POI hiện tại.
        if (
          feature &&
          isValidBdsRecord(feature) &&
          matchesBdsFilters(feature, appliedFilters) &&
          matchesPoiRadius(getFeatureLatLng(feature), selectedPoi, radius)
        ) {
          setPopupData({
            latlng,
            properties: featureProperties,
          });
        } else {
          setPopupData(null);
        }
      } catch (error) {
        console.error('WMS GetFeatureInfo failed:', error);
        setPopupData(null);
      }
    },
  });

  return null;
}

export default function MapView({
  activeTile,
  activeBaseTile,
  filteredBDS,
  selectedPoi,
  activeRadius,
  popupData,
  setPopupData,
  appliedFilters,
  getPoiName,
  getPoiCategory,
  getPoiAddress,
}) {
  return (
    // MapContainer chính của Leaflet, giữ center ban đầu ở khu vực Hà Nội.
    <MapContainer
      center={[21.0285, 105.8542]}
      zoom={11}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <MapClickHandler
        setPopupData={setPopupData}
        appliedFilters={appliedFilters}
        selectedPoi={selectedPoi}
        radius={activeRadius}
      />

      <PoiRadiusLayer
        selectedPoi={selectedPoi}
        radius={activeRadius}
        getPoiName={getPoiName}
        getPoiCategory={getPoiCategory}
        getPoiAddress={getPoiAddress}
      />

      <LayersControl position="topright">
        <LayersControl.BaseLayer name={activeBaseTile.name} checked>
          {/* Base map TileLayer lấy từ config/baseMaps để đổi nền mà không đổi logic map. */}
          <TileLayer
            url={activeTile}
            attribution={activeBaseTile.attribution}
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="Điểm Bất Động Sản" checked>
          {/* Danh sách BĐS đã lọc được truyền xuống marker cluster để render trên bản đồ. */}
          <BdsMarkers items={filteredBDS} />
        </LayersControl.Overlay>

        {/* Các overlay WMS render trực tiếp từ GeoServer, không tải GeoJSON về client. */}
        <LayersControl.Overlay name="Mạng lưới giao thông">
          <WMSTileLayer
            url={geoserverWmsUrl}
            layers={roadsLayerName}
            format="image/png"
            transparent={true}
            zIndex={20}
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Ranh giới hành chính">
          <WMSTileLayer
            url={geoserverWmsUrl}
            layers={boundaryLayerName}
            format="image/png"
            transparent={true}
            zIndex={10}
            opacity={0.8}
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Bản đồ nhiệt (Heatmap)">
          <WMSTileLayer
            url={geoserverWmsUrl}
            layers={heatmapLayerName}
            format="image/png"
            transparent={true}
            opacity={0.85}
            zIndex={5}
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Nội suy giá (IDW)">
          <WMSTileLayer
            url={geoserverWmsUrl}
            layers={idwLayerName}
            format="image/png"
            transparent={true}
            opacity={0.85}
            zIndex={4}
          />
        </LayersControl.Overlay>
      </LayersControl>

      {popupData && (
        <Popup position={popupData.latlng}>
          <BdsPopup properties={popupData.properties ?? {}} />
        </Popup>
      )}
    </MapContainer>
  );
}
