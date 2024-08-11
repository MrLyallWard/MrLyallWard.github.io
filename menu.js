
var menu = new list();

var menuRows = [
 [{"title":"PAUSED","value":true},{"title":"RESTART","value":false}],
 [{"title":"EASIEST","value":100},{"title":"EASIER","value":85},{"title":"EASY","value":70},{"title":"MEDIUM","value":55},
  {"title":"FUN","value":40},{"title":"SCARY","value":25},{"title":"DEADLY","value":15}],
 [{"title":"SMALLEST","value":32},{"title":"SMALLER","value":48},{"title":"SMALL","value":64},{"title":"MEDIUM","value":80},
  {"title":"BIG","value":96},{"title":"BIGGER","value":112},{"title":"BIGGEST","value":128}],
 [{"title":"","value":false,"description":"","two":""},{"title":"","value":true,"description":"CUSTOM","two":"LEVEL","three":"CONTENT"}],
 [{"title":"","value":false,"description":"","two":""},{"title":"","value":true,"description":"RESIZE","two":"CUSTOM","three":"LEVEL"}]
];

var menuItems = {"width":11,"height":4,"row":0,"rows":[
  {"title":"MY TURN","property":menu.Paused,"column":0,"columns":menuRows[0]},
  {"title":"","property":menu.Level,"column":0,"columns":local.levels},
  {"title":"SPEED","property":menu.Speed,"column":0,"columns":menuRows[1]},
  {"title":"SIZE","property":menu.Scale,"column":0,"columns":menuRows[2]},
  {"title":"EDIT","property":menu.Placement,"column":0,"columns":menuRows[3]},
  {"title":"EDIT","property":menu.Resize,"column":0,"columns":menuRows[4]}
 ]
};

function list() {
 // User menu Copyright Lyall Ward 2015
 this.paused=true;
 this.level=0;
 this.scale=64;
 this.speed=40;
 this.placement=false;
 this.resize=false;
 this.drawn=false;
 this.hidden=false;
 this.loaded=false;
 this.saved=true;
 this.radius=15;
 list.prototype.Paused = function(p) {if (p!=undefined) menu.paused=p;return menu.paused;}
 list.prototype.Speed = function(s) {switch(s){case 15:case 25:case 40:case 55:case 70:case 85:case 100:menu.speed=s;break;};return menu.speed;};
 list.prototype.Scale = function(s) {switch(s){case 32:case 48:case 64:case 80:case 96:case 112:case 128:menu.scale=s;break;};return menu.scale;};
 list.prototype.Level = function(l) {if ((l!=undefined)&(l>=0)&(l<(local.levels.length)))menu.level=l;return menu.level;};
 list.prototype.Placement = function(p) {if (p!=undefined){menu.placement=p;menu.resize=false;}return menu.placement;}
 list.prototype.Resize = function(p) {if (p!=undefined){menu.resize=p;menu.placement=false;}return menu.resize;}
 list.prototype.Play = function() {return !(this.placement|this.resize);}
}

list.prototype.init = function(anime,key) {
 this.load();
 this.key=key;
 this.size=anime.tileSize;
 this.font=anime.tileSet[types.text];
 this.canvas=anime.canvas;
 this.context=anime.context;
 this.w=Math.round(this.canvas.width/this.size);
 this.h=Math.round(this.canvas.height/this.size);
 this.show(this.canvas.width,this.canvas.height);
}

list.prototype.isOff = function(w,h){
 if (!menu.hidden) menu.update(window.innerWidth,window.innerHeight);
 else if (key.escaped) menu.show(window.innerWidth,window.innerHeight);
 else return true;
 return false;
}

list.prototype.wasntPaused = function(){
 if (!key.escaped) {
  try {menu.save();} catch(x) {};
  menu.hide();
  return !this.paused;
 }
 return false;
}

list.prototype.nextLevel = function(){
 key.escaped=true;
 this.Paused(false);
 this.Level(this.Level()+1);
 this.show(window.innerWidth,window.innerHeight);
 this.drawn=false;
 snd.play(snd.exit);
}

list.prototype.load = function(){
 if(!this.loaded){
  try { 
   this.Speed(Number(localStorage.speed));
   this.Scale(Number(localStorage.scale));
   var level=Number(localStorage.level);
   if(level>0) {
    if (level>(local.levels.length-1))level=(local.levels.length-1);
    this.level=level;
   }
  } catch (x) { }
  this.loaded=true;
 }
}

list.prototype.save = function() {
 if(!this.saved) {
  localStorage.speed=this.speed;
  localStorage.scale=this.scale;
  localStorage.level=this.level;
  this.saved=true;
 }
}

list.prototype.adjust = function(w,h) {
 if((w!=this.canvas.width)||(h!=this.canvas.height)) {
  this.w=Math.round(w/this.size);
  this.h=Math.round(h/this.size);
  this.canvas.setAttribute("width", w);
  this.canvas.setAttribute("height", h);
  this.drawn=false;
 }
}

list.prototype.update = function(w,h) {
 if (!this.hidden) {
  this.adjust(w-20,h-20);
  var m=menuItems.rows[menuItems.row];
  switch(this.key.oneShot()) {
   case this.key.up  : menuItems.row=(menuItems.row>0)?(menuItems.row-1):(menuItems.rows.length-1);this.drawn=false;break;
   case this.key.down: menuItems.row=(menuItems.row<(menuItems.rows.length-1))?(menuItems.row+1):0;this.drawn=false;break;
   case this.key.left: this.paused=false;m.column=(m.column>0)?(m.column-1):(m.columns.length-1);m.property(m.columns[m.column].value);this.drawn=false;break;
   case this.key.right:this.paused=false;m.column=(m.column<(m.columns.length-1))?(m.column+1):0;m.property(m.columns[m.column].value);this.drawn=false;break;
  }
  this.updateMenuText();
 }
}

list.prototype.show = function(w,h) {
 menuItems.row=0;
 this.Paused(true);
 this.hidden=false;
 this.key.oneShot();
 this.drawn=false;
 this.update(w,h);
 this.saved=false;
}

list.prototype.hide = function() {
 this.context.fillStyle='#000000';
 this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
 this.hidden=true;
}

list.prototype.drawString = function(x,y,s) {
 for (var i=0;i<s.length;i++,x+=this.size) {
  if ((x<this.canvas.width)&(y<this.canvas.height)) this.context.drawImage(this.font.image(s,i),x,y);}
}

list.prototype.updateMenuText = function() {
 if (!this.drawn){
 
  var x=(this.canvas.width-(menuItems.width*this.size))/2;
  var y=((this.canvas.height-(menuItems.height*this.size))/2);

  this.context.fillStyle='#000000';
  this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
  var r=menuItems.row;
  var s=(menuItems.height+1)*this.size;
  this.drawRow(x,y,menuItems.rows[r],"#FFFFFF");
  var u=y-s;
  for (var i=r-1;i>=0;i--,u-=s) {this.drawRow(x,u,menuItems.rows[i],"#3F7FBF");}
  var d=y+s;
  for (var i=r+1;i<menuItems.rows.length;i++,d+=s) {this.drawRow(x,d,menuItems.rows[i],"#3F7FBF");}

  this.drawn=true;
 }
}

list.prototype.drawRow = function(x,y,row,fill) { 
 var property=row.property();
 //var v=x;
 for (var i=0;i<row.columns.length;i++) if (row.columns[i].value==property) {row.column=i;break;};
 var i=row.column;
 if (!(i<row.columns.length)) i=0;
 
 this.rectangle(this.context,x,y,menuItems.width*this.size,menuItems.height*this.size,this.radius,fill);
 this.drawString(x,y,row.title);
 this.drawColumn(x,y,row.columns[i]);
 
 var v=x;
 fill="#003060";
 for (var l=i-1;l>=0;l--) {
  v-=((menuItems.width+1)*this.size);
  if ((v+menuItems.width*this.size)>=0) {
   this.rectangle(this.context,v,y,menuItems.width*this.size,menuItems.height*this.size,this.radius,fill);
   this.drawColumn(v,y,row.columns[l]);
  }
 }
 v=x;
 for (var r=i+1;r<row.columns.length;r++) {
  v+=((menuItems.width+1)*this.size);
  if ((v+menuItems.width*this.size)>=0) {
   this.rectangle(this.context,v,y,menuItems.width*this.size,menuItems.height*this.size,this.radius,fill);
   this.drawColumn(v,y,row.columns[r]);
  }
 }
}

list.prototype.drawColumn = function(x,y,c) {
 if (c.description==undefined) this.drawString(x,y+(this.size*2),c.title); else {
  this.drawString(x,y,c.title);
  this.drawString(x,y+this.size,c.description);
  if (c.two!=undefined) this.drawString(x,y+(this.size*2),c.two);
  if (c.three!=undefined) this.drawString(x,y+(this.size*3),c.three);
 }
}

list.prototype.rectangle = function(c,x,y,w,h,r,f) {
 x-=r; y-=r; w+=2*r; h+=2*r;
 c.beginPath();
 c.moveTo(x+r,y);     
 c.lineTo(x+w-r,y);c.arc(x+w-r,y+r,r,1.5*Math.PI,0);
 c.lineTo(x+w,y+h-r);c.arc(x+w-r,y+h-r,r,0,0.5*Math.PI);
 c.lineTo(x+r,y+h);c.arc(x+r,y+h-r,r,0.5*Math.PI,Math.PI);
 c.lineTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,1.5*Math.PI);
 c.globalAlpha=0.2;
 c.fillStyle=f; 
 c.fill();
 c.globalAlpha=0.8;
 c.lineWidth=2;
 c.strokeStyle=f; 
 c.stroke();
 c.globalAlpha=1;
}


