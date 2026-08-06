
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
					
					backgroundColor: ["#5bcfc5", "#709fba", "#ffa755", "#dc3545"],
				},
			],
		};

		return (
			<div className="klk-polar-chart">
				<PolarArea data={chartData} options={options} />
			</div>
		);
	}
}

PolarChart.propTypes = {
	data: PropTypes.object,
};

export default PolarChart;