import { useEffect, useMemo, useState } from 'react';
import LayerTogglePanel from './components/LayerTogglePanel';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { baseTileLayers, defaultBaseTileUrl } from './config/baseMaps';
import { fetchBdsFeatures, fetchPoiFeatures } from './services/geoserverApi';
import { filterPanelCss } from './styles/appStyles';
import {
  allDistrictFilterValue,
  applyAllBdsFilters,
  buildDistrictFilterOptions,
  isValidBdsRecord,
  normalizeText,
  parseNumber,
} from './utils/bdsFilters';
import { buildBdsFilterSummary } from './utils/bdsStats';
import { getFeatureLatLng } from './utils/geometry';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// App.jsx hiện đóng vai trò orchestration/state chính của WebGIS.
// UI, API GeoServer và helper xử lý dữ liệu đã được tách sang module riêng để dễ bảo trì.
const filterTypeOptions = ['Tất cả', 'Nhà đất', 'Chung cư', 'Đất nền', 'Mặt bằng'];

// Các range filter để dạng string vì input number của HTML vẫn trả value dạng text.
const defaultRangeFilter = { min: '', max: '' };
const defaultAppliedFilters = {
  type: 'Tất cả',
  district: allDistrictFilterValue,
  price: defaultRangeFilter,
  unitPrice: defaultRangeFilter,
  area: defaultRangeFilter,
};

function getPoiName(properties = {}) {
  // POI từ GeoServer có thể đến từ nhiều nguồn nên tên/loại/địa chỉ phải đọc theo nhiều alias.
  const rawName =
    properties.name ??
    properties.ten ??
    properties.ten_poi ??
    properties.poi_name ??
    properties.title ??
    properties.Name;

  return String(rawName ?? '').trim();
}

function getPoiCategory(properties = {}) {
  return (
    properties.amenity ??
    properties.type ??
    properties.loai ??
    properties.fclass ??
    properties.category ??
    properties.nhom ??
    'Điểm tiện ích'
  );
}

function getPoiAddress(properties = {}) {
  return (
    properties.address ??
    properties.dia_chi ??
    properties.street ??
    properties.phuong_xa ??
    properties.quan_huyen ??
    ''
  );
}

function getPoiSearchText(poi) {
  return normalizeText(
    `${getPoiName(poi.properties)} ${getPoiCategory(poi.properties)} ${getPoiAddress(poi.properties)}`,
  );
}

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}

function App() {
  // App load dữ liệu, giữ state filter/POI/layer, tính dữ liệu đã lọc rồi truyền props xuống component con.
  const [popupData, setPopupData] = useState(null);
  const [allBDS, setAllBDS] = useState([]);
  const [filterType, setFilterType] = useState('Tất cả');
  const [filterDistrict, setFilterDistrict] = useState(allDistrictFilterValue);
  const [filterPrice, setFilterPrice] = useState({ min: '', max: '' });
  const [filterUnitPrice, setFilterUnitPrice] = useState({ min: '', max: '' });
  const [filterArea, setFilterArea] = useState({ min: '', max: '' });
  const [appliedFilters, setAppliedFilters] = useState(defaultAppliedFilters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('main');
  const [activeTile, setActiveTile] = useState(defaultBaseTileUrl);
  const [poiData, setPoiData] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [poiSearchInput, setPoiSearchInput] = useState('');
  const debouncedPoiSearchQuery = useDebounce(poiSearchInput, 300);
  const activeBaseTile = baseTileLayers.find((tile) => tile.url === activeTile) ?? baseTileLayers[0];

  useEffect(() => {
    const controller = new AbortController();

    async function loadBdsData() {
      try {
        // Load BĐS một lần qua WFS, sau đó chuẩn hóa thành marker có id, position và properties.
        const geojson = await fetchBdsFeatures({
          signal: controller.signal,
        });
        const markers = (geojson.features ?? [])
          .map((feature, index) => ({
            id: feature.id ?? `${index}-${feature.properties?.title ?? 'bds'}`,
            position: getFeatureLatLng(feature),
            properties: feature.properties ?? {},
          }))
          .filter((item) => item.position && isValidBdsRecord(item));

        setAllBDS(markers);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('WFS load failed:', error);
          setAllBDS([]);
        }
      }
    }

    loadBdsData();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPoiData() {
      try {
        // Load POI qua WFS để phục vụ search và lọc BĐS theo bán kính quanh POI.
        const geojson = await fetchPoiFeatures({
          signal: controller.signal,
        });
        const pois = (geojson.features ?? [])
          .map((feature, index) => ({
            id: feature.id ?? `${index}-${getPoiName(feature.properties)}`,
            position: getFeatureLatLng(feature),
            properties: feature.properties ?? {},
          }))
          .filter((item) => item.position && getPoiName(item.properties));

        setPoiData(pois);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('POI WFS load failed:', error);
          setPoiData([]);
        }
      }
    }

    loadPoiData();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredPoiData = useMemo(() => {
    // Debounce query giúp search POI mượt hơn khi người dùng gõ nhanh.
    const normalizedQuery = normalizeText(debouncedPoiSearchQuery);
    return normalizedQuery
      ? poiData.filter((poi) => getPoiSearchText(poi).includes(normalizedQuery))
      : poiData;
  }, [debouncedPoiSearchQuery, poiData]);

  const activeRadius = Math.max(0, parseNumber(radius) ?? 0);
  const districtFilterOptions = useMemo(() => buildDistrictFilterOptions(allBDS), [allBDS]);
  const filteredBDS = useMemo(() => {
    // Danh sách BĐS hiển thị là dữ liệu dẫn xuất từ WFS, filter và POI hiện tại.
    // Sidebar dùng cùng mảng này cho dashboard để số liệu khớp với marker đang thấy trên bản đồ.
    // Không mutate allBDS để có thể xóa lọc hoặc đổi bán kính mà không cần gọi lại WFS.
    return applyAllBdsFilters(allBDS, appliedFilters, selectedPoi, radius);
  }, [allBDS, appliedFilters, radius, selectedPoi]);
  const filterSummary = useMemo(
    () => buildBdsFilterSummary(filteredBDS, allBDS.length),
    [allBDS.length, filteredBDS],
  );

  function handlePriceChange(field, value) {
    setFilterPrice((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleUnitPriceChange(field, value) {
    setFilterUnitPrice((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAreaChange(field, value) {
    setFilterArea((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleApplyFilters() {
    setAppliedFilters({
      type: filterType,
      district: filterDistrict,
      price: { ...filterPrice },
      unitPrice: { ...filterUnitPrice },
      area: { ...filterArea },
    });
    setPopupData(null);
  }

  function handleClearFilters() {
    const resetPrice = { min: '', max: '' };
    const resetUnitPrice = { min: '', max: '' };
    const resetArea = { min: '', max: '' };

    setFilterType('Tất cả');
    setFilterDistrict(allDistrictFilterValue);
    setFilterPrice(resetPrice);
    setFilterUnitPrice(resetUnitPrice);
    setFilterArea(resetArea);
    setAppliedFilters({
      type: 'Tất cả',
      district: allDistrictFilterValue,
      price: resetPrice,
      unitPrice: resetUnitPrice,
      area: resetArea,
    });
    setPopupData(null);
  }

  function handlePoiRadiusChange(value) {
    setRadius(value === '' ? '' : Math.max(0, Number(value)));
  }

  function handleSelectPoi(poi) {
    setSelectedPoi(poi);
    setPopupData(null);
  }

  function handleClearSelectedPoi() {
    setSelectedPoi(null);
    setPopupData(null);
  }

  return (
    <div className={`map-shell${isSidebarOpen ? ' map-shell--sidebar-open' : ''}`}>
      <style>{filterPanelCss}</style>

      <Sidebar
        isOpen={isSidebarOpen}
        activeMenu={activeMenu}
        bdsItems={filteredBDS}
        filteredBdsCount={filteredBDS.length}
        totalBdsCount={allBDS.length}
        onToggle={() => setIsSidebarOpen((current) => !current)}
        onClose={() => setIsSidebarOpen(false)}
        onActiveMenuChange={setActiveMenu}
        filterPanelProps={{
          filterTypeOptions,
          districtFilterOptions,
          filterType,
          filterDistrict,
          filterPrice,
          filterUnitPrice,
          filterArea,
          filterSummary,
          onTypeChange: setFilterType,
          onDistrictChange: setFilterDistrict,
          onPriceChange: handlePriceChange,
          onUnitPriceChange: handleUnitPriceChange,
          onAreaChange: handleAreaChange,
          onApplyFilters: handleApplyFilters,
          onClearFilters: handleClearFilters,
        }}
        poiSearchPanelProps={{
          poiResults: filteredPoiData,
          poiTotal: poiData.length,
          selectedPoi,
          radius,
          activeRadius,
          poiSearchInput,
          onRadiusChange: handlePoiRadiusChange,
          onSearchChange: setPoiSearchInput,
          onSelectPoi: handleSelectPoi,
          onClearSelectedPoi: handleClearSelectedPoi,
          getPoiName,
          getPoiCategory,
          getPoiAddress,
        }}
      />

      <MapView
        activeTile={activeTile}
        activeBaseTile={activeBaseTile}
        filteredBDS={filteredBDS}
        selectedPoi={selectedPoi}
        activeRadius={activeRadius}
        popupData={popupData}
        setPopupData={setPopupData}
        appliedFilters={appliedFilters}
        getPoiName={getPoiName}
        getPoiCategory={getPoiCategory}
        getPoiAddress={getPoiAddress}
      />

      <LayerTogglePanel
        baseTileLayers={baseTileLayers}
        activeTile={activeTile}
        onTileChange={setActiveTile}
      />
    </div>
  );
}

export default App;
