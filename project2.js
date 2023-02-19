// Adds commas in the number for every three digits to make it more readable
function add_commas(num) {
	let new_num = "";
	let string_num = num.toString();
	for (let i = 0; i < string_num.length; i++) {
		if ((string_num.length - i - 1)%3 == 0 && i != string_num.length - 1) {
			new_num += string_num[i] + ",";
		}
		else {
			new_num += string_num[i];
		}
	}
	return new_num;
}

// Retrieves all the attribute values from an object (e.g. all the languages)
function object_into_string(object) {
	object_keys = Object.keys(object)
	values = ""
	for (var i = 0; i < object_keys.length; i++) {
		if (i == object_keys.length - 1) {
			values += object[object_keys[i]];
		}
		else {
			values += object[object_keys[i]] + ", ";
		}
		
	}
	return values;
}

// Retrieves all the name attribute values from the nested objects (e.g. all the currency names)
function name_of_nested_object_into_string(object) {
	object_keys = Object.keys(object)
	values = ""
	for (var i = 0; i < object_keys.length; i++) {
		if (i == object_keys.length - 1) {
			values += object[object_keys[i]].name;
		}
		else {
			values += object[object_keys[i]].name + ", ";
		}
	}
	return values;
}

// Gets an image to represent true/false(status)
function status_to_image(status) {
	image = ""
	if (status) {
		image = "images/checkMark.png";
	}
	else {
		image = "images/xMark.png";
	}
	
	return image;
}

// Display the numbers that the user is selecting with the slider inputs
function show_range() {
	let form = document.getElementById("range_input");
	let country_area = form.elements.country_area.value;	
	let population = form.elements.population.value;	
	
	$("#range1").html(add_commas(country_area) + " km^2 and above");
	$("#range2").html(add_commas(population) + " people and above");
}

// Resets all the inputs and hides the previous search result
function reset() {
	document.getElementById("main_search").reset();
	document.getElementById("range_input").reset();
	document.getElementById("region_input").reset();
	
	$("#range1").html(0 + " km^2 and above");
	$("#range2").html(0 + " people and above");
	
	country_name = "";
	country_area = "";
	population = "";
	region = "";
	
	$("#result").hide();
}

// Displays the information collected from the database
function analyze(country) {
	// Declaring the function here because adding parameters and calling it from outside breaks it
	function drawRegionsMap() {
        var data = google.visualization.arrayToDataTable([
          ['Country'],
          [country.name.common],
        ]);

        var options = {
        	backgroundColor: "black",
          datalessRegionColor: "#232323",
          defaultColor: "white"
        };

        var chart = new google.visualization.GeoChart(document.getElementById('country_map'));

        chart.draw(data, options);
    }
	
	// Displaying all the information
	$("#country_title").html(country.name.common);
	$("#country_flag").attr("src", country.flags.svg);
	
	// Draws the map
	google.charts.load('current', {
        'packages':['geochart'],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);
	
	$("#official_name").html(country.name.official);
	$("#independence_status").attr("src", status_to_image(country.independent));
	$("#un_status").attr("src", status_to_image(country.unMember));
	$("#region").html(country.region);
	$("#sub_region").html(country.subregion);
	$("#capital").html(country.capital[0]);
	$("#languages").html(object_into_string(country.languages));
	$("#currency").html(name_of_nested_object_into_string(country.currencies));
	$("#area").html(add_commas(country.area) + " km^2");
	$("#population").html(add_commas(country.population) + " people");
	
	// Reveals the result section of the website
	$("#result").show();
	// Makes sure eveything is loaded first before scrolling down into it
	setTimeout(() => { document.getElementById('result').scrollIntoView(); }, 300);
}

// Gets country info from database based on name
function show_result_by_name() {
	// Resets the filter inputs to indicate they're not being used for this search 
	document.getElementById("range_input").reset();
	document.getElementById("region_input").reset();
	$("#range1").html(0 + " km^2 and above");
	$("#range2").html(0 + " people and above");
	
	// Sets up the request URL
	let base_URL = "https://restcountries.com/v3.1/";
	let form = document.getElementById("main_search");
	let name = form.elements.country_input.value;
	let full_URL = base_URL + "name/" + name + "?fullText=true";
	
	// Extracts data from the requested JSON
	$.get(full_URL, function(data) {
		console.log(data);
		country_info = data[0];
		analyze(country_info);
	})
	.fail(function() {
		alert("No result found");
	});	
}

// Gets country info from database based filters
function show_result_by_filter() {
	// Resets the text box to indicate that it's not being used for this search 
	document.getElementById("main_search").reset();
	
	// Sets up the request URL
	let base_URL = "https://restcountries.com/v3.1/"
	let form1 = document.getElementById("range_input");
	let form2 = document.getElementById("region_input");
	let area = form1.elements.country_area.value;
	let population = form1.elements.population.value;
	let region = form2.elements.region_choice.value;
	
	let full_URL = base_URL + "region/" + region;
	
	// Extracts data from the requested JSON
	$.get(full_URL, function(data) {
		console.log(data);
		
		// Holds the countries that match the area and population filter 
		let countries = [] 
		
		// Searches in the countries of that region for ones that match the area and population filter
		for (let i = 0; i < data.length; i++) {
			country = data[i]
			if (country.area >= area && country.population >= population) {
				countries.push(country); 
			}				
		}
		// Makes sure atleast one country was found and picks one randomly from the arrat
		if (countries.length > 0) {
			random_index = Math.floor(Math.random() * countries.length);
			let country_info = countries[random_index];
			analyze(country_info)
		}
		// Otherwise alerts the user that no result was found.
		else {
			alert("No result found");
		}
	});
}
