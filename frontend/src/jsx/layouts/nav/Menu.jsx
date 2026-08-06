import { hasPermission } from "../../../utils/auth.js";

export const MenuList = [
  {
    section: "overview",
    title: "Dashboard",
    icon: "fa-chart-column",
    to: "dashboard",
    permission: "dashboard",
  },

  {
    section: "operations",
    title: "Panel Generation",
    icon: "fa-solar-panel",
    content: [
      { title: "Generate Panel", to: "panel/generate", permission: "generate_panel" },
      { title: "View Panel List", to: "generate/panel/list", permission: "view_panel_list" },
    ],
  },

  {
    section: "operations",
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
    section: "operations",
    title: "Hold Production",
    icon: "fa-pause-circle",
    content: [
      { title: "Add Hold Production", to: "hold-production/add", permission: "add_production" },
      { title: "View Hold Production", to: "hold-production/list", permission: "add_production" },
    ],
  },

  {
    section: "operations",
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
    section: "operations",
    title: "Receive Panel",
    icon: "fa-truck-ramp-box",
    content: [
      { title: "View Safe Panels", to: "receiver/safe/list", permission: "recieve_panels" },
      { title: "Add Receiving Damage", to: "receiver/damage/create", permission: "add_recieving_damage" },
      { title: "View Receiving Damage List", to: "receiver/damage/list", permission: "view_recieving_damage" },
    ],
  },

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
      const filtered = menu.content.filter((item) => hasPermission(item.permission));
      return filtered.length > 0 ? { ...menu, content: filtered } : null;
    }

    return hasPermission(menu.permission) ? menu : null;
  }).filter(Boolean);

export default getFilteredMenuList;
