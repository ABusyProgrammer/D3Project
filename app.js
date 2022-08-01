let globalYear = 2013;
let globalBrand = "ford"
let globalModel = "focus"

async function renderMainPage(year) {
	console.log("in main");
	document.getElementById("first_svg").innerHTML = "";
	document.getElementById("second_svg").innerHTML = "";
	document.getElementById("annotation1").innerHTML = "";
	document.getElementById("annotation2").innerHTML = "";

	document.getElementById("setYear").style = "display:visible";


	document.getElementById("mainPage").style = "display:visible";
	document.getElementById("brandPage").style.display = "none";
	document.getElementById("modelPage").style.display = "none";

	document.getElementById("setYear").innerHTML = year;

	await showNationWideBrandRankingByYear(year);
	await showTitleStatusDistributionByYear(year);

	// await showSalePriceOverTimeForAllModels('ford', 'wagon');
	// await showColorsOfCarModel('ford', 'wagon');
}


function backToMain() {
	updateYear(0);
}


async function updateYear(increment) {
	const newYearVal = parseInt(document.getElementById("setYear").innerHTML) + increment;

	document.getElementById("setYear").innerHTML = newYearVal;
	globalYear = newYearVal;

	await renderMainPage(newYearVal);
}


async function getNationWideBrandRankingByYear() {
	let output = {};
	const csvData = await d3.csv("../data/data.csv");

	for (let i = 0; i < csvData.length; i++) {
		if (csvData[i].year in output) {
			if (csvData[i].brand in output[csvData[i].year]) {
				output[csvData[i].year][csvData[i].brand]++;
			}
			else {
				output[csvData[i].year][csvData[i].brand] = 1;
			}
		}
		else {
			output[csvData[i].year] = {};
			output[csvData[i].year][csvData[i].brand] = 1;
		}
	}

	let csvFormat = "year,brand,count\n";
	for (const year of Object.keys(output)) {
		for (const brand of Object.keys(output[year])) {
			csvFormat += year + "," + brand + "," + output[year][brand] + "\n";
		}
	}

	return output;
}


async function showNationWideBrandRankingByYear(year) {
	let data = await d3.csv("./data/showNationWideBrandRankingsByYear.csv");
	data = data.filter(function (row) {
		return row["year"] == year;
	});
	console.log(data);

	if (data.length < 1) {
		document.getElementById("mainNoData").style.visibility = "visible";
		document.getElementById("mainTable").style.visibility = "hidden";
		return;
	}
	else {
		document.getElementById("mainNoData").style.visibility = "hidden";
		document.getElementById("mainTable").style.visibility = "visible";
	}

	let svg = d3.select("#first_svg"),
		margin = 200,
		width = svg.attr("width") - margin,
		height = svg.attr("height") - margin

	let xScale = d3.scaleBand().range([0, width]).padding(0.1),
		yScale = d3.scaleLinear().range([height, 0]);

	let g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

	xScale.domain(data.map(function (d) { return d.brand; }));
	yScale.domain([0, d3.max(data, function (d) { return parseInt(d.count); })]);

	g.append("g")
		.style("font", "16px times")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale))
		.append("text")
		.attr("y", height - 250)
		.attr("x", width - 220)
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.attr("font-size", "20px")
		.text("Brand Name");

	g.append("g")
		.style("font", "16px times")
		.call(d3.axisLeft(yScale).tickFormat(function (d) {
			return d;
		})
			.ticks(10))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-50px")
		.attr("dx", "-80px")
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.attr("font-size", "20px")
		.text("Number of Sold Units");

	g.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) { return xScale(d.brand); })
		.attr("y", function (d) { return yScale(d.count); })
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) { return height - yScale(d.count); })
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation1").innerHTML = "Brand Name: " + data.brand + "<br># Units: " + data.count;
		})
		.on("mouseout", function(displayElement, data) { 
			document.getElementById("annotation1").innerHTML = "";
		})
		.on("click", function(displayElement, data) { 
			renderBrandPage(data.brand);
		});
}


async function getTitleStatusDistributionByYear(year) {
	let output = {};
	let csvData = await d3.csv("../data/data.csv");

	for (let i = 0; i < csvData.length; i++) {
		if (csvData[i].year in output) {
			if (csvData[i].title_status in output[csvData[i].year]) {
				output[csvData[i].year][csvData[i].title_status]++;
			}
			else {
				output[csvData[i].year][csvData[i].title_status] = 1;
			}
		}
		else {
			output[csvData[i].year] = {};
			output[csvData[i].year][csvData[i].title_status] = 1;
		}
	}

	let csvFormat = "year,status,count\n";
	for (const year of Object.keys(output)) {
		for (const status of Object.keys(output[year])) {
			csvFormat += year + "," + status + "," + output[year][status] + "\n";
		}
	}
	console.log(csvFormat);
	
	return output;
}


async function showTitleStatusDistributionByYear(year) {
	const width = 450,
	height = 450,
	margin = 40;

	const radius = Math.min(width, height) / 2 - margin;

	const svg = d3.select("#second_svg")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", `translate(${width/2}, ${height/2})`);

	let data = await d3.csv("./data/showTitleStatusDistributionByYear.csv");
	data = data.filter(function (row) {
		return row["year"] == year;
	});

	let tempData = {};
	for (let i = 0; i < data.length; i++) {
		if (data[i]["status"] in tempData) {
			tempData[data[i]["status"]] += parseFloat(data[i]["count"]);
		}
		else {
			tempData[data[i]["status"]] = parseFloat(data[i]["count"]);
		}
	}
	data = tempData;
	console.log(data);

	const color = d3.scaleOrdinal()
	.range(["#00FFFF", "#00CC66", "#CCCC00"])

// Compute the position of each group on the pie:
const pie = d3.pie()
  .value(function(d) {return d[1]})
const pie_positions = pie(Object.entries(data))

// shape helper to build arcs:
const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)

	svg
  .selectAll('mySlices')
  .data(pie_positions)
  .join('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(color(d.data[0])) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation2").innerHTML = "Status: " + data.data[0] + "<br># Instances: " + data.data[1];
		})
		.on("mouseout", function(displayElement, data) { 
			document.getElementById("annotation2").innerHTML = "";
		})

// Now add the annotation. Use the centroid method to get the best coordinates
svg
  .selectAll('mySlices')
  .data(pie_positions)
  .join('text')
  .text(function(d){ return d.data[0]})
  .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
  .style("text-anchor", "middle")
  .style("font-size", 17)
}


async function renderBrandPage(brand) {
	console.log("in brand");
	document.getElementById("third_svg").innerHTML = "";
	document.getElementById("fourth_svg").innerHTML = "";
	document.getElementById("annotation3").innerHTML = "";
	document.getElementById("annotation4").innerHTML = "";


	document.getElementById("mainPage").style.display = "none";
	document.getElementById("brandPage").style = "display:visible";
	document.getElementById("modelPage").style.display = "none";

	document.getElementById("setYear").style.display = "none";

	await showTopSellingModelsForBrand(brand);
	await showMostPopularStatesForBrand(brand);
}


async function getTopSellingModelsForAllBrands() {
	let brands = ["ford", "chevrolet", "kia", "bmw", "dodge", "nissan"]
	let csvFormat = "brand,model,price\n";
	const csvData = await d3.csv("../data/data.csv");

	brands.forEach(brand => {
		let output = {};
	
		for (let i = 0; i < csvData.length; i++) {
			if (csvData[i].brand != brand) { continue; }
			if (parseFloat(csvData[i].price) < 500) { continue; }
	
			if (csvData[i].model in output) {
				output[csvData[i].model]["price_sum"] += parseFloat(csvData[i].price);
				output[csvData[i].model]["instances"]++;
			}
			else {
				output[csvData[i].model] = {};
				output[csvData[i].model]["price_sum"] = parseFloat(csvData[i].price);
				output[csvData[i].model]["instances"] = 1;
			}
		}
	
		finalOutput = {};
		for (const modelVal in output) {
			finalOutput[modelVal] = output[modelVal]["price_sum"] / output[modelVal]["instances"];
		}
	
		for (const model of Object.keys(finalOutput)) {
			csvFormat += brand  + "," + model + "," + parseInt(finalOutput[model]) + "\n";
		}
	})

	// console.log(csvFormat);
}


async function showTopSellingModelsForBrand(brand) {
	console.log("In here too")
	let svg = d3.select("#third_svg"),
	margin = 200,
	width = svg.attr("width") - margin,
	height = svg.attr("height") - margin

	let xScale = d3.scaleBand().range([0, width]).padding(0.1),
		yScale = d3.scaleLinear().range([height, 0]);

	let g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

	let data = await d3.csv("./data/showTopSellingModelsForBrand.csv");
	data = data.filter(function (row) {
		return row["brand"] == brand && parseFloat(row["price"]) > 500; // filter out undesireble values
	});

	xScale.domain(data.map(function (d) { return d.model; }));
	yScale.domain([0, d3.max(data, function (d) { return parseInt(d.price); })]);

	g.append("g")
		.style("font", "14px times")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("x", "45")
		.attr("y", "-8")
		.attr("transform", "rotate(90)")

	g.append("g")
		.style("font", "16px times")
		.call(d3.axisLeft(yScale).tickFormat(function (d) {
			return d;
		})
			.ticks(10))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-70px")
		.attr("dx", "-80px")
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.attr("font-size", "20px")
		.text("Average Sale Price ($)");

	g.selectAll(".greenBar")
		.data(data)
		.enter().append("rect")
		.attr("class", "greenBar")
		.attr("x", function (d) { return xScale(d.model); })
		.attr("y", function (d) { return yScale(parseInt(d.price)); })
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) { return height - yScale(parseInt(d.price)); })
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation3").innerHTML = "Brand Name: " + data.model + "<br># Units: " + data.price;
		})
		.on("mouseout", function(displayElement, data) { 
			document.getElementById("annotation3").innerHTML = "";
		})
		.on("click", function(displayElement, data) { 
			console.log("Got you asshole");
		});
}


async function getMostPopularStatesForAllBrands() {
	let brands = ["ford", "chevrolet", "kia", "bmw", "dodge", "nissan"]
	let csvFormat = "brand,model,price\n";
	const csvData = await d3.csv("../data/data.csv");

	brands.forEach(brand => {
		let output = {};
		for (let i = 0; i < csvData.length; i++) {
			if (csvData[i].brand != brand) {
				continue;
			}

			if (csvData[i].state in output) {
				output[csvData[i].state] += 1;
			}
			else {
				output[csvData[i].state] = 1;
			}
		}

		for (const state of Object.keys(output)) {
			csvFormat += brand  + "," + state + "," + parseInt(output[state]) + "\n";
		}
	});

	console.log(csvFormat);
}


async function showMostPopularStatesForBrand(brand) {
	console.log("In here toooo")
	let data = await d3.csv("./data/showMostPopularStatesForAllBrands.csv");
	data = data.filter(function (row) {
		return row["brand"] == brand && parseInt(row["count"]) > 10; // filter out one-off values
	});

	if (data.length < 1) {
		document.getElementById("fourth_svg").parentElement.innerHTML = "<h2>NO DATA FOUND FOR THIS</h2>";
		return;
	}

	let svg = d3.select("#fourth_svg"),
	margin = 200,
	width = svg.attr("width") - margin,
	height = svg.attr("height") - margin

	let xScale = d3.scaleBand().range([0, width]).padding(0.1),
		yScale = d3.scaleLinear().range([height, 0]);

	let g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

	xScale.domain(data.map(function (d) { return d.state; }));
	yScale.domain([0, d3.max(data, function (d) { return parseInt(d.count); })]);

	g.append("g")
		.style("font", "14px times")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("x", "45")
		.attr("y", "-8")
		.attr("transform", "rotate(90)")

	g.append("g")
		.style("font", "16px times")
		.call(d3.axisLeft(yScale).tickFormat(function (d) {
			return d;
		})
			.ticks(10))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-70px")
		.attr("dx", "-80px")
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.attr("font-size", "20px")
		.text("Number of Sold Units");

	g.selectAll(".blueBar")
		.data(data)
		.enter().append("rect")
		.attr("class", "blueBar")
		.attr("x", function (d) { return xScale(d.state); })
		.attr("y", function (d) { return yScale(parseInt(d.count)); })
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) { return height - yScale(parseInt(d.count)); })
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation4").innerHTML = "Brand Name: " + data.state + "<br># Units: " + data.count;
		})
		.on("mouseout", function(displayElement, data) { 
			document.getElementById("annotation4").innerHTML = "";
		})
		.on("click", function(displayElement, data) { 
			console.log("Got you asshole");
		});
}


async function renderModelPage(brand, model) {
	document.getElementById("first_svg").innerHTML = "";
	document.getElementById("second_svg").innerHTML = "";
	document.getElementById("annotation1").innerHTML = "";
	document.getElementById("annotation2").innerHTML = "";

	document.getElementById("setYear").style = "display:none";


	document.getElementById("modelPage").style = "display:visible";
	document.getElementById("brandPage").style.display = "none";
	document.getElementById("mainPage").style.display = "none";

	await showSalePriceOverTimeForAllModels(brand, model);
	await showColorsOfCarModel(brand, model);
}


async function getSalePriceOverTimeForAllModels(brand, model) {
	let output = {};
	let csvData = await d3.csv("../data/data.csv");
	csvData = csvData.filter(function (row) {
		return row["brand"] == brand && row["model"] == model;
	});
	for (let i = 0; i < csvData.length; i++) {
		if (csvData[i].year in output) {
			output[csvData[i].year]["price_sum"] += parseFloat(csvData[i].price);
			output[csvData[i].year]["instances"]++;
		}
		else {
			output[csvData[i].year] = {};
			output[csvData[i].year]["price_sum"] = parseFloat(csvData[i].price);
			output[csvData[i].year]["instances"] = 1;
		}
	}

	finalOutput = new Array();
	for (const yearVal in output) {
		let something = output[yearVal]["price_sum"] / output[yearVal]["instances"];
		tempObject = { "year": yearVal, "price": something };
		finalOutput.push(tempObject);
	}

	return finalOutput;
}


async function showSalePriceOverTimeForAllModels(brand, model) {
	let data = await getSalePriceOverTimeForAllModels(brand, model);

	if (data.length < 1) {
		document.getElementById("fourth_svg").parentElement.innerHTML = "<h1>NO DATA FOUND FOR THIS</h1>";
		return;
	}

	let svg = d3.select("#fifth_svg"),
	margin = 200,
	width = svg.attr("width") - margin,
	height = svg.attr("height") - margin

	let xScale = d3.scaleBand().range([0, width]).padding(0.1),
		yScale = d3.scaleLinear().range([height, 0]);

	let g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

	xScale.domain(data.map(function (d) { return d.year; }));
	yScale.domain([0, d3.max(data, function (d) { return parseInt(d.price); })]);

	g.append("g")
		.style("font", "14px times")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale))
		.selectAll("text")
		.attr("x", "45")
		.attr("y", "-8")
		.attr("transform", "rotate(90)")

	g.append("g")
		.style("font", "16px times")
		.call(d3.axisLeft(yScale).tickFormat(function (d) {
			return d;
		})
			.ticks(10))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-70px")
		.attr("dx", "-80px")
		.attr("text-anchor", "end")
		.attr("stroke", "black")
		.attr("font-size", "20px")
		.text("Number of Sold Units");

	g.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) { return xScale(d.year); })
		.attr("y", function (d) { return yScale(parseInt(d.price)); })
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) { return height - yScale(parseInt(d.price)); })
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation5").innerHTML = "Brand Name: " + data.state + "<br># Units: " + data.count;
		})
		.on("mouseout", function(displayElement, data) { 
			document.getElementById("annotation5").innerHTML = "";
		})
		.on("click", function(displayElement, data) { 
			console.log("Got you asshole");
		});
}


async function getColorsOfCarModel(brand, model) {
	let output = {};
	const csvData = await d3.csv("../data/data.csv");

	for (let i = 0; i < csvData.length; i++) {
		if (csvData[i].model != model || csvData[i].brand != brand) {
			continue;
		}

		if (csvData[i].color in output) {
			output[csvData[i].color] += 1;
		}
		else {
			output[csvData[i].color] = 1;
		}
	}

	return output;
}


async function showColorsOfCarModel(brand, model) {
	const width = 450,
	height = 450,
	margin = 40;

	const radius = Math.min(width, height) / 2 - margin;

	const svg = d3.select("#sixth_svg")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", `translate(${width/2}, ${height/2})`);

	let data = await getColorsOfCarModel(brand, model);
	colors = Object.keys(data);
	const noColorIndex = colors.indexOf('no_color');
	if (noColorIndex != -1) {
		colors[noColorIndex] = "green";
	}

	const color = d3.scaleOrdinal()
	.range(colors)

const pie = d3.pie()
  .value(function(d) {return d[1]})
const pie_positions = pie(Object.entries(data))

// shape helper to build arcs:
const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)

	svg
  .selectAll('mySlices')
  .data(pie_positions)
  .join('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d) { 
			return(color(d.data[0])) 
		})
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
		.on("mouseover", function(displayElement, data) { 
			document.getElementById("annotation6").innerHTML = "Color: " + data.data[0] + "<br># Instances: " + data.data[1];
		})
		.on("mouseout", function() { 
			document.getElementById("annotation6").innerHTML = "";
		})

svg
  .selectAll('pie_slices')
  .data(pie_positions)
}