import express from "express";

import {
  getHoldCapacity,
  getGeneratedYearByCapacity,
  getCompanyPrefix,
  getPanelType,
  getAvailablePanelCount,
  createHoldPanel,
  fetchAllHoldPanels,
  fetchHoldPanelById,
  getPanelsByHoldPanelById,
  getHoldDetails,
  releasePanel,
  getReleasePanels
} from "../controllers/holdpanel.controller.js";

const router = express.Router();

router.get("/hold-capacity", getHoldCapacity);

router.get(
  "/generated-year",
  getGeneratedYearByCapacity
);

router.get(
  "/company-prefix",
  getCompanyPrefix
);

router.get(
  "/panel-type",
  getPanelType
);

router.get(
  "/available-count",
  getAvailablePanelCount
);

router.post(
  "/hold-panel",
   createHoldPanel
);


router.get("/view-hold-panel", fetchAllHoldPanels );

router.get("/view-hold-panel/:id", fetchHoldPanelById);

router.get("/hold-panel/:id", getPanelsByHoldPanelById);


router.get("/hold-details/:id", getHoldDetails);

router.post("/release-panels", releasePanel);

router.get(
    "/release-panels/:hold_id",
    getReleasePanels
);


export default router