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

  const monthly = data?.monthWiseData;

  if (monthly && monthly.length > 0) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const getMonthVal = (key, month) => {
      const found = monthly.find((m) => m?._id?.month === month);
      return found ? found[key] || 0 : 0;
    };

    return [
      {
        name: "Panels Generated",
        data: months.map((m) => getMonthVal("totalGenerated", m)),
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

  return [];
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

ActivityApexBarGraph.propTypes = {
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