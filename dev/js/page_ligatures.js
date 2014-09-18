// start of file

//-------------------
// UBER FUCNTIONS
//-------------------

	function loadPage_ligatures(){

		// debug("LOADING PAGE >> ligatures");

		getEditDocument().getElementById("mainwrapper").innerHTML = charedit_content();
		setupEditCanvas();
		initEventHandlers();

		_UI.selectedtool = "pathedit";
		if(_UI.selectedchar.length < 7) _UI.selectedchar = getFirstLigatureID();

		redraw("loadPage_ligatures");
	}

	function showNewLigatureDialog() {
		var con = '<h1>New Ligature</h1>';
		con += '<div style="width:500px;">';
		con += 'Create a new ligature by specifying two or more individual characters that will make up the ligature (like ff). ';
		con += 'Ligature characters can also be specified in Unicode format (like U+0066U+0066) or hexadecimal format (like 0x00660x0066). ';
		con += 'Hexadecimal, Unicode, and regular character formats cannot be mixed - choose one type!<br><br>';
		con += '<h3>Ligature Characters</h3>';
		con += '<input type="text" id="newligatureinput" style="font-size:24px; padding:8px;"/><br>';
		con += makeshowErrorMessageBox();
		con += '<br>';
		con += '<button class="buttonsel" onclick="createNewLigature();">create new ligature</button>';
		con += '</div>';

		openDialog(con);
	}

	function createNewLigature() {
		debug('\n createNewLigature - START');
		var lid = document.getElementById('newligatureinput').value;
		debug('\t retrieved ' + lid);
		lid = lid.replace(/\s/gi, '');
		lid = parseUnicodeInput(lid);
		debug('\t parsed ' + lid);

		var lig = _GP.ligatures;

		if(lig[lid]){
			showErrorMessageBox('Ligature allready exists.');
		} else if (lid.length < 2){
			showErrorMessageBox('Ligatures must be at least two characters.');
		} else {
			lig[lid] = new Char({'charhex':lid});

			_UI.selectedchar = lid;
			navigate();
			closeDialog();
		}
	}

	function deleteLigatureConfirm(){
		var content = "Are you sure you want to delete this ligature?<br>";
		content += "<br>Warning: This action cannot be undone!<br>";
		content += "<br><button onclick='deleteLigature();'>permanently delete this ligature</button> &nbsp; <button onclick='closeDialog();'>cancel</button>";

		openDialog(content);
	}

	function deleteLigature(){
		debug('\n deleteLigature - START');
		debug('\t deleting ' + _UI.selectedchar);

		closeDialog();
		delete _GP.ligatures[_UI.selectedchar];
		_UI.selectedchar = getFirstLigatureID();
		navigate();

		debug('deleteLigature - END\n');
	}

//-----------------------
// Char Paridy Functions
//-----------------------
	function getFirstLigatureID() {
		for(var g in _GP.ligatures){
			if(_GP.ligatures.hasOwnProperty(g)) {
				debug('getFirstLigature - returning id for ' + _GP.ligatures[g].charname);
				return g;
			}
		}

		// debug('getFirstLigature - returning false');
		return false;
	}

// end of file