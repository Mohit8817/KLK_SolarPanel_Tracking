import { useContext, useEffect, useMemo, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import { useDispatch, useSelector } from "react-redux";
import { getFilteredMenuList } from "./Menu";
import {
  buildMenuWithSections,
  getActiveParentTitle,
  isMenuPathActive,
  isParentRouteActive,
} from "./menuUtils";
import { ThemeContext } from "../../../context/ThemeContext";
import { navtoggle } from "../../../store/actions/AuthActions";
import LogoutPage from "./Logout";
import profile from "../../../assets/images/profile/profileimg3.jpg";
import "./Sidebar.css";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const MenuIcon = ({ icon }) => (
  <span className="klk-sidebar__icon-box">
    <i className={`fa-solid ${icon}`} aria-hidden="true" />
  </span>
);

const SideBar = () => {
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
  } = useContext(ThemeContext);

  const dispatch = useDispatch();
  const sideMenu = useSelector((state) => state.sideMenu);
  const isCollapsed = sideMenu;
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState(() => getFilteredMenuList());
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setMenuItems(getFilteredMenuList());
  }, []);

  useEffect(() => {
    const parent = getActiveParentTitle(menuItems, location.pathname);
    if (parent) setOpenMenu(parent);
  }, [location.pathname, menuItems]);

  const menuRows = useMemo(
    () => buildMenuWithSections(menuItems),
    [menuItems]
  );

  const [hideOnScroll, setHideOnScroll] = useState(true);

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    },
    [hideOnScroll]
  );

  const handleMenuActive = (title) => {
    if (isCollapsed) return;
    setOpenMenu((prev) => (prev === title ? "" : title));
  };

  const closeSidebarMobile = () => {
    if (window.innerWidth < 991 && sideMenu) {
      ChangeIconSidebar(false);
      dispatch(navtoggle());

      const wrapper = document.querySelector("#main-wrapper");
      if (wrapper) {
        wrapper.classList.add("menu-toggle");
      }
    }
  };

  const sidebarClass =
    iconHover +
    (sidebarposition.value === "fixed" &&
    sidebarLayout.value === "horizontal" &&
    headerposition.value === "static"
      ? hideOnScroll > 120
        ? " fixed"
        : ""
      : "");

  return (
    <div
      onMouseEnter={() => ChangeIconSidebar(true)}
      onMouseLeave={() => ChangeIconSidebar(false)}
      className={`dlabnav klk-sidebar${isCollapsed ? " klk-sidebar--collapsed" : ""} ${sidebarClass}`.trim()}
    >
      <PerfectScrollbar className="dlabnav-scroll">
        <ul className="metismenu" id="menu">
          <li className="klk-sidebar__profile">
            <Dropdown as="div" className="w-100">
              <Dropdown.Toggle
                variant=""
                as="a"
                className="klk-sidebar__profile-toggle c-pointer"
              >
                <img
                  src={`${baseURL}/uploads/${user?.emp_image}`}
                  onError={(e) => {
                    e.target.src = profile;
                  }}
                  alt="profile"
                  className="klk-sidebar__avatar"
                />
                <div className="klk-sidebar__profile-info">
                  <span className="klk-sidebar__profile-name">
                    {user
                      ? `${user.first_name} ${user.last_name}`
                      : "User"}
                  </span>
                  <small className="klk-sidebar__profile-email">
                    {user?.email || "No email"}
                  </small>
                </div>
                <i
                  className="fa-solid fa-chevron-down klk-sidebar__profile-chev"
                  aria-hidden="true"
                />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="mt-2 dropdown-menu dropdown-menu-end">
                <Link to="/app-profile" className="dropdown-item ai-icon">
                  <i className="fa-solid fa-user text-primary me-2" aria-hidden="true" />
                  Profile
                </Link>
                <LogoutPage />
              </Dropdown.Menu>
            </Dropdown>
          </li>

          {menuRows.map((row) => {
            if (row.type === "label") {
              return (
                <li className="klk-sidebar__label" key={row.key}>
                  <span className="klk-sidebar__label-text">{row.title}</span>
                </li>
              );
            }

            const data = row.data;
            const hasChildren = data.content?.length > 0;
            const parentActive = isParentRouteActive(data, location.pathname);
            const isExpanded = !isCollapsed && openMenu === data.title;
            const liClass = [
              isExpanded || parentActive ? "mm-active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            if (hasChildren) {
              return (
                <li className={liClass} key={row.key}>
                  <a
                    href="#"
                    className={`has-arrow klk-sidebar__link${
                      parentActive ? " klk-sidebar__link--active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuActive(data.title);
                    }}
                  >
                    <MenuIcon icon={data.icon} />
                    <span className="nav-text">{data.title}</span>
                  </a>

                  <ul className={isExpanded ? "mm-show" : undefined}>
                    {data.content.map((submenu) => (
                      <li key={submenu.to}>
                        <NavLink
                          to={submenu.to}
                          isActive={() =>
                            isMenuPathActive(submenu.to, location.pathname)
                          }
                          className={({ isActive }) =>
                            isActive ? "klk-sidebar__link--active" : undefined
                          }
                          onClick={closeSidebarMobile}
                        >
                          {submenu.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li
                className={
                  isMenuPathActive(data.to, location.pathname)
                    ? "mm-active"
                    : undefined
                }
                key={row.key}
              >
                <NavLink
                  to={data.to}
                  isActive={() =>
                    isMenuPathActive(data.to, location.pathname)
                  }
                  className={({ isActive }) =>
                    `klk-sidebar__link${
                      isActive ? " klk-sidebar__link--active" : ""
                    }`
                  }
                  onClick={closeSidebarMobile}
                >
                  <MenuIcon icon={data.icon} />
                  <span className="nav-text">{data.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;
