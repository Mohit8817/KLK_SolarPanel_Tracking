import { getPermissions, hasPermission } from "../../../utils/auth.js";

// ================= MENU =================
export const MenuList = [
  {
    title: "Dashboard",
    iconStyle: <i className="flaticon-025-dashboard"></i>,
    to: "dashboard",
    permission: "dashboard",
  },

  {
    title: "Panel Generation",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-solar-panel fw-bold"></i>,
    content: [
      { title: "Generate Panel", to: "panel/generate", permission: "generate_panel" },
      { title: "View Panel List", to: "generate/panel/list", permission: "view_panel_list" },
    ],
  },

  {
    title: "Production",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-industry fw-bold"></i>,
    content: [
      { title: "Add Production", to: "production/add", permission: "add_production" },
      { title: "View Production List", to: "production/list", permission: "view_production" },
      { title: "Add Damage", to: "production-damage/add", permission: "add_production_damage" },
      { title: "Damage List", to: "production-damage/list", permission: "view_production_damage_list" },
      { title: "Vendor Production List", to: "production/vendor-list", permission: "view_vendor_production_list" },
    ],
  },

  {
    title: "Hold Production",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-pause-circle fw-bold"></i>,
    content: [
      { title: "Add Hold Production", to: "hold-production/add", permission: "add_production" },
      { title: "View Hold Production", to: "hold-production/list", permission: "add_production" },
    ],
  },

  {
    title: "Dispatch Panel",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-truck-fast fw-bold"></i>,
    content: [
      { title: "Dispatch Panel", to: "/dispatch/create", permission: "add_dispatch" },
      { title: "View Dispatch List", to: "/dispatch/list", permission: "view_dispatch" },
      { title: "Add Damage", to: "sender/damage/create", permission: "add_sender_damage" },
      { title: "View Damage List", to: "/damage/list", permission: "view_sender_damage" },
    ],
  },

  {
    title: "Receive Panel",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-truck-ramp-box fw-bold" />,
    content: [
      {
        title: "View Safe Panels",
        to: "receiver/safe/list",
        permission: "recieve_panels",
      },
      {
        title: "Add Reicieving Damage Panel",
        to: "receiver/damage/create",
        permission: "add_recieving_damage",
      },
      {
        title: "View Reicieving Damage List",
        to: "receiver/damage/list",
        permission: "view_recieving_damage",
      },
    ],
  },

  {
    title: "User Management",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-users fw-bold"></i>,
    content: [
      { title: "Add User", to: "/user/add", permission: "add_user" },
      { title: "View Users", to: "/user/list", permission: "view_user" },
    ],
  },

  {
    title: "Settings",
    classsChange: "mm-collapse",
    iconStyle: <i className="fa-solid fa-gear fw-bold"></i>,
    content: [
      { title: "Role Permission", to: "role/list", permission: "manage_role" },
      { title: "Permission", to: "permission/list", permission: "manage_permission" },
    ],
  },
];

export const getFilteredMenuList = () =>
  MenuList.map((menu) => {
    if (menu.content) {
      const filtered = menu.content.filter((item) =>
        hasPermission(item.permission)
      );

      return filtered.length > 0 ? { ...menu, content: filtered } : null;
    }

    return hasPermission(menu.permission) ? menu : null;
  }).filter(Boolean);

// Recomputed on each import after login navigation; prefer getFilteredMenuList() in components.
export const FilteredMenuList = getFilteredMenuList();

export default FilteredMenuList;
