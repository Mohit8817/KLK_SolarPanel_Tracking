import React from "react";
import PropTypes from "prop-types";
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
        colors: ["#5bcfc5", "#709fba", "#ffa755", "#dc3545"],
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

getChartData() {
  const { data } = this.props;
  const monthly = data?.monthWiseData;

  if (!monthly || monthly.length === 0) {
    return { categories: [], series: [] };
  }

  const sorted = [...monthly].sort((a, b) => {
    const ay = a?._id?.year ?? 0;
    const by = b?._id?.year ?? 0;
    if (ay !== by) return ay - by;
    return (a?._id?.month ?? 0) - (b?._id?.month ?? 0);
  });

  const categories = sorted.map(
    (m) => m.monthLabel || `${m?._id?.year}-${String(m?._id?.month).padStart(2, "0")}`
  );

  const series = [
    { name: "Panels Generated", data: sorted.map((m) => m.totalGenerated || 0) },
    { name: "Total Production", data: sorted.map((m) => m.totalProduction || 0) },
    { name: "Total Dispatched", data: sorted.map((m) => m.totalDispatched || 0) },
    { name: "Total Damage", data: sorted.map((m) => m.totalDamage || 0) },
  ];

  return { categories, series };
}

  render() {
    const { height = 400 } = this.props;
    const { categories, series } = this.getChartData();
    const options = {
      ...this.state.options,
      xaxis: { ...this.state.options.xaxis, categories },
    };

    return (
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    );
  }
}

ActivityApexBarGraph.propTypes = {
  height: PropTypes.number,
  data: PropTypes.shape({
    monthWiseData: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({
          month: PropTypes.number,
        }),
        totalGenerated: PropTypes.number,
        totalProduction: PropTypes.number,
        totalDispatched: PropTypes.number,
        totalDamage: PropTypes.number,
      })
    ),
  }),
};

export default ActivityApexBarGraph;