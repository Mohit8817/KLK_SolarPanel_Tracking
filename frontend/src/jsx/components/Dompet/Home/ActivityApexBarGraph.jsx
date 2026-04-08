import React from "react";
import ReactApexChart from "react-apexcharts";

class ActivityApexBarGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
            columnWidth: "90%",      
            dataLabels: { position: "top" },
          },
        },
        colors: ["#4CAF50", "#FF9800", "#2196F3", "#F44336"],
        fill: { opacity: 1 },
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 3,
          colors: ["transparent"],
        },
        grid: { borderColor: "#eee" },
        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          labels: {
            style: {
              colors: "#3e4954",
              fontSize: "12px",
              fontFamily: "poppins",
              fontWeight: 400,
            },
          },
        },
        yaxis: {
          labels: {
            formatter: (val) => `${val}`,
            style: {
              colors: "#3e4954",
              fontSize: "12px",
              fontFamily: "poppins",
              fontWeight: 400,
            },
          },
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          fontFamily: "poppins",
          fontSize: "13px",
          labels: { colors: "#3e4954" },
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} units`,
          },
        },
        responsive: [
          {
            breakpoint: 1600,
            options: { chart: { height: 400 } },
          },
          {
            breakpoint: 575,
            options: { chart: { height: 250 } },
          },
        ],
      },
    };
  }

  getSeries() {
    const { data } = this.props;

    // If monthlyData exists from API, use it
    const monthly = data?.monthlyData;

    if (monthly && monthly.length > 0) {
      // Map 12 months, fill missing months with 0
      const months = Array.from({ length: 12 }, (_, i) => i + 1); // [1..12]

      const getMonthVal = (key, month) => {
        const found = monthly.find((m) => m.month === month);
        return found ? found[key] || 0 : 0;
      };

      return [
        {
          name: "Panels Produced",
          data: months.map((m) => getMonthVal("totalPanelsProduced", m)),
        },
        {
          name: "Total Production",
          data: months.map((m) => getMonthVal("totalProduction", m)),
        },
        {
          name: "Total Dispatched",
          data: months.map((m) => getMonthVal("totalDispatched", m)),
        },
        {
          name: "Total Damage",
          data: months.map((m) => getMonthVal("totalDamage", m)),
        },
      ];
    }

    // ── Fallback: use current totals spread across current month only ──
    const currentMonth = new Date().getMonth(); // 0-indexed
    const totalPanelsProduced = data?.stock?.totalPanelsProduced || 0;
    const totalProduction     = data?.production?.totalProduction || 0;
    const totalDispatched     = data?.dispatch?.totalDispatched || 0;
    const totalDamage         = data?.damage?.totalDamage || 0;

    const fillMonth = (val) =>
      Array.from({ length: 12 }, (_, i) => (i === currentMonth ? val : 0));

    return [
      { name: "Panels Produced",  data: fillMonth(totalPanelsProduced) },
      { name: "Total Production", data: fillMonth(totalProduction) },
      { name: "Total Dispatched", data: fillMonth(totalDispatched) },
      { name: "Total Damage",     data: fillMonth(totalDamage) },
    ];
  }

  render() {
    return (
      <ReactApexChart
        options={this.state.options}
        series={this.getSeries()}
        type="bar"
        height={400}
      />
    );
  }
}

export default ActivityApexBarGraph;