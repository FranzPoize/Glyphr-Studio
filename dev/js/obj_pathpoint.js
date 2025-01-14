// start of file
/**
	Object > Path Point
	A collection of these units make up a Path,
	they have position and handles (or control
	points). There are a few Path Point types, and
	individual handles can be shown or hidden.

	(bottm of the file)
	Object > Coordinate
	A mini object that holds x/y position, as well
	as if that point is locked or not.
**/


	function PathPoint(oa){
		oa = oa || {};
		this.objtype = 'pathpoint';

		this.P = oa.P? new Coord(oa.P) : new Coord({'x':100, 'y':100});
		this.H1 = oa.H1? new Coord(oa.H1) : new Coord({'x':0, 'y':0});
		this.H2 = oa.H2? new Coord(oa.H2) : new Coord({'x':200, 'y':200});
		// this.Q = oa.Q? new Coord(oa.Q) : false;	// Remembering Quadratic sinlge handle for Import SVG
		this.type = oa.type || 'corner';		// corner, flat, symmetric
		// this.parentpath = oa.parentpath || false;

		if(isval(oa.useh1) && oa.useh1) this.useh1 = true;
		else this.useh1 = false;

		if(isval(oa.useh2) && oa.useh2) this.useh2 = true;
		else this.useh2 = false;

		if(this.type === 'symmetric') { this.makeSymmetric('H1'); }
		else if (this.type === 'flat') { this.makeFlat('H1'); }

		//debug('PATHPOINT was passed ' + JSON.stringify(oa));
	}




//-------------------------------------------------------
// PATH POINT METHODS
//-------------------------------------------------------

	PathPoint.prototype.setPathPointPosition = function(controlpoint, nx, ny){
		var dx = 0;
		var dy = 0;
		if(nx !== false) nx = parseFloat(nx);
		if(ny !== false) ny = parseFloat(ny);
		var changed = false;

		switch(controlpoint){
			case 'P':
				if(!this.P.xlock && !isNaN(nx)){
					dx = (this.P.x - nx);
					this.P.x = nx;
					this.H1.x -= dx;
					this.H2.x -= dx;
				}
				if(!this.P.ylock && !isNaN(ny)){
					dy = (this.P.y - ny);
					this.P.y = ny;
					this.H1.y -= dy;
					this.H2.y -= dy;
				}
				break;

			case 'H1':
				if(!this.H1.xlock && !isNaN(nx)){
					this.H1.x = nx;
					changed = 'H1';
				}
				if(!this.H1.ylock && !isNaN(ny)){
					this.H1.y = ny;
					changed = 'H1';
				}
				break;

			case 'H2':
				if(!this.H2.xlock && !isNaN(nx)){
					this.H2.x = nx;
					changed = 'H2';
				}
				if(!this.H2.ylock && !isNaN(ny)){
					this.H2.y = ny;
					changed = 'H2';
				}
				break;
		}

		if(changed){
			if(this.type === 'symmetric'){ this.makeSymmetric(changed); }
			else if (this.type === 'flat') { this.makeFlat(changed); }
		}

		//this.roundAll();
	};

	PathPoint.prototype.updatePathPointPosition = function(controlpoint, dx, dy, force){
		// debug('UPDATEPOINTPOSITION - cp / dx / dy / force:\n' + controlpoint + ' / ' + dx + ' / ' + dy + ' / ' + force);
		if(dx !== false) dx = parseFloat(dx);
		if(dy !== false) dy = parseFloat(dy);
		var lockx = (_UI.selectedtool==='pathedit'? this.P.xlock : false);
		var locky = (_UI.selectedtool==='pathedit'? this.P.ylock : false);

		if(isval(force)){
			if(force){
				lockx = false;
				locky = false;
			}
		}

		switch(controlpoint){
			case 'P':
				if(!lockx) this.P.x += dx;
				if(!locky) this.P.y += dy;
				if(!lockx) this.H1.x += dx;
				if(!locky) this.H1.y += dy;
				if(!lockx) this.H2.x += dx;
				if(!locky) this.H2.y += dy;
				break;

			case 'H1' :
				this.H1.x += dx;
				this.H1.y += dy;
				// debug('\t Hold H1, updated to: ' + this.H1.x + ' ' + this.H1.y);
				if(this.type === 'symmetric'){ this.makeSymmetric('H1'); }
				else if (this.type === 'flat') { this.makeFlat('H1'); }
				break;

			case 'H2' :
				this.H2.x += dx;
				this.H2.y += dy;
				if(this.type === 'symmetric'){ this.makeSymmetric('H2'); }
				else if (this.type === 'flat') { this.makeFlat('H2'); }
				break;
		}

		//this.roundAll();
	};

	PathPoint.prototype.isOverControlPoint = function(x, y, nohandles) {
		var hp = _GP.projectsettings.pointsize/getView('Path.isOverControlPoint').dz;

		if( ((this.P.x+hp) > x) && ((this.P.x-hp) < x) && ((this.P.y+hp) > y) && ((this.P.y-hp) < y) ){
			// debug('PathPoint.isOverControlPoint - Returning P1');

			return {point:this, type:'P'};
		}

		if(this.useh1 && !nohandles){
			if( ((this.H1.x+hp) > x) && ((this.H1.x-hp) < x) && ((this.H1.y+hp) > y) && ((this.H1.y-hp) < y) ){
				// debug('PathPoint.isOverControlPoint - Returning H1');
				return {point:this, type:'H1'};
			}
		}

		if(this.useh2 && !nohandles){
			if( ((this.H2.x+hp) > x) && ((this.H2.x-hp) < x) && ((this.H2.y+hp) > y) && ((this.H2.y-hp) < y) ){
				// debug('PathPoint.isOverControlPoint - Returning H2');
				return {point:this, type:'H2'};
			}
		}

		return false;
	};

	PathPoint.prototype.toggleUseHandle = function(h){
		//debug('TOGGLEUSEHANDLE - before:\n'+json(this));

		if(h==='H1'){
			this.useh1 = !this.useh1;
			history_put('Use Handle 1 : ' + this.useh1);
		} else {
			this.useh2 = !this.useh2;
			history_put('Use Handle 2 : ' + this.useh2);
		}
		_UI.ms.shapes.calcMaxes();
		redraw({calledby:'pointDetails'});

		//debug('TOGGLEUSEHANDLE - after:\n'+json(this));
	};

	PathPoint.prototype.setPointType = function(type) {
		if(type === 'symmetric') this.makeSymmetric();
		else if (type === 'flat') this.makeFlat();
		else this.type = 'corner';
	};

	PathPoint.prototype.makeSymmetric = function(hold){
		//debug('MAKESYMETRIC - hold ' + hold + ' starts as ' + JSON.stringify(this));

		if(!hold){
			hold = this.useh1? 'H1' : 'H2';
			if(!(this.useh1 || this.useh2)){
				if( ((this.H2.x+this.P.x+this.H1.x)/3 === this.P.x) && ((this.H2.y+this.P.y+this.H1.y)/3 === this.P.y) ){
					// Handles and points are all in the same place
					this.H2.x-=200;
					this.H1.x+=200;
					this.type = 'symmetric';
					this.useh1 = true;
					this.useh2 = true;
					return;
				}
			}
		}

		switch(hold){
			case 'H1' :
				this.H2.x = ((this.P.x - this.H1.x) + this.P.x);
				this.H2.y = ((this.P.y - this.H1.y) + this.P.y);
				break;
			case 'H2' :
				this.H1.x = ((this.P.x - this.H2.x) + this.P.x);
				this.H1.y = ((this.P.y - this.H2.y) + this.P.y);
				break;
		}

		this.type = 'symmetric';
		this.useh1 = true;
		this.useh2 = true;

		//this.roundAll();
		//debug('MAKESYMETRIC - returns ' + JSON.stringify(this));
	};

	PathPoint.prototype.makeFlat = function(hold){
		// debug('\n PathPoint.makeFlat - START');
		// debug('\t hold passed ' + hold);

		if(this.isFlat()) {
			this.type = 'flat';
			return;
		}

		if(!hold){
			hold = this.useh1? 'H1' : 'H2';
			if(!(this.useh1 || this.useh2)){
				if( ((this.H2.x+this.P.x+this.H1.x)/3 === this.P.x) && ((this.H2.y+this.P.y+this.H1.y)/3 === this.P.y) ){
					// Handles and points are all in the same place
					this.H2.x-=300;
					this.H1.x+=100;
					this.type = 'flat';
					this.useh1 = true;
					this.useh2 = true;
					return;
				}
			}
		}


		var angle1 = this.getH1Angle();
		var angle2 = this.getH2Angle();
		var hyp1 = this.getH1Length();
		var hyp2 = this.getH2Length();

		//new values
		var newHx, newHy, newadj, newopp;

		if(hold === 'H1'){
			//get new x and y for H2
			newadj = Math.cos(angle1) * hyp2;
			newopp = Math.tan(angle1) * newadj;

			//Set values
			newHx =  (this.P.x + (newadj*-1));
			newHy = (this.P.y + (newopp*-1));
			
			if(!isNaN(newHx) && !isNaN(newHy)){
				this.H2.x = newHx;
				this.H2.y = newHy;
			}

		} else if (hold === 'H2'){
			//get new x and y for H2
			newadj = Math.cos(angle2) * hyp1;
			newopp = Math.tan(angle2) * newadj;

			//Set values
			newHx =  (this.P.x + (newadj*-1));
			newHy = (this.P.y + (newopp*-1));
				
			if(!isNaN(newHx) && !isNaN(newHy)){
				this.H1.x = newHx;
				this.H1.y = newHy;
			}
		}		
		
		this.type = 'flat';

		// debug(' PathPoint.makeFlat - END\n');
	};

	PathPoint.prototype.isFlat = function() {
		if(this.P.x === this.H1.x && this.P.x === this.H2.x) return true;
		if(this.P.y === this.H1.y && this.P.y === this.H2.y) return true;

		var a1 = this.getH1Angle();
		var a2 = this.getH2Angle();
		// debug('\t comparing ' + a1 + ' / ' + a2);

		 return (round((Math.abs(a1) + Math.abs(a2)), 2) === 3.14);
	};

	PathPoint.prototype.resolvePointType = function(){
		// debug('\n PathPoint.resolvePointType - START');

		if(this.isFlat()){
			if(this.getH1Length() === this.getH2Length()){
				// debug('\t resolvePointType - setting to Symmetric');
				this.type = 'symmetric';
			} else {
				// debug('\t resolvePointType - setting to Flat');
				this.type = 'flat';
			}
		} else {
			// debug('\t resolvePointType - setting to Corner');
			this.type = 'corner';
		}
		// debug(' pathPoint.resolvePointType - END\n');
	};

	PathPoint.prototype.makePointedTo = function(px, py, length){
		//figure out angle
		var adj1 = this.P.x-px;
		var opp1 = this.P.y-py;
		var hyp1 = Math.sqrt( (adj1*adj1) + (opp1*opp1) );
		var angle1 = Math.acos(adj1 / hyp1);

		//debug('MAKEPOINTEDTO - x/y/l ' + px + ' ' + py + ' ' + length + ' - Before H1x/y ' + this.H1.x + ' ' + this.H1.y);
		this.H1.x = this.P.x - Math.cos(angle1)*length;
		this.H1.y = this.P.y - Math.sin(angle1)*length;
		//debug('MAKEPOINTEDTO - after H1x/y ' + this.H1.x + ' ' + this.H1.y);
		if(this.type === 'corner') this.makeFlat('H1');
		else this.makeSymmetric('H1');
		//debug('MAKEPOINTEDTO - after makesymmetric H1x/y ' + this.H1.x + ' ' + this.H1.y);

		//this.roundAll();
	};

	PathPoint.prototype.rotate = function(angle, about) {
		// debug('\n PathPoint.rotate - START');
		rotate(this.P, angle, about);
		rotate(this.H1, angle, about);
		rotate(this.H2, angle, about);
		// debug('\t this.P ' + json(this.P, true));
		// debug(' PathPoint.rotate - END\n');
	};

	PathPoint.prototype.resetHandles = function(){
		this.type = 'corner';
		this.useh1 = true;
		this.useh2 = true;
		this.H2.x = this.P.x - 100;
		this.H2.y = this.P.y;
		this.H1.x = this.P.x + 100;
		this.H1.y = this.P.y;
	};

	PathPoint.prototype.getPointNum = function() {
		var parr = this.parentpath;
		if(!parr) return false;

		parr = parr.pathpoints;
		if(!parr) return false;

		for(var p=0; p<parr.length; p++){
			if(parr[p] === this) return p;
		}

		return false;
	};

	PathPoint.prototype.roundAll = function(){
		this.P.x = round(this.P.x, 9);
		this.P.y = round(this.P.y, 9);
		this.H1.x = round(this.H1.x, 9);
		this.H1.y = round(this.H1.y, 9);
		this.H2.x = round(this.H2.x, 9);
		this.H2.y = round(this.H2.y, 9);
	};

	PathPoint.prototype.findQuadraticSymmetric = function() {
		if(this.Q){
			return {
				'x' : ((this.P.x - this.Q.x) + this.P.x),
				'y' : ((this.P.y - this.Q.y) + this.P.y)
			};
		} else return false;
	};

	PathPoint.prototype.sharesPointPositionWith = function(path) {
		// debug('\n PathPoint.sharesPointPositionWith - START');

		for(var p=0; p<path.pathpoints.length; p++){
			if(pointsOverlap(path.pathpoints[p].P, this.P)){
				// debug(' PathPoint.sharesPointPositionWith - END - returning ' + p + '\n');
				return p;
			}				
		}

		// debug(' PathPoint.sharesPointPositionWith - END - returning false \n');
		return false;
	};

	function pointsOverlap(pp1, pp2) {
		// debug('\n pointsOverlap - START');

		var precision = 1;
		var pp1x = round(pp1.x * precision);
		var pp1y = round(pp1.y * precision);
		var pp2x = round(pp2.x * precision);
		var pp2y = round(pp2.y * precision);

		// debug('\t ' + pp1.x + ',' + pp1.y + ' - ' + pp2.x + ',' + pp2.y);
		// debug('\t ' + pp1x + ',' + pp1y + ' - ' + pp2x + ',' + pp2y);

		var re =  ((pp1x === pp2x) && (pp1y === pp2y));
		// debug('\t returning ' + re);

		return re;
	}


//-------------------------------------------------------
// GETTERS
//-------------------------------------------------------

	PathPoint.prototype.getPx = function() {
		var re = this.P.x;
		if(isNaN(re)){
			re = 0;
			// debug('PathPoint NaN found P.x - falling back to 0');
		}
		return re;
	};

	PathPoint.prototype.getPy = function() {
		var re = this.P.y;
		if(isNaN(re)){
			re = 0;
			// debug('PathPoint NaN found P.y - falling back to 0');
		}
		return re;
	};

	PathPoint.prototype.getH1x = function() {
		var re = this.useh1? this.H1.x : this.P.x;
		if(isNaN(re)){
			re = this.P.x || (this.H1.x || 0);
			// debug('PathPoint NaN found H1.x - falling back to ' + re);
		}
		return re;
	};

	PathPoint.prototype.getH1y = function() {
		var re = this.useh1? this.H1.y : this.P.y;
		if(isNaN(re)){
			re = this.P.y || (this.H1.y || 0);
			// debug('PathPoint NaN found H1.y - falling back to ' + re);
		}
		return re;
	};

	PathPoint.prototype.getH2x = function() {
		var re = this.useh2? this.H2.x : this.P.x;
		if(isNaN(re)){
			re = this.P.x || (this.H2.x || 0);
			// debug('PathPoint NaN found H2.x - falling back to ' + re);
		}
		return re;
	};

	PathPoint.prototype.getH2y = function() {
		var re = this.useh2? this.H2.y : this.P.y;
		if(isNaN(re)){
			re = this.P.y || (this.H2.y || 0);
			// debug('PathPoint NaN found H2.y - falling back to ' + re);
		}
		return re;
	};

	PathPoint.prototype.getH1Angle = function(){
		return calculateAngle(this.H1, this.P);
	};

	PathPoint.prototype.getH2Angle = function(){
		return calculateAngle(this.H2, this.P);
	};

	PathPoint.prototype.getH1NiceAngle = function(){
		return calculateNiceAngle(this.getH1Angle());
	};

	PathPoint.prototype.getH2NiceAngle = function(){
		return calculateNiceAngle(this.getH2Angle());
	};

	PathPoint.prototype.getH1Length = function() {
		return calculateLength(this.H1, this.P);
	};

	PathPoint.prototype.getH2Length = function() {
		return calculateLength(this.H2, this.P);
	};




//-------------------------------------------------------
// DRAW
//-------------------------------------------------------

	PathPoint.prototype.drawPoint = function(accent) {
		// debug('\n PathPoint.drawPoint - START');
		// debug('\t sel = ' + _UI.ms.points.isSelected(this));

		accent = accent || _UI.colors.blue;
		var ps = _GP.projectsettings.pointsize;
		var hp = ps/2;
		// _UI.glypheditctx.fillStyle = sel? 'white' : accent.l65;
		_UI.glypheditctx.fillStyle = _UI.ms.points.isSelected(this)? 'white' : accent.l65;
		_UI.glypheditctx.strokeStyle = accent.l65;

		_UI.glypheditctx.fillRect((sx_cx(this.P.x)-hp), (sy_cy(this.P.y)-hp), ps, ps);
		_UI.glypheditctx.strokeRect((sx_cx(this.P.x)-hp), (sy_cy(this.P.y)-hp), ps, ps);
		// debug(' PathPoint.drawPoint - END\n');
	};

	PathPoint.prototype.drawDirectionalityPoint = function(accent, next){
		accent = accent || _UI.colors.blue;
		// _UI.glypheditctx.fillStyle = sel? 'white' : accent.l65;
		_UI.glypheditctx.fillStyle = _UI.ms.points.isSelected(this)? 'white' : accent.l65;
		_UI.glypheditctx.strokeStyle = accent.l65;
		_UI.glypheditctx.lineWidth = 1;
		var begin = {'x':this.P.x, 'y':this.P.y};
		var end = {'x':this.H2.x, 'y':this.H2.y};

		if(!this.useh2) {
			end = {'x':next.P.x, 'y':next.P.y};
		}

		var ps = (_GP.projectsettings.pointsize*0.5);
		var arrow = [
			[(ps*3), 0],
			[ps, ps],
			[-ps, ps],
			[-ps, -ps],
			[ps, -ps]
		];
		var rotatedarrow = [];
		var ang = (Math.atan2((end.y-begin.y),(end.x-begin.x))*-1);

		// FAILURE CASE FALLBACK
		if(!ang && ang !== 0){
			ang = (this.P.x > this.H2.x)? Math.PI : 0;
		}

		for(var a in arrow){ if(arrow.hasOwnProperty(a)){
			rotatedarrow.push([
				((arrow[a][0] * Math.cos(ang)) - (arrow[a][1] * Math.sin(ang))),
				((arrow[a][0] * Math.sin(ang)) + (arrow[a][1] * Math.cos(ang)))
			]);
		}}

		//debug('DRAWPOINT arrow = ' + JSON.stringify(arrow) + '  - rotatedarrow = ' + JSON.stringify(rotatedarrow));

		_UI.glypheditctx.beginPath();
		_UI.glypheditctx.moveTo((rotatedarrow[0][0] + sx_cx(this.P.x)), (rotatedarrow[0][1] + sy_cy(this.P.y)));

		for(var p in rotatedarrow){
			if (p > 0) {
				_UI.glypheditctx.lineTo((rotatedarrow[p][0] + sx_cx(this.P.x)), (rotatedarrow[p][1] + sy_cy(this.P.y)));
			}
		}

		_UI.glypheditctx.lineTo((rotatedarrow[0][0] + sx_cx(this.P.x)), (rotatedarrow[0][1] + sy_cy(this.P.y)));
		_UI.glypheditctx.fill();
		_UI.glypheditctx.stroke();

		// Exact Middle Point
		_UI.glypheditctx.fillStyle = accent.l65;
		_UI.glypheditctx.fillRect((sx_cx(this.P.x).makeCrisp()), (sy_cy(this.P.y).makeCrisp()), 1, 1);
	};

	PathPoint.prototype.drawHandles = function(drawH1, drawH2, accent) {
		accent = accent || _UI.colors.blue;
		_UI.glypheditctx.fillStyle = accent.l65;
		_UI.glypheditctx.strokeStyle = accent.l65;
		_UI.glypheditctx.lineWidth = 1;
		var hp = _GP.projectsettings.pointsize/2;

		if(drawH1 && this.useh1){
			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.arc(sx_cx(this.H1.x), sy_cy(this.H1.y), hp, 0, Math.PI*2, true);
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.fill();

			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
			_UI.glypheditctx.lineTo(sx_cx(this.H1.x), sy_cy(this.H1.y));
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.stroke();
		}

		if(drawH2 && this.useh2){
			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.arc(sx_cx(this.H2.x), sy_cy(this.H2.y), hp, 0, Math.PI*2, true);
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.fill();

			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
			_UI.glypheditctx.lineTo(sx_cx(this.H2.x), sy_cy(this.H2.y));
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.stroke();
		}
	};

	PathPoint.prototype.drawQuadraticHandle = function(prevP) {
		// Draw Quadratic handle point from imported SVG
		_UI.glypheditctx.fillStyle = _UI.colors.error.medium;
		_UI.glypheditctx.strokeStyle = _UI.colors.error.medium;
		_UI.glypheditctx.lineWidth = 1;
		var hp = _GP.projectsettings.pointsize/2;

		if(this.Q){
			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.arc(sx_cx(this.Q.x), sy_cy(this.Q.y), hp, 0, Math.PI*2, true);
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.fill();

			_UI.glypheditctx.beginPath();
			_UI.glypheditctx.moveTo(sx_cx(this.P.x), sy_cy(this.P.y));
			_UI.glypheditctx.lineTo(sx_cx(this.Q.x), sy_cy(this.Q.y));
			_UI.glypheditctx.closePath();
			_UI.glypheditctx.stroke();

			if(prevP){
				_UI.glypheditctx.beginPath();
				_UI.glypheditctx.moveTo(sx_cx(prevP.x), sy_cy(prevP.y));
				_UI.glypheditctx.lineTo(sx_cx(this.Q.x), sy_cy(this.Q.y));
				_UI.glypheditctx.closePath();
				_UI.glypheditctx.stroke();
			}
		}
	};


//-------------------------------------------------------
// COORDINATE OBJECT
//-------------------------------------------------------

	function Coord(oa){
		this.objtype = 'coord';
		oa = oa || {};

		this.x = parseFloat(oa.x) || 0;
		this.y = parseFloat(oa.y) || 0;
		this.xlock = oa.xlock || false;
		this.ylock = oa.yllock || false;

		if(oa && oa.x !== undefined && isNaN(oa.x)) console.log('NEW COORD >> initialized oa.x = ' + oa.x);
		if(oa && oa.y !== undefined && isNaN(oa.y)) console.log('NEW COORD >> initialized oa.y = ' + oa.y);

	}

// end of file