export const SECTION_LABELS = {
  overview: "Overview",
  operations: "Operations",
  admin: "Administration",
};

/** Strip leading/trailing slashes for consistent route matching. */
export function normalizePath(path) {
  return (path || "").replace(/^\/+/, "").replace(/\/+$/, "");
}

const DETAIL_ROUTE_PREFIXES = {
  "generate/panel/list": ["view-panel-details"],
  "production/list": ["view-production-panels"],
  "dispatch/list": ["view-dispatch-panels", "dispatch/panel/update"],
  "receiver/safe/list": ["receiver/panels", "receiver/fetch-panels-detail"],
  "user/list": ["user/edit", "user/view"],
  "hold-production/list": ["hold-production-panels"],
  "production-damage/list": ["production-damage"],
  "damage/list": ["damage"],
  "receiver/damage/list": ["receiver/damage"],
};

/** Whether a menu path matches the current URL (including related detail routes). */
export function isMenuPathActive(menuPath, pathname) {
  const menu = normalizePath(menuPath);
  const current = normalizePath(pathname);

  if (menu === "dashboard" || menu === "") {
    return current === "" || current === "dashboard";
  }

  if (current === menu) return true;

  const prefixes = DETAIL_ROUTE_PREFIXES[menu];
  if (prefixes?.some((prefix) => current === prefix || current.startsWith(`${prefix}/`))) {
    return true;
  }

  return current.startsWith(`${menu}/`);
}

/** Parent menu title that contains the active child route, if any. */
export function getActiveParentTitle(items, pathname) {
  for (const item of items) {
    if (item.content?.some((sub) => isMenuPathActive(sub.to, pathname))) {
      return item.title;
    }
  }
  return "";
}

/** Whether any child of a menu group matches the current route. */
export function isParentRouteActive(item, pathname) {
  return item.content?.some((sub) => isMenuPathActive(sub.to, pathname)) ?? false;
}

/** Insert section labels before the first item in each group. */
export function buildMenuWithSections(filteredItems) {
  const rows = [];
  let lastSection = null;

  filteredItems.forEach((item) => {
    if (item.section && item.section !== lastSection) {
      rows.push({ type: "label", key: `label-${item.section}`, title: SECTION_LABELS[item.section] });
      lastSection = item.section;
    }
    rows.push({ type: "item", key: item.title, data: item });
  });

  return rows;
}
