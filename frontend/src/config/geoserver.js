// Ghi chú: WMS dùng để render trực tiếp các layer bản đồ từ GeoServer lên Leaflet.
export const geoserverWmsUrl = 'http://localhost:8080/geoserver/doan_webgis/wms';
// WFS dùng để lấy GeoJSON về frontend, phục vụ filter/search ở phía client.
export const geoserverWfsUrl = 'http://localhost:8080/geoserver/doan_webgis/ows';

// Tên layer phải khớp chính xác với workspace/layer trên GeoServer.
export const bdsLayerName = 'doan_webgis:bds_hanoi_real_data';
export const poisLayerName = 'doan_webgis:hanoi_pois';
export const roadsLayerName = 'doan_webgis:hanoi_roads';
export const boundaryLayerName = 'doan_webgis:ranh_gioi_hanoi';
export const heatmapLayerName = 'doan_webgis:Heatmap_BDS_HaNoi';
export const idwLayerName = 'doan_webgis:IDW_BDS_HaNoi';
export const trendLayerName = 'doan_webgis:v_bds_price_trend_mock_geom';
