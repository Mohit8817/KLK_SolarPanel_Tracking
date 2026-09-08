import { hasPermission } from "../../../utils/auth.js";

export const MenuList = [
  {
    section: "overview",
    title: "Panel Dashboard",
    icon: "fa-chart-column",
    to: "dashboard",
    permission: "dashboard",
  },
  {
    section: "overview",
    title: "Light & Battery Dashboard",
    icon: "fa-chart-column",
    to: "light/dashboard",
    permission: "dashboard",
  },

  // ==========================================
  // SOLAR PANEL OPERATIONS
  // ==========================================
  {
    section: "panel_operations",
    title: "Panel Generation",
    icon: "fa-solar-panel",
    content: [
      { title: "Generate Panel", to: "panel/generate", permission: "generate_panel" },
      { title: "View Panel List", to: "generate/panel/list", permission: "view_panel_list" },
    ],
  },

  {
    section: "panel_operations",
    title: "Production",
    icon: "fa-industry",
    content: [
      { title: "Add Production", to: "production/add", permission: "add_production" },
      { title: "View Production List", to: "production/list", permission: "view_production" },
      { title: "Add Damage", to: "production-damage/add", permission: "add_production_damage" },
      { title: "Damage List", to: "production-damage/list", permission: "view_production_damage_list" },
      { title: "Vendor Production List", to: "production/vendor-list", permission: "view_vendor_production_list" },
    ],
  },

  {
    section: "panel_operations",
    title: "Hold Production",
    icon: "fa-pause-circle",
    content: [
      { title: "Add Hold Production", to: "hold-production/add", permission: "add_production" },
      { title: "View Hold Production", to: "hold-production/list", permission: "add_production" },
    ],
  },

  {
    section: "panel_operations",
    title: "Dispatch Panel",
    icon: "fa-truck-fast",
    content: [
      { title: "Dispatch Panel", to: "dispatch/create", permission: "add_dispatch" },
      { title: "View Dispatch List", to: "dispatch/list", permission: "view_dispatch" },
      { title: "Add Damage", to: "sender/damage/create", permission: "add_sender_damage" },
      { title: "View Damage List", to: "damage/list", permission: "view_sender_damage" },
    ],
  },

  {
    section: "panel_operations",
    title: "Receive Panel",
    icon: "fa-truck-ramp-box",
    content: [
      { title: "View Safe Panels", to: "receiver/safe/list", permission: "recieve_panels" },
      { title: "Add Receiving Damage", to: "receiver/damage/create", permission: "add_recieving_damage" },
      { title: "View Receiving Damage List", to: "receiver/damage/list", permission: "view_recieving_damage" },
    ],
  },

  // ==========================================
  // SOLAR LIGHT & BATTERY OPERATIONS
  // ==========================================
  {
    section: "light_operations",
    title: "Serial Generation",
    icon: "fa-barcode",
    content: [
      { title: "Generate Serials", to: "light/serial/generate", permission: "" },
      { title: "Serial Lot List", to: "light/serial/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: "BOM & Stock Request",
    icon: "fa-boxes-stacked",
    content: [
      { title: "Material Request", to: "light/bom/request", permission: "" },
      { title: "Request & OTP List", to: "light/bom/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: " Light & Battery Production",
    icon: "fa-screwdriver-wrench",
    content: [
      { title: "Add Production", to: "light/production/add", permission: "" },
      { title: "Production List", to: "light/production/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: "Quality Check",
    icon: "fa-clipboard-check",
    content: [
      { title: "Quality Check Inspection", to: "light/qc/inspection", permission: "" },
      { title: "Quality Check Tested List", to: "light/qc/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: "Box Packaging",
    icon: "fa-box-open",
    content: [
      { title: "Packaging Console", to: "light/box/packaging", permission: "" },
      { title: "Sealed Boxes List", to: "light/box/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: "Dispatch Light",
    icon: "fa-dolly",
    content: [
      { title: "Dispatch Boxes", to: "light/dispatch/create", permission: "" },
      { title: "View Dispatch List", to: "light/dispatch/list", permission: "" },
    ],
  },

  {
    section: "light_operations",
    title: "Receive Light",
    icon: "fa-warehouse",
    content: [
      { title: "Receive Boxes", to: "light/receive/boxes", permission: "" },
      { title: "Received Box List", to: "light/receive/list", permission: "" },
    ],
  },



  // ==========================================
  // ADMINISTRATION
  // ==========================================
  {
    section: "admin",
    title: "User Management",
    icon: "fa-users",
    content: [
      { title: "Add User", to: "user/add", permission: "add_user" },
      { title: "View Users", to: "user/list", permission: "view_user" },
    ],
  },

  {
    section: "admin",
    title: "Settings",
    icon: "fa-gear",
    content: [
      { title: "Role Permission", to: "role/list", permission: "manage_role" },
      { title: "Permission", to: "permission/list", permission: "manage_permission" },
    ],
  },
];

export const getFilteredMenuList = () =>
  MenuList.map((menu) => {
    if (menu.content) {
      const filtered = menu.content.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      });
      return filtered.length > 0 ? { ...menu, content: filtered } : null;
    }

    if (!menu.permission) return menu;
    return hasPermission(menu.permission) ? menu : null;
  }).filter(Boolean);

export default getFilteredMenuList;
