/*
requires
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
Maybe jquery as well but not sure
*/

var gss_wedtraining_div_id = "wedtraining";
var gss_sattraining_div_id = "sattraining";
var gss_race_div_id = "racesdiv";
var isTest = false;

if (isTest) {
	populateDataTest();
} else {
	google.load('visualization', '1', {'packages':['corechart']});
	google.setOnLoadCallback(getTrainingPlan);
}


var weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// this is my test spreadsheet
//var ssKey = "1QpeAo6u9-t0JGzuAMTwRL7xx6cEmdC2j0N_XddaHteI";

// the following is the ARC SS
var ssKey = "1SQq7DSinO7do-sdqUjZZb0sV437SHRMICMlUQlFFy-g";
var gurl = "https://docs.google.com/spreadsheets/d/" + ssKey + "/gviz/tq";

function getDateTimeForQuery() {
	var d = new Date();
	return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " 00:00:00.000";
}

function getDateIn7DaysForQuery() {
	var d = new Date();
	var dateInaWeek = new Date(d.getTime() + (35*24*60*60*1000));
	return dateInaWeek.getFullYear() + "-" + (dateInaWeek.getMonth()+1) + "-" + dateInaWeek.getDate() + " 00:00:00.000";
}

function getTrainingPlan() {

	var opts = {sendMethod: 'auto'};
	var query = new google.visualization.Query(gurl, opts);
	var queryString = "select * where " + 
						"(A >= datetime '" + getDateTimeForQuery() + "' and A < datetime '" + getDateIn7DaysForQuery() + "')" +
						" or (F = 'Race' and A >= datetime '" + getDateTimeForQuery() + "')" + 
						" Order By A"
						;

	//console.log(queryString);
	query.setQuery(queryString);
	query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
	if (response.isError()) {
		console.error('Problem getting training plan ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	} else {	
		var data = response.getDataTable();
		populateData(data);
	}
}

function populateData(dataTable) {
	var rowCount = dataTable.getNumberOfRows();

	var wedString = [];
	var satString = [];

	for (var i = 0; i < rowCount; i++) {
		if(dataTable.getValue(i,1) == 'Wednesday'){
			wedString.push(formatTrainStringMap(dataFromGS(dataTable,i),true));
		} else if (dataTable.getValue(i,1) == 'Saturday') {
			satString.push(formatTrainStringMap(dataFromGS(dataTable,i),false));
		}
	}

	populateExtraTS (wedString,satString);
}

function populateDataTest() {
	var rowCount = 6;

	var wedString = [];
	var satString = [];

	for (var i = 0; i < rowCount; i++) {
		wedString.push(formatTrainStringMap(dataFromTest(true, i),true));	
		satString.push(formatTrainStringMap(dataFromTest(false, i),false));	
	}

	populateExtraTS (wedString,satString);
}

function getDateString(dateVal) {
	if (dateVal) {
		return weekday[dateVal.getDay()] + " " +
			month[dateVal.getMonth()] + " " +
			dateVal.getDate();
	} else {
		return "";
	}
}

function dataFromTest(isWed, index) {

	var inputMap = new Map();

	if (isWed == true) {
		inputMap.set("dateString","Wed Apr 10 | " + index);
		inputMap.set("location","Start of Uni Loop");
		inputMap.set("effort","6.4k");
		inputMap.set("description","2*400m, 2*800m, 1*1600m, 2*800m, 2*400m");
		inputMap.set("satPinLink","https://maps.app.goo.gl/dFZpLyYUuKWmsZbU6");
		inputMap.set("stravaLink","https://www.strava.com/routes/3204260194096713614");
	} else {
		inputMap.set("dateString","Sat Apr 6 | " + index);
		inputMap.set("location","Meet at Grange Jetty, coffe after at Cooks Pantry (6 Jetty St., Grange)");
		inputMap.set("effort","45-60min");
		inputMap.set("description","Grange Beach");
		inputMap.set("satPinLink","https://maps.app.goo.gl/dFZpLyYUuKWmsZbU6");
		inputMap.set("stravaLink","https://www.strava.com/routes/3204260194096713614");
	}
	return inputMap;			
}

function formatTrainStringMap(dataMap, isWed) {
	var wedPinLink = "https://maps.app.goo.gl/1ce5Js1C8yu2Fzr28";
	
	var dateString = dataMap.get("dateString");
	var location = dataMap.get("location");
	var effort = dataMap.get("effort");
	var description = dataMap.get("description");
	var satPinLink = dataMap.get("satPinLink");
	var stravaLink = dataMap.get("stravaLink");

	var pinLink = wedPinLink;
	if(!isWed) {
		pinLink = satPinLink;
	}

	var startText = "Start location: " + pinLink;
	
	var routeText = "";
	if(!isWed) {
		routeText = "\rPlanned route: " + stravaLink;
	}

	var preText = "Tonights session meet at 6pm for 6:10pm start: ";
	if(!isWed) {
		preText = "Tomorrows session meet at 8 for a 8:10am start: ";
	}

	var content = preText +
		location + ", " +
		effort + ", " +
		description + "\r\r" + 
		startText +
		routeText;

	var keyValMap = new Map();
	keyValMap.set("date", dateString);
	keyValMap.set("content", content);
	
	return keyValMap;
}

function dataFromGS(dataTable, rowNumber) {

	var inputMap = new Map();
	inputMap.set("dateString", getDateString(dataTable.getValue(rowNumber,0)));
	inputMap.set("location",dataTable.getValue(rowNumber,3));
	inputMap.set("effort",dataTable.getValue(rowNumber,4));
	inputMap.set("description",dataTable.getValue(rowNumber,2));
	inputMap.set("satPinLink",dataTable.getValue(rowNumber,6));
	inputMap.set("stravaLink",dataTable.getValue(rowNumber,8));

	return inputMap;				
}

function populateExtraTS (wedString,satString) {
	let wedDiv = document.getElementById("moreWedTraining");
	for (var i = 0; i < wedString.length; i++) {
		let textAreaId = "textArea-wed-" + i;
		addTextAndCopyButton(wedDiv, wedString[i], textAreaId);
	}
	
	let satDiv = document.getElementById("moreSatTraining");
	for (var i = 0; i < satString.length; i++) {
		let textAreaId = "textArea-sat-" + i;
		addTextAndCopyButton(satDiv, satString[i], textAreaId);
	}
}

function addTextAndCopyButton(parentDiv, contentMap,textAreaId) {
	let copyButton = document.createElement("button");
	copyButton.innerHTML = contentMap.get("date");
	copyButton.onclick = function() { copyTextAreaText(textAreaId); };

	let textAreaDiv = document.createElement("textarea");
	textAreaDiv.textContent = contentMap.get("content");
	textAreaDiv.id = textAreaId;

	parentDiv.appendChild(copyButton);
	parentDiv.appendChild(textAreaDiv);
}

function copyTextAreaText(textAreaId) {

	var copyText = document.getElementById(textAreaId);

	// Copy the text inside the text field
	navigator.clipboard.writeText(copyText.textContent);

	if (isTest) {
		alert(textAreaId + " | " + copyText.value);
	}
}