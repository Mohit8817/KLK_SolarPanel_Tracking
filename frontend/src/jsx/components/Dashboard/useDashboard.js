import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}dashboard/main-dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(response.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stock = data?.stock || {};
  const production = data?.production || {};
  const dispatch = data?.dispatch || {};
  const damage = data?.damage || {};
  const summary = data?.summary || {};

  const totalPanels = stock.totalPanelsProduced || 0;
  const totalProduction = production.totalProduction || 0;
  const totalDispatched = dispatch.totalDispatched || 0;
  const inStock = stock.inStock || 0;
  const totalDamage = damage.totalDamage || 0;
  const productionDamaged = damage.productionDamaged || 0;
  const dispatchedDamaged = damage.dispatchedDamaged || 0;
  const collectedDamaged = damage.dispatchedAndCollectedDamaged || 0;
  const todayProduction = production.todayProduction || 0;
  const pendingProduction = stock.pendingProduction || 0;
  const onHold = stock.onHold || 0;
  const pendingReceive = dispatch.dispatchedNotCollected || 0;
  const safeReceived = dispatch.safePanelsReceived || 0;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthLabel = new Date(currentYear, currentMonth - 1).toLocaleString(
    "en-US",
    { month: "short", year: "numeric" }
  );
  const currentMonthData = data?.monthWiseData?.find(
    (m) => m?._id?.month === currentMonth && m?._id?.year === currentYear
  );

  const readyToDispatch = stock.readyToDispatch ?? summary.pendingDispatch ?? 0;
  const totalCollected = dispatch.dispatchedAndCollected || 0;
  const thisMonthGenerated = currentMonthData?.totalGenerated || 0;
  const thisMonthProduction = currentMonthData?.totalProduction || 0;
  const thisMonthDispatched = currentMonthData?.totalDispatched || 0;

  const pctOfTotal = (val) => (totalPanels ? Math.round((val / totalPanels) * 100) : 0);
  const dmgPct = (val) => (totalDamage ? Math.round((val / totalDamage) * 100) : 0);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchDashboard,
    summary,
    totalPanels,
    totalProduction,
    totalDispatched,
    inStock,
    totalDamage,
    productionDamaged,
    dispatchedDamaged,
    collectedDamaged,
    todayProduction,
    pendingProduction,
    onHold,
    pendingReceive,
    safeReceived,
    readyToDispatch,
    totalCollected,
    thisMonthGenerated,
    thisMonthProduction,
    thisMonthDispatched,
    currentMonthLabel,
    currentMonthData,
    pctOfTotal,
    dmgPct,
  };
}
