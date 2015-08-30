/*
requires
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
Maybe jquery as well but not sure
*/

var gss_wedtraining_div_id = "wedtraining";
var gss_sattraining_div_id = "sattraining";
var gss_race_div_id = "racesdiv";

//google.load('visualization', '1', {'packages':['corechart']});
//google.setOnLoadCallback(getTrainingPlan);

var weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// this is my test spreadsheet
//var ssKey = "1QpeAo6u9-t0JGzuAMTwRL7xx6cEmdC2j0N_XddaHteI";

// the following is the ARC SS
var ssKey = "1SQq7DSinO7do-sdqUjZZb0sV437SHRMICMlUQlFFy-g";
var gurl = "https://docs.google.com/spreadsheets/d/" + ssKey + "/gviz/tq";

var gurl2 = "http://spreadsheets.google.com/a/google.com/tq?key=1SQq7DSinO7do-sdqUjZZb0sV437SHRMICMlUQlFFy-g&tq=select%20*%20limit%2010&tqx=responseHandler:getTrainingPlan2";



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

function getTrainingPlan2(data) {
	console.log(data);
	parse(data);
	//console.log(parse(data));
}

function parse(data) {

	var wedString = [];
	var satString = [];
	var raceString = [];

    var table = data.table;
    for (var i = 0; i < table.rows.length; i++){
    
    	var date = ( new Function( 'return ' + getStringValue(table,i,0) ) )(); 
    	var day = getStringValue(table,i,1);
    	var description = getStringValue(table,i,2);
    	var location = getStringValue(table,i,3);
    	var effort = getStringValue(table,i,4);
    	var race = getStringValue(table,i,5) == 'Race';
    	
    	
		if(race){
			var ddString = getDateDiff(new Date(), new Date(date));
			raceString.push(generateDisplayVal(date,day,description,location,effort,race,ddString));
		} else if(day == 'Wednesday'){
			wedString.push(generateDisplayVal(date,day,description,location,effort,race));
		} else if (day == 'Saturday') {
			satString.push(generateDisplayVal(date,day,description,location,effort,race));
		}
    
    }
    
    populatePTag (wedString[0],satString[0],raceString[0]);
	populateExtraTS (wedString,satString, raceString);
}

function getStringValue(table, row, col) {
	
	if (table.rows[row] && 
			table.rows[row].c && 
			table.rows[row].c[col] &&
			table.rows[row].c[col].v ) {
		return table.rows[row].c[col].v;
	} else {
		return "";
	}	

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

function generateDisplay(date,day,type,location,effort,race) {
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

function getDateString(dateValIn) {
	dateVal = new Date(dateValIn);
	if (dateVal) {
		return weekday[dateVal.getDay()] + " " +
			month[dateVal.getMonth()] + " " +
			dateVal.getDate();
	} else {
		return "";
	}
}

function generateDisplayVal(date,day,description,location,effort,race,dateDiffString) {
	var dateString = getDateString(date);
	
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

