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

//wed test
//console.log(formatTrainString(null,null, null, true));
//sat test
//console.log(formatTrainString(null,null,null));


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
		// var dateVal = dataTable.getValue(i,0);
		// not all races are on sundays
		if(dataTable.getValue(i,5) == 'Race'){
			var ddString = getDateDiff(new Date(), dataTable.getValue(i,0));
			raceString.push(formatTrainString(dataTable,i,ddString));
		} else if(dataTable.getValue(i,1) == 'Wednesday'){
			wedString.push(formatTrainString(dataTable,i, null, true));
		} else if (dataTable.getValue(i,1) == 'Saturday') {
			satString.push(formatTrainString(dataTable,i,null));
		}
	}

	populatePTag (wedString[0],satString[0]);
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

function formatTrainString(dataTable, rowNumber, dateDiffString, isWed) {
	var wedPinLink = "https://maps.app.goo.gl/1ce5Js1C8yu2Fzr28";
	
	var dateString = getDateString(dataTable.getValue(rowNumber,0));
	var location = dataTable.getValue(rowNumber,3);
	var effort = dataTable.getValue(rowNumber,4);
	var description = dataTable.getValue(rowNumber,2);	
	var satPinLink = dataTable.getValue(rowNumber,6);
	var stravaLink = dataTable.getValue(rowNumber,8);

	// wed test
	// var dateString = "Wed Apr 10";
	// var location = "Start of Uni Loop";
	// var effort = "6.4k";
	// var description = "2*400m, 2*800m, 1*1600m, 2*800m, 2*400m";	
	// var satPinLink = "https://maps.app.goo.gl/dFZpLyYUuKWmsZbU6";
	// var stravaLink = "https://www.strava.com/routes/3204260194096713614";

	// sat test
	// var dateString = "Sat Apr 6";
	// var location = "Meet at Grange Jetty, coffe after at Cooks Pantry (6 Jetty St., Grange)";
	// var effort = "45-60min";
	// var description = "Grange Beach";	
	// var satPinLink = "https://maps.app.goo.gl/dFZpLyYUuKWmsZbU6";
	// var stravaLink = "https://www.strava.com/routes/3204260194096713614";
	
	if (dateDiffString) {
		dateString = dateString + " " + dateDiffString;
	}

	var pinLink = wedPinLink;
	if(!isWed) {
		pinLink = satPinLink;
	}

	var startText = "Start location: " + pinLink;
	
	var routeText = "";
	if(!isWed) {
		routeText = "<br/>Planned route: " + stravaLink;
	}

	var preText = "Tonights session meet at 6pm for 6:10pm start: ";
	if(!isWed) {
		preText = "Tomorrows session meet at 8 for a 8:10am start: ";
	}

	return "<b>" + dateString + "</b><br/>" +
				preText +
				location + ", " +
				effort + ", " +
				description + "<br/><br/>" + 
				startText +
				routeText;
}


function generateExtraTraining(trainString) {
	return "<br/><p class='text-muted'>" + 
			trainString +
			"</p>";
}

function populatePTag(wedString, satString) {
	if (wedString) {
		document.getElementById(gss_wedtraining_div_id).innerHTML = wedString;
	} else {
		document.getElementById(gss_wedtraining_div_id).innerHTML = "Oops, no training schedule found. However, we will still be running, check Facebook on wednesday for more details.";
	}
	
	if (satString) {
		document.getElementById(gss_sattraining_div_id).innerHTML = satString;
	} else {
		document.getElementById(gss_sattraining_div_id).innerHTML = "Oops, no training schedule found. However, we will still be running, check Facebook on Friday evening for more details.";
	}
}

function populateExtraTS (wedString,satString) {
	var fullWedHtmlString = "";
	var fullSatHtmlString = "";

	for (var i = 1; i < wedString.length; i++) {
		fullWedHtmlString = fullWedHtmlString + generateExtraTraining(wedString[i]);
	}
	
	for (var i = 1; i < satString.length; i++) {
		fullSatHtmlString = fullSatHtmlString + generateExtraTraining(satString[i]);
	}

	
	if (fullWedHtmlString) {
		document.getElementById("moreWedTraining").innerHTML = fullWedHtmlString;
	} else {
		document.getElementById("showmorewedtrainingctrl").style.visibility = "hidden";
	}
	
	if (fullSatHtmlString) {
		document.getElementById("moreSatTraining").innerHTML = fullSatHtmlString;
	} else {
		document.getElementById("showmoresattrainingctrl").style.visibility = "hidden";
	}
	

}

