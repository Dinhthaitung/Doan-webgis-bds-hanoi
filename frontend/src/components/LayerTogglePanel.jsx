// Panel đổi nền bản đồ nằm ngoài LayersControl để luôn truy cập nhanh ở góc bản đồ.
export default function LayerTogglePanel({ baseTileLayers, activeTile, onTileChange }) {
  // Control đổi nền bản đồ; các overlay WMS chính được bật/tắt trong LayersControl của MapView.
  return (
    <div className="basemap-switcher" aria-label="Chuyển đổi nền bản đồ">
      {baseTileLayers.map((tile) => (
        <button
          className={`basemap-switcher__button${
            activeTile === tile.url ? ' basemap-switcher__button--active' : ''
          }`}
          key={tile.url}
          type="button"
          onClick={() => onTileChange(tile.url)}
        >
          {tile.name}
        </button>
      ))}
    </div>
  );
}
