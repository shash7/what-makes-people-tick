

;(function(window, document, undefined) {
	
	'use strict';
	
	function init() {
		fetchData(function(data) {
			var obj = trimData(data);
			render(obj);
		});
	}

	function render(obj) {
		var width = $('.chart').width();
		var height = $('.chart').height();
		var svg = d3.select(".chart")
    	.append("svg")
    	.attr('width', width);

    svg.selectAll('rect')
    	.data(obj.weather)
    	.enter()
    	.append('rect')
    	.attr('x', function(d, i) {
    		return i * (width / obj.weather.length);
    	})
    	.attr('y', function(d) {
    		return height / 2 - d.temp;
    	})
    	.attr('width', width/obj.weather.length)
    	.attr('height', function(d) {
    		return (height/obj.weather.length) * d.temp;
    	})
    	.attr('fill', function(d) {
    		return "rgba(231,21,84, " + d.temp * 0.008 + ")"
    	});
    svg.selectAll("text")
	  	.data(obj.weather)
	  	.enter()
	  	.append("text")
	  	.text(function(d) {
	  		return d.temp;
	  	})
	  	.attr('x', function(d, i) {
	  		return i * (width / obj.weather.length);
	  	})
	  	.attr('y', function(d, i) {
	  		return height - (d.temp * 4);
	  	});
	}
	
	function trimData(data) {
		var posts = [];
		var weather = [];
		data.map(function(obj) {
			obj = cleanData(obj);
			if(obj.type === 'reddit') {
				posts.push(obj);
			} else {
				weather.push(obj);
			}
		});
		posts = collapseData(posts);
		return {
			weather : weather,
			posts : posts
		};
	}

	var arr = [[{
		date : new Date().getDate(),
		limit : 20,
	},
	{

	}],
	[{
		date : new Date().getDate(),
		temp : 20
	}]]

	function cleanData(obj) {
		var data = {};
		if(obj.country) {
			data.type = 'weather',
			data.date = new Date(obj.timestamp),
			data.temp = obj.tempAvg
		} else {
			data.type = 'reddit',
			data.date = new Date(obj.data.created_utc);
		}
		return data;
	}

	function collapseData(arr) {
		var posts = [];
		arr.map(function(post) {
			var date = new Date(post.date).getDate();
			var result = findInArray(posts, date);
			if(result) {
				posts[result].limit += 1;
			}
			posts.push({
				date : date,
				limit : 1
			});
		});
		return posts;
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