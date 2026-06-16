import { useContext } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom"; 
import { useSelector } from "react-redux";

import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import Setting from "./layouts/Setting";
import ScrollToTop from './pages/ScrollToTop';

import { ThemeContext } from "../context/ThemeContext";

import Home from "./components/Dashboard/Home";

import Generatepanel from "./components/GeneratePanel/Generatepanel";
import ViewGeneratePanel from "./components/GeneratePanel/ViewGeneratePanel";
import ViewPanelDetails from "./components/GeneratePanel/ViewPanelDetails";
import ProductionForm from "./components/Production/ProductionForm";
import ViewProduction from "./components/Production/ViewProduction";
import ViewProductionPanels from "./components/Production/ViewProductionPanels";
import ProductionDamage from "./components/Production/ProductionDamage";
import ViewProductionDamage from "./components/Production/ViewProductionDamage";
import DispatchPanel from "./components/DispatchPanel/DispatchPanel";
import ViewDispatchPanel from "./components/DispatchPanel/ViewDispatch";
import ViewDispatchPanels from "./components/DispatchPanel/ViewDispatchPanels";
import UpdateDispatchPanel from "./components/DispatchPanel/UpdateDispatchPanel";
import DamagePanel from "./components/DamagePanel/Damagepanel";
import ViewDamagePanel from "./components/DamagePanel/ViewDamagePanel";
import AddUser from "./components/User/AddUser";
import ViewUser from "./components/User/ViewUser";
import EditUser from "./components/User/EditUser";
import ViewSingleUser from "./components/User/ViewSingleUser";

import ReceiveDamagedPanel from "./components/PanelReceiver/ReceiveDamagedPanel";
import LockScreen from "./pages/LockScreen";

import ReceiveSafePanel from "./components/PanelReceiver/ReceiveSafePanel";
import ViewReceiveSafePanel from "./components/PanelReceiver/ViewReceiveSafePanel";
import ViewReceivedPanels from "./components/PanelReceiver/ViewReceivedPanels";
import ViewReceiveDamagedPanel from "./components/PanelReceiver/ViewReceiveDamagedPanel";

import AddManufactureDamage from "./components/ManufactureDamage/AddManufactureDamage";
import ViewManufactureDamage from "./components/ManufactureDamage/ViewManufactureDamage";

import RoleList from "./components/RolePermission/RoleList";
import PermissionList from "./components/RolePermission/PermissionList";
import VendorProduction from "./components/Production/VendorProduction";


import HoldProductionform from "./components/HoldProduction/HoldProductionform";
import ViewHoldProd from "./components/HoldProduction/ViewHoldProd";
import ViewHoldPanels from "./components/HoldProduction/ViewHoldpanels";



const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

const Markup = () => {
  const allroutes = [
    { url: "", component: <Home /> },
    { url: "dashboard", component: <Home /> },


    { url: "panel/generate", component: <Generatepanel /> },
    { url: "generate/panel/list", component: <ViewGeneratePanel /> },
    { url: "view-panel-details/:id", component: <ViewPanelDetails /> },

    { url: "manufacture-damage/add", component: <AddManufactureDamage /> },
    { url: "manufacture-damage/list", component: <ViewManufactureDamage /> },

    { url: "production/add", component: <ProductionForm /> },
    { url: "production/list", component: <ViewProduction /> },
    { url: "view-production-panels/:id", component: <ViewProductionPanels /> },
    { url: "production-damage/add", component: <ProductionDamage /> },
    { url: "production-damage/list", component: <ViewProductionDamage /> },
    { url: "production/vendor-list", component: <VendorProduction /> },

    { url: "dispatch/create", component: <DispatchPanel /> },
    { url: "dispatch/list", component: <ViewDispatchPanel /> },
    { url: "view-dispatch-panels/:id", component: <ViewDispatchPanels /> },
    { url: "dispatch/panel/update/:id", component: <UpdateDispatchPanel /> },

    { url: "receiver/panels/:id", component: <ReceiveSafePanel /> },
    { url: "receiver/safe/list", component: <ViewReceiveSafePanel /> },
    { url: "receiver/fetch-panels-detail/:id", component: <ViewReceivedPanels /> },

    { url: "sender/damage/create", component: <DamagePanel /> },
    { url: "damage/list", component: <ViewDamagePanel /> },
    { url: "receiver/damage/create", component: <ReceiveDamagedPanel /> },
    { url: "receiver/damage/list", component: <ViewReceiveDamagedPanel /> },

    { url: "user/add", component: <AddUser /> },
    { url: "user/list", component: <ViewUser /> },
    { url: "user/edit/:id", component: <EditUser /> },
    { url: "user/view/:id", component: <ViewSingleUser /> },

    { url: "role/list", component: <RoleList /> },
    { url: "permission/list", component: <PermissionList /> },

    { url: "hold-production/add", component: <HoldProductionform /> },
    { url: "hold-production/list", component: < ViewHoldProd/> },
    { url: "hold-production-panels/:id", component: < ViewHoldPanels/> },

  ];

  return (
    <>
      <Routes>
              <Route path="/page-lock-screen" element={<LockScreen />} />      
        <Route path="*" element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          {allroutes.map((data, i) => (
            <Route key={i} path={data.url} element={data.component} />
          ))}
        </Route>
      </Routes>

      <ScrollToTop />
    </>
  );
};

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