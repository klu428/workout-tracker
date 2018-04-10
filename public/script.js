//Author: Kelvin Lu

document.addEventListener('DOMContentLoaded', bindAdd);

//Append columns to a header row based on object attributes
function appendHeader(obj, row) {
	for (var attr in obj) {
		var col = document.createElement("th");
		col.textContent = obj[attr];
		row.appendChild(col);
	}
}

//Append columns to a table row based on object attributes
function appendRows(obj, row) {
	for (var attr in obj) {
		var col = document.createElement("td");
		col.textContent = obj[attr];
		row.appendChild(col);
	}
}

//Bind delete button
function bindDelete(row) {
	row.onsubmit = function(event) {
		event.preventDefault();
		var form = event.target;
		var req = new XMLHttpRequest();
		var formdata = new FormData(form);
		var payload = {}
		formdata.forEach(function(value, key) {
			payload[key] = value;
		});
		payload.id = parseInt(payload.id, 10);
		req.open("POST", "/delete", true);
		req.setRequestHeader('Content-Type', 'application/json');
		req.addEventListener('load', function() {
			if(req.status == 200) {
				var response = JSON.parse(req.responseText);
				updateTable(response);
			} else {
				alert(req.responseText);
			}
		});
		req.send(JSON.stringify(payload));

	};
}

//Dynamically create edit form
function bindEdit(row, params) {
	row.onsubmit = function(event) {
		event.preventDefault();
		var form = event.target;
		var formdata = new FormData(form);
		formdata.forEach(function(value,key) {
			params[key] = value;
		});
		var ef = document.createElement("form");
		ef.setAttribute('method', "post");
		ef.setAttribute('class', "editForm");
		var eid = document.createElement("input");
		eid.setAttribute('type', "hidden");
		eid.setAttribute('name', "id");
		eid.setAttribute('value', params.id);

		var enamelabel = document.createElement("label");
		enamelabel.textContent = "Name:";
		var ename = document.createElement("input");
		ename.setAttribute('type', "text");
		ename.setAttribute('name', "name");
		ename.setAttribute('value', params.name);

		var erepslabel = document.createElement("label");
		erepslabel.textContent = "Reps:";
		var ereps = document.createElement("input");
		ereps.setAttribute('type', "number");
		ereps.setAttribute('name', "reps");
		ereps.setAttribute('value', params.reps);

		var eweightlabel = document.createElement("label");
		eweightlabel.textContent = "Weight:";
		var eweight = document.createElement("input");
		eweight.setAttribute('type', "number");
		eweight.setAttribute('name', "weight");
		eweight.setAttribute('value', params.weight);

		var edatelabel = document.createElement("label");
		edatelabel.textContent = "Date:";
		var date = params.date.substring(0,10);
		var edate = document.createElement("input");
		edate.setAttribute('type', "date");
		edate.setAttribute('name', "date");
		edate.setAttribute('value', date);

		var eunitslabel = document.createElement("label");
		eunitslabel.textContent = "Unit:";
		var elbs = document.createElement("input");
		elbs.setAttribute('type', "radio");
		elbs.setAttribute('name', "lbs");
		elbs.setAttribute('value', "1");
		var elbstext = document.createTextNode("lbs");

		var ekg = document.createElement("input");
		ekg.setAttribute('type', "radio");
		ekg.setAttribute('name', "lbs");
		ekg.setAttribute('value', "0");
		ekg.textContent = "kg:"
		var ekgtext = document.createTextNode("kg");

		if (params.unit == "lbs") {
			elbs.checked = true;
		} else {
			ekg.checked = true;
		}

		var esubmit = document.createElement("input");
		esubmit.setAttribute('type', "submit");
		esubmit.setAttribute('value', "Submit Edit");

		ef.appendChild(eid);

		enamelabel.appendChild(ename);
		ef.appendChild(enamelabel);

		erepslabel.appendChild(ereps);
		ef.appendChild(erepslabel);

		eweightlabel.appendChild(eweight);
		ef.appendChild(eweightlabel);

		edatelabel.appendChild(edate);
		ef.appendChild(edatelabel);

		eunitslabel.appendChild(elbs);
		eunitslabel.appendChild(elbstext);
		eunitslabel.appendChild(ekg);
		eunitslabel.appendChild(ekgtext);
		ef.appendChild(eunitslabel);
		ef.appendChild(esubmit);
		bindSubmitEdit(ef);

		document.body.appendChild(ef);
	};
}

//bind the edit submit button
function bindSubmitEdit(row) {
	row.onsubmit = function(event) {
		event.preventDefault();
		var form = event.target;
		var req = new XMLHttpRequest();
		var formdata = new FormData(form);
		var payload = {}
		formdata.forEach(function(value, key) {
			payload[key] = value;
		});
		payload.id = parseInt(payload.id, 10);
		payload.lbs = parseInt(payload.lbs, 10);
		payload.reps = parseInt(payload.reps, 10);
		payload.weight = parseInt(payload.weight, 10);
		req.open("POST", "/edit", true);
		req.setRequestHeader('Content-Type', 'application/json');
		req.addEventListener('load', function() {
			if(req.status == 200) {
				var response = JSON.parse(req.responseText);
				updateTable(response);
			} else {
				alert(req.responseText);
			}
		});
		req.send(JSON.stringify(payload));

	};
}

//Update the workout table with what is in the database
function updateTable(resp) {
	var old = document.querySelector('#workoutTable');
	old.parentNode.removeChild(old);
	var deleteEdit = document.getElementsByClassName('editForm');
	while(deleteEdit.length > 0) {
		deleteEdit[0].parentNode.removeChild(deleteEdit[0]);
	}
	var newTable = document.createElement("table");
	newTable.id = "workoutTable";
	var headerRow = document.createElement("tr");
	var header = {name:"Name", reps:"Reps", weight:"Weight", date:"Date", unit:"Unit", delete:"Delete", edit: "Edit"};
	appendHeader(header, headerRow);
	newTable.appendChild(headerRow);

	for(var row in resp) {
		var r = document.createElement("tr");
		r.id = resp[row].id;
		var wo = {};
		wo.name = resp[row].name;
		wo.reps = resp[row].reps;
		wo.weight = resp[row].weight;
		wo.date = resp[row].date;
		if(resp[row].lbs) {
			wo.unit = "lbs";
		} else {
			wo.unit = "kg";
		}
		appendRows(wo, r);
		var tf = document.createElement("td");
		var f = document.createElement("form");
		f.setAttribute('method', "post");
		var hid = document.createElement("input");
		hid.setAttribute('type', "hidden");
		hid.setAttribute('name', "id");
		hid.setAttribute('value', resp[row].id);
		var s = document.createElement("input");
		s.setAttribute('type', "submit");
		s.setAttribute('value', "Delete");

		f.appendChild(hid);
		f.appendChild(s);
		bindDelete(f);
		tf.appendChild(f);
		r.appendChild(tf);


		var edit = document.createElement("td");
		var editf = document.createElement("form");
		editf.setAttribute('method', "post");
		var eid = document.createElement("input");
		eid.setAttribute('type', "hidden");
		eid.setAttribute('name', "id");
		eid.setAttribute('value', resp[row].id);
		var edits = document.createElement("input");
		edits.setAttribute('type', "submit");
		edits.setAttribute('value', "Edit");

		editf.appendChild(eid);
		editf.appendChild(edits);
		bindEdit(editf, wo);
		edit.appendChild(editf);
		r.appendChild(edit);

		newTable.appendChild(r);
	}

	document.body.appendChild(newTable);
}

//Bind the add button
function bindAdd() {
	document.getElementById("addForm").onsubmit = function(event) {
		event.preventDefault();
		var form = event.target;
		var req = new XMLHttpRequest();
		var formdata = new FormData(form);
		var payload = {}
		formdata.forEach(function(value, key) {
			payload[key] = value;
		});
		payload.lbs = parseInt(payload.lbs, 10);
		payload.reps = parseInt(payload.reps, 10);
		payload.weight = parseInt(payload.weight, 10);
		req.open("POST", "/add", true);
		req.setRequestHeader('Content-Type', 'application/json');
		req.addEventListener('load', function() {
			if(req.status == 200) {
				var response = JSON.parse(req.responseText);
				updateTable(response);
			} else {
				alert(req.responseText);
			}
		});
		req.send(JSON.stringify(payload));
	};
}