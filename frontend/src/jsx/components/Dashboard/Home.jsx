/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
import { ThemeContext } from "../../../context/ThemeContext";
import { PageLoader, ErrorState } from "../Common/LoadingState";
import PageHeader from "../Common/PageHeader";
import DashboardStatCard from "./DashboardStatCard";
import DashboardSection from "./DashboardSection";
import DashboardCapacityTable from "./DashboardCapacityTable";
import DashboardPrefixTable from "./DashboardPrefixTable";
import { useDashboard } from "./useDashboard";
import "./Dashboard.css";

const PolarChart = loadable(() =>
  pMinDelay(import("../Dompet/Home/PolarChart"), 1000)
);
const ActivityApexBarGraph = loadable(() =>
  pMinDelay(import("../Dompet/Home/ActivityApexBarGraph"), 1000)
);
const TransactionApexBar = loadable(() =>
  pMinDelay(import("../Dompet/Home/TransactionApexBar"), 1000)
);

const QUICK_ACTIONS = [
  { label: "Generate", desc: "Create serial lot", to: "/panel/generate", icon: "fa-plus" },
  { label: "Production", desc: "Add production", to: "/production/add", icon: "fa-industry" },
  { label: "Dispatch", desc: "Ship panels", to: "/dispatch/create", icon: "fa-truck-fast" },
  { label: "Receive", desc: "Record receiving", to: "/receiver/safe/list", icon: "fa-truck-ramp-box" },
];

const PIPELINE_ICONS = {
  generated: "fa-solar-panel",
  produced: "fa-industry",
  inStock: "fa-warehouse",
  dispatched: "fa-truck-fast",
  received: "fa-truck-ramp-box",
  damaged: "fa-triangle-exclamation",
};

const Home = () => {
  const dash = useDashboard();
  const {
    data, loading, error, lastUpdated, fetchDashboard, summary,
    totalPanels, totalProduction, totalDispatched, inStock, totalDamage,
    productionDamaged, dispatchedDamaged, collectedDamaged,
    todayProduction, pendingProduction, onHold, pendingReceive, safeReceived,
    readyToDispatch, totalCollected, thisMonthGenerated, thisMonthProduction, thisMonthDispatched,
    currentMonthLabel, currentMonthData, pctOfTotal, dmgPct,
  } = dash;

  const { changeBackground, changePrimaryColor, chnageSidebarColor } =
    useContext(ThemeContext);

  useEffect(() => {
    changeBackground({ value: "light", label: "Light" });
    changePrimaryColor("color_1");
    chnageSidebarColor("color_1");
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Generated", value: totalPanels, hint: "All serial numbers", icon: "fa-solar-panel", accent: "teal", to: "/generate/panel/list" },
      { label: "Production", value: totalProduction, hint: pendingProduction ? `${pendingProduction.toLocaleString()} pending` : undefined, icon: "fa-industry", accent: "dark", to: "/production/list" },
      { label: "Dispatched", value: totalDispatched, hint: pendingReceive ? `${pendingReceive.toLocaleString()} in transit` : undefined, icon: "fa-truck-fast", accent: "blue", to: "/dispatch/list" },
      { label: "In stock", value: inStock, hint: onHold ? `${onHold.toLocaleString()} on hold` : "Ready to dispatch", icon: "fa-warehouse", accent: "amber", to: "/production/list" },
      { label: "Received", value: safeReceived, hint: "Safely received panels", icon: "fa-truck-ramp-box", accent: "teal", to: "/receiver/safe/list" },
      { label: "Today", value: todayProduction, hint: "Produced today", icon: "fa-calendar-day", accent: "dark" },
      { label: "Damage", value: totalDamage, hint: summary.damageRate ? `${summary.damageRate}% of total` : undefined, icon: "fa-triangle-exclamation", accent: "rose", to: "/production-damage/list" },
      { label: "On hold", value: onHold, hint: "Awaiting release", icon: "fa-pause-circle", accent: "slate", to: "/hold-production/list" },
    ],
    [totalPanels, totalProduction, pendingProduction, totalDispatched, pendingReceive, inStock, onHold, safeReceived, todayProduction, totalDamage, summary.damageRate]
  );

  const operationalKpis = useMemo(
    () => [
      { label: "Ready to dispatch", value: readyToDispatch, hint: "Produced, not yet shipped", icon: "fa-box-open", accent: "amber", to: "/production/list" },
      { label: "Pending production", value: pendingProduction, hint: "Serials awaiting production", icon: "fa-clock", accent: "dark", to: "/production/add" },
      { label: "Total collected", value: totalCollected, hint: `${safeReceived.toLocaleString()} received safe`, icon: "fa-circle-check", accent: "teal", to: "/receiver/safe/list" },
      { label: "Prod. damaged", value: productionDamaged, hint: "Damaged during production", icon: "fa-screwdriver-wrench", accent: "rose", to: "/production-damage/list" },
      { label: `${currentMonthLabel} generated`, value: thisMonthGenerated, hint: "Panels created this month", icon: "fa-calendar-plus", accent: "teal" },
      { label: `${currentMonthLabel} produced`, value: thisMonthProduction, hint: "Production completed this month", icon: "fa-calendar-check", accent: "dark" },
      { label: `${currentMonthLabel} dispatched`, value: thisMonthDispatched, hint: "Shipped this month", icon: "fa-calendar-week", accent: "blue", to: "/dispatch/list" },
      { label: "Pending receive", value: pendingReceive, hint: "Dispatched, not collected", icon: "fa-truck", accent: "blue", to: "/dispatch/list" },
    ],
    [readyToDispatch, pendingProduction, totalCollected, safeReceived, productionDamaged, currentMonthLabel, thisMonthGenerated, thisMonthProduction, thisMonthDispatched, pendingReceive]
  );

  const glanceItems = useMemo(
    () => [
      { label: "Production rate", value: `${summary.productionRate ?? 0}%`, icon: "fa-industry" },
      { label: "Dispatch rate", value: `${summary.dispatchRate ?? 0}%`, icon: "fa-truck-fast" },
      { label: "Receive rate", value: `${summary.receiveRate ?? 0}%`, icon: "fa-truck-ramp-box" },
      { label: "Damage rate", value: `${summary.damageRate ?? 0}%`, icon: "fa-triangle-exclamation", danger: true },
      { label: "Ready to dispatch", value: readyToDispatch.toLocaleString(), icon: "fa-box-open" },
    ],
    [summary, readyToDispatch]
  );

  const attentionItems = useMemo(() => {
    const items = [];
    if (pendingProduction > 0) items.push({ key: "p", value: pendingProduction, label: "awaiting production", tone: "amber", icon: "fa-clock", to: "/production/add" });
    if (pendingReceive > 0) items.push({ key: "t", value: pendingReceive, label: "in transit", tone: "blue", icon: "fa-truck", to: "/dispatch/list" });
    if (onHold > 0) items.push({ key: "h", value: onHold, label: "on hold", tone: "slate", icon: "fa-pause", to: "/hold-production/list" });
    return items;
  }, [pendingProduction, pendingReceive, onHold]);

  const legendItems = [
    { label: "Produced", value: totalProduction, color: "#5bcfc5" },
    { label: "Dispatched", value: totalDispatched, color: "#709fba" },
    { label: "In stock", value: inStock, color: "#f59e0b" },
    { label: "Damaged", value: totalDamage, color: "#ef4444" },
  ];

  const rateItems = [
    { label: "Production rate", value: summary.productionRate ?? 0, icon: "fa-industry" },
    { label: "Dispatch rate", value: summary.dispatchRate ?? 0, icon: "fa-truck-fast" },
    { label: "Receive rate", value: summary.receiveRate ?? 0, icon: "fa-truck-ramp-box" },
    { label: "Damage rate", value: summary.damageRate ?? 0, icon: "fa-triangle-exclamation", danger: true },
  ];

  const damageRows = [
    { label: "Production", value: productionDamaged, cls: "prod", icon: "fa-industry" },
    { label: "Dispatch", value: dispatchedDamaged, cls: "disp", icon: "fa-truck-fast" },
    { label: "Receiving", value: collectedDamaged, cls: "recv", icon: "fa-truck-ramp-box" },
  ];

  const updated = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  if (loading) return <PageLoader message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  return (
    <div className="klk-dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time panel tracking from serial generation to receiving"
        action={
          <div className="d-flex flex-wrap align-items-center gap-2">
            {updated && (
              <span className="klk-dash-updated">
                <i className="fa-solid fa-circle klk-dash-updated__dot" aria-hidden="true" />
                Updated {updated}
              </span>
            )}
            <button type="button" className="btn btn-primary btn-sm klk-dash-refresh" onClick={fetchDashboard}>
              <i className="fa fa-refresh me-1" /> Refresh
            </button>
          </div>
        }
      />

      {/* At a glance strip */}
      <div className="klk-dash-glance klk-dash-section">
        {glanceItems.map((item) => (
          <div key={item.label} className={`klk-dash-glance__item${item.danger ? " klk-dash-glance__item--danger" : ""}`}>
            <span className="klk-dash-glance__icon">
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
            </span>
            <div>
              <span className="klk-dash-glance__value">{item.value}</span>
              <span className="klk-dash-glance__label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <DashboardSection
        icon="fa-bolt"
        title="Quick actions"
        subtitle="Jump to common operations"
        accent="teal"
      >
        <div className="klk-dash-actions-grid">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className="klk-dash-action-card">
              <span className="klk-dash-action-card__icon">
                <i className={`fa-solid ${a.icon}`} aria-hidden="true" />
              </span>
              <span className="klk-dash-action-card__text">
                <strong>{a.label}</strong>
                <small>{a.desc}</small>
              </span>
              <i className="fa-solid fa-arrow-right klk-dash-action-card__arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </DashboardSection>

      {/* Pipeline + alerts */}
      {(data?.pipeline?.length > 0 || attentionItems.length > 0) && (
        <DashboardSection
          icon="fa-diagram-project"
          title="Lifecycle pipeline"
          subtitle="Panel flow from generation to damage reporting"
          accent="dark"
        >
          {data?.pipeline?.length > 0 && (
            <div className="klk-dash-pipeline">
              {data.pipeline.map((step, i) => (
                <div key={step.key} className="klk-dash-pipeline__item">
                  {i > 0 && (
                    <span className="klk-dash-pipeline__connector" aria-hidden="true">
                      <i className="fa-solid fa-chevron-right" />
                    </span>
                  )}
                  <div className={`klk-dash-pipeline__box${step.key === "damaged" ? " klk-dash-pipeline__box--danger" : ""}`}>
                    <span className="klk-dash-pipeline__icon">
                      <i className={`fa-solid ${PIPELINE_ICONS[step.key] || "fa-circle"}`} aria-hidden="true" />
                    </span>
                    <span className="klk-dash-pipeline__num">{step.value?.toLocaleString?.() ?? step.value}</span>
                    <span className="klk-dash-pipeline__text">{step.label}</span>
                    <div className="klk-dash-pipeline__track">
                      <div className="klk-dash-pipeline__fill" style={{ width: `${pctOfTotal(step.value)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {attentionItems.length > 0 && (
            <div className="klk-dash-alerts">
              <p className="klk-dash-alerts__label">Needs attention</p>
              <div className="klk-dash-alerts__list">
                {attentionItems.map((item) => (
                  <Link key={item.key} to={item.to} className={`klk-dash-alerts__pill klk-dash-alerts__pill--${item.tone}`}>
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                    <strong>{item.value.toLocaleString()}</strong>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </DashboardSection>
      )}

      {/* KPIs */}
      <DashboardSection
        icon="fa-chart-column"
        title="Key metrics"
        subtitle="Current counts across all panel stages"
        accent="teal"
      >
        <div className="row g-3">
          {kpis.map((kpi) => (
            <div className="col-xl-3 col-sm-6" key={kpi.label}>
              <DashboardStatCard {...kpi} />
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* Operational metrics */}
      <DashboardSection
        icon="fa-layer-group"
        title="Operational insights"
        subtitle="Pending work, monthly output & collection status"
        accent="blue"
      >
        <div className="row g-3">
          {operationalKpis.map((kpi) => (
            <div className="col-xl-3 col-sm-6" key={kpi.label}>
              <DashboardStatCard {...kpi} />
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* Insights */}
      <div className="row g-3 klk-dash-insights klk-dash-section">
        <div className="col-lg-4">
          <DashboardSection
            icon="fa-chart-pie"
            title="Panel status"
            subtitle="Distribution across lifecycle stages"
            accent="teal"
            className="h-100"
          >
            <ul className="klk-dash-legend klk-dash-legend--cards">
              {legendItems.map((item) => (
                <li key={item.label} className="klk-dash-legend__item">
                  <span className="klk-dash-legend__left">
                    <span className="klk-dash-legend__dot" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="klk-dash-legend__count">{item.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="klk-dash-polar">
              <PolarChart data={data} />
            </div>
          </DashboardSection>
        </div>

        <div className="col-lg-4">
          <DashboardSection
            icon="fa-gauge-high"
            title="Performance"
            subtitle="Operational efficiency rates"
            accent="blue"
            className="h-100"
          >
            <div className="klk-dash-rates">
              {rateItems.map((rate) => (
                <div key={rate.label} className={`klk-dash-rate${rate.danger ? " klk-dash-rate--danger" : ""}`}>
                  <div className="klk-dash-rate__top">
                    <span className="klk-dash-rate__label">
                      <i className={`fa-solid ${rate.icon}`} aria-hidden="true" />
                      {rate.label}
                    </span>
                    <strong>{rate.value}%</strong>
                  </div>
                  <div className="klk-dash-rate__bar">
                    <div className="klk-dash-rate__fill" style={{ width: `${Math.min(rate.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        <div className="col-lg-4">
          <DashboardSection
            icon="fa-triangle-exclamation"
            title="Damage breakdown"
            subtitle="Damage reported at each stage"
            accent="rose"
            className="h-100"
            action={
              <span className="klk-dash-block__badge">{totalDamage.toLocaleString()} total</span>
            }
          >
            <div className="klk-dash-damage">
              {damageRows.map((row) => (
                <div key={row.label} className="klk-dash-damage__row">
                  <div className="klk-dash-damage__top">
                    <span className="klk-dash-damage__label">
                      <i className={`fa-solid ${row.icon}`} aria-hidden="true" />
                      {row.label}
                    </span>
                    <strong>{row.value.toLocaleString()}</strong>
                  </div>
                  <div className="klk-dash-damage__bar">
                    <div className={`klk-dash-damage__fill klk-dash-damage__fill--${row.cls}`} style={{ width: `${dmgPct(row.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 klk-dash-section">
        <div className="col-xl-7">
          <DashboardSection
            icon="fa-chart-column"
            title="Activity trends"
            subtitle="Generated, production, dispatch & damage by month"
            accent="teal"
            className="h-100"
            action={
              <div className="klk-dash-tags">
                <span className="klk-dash-tag">{currentMonthLabel}: <strong>{currentMonthData?.totalGenerated ?? 0}</strong> gen</span>
                <span className="klk-dash-tag">Prod <strong>{currentMonthData?.totalProduction ?? 0}</strong></span>
                <span className="klk-dash-tag">Disp <strong>{currentMonthData?.totalDispatched ?? 0}</strong></span>
              </div>
            }
            bodyClassName="klk-dash-chart-body"
          >
            <ActivityApexBarGraph data={data} height={300} />
          </DashboardSection>
        </div>

        <div className="col-xl-5">
          <DashboardSection
            icon="fa-calendar-days"
            title="Monthly overview"
            subtitle="Panels generated vs dispatched"
            accent="dark"
            className="h-100"
            bodyClassName="klk-dash-chart-body"
          >
            <TransactionApexBar data={data?.monthWiseData || []} height={300} />
          </DashboardSection>
        </div>
      </div>

      {/* Capacity table */}
      <DashboardSection
        icon="fa-table-list"
        title="Capacity breakdown"
        subtitle="Production, dispatch & damage grouped by panel wattage"
        accent="teal"
        bodyClassName="p-0"
        action={
          <Link to="/generate/panel/list" className="btn btn-outline-primary btn-sm">
            <i className="fa-solid fa-arrow-up-right-from-square me-1" />
            View all panels
          </Link>
        }
      >
        <DashboardCapacityTable rows={data?.panelCapacityWise || []} />
      </DashboardSection>

      {/* Company / prefix table */}
      <DashboardSection
        icon="fa-building"
        title="Company breakdown"
        subtitle="Production, dispatch & damage grouped by prefix (company)"
        accent="dark"
        bodyClassName="p-0"
        action={
          <Link to="/generate/panel/list" className="btn btn-outline-primary btn-sm">
            <i className="fa-solid fa-arrow-up-right-from-square me-1" />
            View all panels
          </Link>
        }
      >
        <DashboardPrefixTable rows={data?.panelPrefixWise || []} />
      </DashboardSection>
    </div>
  );
};

export default Home;
