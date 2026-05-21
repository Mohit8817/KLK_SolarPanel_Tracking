export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const getPermissions = () => {
  try {
    const raw = localStorage.getItem("permissions");

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const hasPermission = (permission) => {
  // ❌ NEVER allow empty permission bypass
  if (!permission) return false;

  const permissions = getPermissions();

  // 🔒 fail-safe: block everything if not loaded
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.includes(permission);
};