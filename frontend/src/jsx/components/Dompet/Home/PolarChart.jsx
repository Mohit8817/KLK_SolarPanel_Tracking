
import  { Component } from "react";
import PropTypes from "prop-types";
import {
	Chart as ChartJS,
	RadialLinearScale,
	ArcElement,
	Tooltip,
	Legend,
} from 'chart.js';
import { PolarArea } from "react-chartjs-2";
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const options = {
	plugins: {
		responsive: true,
		legend: { display: false },
	},
	maintainAspectRatio: false,
	scales: {
		r: {
			ticks: { display: false },
			grid: { display: false },
		},
	},
};

class PolarChart extends Component {
	render() {
		const { data: dashboardData } = this.props;

		const totalProduction  = dashboardData?.production?.totalProduction  || 0;
		const totalDispatched  = dashboardData?.dispatch?.totalDispatched    || 0;
		const inStock          = dashboardData?.stock?.inStock               || 0;
		const totalDamage      = dashboardData?.damage?.totalDamage          || 0;

		const chartData = {
			datasets: [
				{
					data: [totalProduction, totalDispatched, inStock, totalDamage],
					
					backgroundColor: ["#496ecc", "#68e365", "#ffa755", "#c8c8c8"],
				},
			],
		};

		return <PolarArea data={chartData} height={200} options={options} />;
	}
}

PolarChart.propTypes = {
	data: PropTypes.object,
};

export default PolarChart;