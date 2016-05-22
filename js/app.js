

;(function(window, document, undefined) {
	
	'use strict';

	var graph = {
		init: function(data) {
			data.weatherTransformed = transformWeather(data.weather);
			data.cloudCoverTransformed = transformCloudCover(data.weather);
			var xScale = new Plottable.Scales.Category();
			var yScale = new Plottable.Scales.Linear();
			yScale.domain([0,50]);
			var colorScale = new Plottable.Scales.InterpolatedColor();
			colorScale.range(["#E7DBD7", "#E71554"]);


			var plot = new Plottable.Plots.StackedArea()
		  .addDataset(new Plottable.Dataset(data.weatherTransformed).metadata(1.5))
		  .addDataset(new Plottable.Dataset(data.cloudCoverTransformed).metadata(1))
		  .x(function(d) { return d.x; }, xScale)
		  .y(function(d) { return d.y; }, yScale)
		  .attr("fill", function(d, i, dataset) {
		  	return dataset.metadata();
		  }, colorScale);


		  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
			var yAxis = new Plottable.Axes.Numeric(yScale, "left");
		  var table = new Plottable.Components.Table([
				[yAxis, plot],
				[null, xAxis]
			]);

			table.renderTo('.chart svg');
		},
		setGraph : function(data) {
			var posts = data.posts.sort(function(a, b) {
				return new Date(b.data.created_utc * 1000) - new Date(a.data.created_utc * 1000);
			});
			var weather = data.weather.sort(function(a, b) {
				return new Date(b.timestamp) - new Date(a.timestamp);
			});
			var prev;
			weather = weather.map(function(temp) {
				var date = moment(temp.timestamp);
				if(!date.isSame(prev, 'd')) {
					prev = date;
					return temp;
				}
			});
			var firstDate = moment(weather[0].timestamp);
			var lastDate = moment(weather[weather.length - 1].timestamp);
			posts = posts.map(function(post) {
				var date = moment(post.data.created_utc * 1000);
				if(date.isBefore(firstDate) && date.isAfter(lastDate)) {
					return post;
				}
			});
			var posts = data.posts.sort(function(a, b) {
				return new Date(b.data.created_utc * 1000) - new Date(a.data.created_utc * 1000);
			});
			weather = weather.map(function(temp) {
				if(temp !== undefined) {
					return temp;
				}
			});

			var res = {
				temp : [],
				posts : []
			};
			weather.map(function(temp, i) {
					if(temp) {
					var weatherDate = moment(temp.timestamp);
					res.temp.push({
						x : i,
						y : temp.cldCvrAvg
					});
					var len = 0;
					posts.map(function(post) {
						var date = moment(post.data.created_utc * 1000);
						if(date.isSame(weatherDate, 'd')) {
							len += 1;
						}
					});
					res.posts.push({
						x : i,
						y : len
					});
				}
			});
			return res;
		},
		renderGraph : function(data) {
			console.log(data);
			var xScale = new Plottable.Scales.Category();
			var yScale = new Plottable.Scales.Linear().domain([0, 50]);
			var colorScale = new Plottable.Scales.InterpolatedColor();
			colorScale.range(["#BDCEF0", "#5279C7"]);


			var plot = new Plottable.Plots.StackedArea()
			.addDataset(new Plottable.Dataset(data.weather).metadata(5))
			.addDataset(new Plottable.Dataset(data.posts).metadata(3))
			.x(function(d) { return d.x; }, xScale)
			.y(function(d) { return d.y; }, yScale)
			.attr("fill", function(d, i, dataset) { return dataset.metadata(); }, colorScale)
			.renderTo(".chart svg");

			window.addEventListener("resize", function() {
			plot.redraw();
			});
		}
	};
	
	function init() {
		fetchData(function(data) {
			data = trimData(data);
			//graph.init(data);
			data = graph.setGraph(data);
			graph.renderGraph(data);
		});
	}

	function transformWeather(arr) {
		arr = arr.map(function(obj, i) {
			var temp = ((obj.tempAvg - 32) * 5) / 9;
			return {
				x : i,
				y : temp
			};
		})
		return arr;
	}

	function transformCloudCover(arr) {
		arr = arr.map(function(obj, i) {
			return {
				x : i,
				y : obj.cldCvrAvg / 8
			};
		})
		return arr;
	}

	function trimData(arr) {
		var obj = {
			posts : [],
			weather : []
		};
		arr.map(function(data) {
			if(data.kind) {
				obj.posts.push(data);
			} else {
				obj.weather.push(data);
			}
		});
		return obj;
	}
	

	function findInArray(arr, date) {
		var result = false;
		arr.map(function(obj, index) {
			if(obj.date === date) {
				result = index;
			}
		});
		return result;
	}
	
	function fetchData(cb) {
		$.ajax({
			url : 'https://dl.dropboxusercontent.com/s/cxu7ndm1bvkiovt/data.json?dl=0',
			method : 'get',
			success : function(data) {
				data = JSON.parse(data);
				cb(data);
			}
		});
	}
	
	$(document).ready(init);
	
})(window, document);