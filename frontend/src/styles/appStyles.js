// CSS chính của shell bản đồ/sidebar theo phong cách glassmorphism, inject từ App để giữ UI trong một module.
export const filterPanelCss = `
  .map-shell {
    --sidebar-width: min(360px, 88vw);
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar-toggle {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1000;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 50%;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.22);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: pointer;
    font-size: 23px;
    font-weight: 700;
    line-height: 1;
    transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }

  .sidebar-toggle:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.26);
  }

  .sidebar-toggle:active {
    transform: translateY(0);
  }

  .basemap-switcher {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
    display: flex;
    gap: 8px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 14px;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .basemap-switcher__button {
    min-height: 34px;
    padding: 0 12px;
    color: #334155;
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid rgba(148, 163, 184, 0.32);
    border-radius: 10px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    transition: transform 140ms ease, background 140ms ease, color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  }

  .basemap-switcher__button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(37, 99, 235, 0.34);
  }

  .basemap-switcher__button:active {
    transform: translateY(0);
  }

  .basemap-switcher__button--active {
    color: #ffffff;
    background: rgba(37, 99, 235, 0.9);
    border-color: rgba(37, 99, 235, 0.72);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
  }

  .filter-sidebar {
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 1050;
    width: var(--sidebar-width);
    pointer-events: none;
    visibility: hidden;
    transform: translateX(-100%);
    transition: transform 260ms ease, visibility 0s linear 260ms;
  }

  .map-shell--sidebar-open .filter-sidebar {
    pointer-events: auto;
    visibility: visible;
    transform: translateX(0);
    transition: transform 260ms ease;
  }

  .filter-panel {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 86px 18px 18px;
    overflow-y: auto;
    color: #111827;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-left: 0;
    border-radius: 0 18px 18px 0;
    box-shadow: 0 20px 55px rgba(15, 23, 42, 0.24);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .sidebar-close {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 1;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    color: #334155;
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(148, 163, 184, 0.32);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    transition: transform 150ms ease, background 150ms ease, color 150ms ease, border-color 150ms ease;
  }

  .sidebar-close:hover {
    transform: translateY(-1px);
    color: #0f172a;
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(37, 99, 235, 0.28);
  }

  .sidebar-close:active {
    transform: translateY(0);
  }

  .sidebar-screen {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .sidebar-menu-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sidebar-menu-button {
    width: 100%;
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 12px;
    align-items: center;
    padding: 13px;
    color: #0f172a;
    text-align: left;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 14px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
    cursor: pointer;
    transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
  }

  .sidebar-menu-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(37, 99, 235, 0.34);
    box-shadow: 0 16px 34px rgba(37, 99, 235, 0.16);
  }

  .sidebar-menu-button:active {
    transform: translateY(0);
  }

  .sidebar-menu-button__icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(16, 185, 129, 0.16));
    font-size: 20px;
  }

  .sidebar-menu-button__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .sidebar-menu-button__title {
    font-size: 14px;
    font-weight: 700;
  }

  .sidebar-menu-button__description {
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.35;
  }

  .sidebar-back {
    width: fit-content;
    min-height: 38px;
    padding: 0 12px;
    color: #1d4ed8;
    background: rgba(219, 234, 254, 0.78);
    border: 1px solid rgba(96, 165, 250, 0.34);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 140ms ease, background 140ms ease;
  }

  .sidebar-back:hover {
    transform: translateY(-1px);
    background: rgba(219, 234, 254, 0.95);
  }

  .sidebar-placeholder {
    min-height: 180px;
    display: grid;
    place-items: center;
    padding: 24px;
    color: #475569;
    text-align: center;
    background: rgba(255, 255, 255, 0.62);
    border: 1px dashed rgba(100, 116, 139, 0.32);
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
  }

  .stats-dashboard {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stats-dashboard__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stats-dashboard__header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 17px;
    line-height: 1.25;
  }

  .stats-dashboard__header p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }

  .stats-metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .stats-metric {
    min-width: 0;
    min-height: 104px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 14px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.09);
  }

  .stats-metric__label {
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .stats-metric__value {
    color: #0f172a;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }

  .stats-metric__hint {
    color: #475569;
    font-size: 11.5px;
    font-weight: 700;
    line-height: 1.35;
  }

  .stats-highlight {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 12px;
    color: #0f172a;
    background: rgba(219, 234, 254, 0.7);
    border: 1px solid rgba(96, 165, 250, 0.34);
    border-radius: 14px;
  }

  .stats-highlight__label {
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .stats-highlight strong {
    font-size: 16px;
    line-height: 1.25;
  }

  .stats-highlight span:last-child {
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
  }

  .stats-distribution {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.64);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 14px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  }

  .stats-distribution__header,
  .stats-distribution__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .stats-distribution__header {
    color: #334155;
    font-size: 12px;
    font-weight: 800;
  }

  .stats-distribution__header span:last-child {
    color: #64748b;
    font-size: 11px;
  }

  .stats-distribution__list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .stats-distribution__row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stats-distribution__meta {
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }

  .stats-distribution__meta span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats-distribution__meta strong {
    color: #0f172a;
    font-size: 12px;
  }

  .stats-distribution__track {
    height: 7px;
    overflow: hidden;
    background: rgba(203, 213, 225, 0.72);
    border-radius: 999px;
  }

  .stats-distribution__track span {
    display: block;
    height: 100%;
    min-width: 8px;
    background: linear-gradient(90deg, #2563eb, #10b981);
    border-radius: inherit;
  }

  .stats-empty {
    min-height: 116px;
    display: grid;
    place-items: center;
    padding: 18px;
    color: #475569;
    text-align: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px dashed rgba(100, 116, 139, 0.28);
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
  }

  .district-comparison {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.66);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 16px;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
  }

  .district-comparison__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .district-comparison__header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 17px;
    line-height: 1.25;
  }

  .district-comparison__header p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }

  .district-comparison__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .district-controls {
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 12px;
    background: rgba(241, 245, 249, 0.64);
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 14px;
  }

  .district-controls__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .district-controls__heading strong {
    color: #0f172a;
    font-size: 13px;
    font-weight: 850;
    line-height: 1.3;
  }

  .district-controls__heading span {
    color: #64748b;
    font-size: 11.5px;
    font-weight: 800;
    white-space: nowrap;
  }

  .district-control-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .district-control-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .district-control-field span {
    color: #334155;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .district-control-field select {
    width: 100%;
    box-sizing: border-box;
    min-height: 38px;
    padding: 0 10px;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(148, 163, 184, 0.5);
    border-radius: 11px;
    font-size: 13px;
    font-weight: 700;
  }

  .district-control-field select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.96);
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
  }

  .district-picker {
    max-height: 148px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-right: 2px;
    overflow-y: auto;
  }

  .district-pill {
    min-width: 0;
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 10px;
    color: #334155;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 999px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, color 140ms ease;
  }

  .district-pill:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.94);
    border-color: rgba(37, 99, 235, 0.34);
  }

  .district-pill--active {
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #0f766e);
    border-color: rgba(37, 99, 235, 0.58);
  }

  .district-pill small {
    color: inherit;
    opacity: 0.82;
    font-size: 10.5px;
    font-weight: 900;
  }

  .district-picker__empty,
  .district-empty {
    width: 100%;
    padding: 14px;
    color: #475569;
    text-align: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px dashed rgba(100, 116, 139, 0.28);
    border-radius: 13px;
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.45;
  }

  .district-result-summary {
    color: #475569;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.4;
  }

  .district-card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.64);
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 14px;
  }

  .district-card__topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .district-card__topline strong {
    min-width: 0;
    color: #0f172a;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.25;
  }

  .district-card__topline span {
    flex: 0 0 auto;
    color: #475569;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.3;
  }

  .district-card__primary {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .district-card__primary span,
  .district-card__grid span {
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .district-card__primary strong {
    color: #0f172a;
    font-size: 18px;
    font-weight: 850;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }

  .district-card__bar {
    height: 8px;
    overflow: hidden;
    background: rgba(203, 213, 225, 0.72);
    border-radius: 999px;
  }

  .district-card__bar span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #14b8a6);
    border-radius: inherit;
  }

  .district-card__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .district-card__grid div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .district-card__grid strong {
    color: #0f172a;
    font-size: 12.5px;
    font-weight: 800;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .district-card__wide {
    grid-column: 1 / -1;
  }

  .trend-card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 16px;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
  }

  .trend-card__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .trend-card h3 {
    margin: 0;
    color: #0f172a;
    font-size: 17px;
    line-height: 1.25;
  }

  .trend-card p {
    margin: 0;
  }

  .trend-card__header p {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }

  .trend-chart {
    width: 100%;
    min-width: 0;
    height: 310px;
  }

  .trend-state {
    min-height: 190px;
    display: grid;
    place-items: center;
    padding: 18px;
    color: #475569;
    text-align: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px dashed rgba(100, 116, 139, 0.28);
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.45;
  }

  .trend-state--error {
    color: #991b1b;
    background: rgba(254, 226, 226, 0.74);
    border-color: rgba(248, 113, 113, 0.34);
  }

  .trend-note {
    color: #475569;
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1.5;
  }

  .trend-tooltip {
    max-width: 230px;
    padding: 10px 11px;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(148, 163, 184, 0.36);
    border-radius: 12px;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: 12px;
  }

  .trend-tooltip__label {
    margin-bottom: 7px;
    color: #0f172a;
    font-weight: 800;
  }

  .trend-tooltip__row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 5px 0;
    border-top: 1px solid rgba(226, 232, 240, 0.9);
    font-weight: 700;
  }

  .trend-tooltip__row:first-of-type {
    border-top: 0;
  }

  .trend-tooltip__series {
    font-weight: 800;
  }

  .trend-tooltip__count {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
  }

  .poi-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .poi-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #475569;
    font-size: 12px;
    font-weight: 600;
  }

  .poi-selected-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(219, 234, 254, 0.68);
    border: 1px solid rgba(96, 165, 250, 0.34);
    border-radius: 14px;
  }

  .poi-selected-card__title {
    color: #0f172a;
    font-size: 14px;
    font-weight: 700;
  }

  .poi-selected-card__meta {
    color: #475569;
    font-size: 12px;
    font-weight: 700;
  }

  .poi-clear-button {
    width: fit-content;
    min-height: 34px;
    padding: 0 11px;
    color: #1d4ed8;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(96, 165, 250, 0.34);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .poi-list {
    max-height: min(360px, 42vh);
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding-right: 3px;
    overflow-y: auto;
  }

  .poi-item {
    width: 100%;
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 10px;
    align-items: center;
    padding: 10px;
    color: #0f172a;
    text-align: left;
    background: rgba(255, 255, 255, 0.66);
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 13px;
    cursor: pointer;
    transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
  }

  .poi-item:hover,
  .poi-item--selected {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(37, 99, 235, 0.38);
  }

  .poi-item__icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    background: rgba(37, 99, 235, 0.12);
    border-radius: 11px;
    font-size: 18px;
  }

  .poi-item__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .poi-item__title,
  .poi-item__meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .poi-item__title {
    font-size: 13px;
    font-weight: 700;
  }

  .poi-item__meta {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .poi-empty {
    padding: 18px;
    color: #64748b;
    text-align: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px dashed rgba(100, 116, 139, 0.3);
    border-radius: 14px;
    font-size: 13px;
    font-weight: 500;
  }

  .poi-selected-marker {
    background: transparent;
    border: 0;
  }

  .poi-selected-marker span {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    border: 3px solid rgba(255, 255, 255, 0.95);
    border-radius: 50% 50% 50% 8px;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.35);
    font-size: 20px;
    transform: rotate(-45deg);
  }

  .poi-selected-marker b {
    display: block;
    font-weight: 700;
    transform: rotate(45deg);
  }

  .filter-panel__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .filter-panel__eyebrow {
    width: fit-content;
    padding: 4px 9px;
    color: #0f766e;
    background: rgba(13, 148, 136, 0.12);
    border: 1px solid rgba(13, 148, 136, 0.18);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .filter-panel__title-row {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 12px;
  }

  .filter-panel h2 {
    margin: 0;
    color: #0f172a;
    font-size: 21px;
    line-height: 1.2;
  }

  .filter-panel__count {
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .filter-field span {
    color: #334155;
    font-size: 13px;
    font-weight: 700;
  }

  .filter-field input,
  .filter-field select {
    width: 100%;
    box-sizing: border-box;
    min-height: 42px;
    padding: 0 12px;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(148, 163, 184, 0.58);
    border-radius: 12px;
    font-size: 14px;
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .filter-field input:focus,
  .filter-field select:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.96);
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
  }

  .filter-range-row {
    display: flex;
    gap: 10px;
  }

  .filter-summary {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.64);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 14px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  }

  .filter-summary__topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .filter-summary__topline span {
    color: #0f766e;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .filter-summary__topline strong {
    color: #0f172a;
    font-size: 13px;
    font-weight: 850;
    line-height: 1.3;
    white-space: nowrap;
  }

  .filter-summary__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .filter-summary__grid div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 9px;
    background: rgba(241, 245, 249, 0.66);
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 11px;
  }

  .filter-summary__grid span {
    color: #64748b;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .filter-summary__grid strong {
    color: #0f172a;
    font-size: 12.5px;
    font-weight: 800;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .filter-summary__empty {
    padding: 12px;
    color: #475569;
    text-align: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px dashed rgba(100, 116, 139, 0.28);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.45;
  }

  .filter-actions {
    display: flex;
    gap: 10px;
    padding-top: 2px;
  }

  .filter-button {
    flex: 1;
    min-height: 42px;
    border: 0;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
  }

  .filter-button:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }

  .filter-button:active {
    transform: translateY(0);
  }

  .filter-button--apply {
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #10b981);
    box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24);
  }

  .filter-button--clear {
    color: #7f1d1d;
    background: rgba(254, 226, 226, 0.88);
    border: 1px solid rgba(248, 113, 113, 0.28);
  }

  @media (max-width: 640px) {
    .map-shell {
      --sidebar-width: min(330px, 92vw);
    }

    .sidebar-toggle {
      width: 44px;
      height: 44px;
      font-size: 21px;
    }

    .filter-panel {
      padding: 76px 14px 14px;
      border-radius: 0 16px 16px 0;
    }

    .filter-panel h2 {
      font-size: 18px;
    }

    .filter-actions,
    .filter-range-row {
      gap: 8px;
    }

    .filter-summary__grid {
      grid-template-columns: 1fr;
    }

    .stats-metric-grid {
      grid-template-columns: 1fr;
    }

    .stats-metric {
      min-height: 92px;
    }

    .district-card__grid {
      grid-template-columns: 1fr;
    }
  }
`;
