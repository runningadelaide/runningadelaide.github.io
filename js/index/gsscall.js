/*
requires
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
Maybe jquery as well but not sure
*/

var gss_wedtraining_div_id = "wedtraining";
var gss_sattraining_div_id = "sattraining";
var gss_race_div_id = "racesdiv";

google.load('visualization', '1', {'packages':['corechart']});
google.setOnLoadCallback(getTrainingPlan);

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

function getDateDiff(earlyDate, lateDate) {
	var one_hour=1000*60*60;
	var totalHours = Math.floor((lateDate.getTime()-earlyDate.getTime())/(one_hour));
	var totalDays = Math.floor(totalHours/24);
	
	var weeks = 0;
	var days = totalDays;
	
	if (totalDays >= 7) {
		weeks = Math.floor(totalDays/7);
	}
	
	if (weeks != 0) {
		days = totalDays - (weeks * 7);
	}
	
	if (weeks > 0) {
		return "(" + weeks + "w " + days + "d)";
	} else {
		var hours = totalHours - (days*24);
		return "(" +days + "d " + hours + "h)";
	}
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
	var raceString = [];

	for (var i = 0; i < rowCount; i++) {
		var dateVal = dataTable.getValue(i,0);
		// not all races are on sundays
		if(dataTable.getValue(i,5) == 'Race'){
			var ddString = getDateDiff(new Date(), dataTable.getValue(i,0));
			raceString.push(formatTrainString(dataTable,i,ddString));
		} else if(dataTable.getValue(i,1) == 'Wednesday'){
			wedString.push(formatTrainString(dataTable,i));
		} else if (dataTable.getValue(i,1) == 'Saturday') {
			satString.push(formatTrainString(dataTable,i));
		}
	}
	
	//console.log(raceString);
	populatePTag (wedString[0],satString[0],raceString[0]);
	populateExtraTS (wedString,satString, raceString);
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

function formatTrainString(dataTable, rowNumber, dateDiffString) {
	var dateString = getDateString(dataTable.getValue(rowNumber,0));
	var location = dataTable.getValue(rowNumber,3);
	var effort = dataTable.getValue(rowNumber,4);
	var description = dataTable.getValue(rowNumber,2);
	
	if (dateDiffString) {
		dateString = dateString + " " + dateDiffString;
	}

	if (location == null) {
		location = "";
	} else {
		location = location + ",";
	}
	
	if (effort == null) {
		effort = "";
	}
	
	return "<b>" + dateString + "</b><br/>" +
				location + 
				effort + " <br/>" +
				description;
}

function formatRaceString(dataTable, rowNumber) {
	var dateString = getDateString(dataTable.getValue(rowNumber,0));
	var location = dataTable.getValue(rowNumber,3);
	var effort = dataTable.getValue(rowNumber,4);
	var description = dataTable.getValue(rowNumber,2);

	if (location == null) {
		location = "";
	} else {
		location = location + ",";
	}
	
	if (effort == null) {
		effort = "";
	}
	
	return "<b>" + dateString + "</b> " +
				location + " " +
				description + " " +
				effort;
}

function generateExtraTraining(trainString) {
	return "<br/><p class='text-muted'>" + 
			trainString +
			"</p>";
}

function populatePTag(wedString, satString, raceString) {
	if (wedString) {
		document.getElementById(gss_wedtraining_div_id).innerHTML = wedString;
	}
	if (satString) {
		document.getElementById(gss_sattraining_div_id).innerHTML = satString;
	}
	if (raceString) {
		document.getElementById(gss_race_div_id).innerHTML = raceString;
	}
}

function populateExtraTS (wedString,satString, raceString) {
	var fullWedHtmlString = "";
	var fullSatHtmlString = "";
	
	var fullRaceHtmlString = "";
	
	for (var i = 1; i < wedString.length; i++) {
		fullWedHtmlString = fullWedHtmlString + generateExtraTraining(wedString[i]);
	}
	
	for (var i = 1; i < satString.length; i++) {
		fullSatHtmlString = fullSatHtmlString + generateExtraTraining(satString[i]);
	}
	
	for (var i = 1; i < raceString.length; i++) {
		fullRaceHtmlString = fullRaceHtmlString + generateExtraTraining(raceString[i]);
	}
	
	document.getElementById("moreWedTraining").innerHTML = fullWedHtmlString;
	document.getElementById("moreSatTraining").innerHTML = fullSatHtmlString;
	document.getElementById("moreRaces").innerHTML = fullRaceHtmlString;
}

