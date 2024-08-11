function input_system() {
 // Input System, Copyright Lyall Ward 2014
 this.stop = 0;
 this.enter = 13;
 this.escape = 27;
 this.punch = 32;
 this._d = 68;
 this._f = 70;
 this._l = 76;
 this._s = 83;
 this._u = 85;
 this.left = 37;
 this.up = 38;
 this.right = 39;
 this.down = 40;
 this.code = this.stop;
 this.direction = this.stop;
 this.previous = this.stop;
 this.punching = this.stop;
 this.escaped = true;
 this.pauseId;
 this.pauseDown=false;
 this.mouseLeftDown=false;
 this.mouseRightDown=false;
 this.wheeling=this.stop;
 this.mouseX=this.stop;
 this.mouseY=this.stop;
 this.motionId;
 this.motionDown=false;
 this.motionOriginX=0;
 this.motionOriginY=0;
 this.motionX=0;
 this.motionY=0;
 this.motionRadius=0;
 this.motionColor='#FFFFFF';
 this.gestureScale=32;
 this.gestureScaleMin=24;
 this.gestureScaleMax=64;
}

var key = new input_system();

input_system.prototype.key_code = function (e) {
 var k = e || window.event; 
 var ky = e.key;
 return k.which ? k.which : k.keyCode;
}

input_system.prototype.filter = function (k) {
 switch(k) {
  case this.up: return this.up;
  case this.down: return this.down;
  case this.left: return this.left;
  case this.right: return this.right;
 }
 return 0;
}

input_system.prototype.on = function(k) {
 var d = this.filter(k);
 if ((d != 0) && (d != this.direction)) {
    this.previous = this.direction;
	this.direction = d;
 }
 switch (k) {
  case this.punch:this.code=this.punching=k;break;
  case this.escape:case this.enter:this.escaped=!this.escaped;break;
  default: this.code=k;console.log(this.code);break;
 }
}

input_system.prototype.off = function(k) {
 var d = this.filter(k);
 if (d == this.direction) {
	this.direction = this.previous;
	this.previous = this.stop;
 } 
 else if (d == this.previous) this.previous = this.stop;
 if (k == this.punch) this.punching = this.stop;
}

input_system.prototype.motionOrigin = function(src,x,y) {
 if(x>(src.width/2)){
  this.motionRadius=(src.width+src.height)/this.gestureScale;
  this.motionDown=true;
  var mx=src.width-(2*this.motionRadius);
  this.motionOriginX=(x>mx)?mx:x;
  this.motionOriginY=src.height/2;//allowing lower is better for protrait touch displays
  return true;
 }
 return false;
}

input_system.prototype.motionAction = function(x,y) {
 if(this.motionDown) {
  this.motionX=x;
  this.motionY=y;
  this.previous=this.stop;
  
  if (Math.abs(x-this.motionOriginX)>Math.abs(y-this.motionOriginY)) {
   var ax=Math.round((x-this.motionOriginX)/this.motionRadius);
   if (ax>0) {this.direction=this.right;} else if (ax<0) {this.direction=this.left;} else {this.direction=this.stop;}
  } else {
   var ay=Math.round((y-this.motionOriginY)/this.motionRadius);
   if (ay>0) {this.direction=this.down;} else if (ay<0) {this.direction=this.up;} else {this.direction=this.stop;}
  }
 }
}

input_system.prototype.mousedown = function(e) {
 e.preventDefault();
 this.mouseX=e.x;
 this.mouseY=e.y;
 this.motionColor='#FF40FF'; 
 this.punching=(e.button==2)?this.punch:this.stop;
 this.mouseLeftDown|=(e.button==1);
 this.mouseRightDown|=(e.button==2);
 if(e.button!=2){
  if((e.x>(.9*e.srcElement.width))&(e.y<(.1*e.srcElement.height))){
   this.escaped=true;// egress(escape) to menu
  }else if(this.motionOrigin(e.srcElement,e.x,e.y))this.motionAction(e.x,e.y); 
 }
}

input_system.prototype.mousemove = function(e) {
 e.preventDefault();
 if(this.motionDown){
  this.mouseX=e.x;
  this.mouseY=e.y;
  this.motionAction(e.x,e.y);
 }
}

input_system.prototype.wheel = function(e) {
 e.preventDefault();
 this.wheeling+=e.wheelDelta;
}

input_system.prototype.mouseup = function(e) {
 e.preventDefault();
 if(e.button!=2){
  if(this.motionDown){
   this.direction=this.stop;
   this.motionDown=false;
  }
 } else {
  this.punching=this.stop;
  if(this.motionDown)this.motionAction(e.x,e.y);
 }
}

input_system.prototype.touchSelectID = function(src,t){
 for (var i=0;(i<t.length)&((this.pauseID==undefined)|(this.motionID==undefined));i++){
  if((t[i].clientX>(.9*src.width))&(t[i].clientY<(.1*src.height))){
   ;// egress(escape) to menu
  }else if(t[i].clientX<(src.width/2)){
   if((this.pauseID==undefined)&(t[i].identifier!=this.motionID)){
    this.punching=this.punch;
    this.pauseDown=true;
    this.pauseID=t[i].identifier;
   }
  }else if((this.motionID==undefined)&(t[i].identifier!=this.pauseID)){
   if(this.motionOrigin(src,t[i].clientX,t[i].clientY)) this.motionID=t[i].identifier;
  }
 }
}

input_system.prototype.touchRemoveID = function(t){
 for (var i=0;(i<t.length)&((this.pauseID!=undefined)|(this.motionID!=undefined));i++){
  if((this.pauseID!=undefined)&(t[i].identifier==this.pauseID)){
   this.punching=this.stop;
   this.pauseID=undefined;
   this.pauseDown=false;
  }
  if((this.motionID!=undefined)&(t[i].identifier==this.motionID)){
   this.motionID=undefined;
   this.direction=this.stop;
   this.motionDown=false;
  }
 }
}

input_system.prototype.touchUpdateID = function(t){
 for (var i=0;i<t.length;i++){
  if (t[i].identifier==this.motionID)
   this.motionAction(t[i].clientX,t[i].clientY);
 }
}

input_system.prototype.touchstart = function(e) {
 e.preventDefault();
 this.motionColor='#40FF40';
 this.touchSelectID(e.srcElement,e.changedTouches);
}

input_system.prototype.touchend = function(e) {
 e.preventDefault();
 this.touchRemoveID(e.changedTouches);
}

input_system.prototype.touchmove = function(e) {
 e.preventDefault();
 this.touchUpdateID(e.changedTouches);
}

input_system.prototype.init = function() {
 window.addEventListener("keydown", function(e) {try { key.on(key.key_code(e)); } catch (x) { }});
 window.addEventListener("keyup", function(e) {try { key.off(key.key_code(e)); } catch (x) { }});
 window.addEventListener("mousedown", function(e) {try { key.mousedown(e); } catch (x) { }});
 window.addEventListener("mouseup", function(e) {try { key.mouseup(e); } catch (x) { }});
 window.addEventListener("mousemove", function(e) {try { key.mousemove(e); } catch (x) { }});
 window.addEventListener("wheel", function(e) {try { key.wheel(e); } catch (x) { }});
 window.addEventListener("touchstart", function(e) {try { key.touchstart(e); } catch (x) { }});
 window.addEventListener("touchend", function(e) {try { key.touchend(e); } catch (x) { }});
 window.addEventListener("touchmove", function(e) {try { key.touchmove(e); } catch (x) { }});
 window.addEventListener("contextmenu", function(e) { e.preventDefault(); }, false);
}

input_system.prototype.backwards = function(dir) {
 var result = 
  ((dir==key.left)&&(this.direction==key.right))||
  ((dir==key.right)&&(this.direction==key.left))||
  ((dir==key.up)&&(this.direction==key.down))||
  ((dir==key.down)&&(this.direction==key.up));
  return result;
}

input_system.prototype.moving = function() {
 return (this.punching!=this.punch)&&(this.direction!=this.stop);
}

input_system.prototype.oneShot = function() {
 var result=this.code;
 this.code=this.stop;
 return result;
}

input_system.prototype.oneWheel = function() {
 if(this.wheeling>99){this.wheeling-=150;return 150;}
 if(this.wheeling<-99){this.wheeling+=150;return -150;}
 return 0;
}
