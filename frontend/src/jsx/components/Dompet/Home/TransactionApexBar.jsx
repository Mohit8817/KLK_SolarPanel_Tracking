import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";

const TransactionApexBar = ({ data = [], height = 400 }) => {
	const [chartData, setChartData] = useState({
		series: [],
		options: {
			chart: {
				type: "bar",
				toolbar: { show: false },
			},
			plotOptions: {
				bar: {
					borderRadius: 10,
					columnWidth: "20%",
				},
			},
			colors: ["#5bcfc5", "#217069"],
			legend: { show: true },
			dataLabels: { enabled: false },
			stroke: {
				show: true,
				width: 2,
				colors: ["transparent"],
			},
			grid: {
				borderColor: "#eee",
			},
			xaxis: {
				categories: [],
			},
			yaxis: {
				title: {
					text: "Panels (Units)",
				},
			},
			tooltip: {
				y: {
					formatter: (val) => `${val} Panels`,
				},
			},
		},
	});

	// 🔥 update chart when API data changes
	useEffect(() => {
		if (!data || data.length === 0) return;

		const categories = data.map(item => item.monthLabel);

		const generated = data.map(item => item.totalGenerated || 0);
		const dispatched = data.map(item => item.totalDispatched || 0);

		setChartData(prev => ({
			...prev,
			series: [
				{
					name: "Panels Generated",
					data: generated,
				},
				{
					name: "Panels Dispatched",
					data: dispatched,
				},
			],
			options: {
				...prev.options,
				xaxis: {
					...prev.options.xaxis,
					categories: categories,
				},
			},
		}));

	}, [data]);

	return (
		<div id="chart">
			<ReactApexChart
				options={chartData.options}
				series={chartData.series}
				type="bar"
				height={height}
			/>
		</div>
	);
};

TransactionApexBar.propTypes = {
	height: PropTypes.number,
	data: PropTypes.arrayOf(
		PropTypes.shape({
			monthLabel: PropTypes.string,
			totalGenerated: PropTypes.number,
			totalDispatched: PropTypes.number,
		})
	),
};

export default TransactionApexBar;