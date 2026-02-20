import { useContext } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import Setting from "./layouts/Setting";
import ScrollToTop from './pages/ScrollToTop';

import { ThemeContext } from "../context/ThemeContext";

import Home from "./components/Dashboard/Home";
import DashboardDark from "./components/Dashboard/DashboardDark";
import CardsCenter from "./components/Dashboard/CardsCenter";

import Generatepanel from "./components/GeneratePanel/Generatepanel";
import ViewGeneratePanel from "./components/GeneratePanel/ViewGeneratePanel";
import ViewPanelDetails from "./components/GeneratePanel/ViewPanelDetails";
import ProductionForm from "./components/Production/ProductionForm";
import ViewProduction from "./components/Production/ViewProduction";
import ViewProductionPanels from "./components/Production/ViewProductionPanels";
import DispatchPanel from "./components/DispatchPanel/DispatchPanel";
import ViewDispatchPanel from "./components/DispatchPanel/ViewDispatch";
import ViewDispatchPanels from "./components/DispatchPanel/ViewDispatchPanels";
import DamagePanel from "./components/DamagePanel/Damagepanel";
import ViewDamagePanel from "./components/DamagePanel/ViewDamagePanel";
import AddUser from "./components/User/AddUser";
import ViewUser from "./components/User/ViewUser";
import ReceiveDamagedPanel from "./components/DamagePanel/ReceiveDamagedPanel";
import LockScreen from "./pages/LockScreen";
import EditUser from "./components/User/EditUser";
import ViewSingleUser from "./components/User/ViewSingleUser";

const Markup = () => {
  const allroutes = [
    { url: "", component: <Home /> },
    { url: "dashboard", component: <Home /> },
    { url: "dashboard-dark", component: <DashboardDark /> },
    { url: "cards-center", component: <CardsCenter /> },

    { url: "panel/generate", component: <Generatepanel /> },
    { url: "generate/panel/list", component: <ViewGeneratePanel /> },
    { url: "view-panel-details/:id", component: <ViewPanelDetails /> },

    { url: "production/add", component: <ProductionForm /> },
    { url: "production/list", component: <ViewProduction /> },
    { url: "view-production-panels/:id", component: <ViewProductionPanels /> },


    { url: "dispatch/create", component: <DispatchPanel /> },
    { url: "dispatch/list", component: <ViewDispatchPanel /> },
    { url: "view-dispatch-panels/:id", component: <ViewDispatchPanels /> },


    { url: "sender/damage/create", component: <DamagePanel /> },
    { url: "receiver/damage/create", component: <ReceiveDamagedPanel /> },
    { url: "damage/list", component: <ViewDamagePanel /> },

    { url: "user/add", component: <AddUser /> },
    { url: "user/list", component: <ViewUser /> },
    { url: "user/edit/:id", component: <EditUser /> },
    { url: "user/view/:id", component: <ViewSingleUser /> }
  ];

  return (
    <>
      <Routes>
        <Route path="/page-lock-screen" element={<LockScreen />} />

        <Route path="/" element={<MainLayout />}>
          {allroutes.map((data, i) => (
            <Route key={i} path={data.url} element={data.component} />
          ))}
        </Route>
      </Routes>

      <ScrollToTop />
    </>
  );
};


// ----- ADD THIS HERE (below Markup, above export) -----
function MainLayout() {
  const { sidebariconHover } = useContext(ThemeContext);
  const sideMenu = useSelector((state) => state.sideMenu);

  return (
    <>
      <div
        id="main-wrapper"
        className={`show ${sidebariconHover ? "iconhover-toggle" : ""} ${
          sideMenu ? "menu-toggle" : ""
        }`}
      >
        <Nav />

        <div
          className="content-body"
          style={{ minHeight: window.screen.height - 60 }}
        >
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>

      <Setting />
    </>
  );
}



export default Markup;
