import { useReducer, useContext, useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Link } from "react-router-dom";
import { Collapse, Dropdown } from "react-bootstrap";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import { MenuList } from "./Menu";
import { ThemeContext } from "../../../context/ThemeContext";
import LogoutPage from "./Logout";
import profile from "../../../assets/images/profile/profileimg3.jpg";

// REDUX
import { useDispatch, useSelector } from "react-redux";
import { navtoggle } from "../../../store/actions/AuthActions";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

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

  const [state, setState] = useReducer(reducer, initialState);

  // Toggle listener
  useEffect(() => {
    const btn = document.querySelector(".nav-control");
    const wrapper = document.querySelector("#main-wrapper");

    const toggleFunc = () => {
      wrapper.classList.toggle("menu-toggle");
    };

    if (btn) btn.addEventListener("click", toggleFunc);

    return () => {
      if (btn) btn.removeEventListener("click", toggleFunc);
    };
  }, []);

  // Scroll hide
  const [hideOnScroll, setHideOnScroll] = useState(true);

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    },
    [hideOnScroll]
  );

  // Menu Active
  const handleMenuActive = (status) => {
    setState({ active: status });
    if (state.active === status) {
      setState({ active: "" });
    }
  };


  // MOBILE AUTO CLOSE
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

  // Path active
  let path = window.location.pathname;
  path = path.split("/");
  path[path.length - 1];

  return (
    <div
      onMouseEnter={() => ChangeIconSidebar(true)}
      onMouseLeave={() => ChangeIconSidebar(false)}
      className={`dlabnav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <PerfectScrollbar className="dlabnav-scroll">
        <ul className="metismenu" id="menu">
          
          {/* Profile */}
          <Dropdown as="li" className="nav-item dropdown header-profile">
            <Dropdown.Toggle
              variant=""
              as="a"
              className="nav-link i-false c-pointer"
            >
              <img
                src={profile}
                width="50"
                height="50"
                alt="profile"
                className="rounded-circle object-fit-cover"
              />
              <div className="header-info ms-3">
                <span className="font-w600">
                  Hi,<b> Admin</b>
                </span>
                <small className="text-end font-w400">
                  superadmin@gmail.com
                </small>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="mt-2">
              <Link
                to="/app-profile"
                className="dropdown-item ai-icon"
                onClick={closeSidebarMobile}
              >
                Profile
              </Link>

              <div onClick={closeSidebarMobile}>
                <LogoutPage />
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* Menu */}
          {MenuList.map((data, index) => {
            let menuClass = data.classsChange;

            if (menuClass === "menu-title") {
              return (
                <li className={menuClass} key={index}>
                  {data.title}
                </li>
              );
            } else {
              return (
                <li
                  className={`${
                    state.active === data.title ? "mm-active" : ""
                  }`}
                  key={index}
                >
                  {data.content && data.content.length > 0 ? (
                    <>
                      <Link
                        to="#"
                        className="has-arrow"
                        onClick={() => handleMenuActive(data.title)}
                      >
                        {data.iconStyle}
                        <span className="nav-text">{data.title}</span>
                      </Link>

                      <Collapse
                        in={state.active === data.title ? true : false}
                      >
                        <ul
                          className={`${
                            menuClass === "mm-collapse" ? "mm-show" : ""
                          }`}
                        >
                          {data.content.map((submenu, i) => {
                            return (
                              <li key={i}>
                                <Link
                                  to={submenu.to}
                                  onClick={closeSidebarMobile}
                                >
                                  {submenu.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    <Link to={data.to} onClick={closeSidebarMobile}>
                      {data.iconStyle}
                      <span className="nav-text">{data.title}</span>
                    </Link>
                  )}
                </li>
              );
            }
          })}
        </ul>
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;