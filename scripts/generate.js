async function getTopSellingModelsForAllBrands() {
	let brands = ["ford", "chevrolet", "kia", "bmw", "dodge", "nissan"]
	let csvFormat = "brand,model,price\n";
	const csvData = await d3.csv("../data/data.csv");

	brands.forEach(brand => {
		let output = {};
	
		for (let i = 0; i < csvData.length; i++) {
			if (csvData[i].brand != brand) { continue; }
	
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
			csvFormat += model + "," + parseInt(finalOutput[model]) + "\n";
		}
	})

	console.log(csvFormat);
}