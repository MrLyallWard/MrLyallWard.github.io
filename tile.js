var types = new tile_types();
var lastContext;
var lastCanvas;

function tile_types() {
 this.blank = 0;    this.dirt = 1;      this.rock = 2;
 this.brick = 3;    this.man = 4;       this.exit = 5;
 this.boulder = 6;  this.ball = 7;      this.pac = 8;       this.poc = 9;
 this.emerald = 10; this.ruby = 11;     this.diamond = 12;
 this.crawler = 13; this.critter = 14;
 this.burrow = 15;  this.mound = 16;
 this.turret = 17;  this.laser = 18;
 this.text = 19;    this.max_type = 20;
}

function tile(size, kind) {
 this.size=size;
 this.kind=kind;
 this.breakable=true;
 this.unstable=false;
 this.killable=false;
 this.track=false;
 this.activated=false;
 this.frames = new Array();
 tile.prototype.rnd = function() {return parseInt(Math.random()*0xFFFFFF);}
 tile.prototype.push = function(rgb) {this.frames.push(rgb);}
 tile.prototype.hashcolor = function(c) {var s = c.toString(16); while(s.length<6) s='0'+s; return '#'+s;}
 this.action=function() {return false;}
 this.customise(kind);
}

tile.prototype.customise = function(kind) {
 switch (kind) {
  case types.dirt:for(var i=0;i<8;i++){this.push(this.noisy(0x905000FF,0x15,0));}this.action=anime.freeze();break;
  case types.rock:for(var i=0;i<8;i++){this.push(this.noisy(0xFFFFFFFF,0xFF,2));}this.action=anime.freeze();break;
  case types.brick:for(var i=0;i<8;i++){this.push(this.brick());}this.action=anime.freeze();this.breakable=false;break;
  case types.man:for(var i=0;i<16;i++){this.push(this.man(i));};this.action=anime.man();this.killable=true;this.track=true;break;
  case types.exit:for(var i=0;i<8;i++){this.push(this.exit(i));};this.action=anime.exit();this.breakable=false;break;
  case types.boulder:for(var i=0;i<16;i++){this.frames.push(this.boulder(i));}for(var i=0;i<16;i++){this.enshade(i);}this.action=anime.boulder();this.unstable=true;break;
  case types.ball:for(var i=0;i<32;i++){this.push(this.sphere(0xFF0000,i));}this.action=anime.rubyMon();this.killable=true;break;
  case types.pac:for(var i=0;i<32;i++){this.push(this.sphere(0x00CF00,i));}this.action=anime.emeraldMon();this.killable=true;break;
  case types.poc:for(var i=0;i<32;i++){this.push(this.sphere(0x003FFF,i));}this.action=anime.diamondMon();this.killable=true;break;
  case types.ruby:for(var i=0;i<8;i++){this.push(this.octohedron(i,0x9F0000));}this.action=anime.spin();this.unstable=true;break;
  case types.emerald:for(var i=0;i<8;i++){this.push(this.icosahedron(i,0x008F00));}this.action=anime.spin();this.unstable=true;break;
  case types.diamond:for(var i=0;i<8;i++){this.push(this.cube(i,0x002F9F));}this.action=anime.spin();this.unstable=true;break;
  case types.crawler:for(var i=0;i<96;i++){this.push(this.critter(i,0x00CF00));}this.action=anime.crawlLeft();this.killable=true;break;
  case types.critter:for(var i=0;i<96;i++){this.push(this.critter(i,0xFF0000));}this.action=anime.crawlRight();this.killable=true;break;
  case types.burrow:this.push(this.burrow(0x707000FF));this.action=anime.burrow();this.breakable=false;break;
  case types.mound:this.push(this.burrow(0x902000FF));this.action=anime.mound();this.breakable=false;break;
  case types.turret:for(var i=0;i<32;i++){this.push(this.turret(i));}this.action=anime.turret();break;
  case types.laser:for(var i=0;i<32;i++){this.push(this.laser(i));}this.action=anime.laser();break;
  case types.text:for(var i=0;i<64;i++){this.push(this.text(i));}this.image=anime.character();break;
  default: this.push(this.blank());this.action=anime.freeze();this.track=true;break;
 }
}

tile.prototype.pic = function(direction,frame) {
 switch(this.kind) {
  //case types.blank:
  case types.ball:case types.pac:case types.poc:return this.frames[frame];
  case types.diamond:case types.ruby:case types.emerald:return this.frames[frame];
  case types.man:return this.frames[frame+((direction==key.left)?0:8)];
  case types.brick: case types.rock: case types.dirt:return this.frames[this.rnd()%this.frames.length];
  case types.boulder: if (direction==key.right) frame = this.frames.length-1-frame; return this.frames[frame];
  case types.critter: case types.crawler: case types.turret: case types.laser: return this.frames[frame];
  case types.text:return this.frames[frame];
  default:return this.frames[0];
 }  
}

tile.prototype.lowpass = function(data) {
 for (var i=4; i<(data.length-4); i+=4) {
  var row = this.size*4;
  var sum = 4*data[i];
  if (sum!=0) {
   sum += data[i-4]+data[i+4];
   sum+=(i>row)?data[i-row]:data[i];
   sum+=((i+row)<data.length)?data[i+row]:data[i];
   data[i+0]=data[i+1]=data[i+2]=(sum+31)>>3;
  }
 }
}

tile.prototype.noisy = function(rgba, speckle, fuzz) {
 var r=(rgba>>24)&0xFF;
 var g=(rgba>>16)&0xFF;
 var b=(rgba>>8)&0xFF;
 var a=(rgba>>0)&0xFF;
 var context=this.cloneContext();
 var rgb=context.getImageData(0, 0, this.size, this.size);
 for (var i=0; i<rgb.data.length; i+=4) {
  var s=this.rnd();
  rgb.data[i+0]=r^(s&speckle);
  rgb.data[i+1]=g^(s&speckle);
  rgb.data[i+2]=b^(s&speckle);
  rgb.data[i+3]=a;
 }
 for (var i=0;i<fuzz;i++) this.lowpass(rgb.data);
 context.putImageData(rgb, 0, 0);
 return context.canvas;
}

tile.prototype.blank = function() {
 var context=this.cloneContext();
 context.fillStyle='black';
 context.fillRect(0,0,this.size,this.size);
 return context.canvas;
}

tile.prototype.laser = function(i) {
 var w=[-2,0,2,3,2,0,-2,-3];
 var c=this.cloneContext();
 var h=this.size/2;
 var a=this.size/8;
 var s=this.size/4;
 var e=this.size-s;
 c.beginPath();
 c.lineWidth=2;
 c.strokeStyle="#FFE090";
 switch(i>>3) {
  case 0: c.moveTo(h+w[i=(i+1)&7],e--); do c.lineTo(h+w[i=(i+1)&7],e--); while (s<e); break;
  case 1: c.moveTo(s++,h+w[i=(i+1)&7]); do c.lineTo(s++,h+w[i=(i+1)&7]); while (s<e); break;
  case 2: c.moveTo(h+w[i=(i+1)&7],s++); do c.lineTo(h+w[i=(i+1)&7],s++); while (s<e); break;
  case 3: c.moveTo(e--,h+w[i=(i+1)&7]); do c.lineTo(e--,h+w[i=(i+1)&7]); while (s<e); break;
 }
 c.stroke();
 return c.canvas;
}

tile.prototype.turret = function(i) {
 var burst=[0x505050,0xB45650,0xE66850,0xFA8650,0xFFB050,0xFFE650,0xE66850,0xB45650];
 var b=burst[i&7];
 var s=this.sphere(b);
 var c=this.cloneContext();
 var w=this.size/8;
 var g;
 switch(i>>3){
  case 0:case 2:g=c.createLinearGradient(this.size/2-w,0,this.size/2+w,0);break;
  case 1:case 3:g=c.createLinearGradient(0,this.size/2-w,0,this.size/2+w);break;
 }
 g.addColorStop(0,this.hashcolor(b|0x0F0F0F));
 g.addColorStop(0.5,this.hashcolor(b));
 g.addColorStop(1,this.hashcolor((b>>1)&0x7F7F7F));
 c.beginPath();
 c.lineWidth=w;
 c.strokeStyle=g;
 switch (i>>3) {
  case 0:c.moveTo(this.size/2,1);c.lineTo(this.size/2,this.size-1);c.stroke();c.drawImage(s,0,.4*this.size);break;
  case 1:c.moveTo(1,this.size/2);c.lineTo(this.size-1,this.size/2);c.stroke();c.drawImage(s,-.4*this.size,0);break;
  case 2:c.moveTo(this.size/2,1);c.lineTo(this.size/2,this.size-1);c.stroke();c.drawImage(s,0,-.4*this.size);break;
  case 3:c.moveTo(1,this.size/2);c.lineTo(this.size-1,this.size/2);c.stroke();c.drawImage(s,.4*this.size,0);break;
 }
 return c.canvas;
}

tile.prototype.exit = function(angle) {
 var context=this.cloneContext();
 context.fillStyle='white';
 context.fillRect(0,this.size/2,this.size,this.size);
 context.arc(this.size/2,this.size/2,this.size/2,0,2*Math.PI);
 context.fill();
 return context.canvas;
}

function coords(x,y,c,angle) {
 if (c==undefined) { this.x=x;this.y=y; } else {
  if (angle==undefined) angle = 0;
  this.x=c.x-(x-c.x)*Math.cos(angle)-(y-c.y)*Math.sin(angle);
  this.y=c.y-(y-c.y)*Math.cos(angle)+(x-c.x)*Math.sin(angle);
 }
}

tile.prototype.burrow = function(color) {
 var c=this.noisy(color,0x15,0).context;
 if(c==undefined){
  console.log("burrow failed to create a noisy canvas");
  console.log(" last context "+lastContext);
  console.log(" last canvas  "+lastCanvas);
 }
 c.beginPath();
 c.fillStyle = "#000000";
 c.moveTo(0,0);c.lineTo(0,this.size);
 c.lineTo(.4*this.size,.4*this.size);c.lineTo(.6*this.size,.4*this.size);c.lineTo(this.size,this.size);
 c.lineTo(this.size,0);c.lineTo(0,0);
 c.fill();
 return c.canvas;
}

tile.prototype.rawCritter = function(color,step,angle) {
 var b = this.sphere(color);
 var c = this.cloneContext();
 var a = 0;
 var legs = [[-1,1,.66,-.11],[0,5,.87,0],[1,3,.66,.11],[-1,4,-.66,-.11],[0,2,-.87,0],[1,0,-.66,.11]];
 var l;
 var m = this.size/2;
 var q = 0.9*this.size/4;
 var rot;

 var origin = new coords(this.size/2,this.size/2);
 var rotation = angle;
 // birectional until we add a face
 c.save();
 c.globalAlpha=0.8;
 c.lineCap="round";
 
 for (l=0;l<legs.length;l++) {
  var leg=legs[l];
  var a = 2*Math.PI*(step/8+leg[1]/legs.length);
  var x = m*(1+leg[2]);
  var y = m+q*(leg[0]+Math.sin(a));
  var e;
  if ((l==1)||(l==4)) e=m-(y-m)*.2; else e=m+(y-m)*.4;

  var shoulder=new coords(m,m+(leg[3]*this.size),origin,rotation);
  var elbow=new coords(m+(x-m)*.4,e,origin,rotation); 
  var toe=new coords(x,y,origin,rotation);

  c.beginPath();
  c.lineWidth=this.size/20;
  c.strokeStyle=this.hashcolor(color); 
  c.moveTo(shoulder.x,shoulder.y);
  c.lineTo(elbow.x,elbow.y);
  c.lineTo(toe.x,toe.y);
  c.stroke();
 }
 c.restore();
 c.save();
 c.scale(.11,.11);
 origin = new coords(4*this.size,4*this.size);
 rot=new coords(4*this.size,3*this.size,origin,rotation);
 c.drawImage(b,rot.x,rot.y);
 rot=new coords(4*this.size,4*this.size,origin,rotation);
 c.drawImage(b,rot.x,rot.y);
 rot=new coords(4*this.size,5*this.size,origin,rotation);
 c.drawImage(b,rot.x,rot.y);

 c.restore();
 c.scale(.33,.33);
 origin = new coords(this.size,this.size);
 rot=new coords(this.size,0,origin,rotation);
 c.drawImage(b,rot.x,rot.y);
 rot=new coords(this.size,2*this.size,origin,rotation);
 c.drawImage(b,rot.x,rot.y);
 return c;
}

tile.prototype.critter = function(step,color) {
 // eight running frames, four directions and eight rotations of each clockwise and widdershins.
 var set=step>>3;
 switch (set) {
  case 0: return this.rawCritter(color,step,1*Math.PI).canvas;
  case 1: return this.rawCritter(color,step,1.5*Math.PI).canvas;
  case 2: return this.rawCritter(color,step,0).canvas;
  case 3: return this.rawCritter(color,step,0.5*Math.PI).canvas;
  default: {
   set-=4;
   if (set<4) return this.rawCritter(color,step,Math.PI*step/16).canvas;
   return this.rawCritter(color,step,Math.PI*step/-16).canvas;
  }
 }
}

tile.prototype.brick = function() {
 var context=this.cloneContext();
 var rgb=context.getImageData(0, 0, this.size, this.size);
 for (var i=0; i<rgb.data.length; i+=4) {
  var rnd = this.rnd();
  var pixel = Math.sqrt((0x20+((rnd>>8)&0x7F))*(0x80+(rnd&0x7F)));
  var row = i/(4*this.size);
  var col = i/4;
  if ((row&7)==0) pixel|=0xC0; else if ((row&7)==7) pixel&=0x3f;
  if (((row/8)&1)!=0) col+=8; 
  if ((col&15)==0) pixel|=0xC0; else if ((col&15)==15) pixel&=0x3F;
  rgb.data[i+0]=rgb.data[i+1]=rgb.data[i+2]=pixel&0xFF;
  rgb.data[i+3]=0xFF;
 }
 this.lowpass(rgb.data);
 context.putImageData(rgb, 0, 0);
 return context.canvas;
}

tile.prototype.smile = function(c,mouth) {
 if(mouth!=undefined)try{
  var bites=[
   [["#000000",.5,.5,.5,2*Math.PI,.01*Math.PI],["#000000",.5,.5,.5,1.98*Math.PI,.02*Math.PI],
    ["#000000",.5,.5,.5,1.95*Math.PI,.05*Math.PI],["#000000",.5,.5,.5,1.82*Math.PI,.18*Math.PI],
    ["#000000",.5,.5,.5,1.8*Math.PI,.2*Math.PI],["#000000",.5,.5,.5,1.82*Math.PI,.18*Math.PI],
    ["#000000",.5,.5,.5,1.95*Math.PI,.05*Math.PI],["#000000",.5,.5,.5,1.98*Math.PI,.02*Math.PI]
   ],
   [["#000000",.5,.5,.5,.99*Math.PI,1*Math.PI],["#000000",.5,.5,.5,.98*Math.PI,1.02*Math.PI],
    ["#000000",.5,.5,.5,.95*Math.PI,1.05*Math.PI],["#000000",.5,.5,.5,.82*Math.PI,1.18*Math.PI],
    ["#000000",.5,.5,.5,.8*Math.PI,1.2*Math.PI],["#000000",.5,.5,.5,.82*Math.PI,1.18*Math.PI],
    ["#000000",.5,.5,.5,.95*Math.PI,1.05*Math.PI],["#000000",.5,.5,.5,.98*Math.PI,1.02*Math.PI]
   ],
   [["#404040",.5,-1.99,2.52,(.5*Math.PI)-.15,(.5*Math.PI)+.15,.5,3.01,2.52,(1.5*Math.PI)-.15,(1.5*Math.PI)+.15],
    ["#101010",.5,-2,2.55,(.5*Math.PI)-.15,(.5*Math.PI)+.15,.5,3,2.55,(1.5*Math.PI)-.15,(1.5*Math.PI)+.15],
	["#202020",.5,-.44,1.05,(.5*Math.PI)-.46,(.5*Math.PI)+.46,.5,1.44,1.05,(1.5*Math.PI)-.46,(1.5*Math.PI)+.46],
	["#303030",.5,-.44,1.05,(.5*Math.PI)-.46,(.5*Math.PI)+.46,.5,1.44,1.05,(1.5*Math.PI)-.46,(1.5*Math.PI)+.46],
	["#404040",.5,-.125,.625,(.5*Math.PI)-.32,(.5*Math.PI)+.32,.5,1.125,.525,(1.5*Math.PI)-.32,(1.5*Math.PI)+.32],
    ["#303030",.5,-.44,1.05,(.5*Math.PI)-.46,(.5*Math.PI)+.46,.5,1.44,1.05,(1.5*Math.PI)-.46,(1.5*Math.PI)+.46],
	["#202020",.5,-.44,1.05,(.5*Math.PI)-.46,(.5*Math.PI)+.46,.5,1.44,1.05,(1.5*Math.PI)-.46,(1.5*Math.PI)+.46],
	["#101010",.5,-2,2.55,(.5*Math.PI)-.15,(.5*Math.PI)+.15,.5,3,2.55,(1.5*Math.PI)-.15,(1.5*Math.PI)+.15]
   ],
   []
  ];
  var s=this.size
  var eyes=[[[.6,.2]],[[.4,.2]],[[.3,.2],[.7,.2]],[]];
  var frame=mouth%8;
  var direction=(mouth-frame)/8;
  var pair=eyes[direction];
  c.globalAlpha=1;
  for (var i=0;i<pair.length;i++) if(pair[i]!=undefined){
   c.beginPath();c.arc(pair[i][0]*s,pair[i][1]*s,s/16,0,2*Math.PI);c.fillStyle="#FFE0C0";c.fill();
   c.beginPath();c.arc(pair[i][0]*s,pair[i][1]*s,s/48,0,2*Math.PI);c.fillStyle="#000000";c.fill();
  }
  var cut=bites[direction];
  if(frame<cut.length){
   cut=cut[frame];
   if(cut.length>0){
    c.beginPath();c.fillStyle=cut[0];c.moveTo(.5*s,.5*s);
    if(cut.length>5)c.arc(cut[1]*s,cut[2]*s,cut[3]*s,cut[4],cut[5]);
    if(cut.length>10)c.arc(cut[6]*s,cut[7]*s,cut[8]*s,cut[9],cut[10]);
    c.lineTo(.5*s,.5*s);c.fill();
   }
  }
 } catch(x){};
}

tile.prototype.sphere = function(color,mouth) {
 var c=this.size/2;
 var r=c*(15/16);
 
 var context=this.cloneContext();
 context.beginPath();
 context.arc(c, c, r, 0, 2 * Math.PI);
 
 var base=context.createRadialGradient(c*.9, c*.9, 0, c*1, c*1, c);
 var intensity = ((color >> 2) & 0x3F3F3F)+((color >> 4) & 0x0F0F0F);
 var increment = ((color >> 5) & 0x070707)+((color >> 4) & 0x0F0F0F);
 for (var i=0.0; i<=1.0; i+=(1/8), intensity+=increment) {base.addColorStop(Math.sqrt(1-(i*i)),this.hashcolor(intensity));}
 context.fillStyle=base;
 context.fill();
 
 var shade=this.cloneContext();
 shade.beginPath();
 shade.arc(c, c, r, 0, 2 * Math.PI);
 var GRAD2=shade.createRadialGradient(this.size*7/8, this.size*7/8, 0, c, c, this.size*1.4);
 GRAD2.addColorStop(0.0,"#000000");
 GRAD2.addColorStop(0.6,"transparent");
 GRAD2.addColorStop(1.0,"transparent");
 shade.fillStyle=GRAD2;
 shade.fill();
 shade.globalAlpha=.8;
 shade.drawImage(context.canvas,0,0);
 
 var light=this.cloneContext();
 light.beginPath();
 light.arc(c, c, r, 0, 2 * Math.PI);
 var GRAD=light.createRadialGradient(this.size*19/64, this.size*19/64, 0, c, c, c);
 GRAD.addColorStop(0.0,this.hashcolor(0xFFFFFF));
 GRAD.addColorStop(0.8,"transparent");
 GRAD.addColorStop(1.0,"transparent");
 light.fillStyle=GRAD;
 light.fill();
 shade.globalAlpha=0.66;
 shade.drawImage(light.canvas,0,0);
 context.globalAlpha=0.66;
 context.drawImage(shade.canvas,0,0);
 
 this.smile(context,mouth);
 return context.canvas;
}

tile.prototype.rawBoulder = function() {
 var c = this.cloneContext();
 var r1 = this.size*3/9; var r2 = this.size*4/9; var r3 = (r1+r2+r2)/3;
 c.fillStyle='#FFFFFF'; c.beginPath();
 c.arc(this.size/2,this.size-r2,r2,0,2*Math.PI);
 c.arc(this.size/2,r1,r1,0,2*Math.PI);
 c.arc(this.size/2,r3+(r3-r1)/2,r3,0,2*Math.PI);
 c.fill();
 var rgb=c.getImageData(0, 0, this.size, this.size);
 for (var i=0; i<rgb.data.length; i+=4) {rgb.data[i+0]&=rgb.data[i+1]&=rgb.data[i+2]&=(this.rnd()&0xFF)|3;}
 for (var reps=0;reps<2;reps++) {this.lowpass(rgb.data);}
 c.putImageData(rgb, 0, 0);
 return c;
}

tile.prototype.boulder = function(i) {
 var c;
 if (i==0) {
  c=this.rawBoulder(); 
 } else {
  c=this.cloneContext();
  c.save();
  c.translate(this.size/2,this.size/2);
  c.rotate(((16-i)/8)*Math.PI);
  c.drawImage(this.frames[0],-this.size/2,-this.size/2);
  c.restore();
 }  
 c.canvas.context=c;
 return c.canvas;
}

tile.prototype.colorStops = function(g,c) {g.addColorStop(.0,c);g.addColorStop(.5,"transparent");g.addColorStop(1.,"transparent");}

tile.prototype.enshade = function(i) {
 var c = this.frames[i].context;
 var l = this.cloneContext();
 var g=l.createLinearGradient(0,0,this.size,0);this.colorStops(g,"#4F5F7F");
 l.fillStyle=g;
 l.fillRect(0,0,this.size,this.size);  
 g=l.createLinearGradient(0,0,0,this.size);this.colorStops(g,"#5F6F7F");
 l.fillStyle=g;
 l.fillRect(0,0,this.size,this.size);  
 this.addContext(c,l);
 l=this.cloneContext();
 g=l.createLinearGradient(this.size,0,0,0);this.colorStops(g,"#5F6F7F");
 l.fillStyle=g;
 l.fillRect(0,0,this.size,this.size);  
 g=l.createLinearGradient(0,this.size,0,0);this.colorStops(g,"#5F6F7F");
 l.fillStyle=g;
 l.fillRect(0,0,this.size,this.size);  
 this.subContext(c,l);
}

tile.prototype.man = function(frame) { // add direction next so (direction,frame) then add pushing so (pushing,direction,frame)
 var fs=[.07,"#BFBFBF"];var ls=[.1,"#003FBF"]; var bs=[.15,"#5F7FFF"]; var hs=[.11,"#FF8040"]; var as=[.06,"#FF8040"]; 
 var strokes = [
  /* run left */
  [[fs,[.35,.95],[.53,.93]], [ls,[.47,.91],[.43,.74],[.51,.50],[.45,.75],[.51,.95]], [fs,[.38,.97],[.55,.97]], [as,[.5,.21],[.55,.39],[.34,.40]], [bs,[.5,.23],[.5,.51]], [as,[.5,.21],[.55,.39],[.34,.40]], [hs,[.5,.11]]],
  [[fs,[.25,.93],[.42,.95]], [ls,[.39,.92],[.37,.75],[.51,.52],[.57,.75],[.65,.95]], [fs,[.51,.97],[.68,.97]], [as,[.5,.23],[.43,.39],[.26,.28]], [bs,[.5,.25],[.5,.53]], [as,[.5,.23],[.61,.36],[.42,.43]], [hs,[.5,.13]]],
  [[fs,[.12,.95],[.29,.97]], [ls,[.25,.95],[.35,.75],[.50,.54],[.65,.75],[.78,.91]], [fs,[.64,.97],[.81,.92]], [as,[.5,.25],[.30,.28],[.26,.07]], [bs,[.5,.27],[.5,.55]], [as,[.5,.25],[.67,.29],[.50,.46]], [hs,[.5,.15]]],
  [[fs,[.25,.97],[.42,.97]], [ls,[.39,.95],[.37,.75],[.51,.52],[.57,.75],[.65,.92]], [fs,[.51,.95],[.68,.93]], [as,[.5,.23],[.43,.39],[.26,.28]], [bs,[.5,.25],[.5,.53]], [as,[.5,.23],[.61,.36],[.42,.43]], [hs,[.5,.13]]],
  [[fs,[.38,.97],[.55,.97]], [ls,[.47,.91],[.43,.74],[.51,.50],[.45,.75],[.51,.95]], [fs,[.35,.95],[.53,.93]], [as,[.5,.21],[.55,.39],[.34,.40]], [bs,[.5,.23],[.5,.51]], [as,[.5,.21],[.55,.39],[.34,.40]], [hs,[.5,.11]]],
  [[fs,[.25,.93],[.42,.95]], [ls,[.39,.92],[.37,.75],[.51,.52],[.57,.75],[.65,.95]], [fs,[.51,.97],[.68,.97]], [as,[.5,.23],[.61,.36],[.42,.43]], [bs,[.5,.25],[.5,.53]], [as,[.5,.23],[.43,.39],[.26,.28]], [hs,[.5,.13]]],
  [[fs,[.12,.95],[.29,.97]], [ls,[.25,.95],[.35,.75],[.50,.54],[.65,.75],[.78,.91]], [fs,[.64,.97],[.81,.92]], [as,[.5,.25],[.67,.29],[.50,.46]], [bs,[.5,.27],[.5,.55]], [as,[.5,.25],[.30,.28],[.26,.07]], [hs,[.5,.15]]],
  [[fs,[.25,.97],[.42,.97]], [ls,[.39,.95],[.37,.75],[.51,.52],[.57,.75],[.65,.92]], [fs,[.51,.95],[.68,.93]], [as,[.5,.23],[.61,.36],[.42,.43]], [bs,[.5,.24],[.5,.53]], [as,[.5,.23],[.43,.39],[.26,.28]], [hs,[.5,.13]]],
 ];
 
 var c = this.cloneContext();    
 if (frame < strokes.length) { //run left
  var z = this.size;           
  var x,y,k,w;                 
 
  for (var s=0;s<strokes[frame].length;s++) {
   var l=strokes[frame][s];
   c.beginPath(); c.lineCap="round"; c.lineWidth=w=z*l[0][0]; c.strokeStyle=k=l[0][1]; c.moveTo(x=z*l[1][0],y=z*l[1][1]);
   for (var i=2;i<l.length;i++) c.lineTo(z*l[i][0],z*l[i][1]);
   c.stroke();
  }

  c.beginPath();
  c.arc(x,y,.8*w,0,2*Math.PI);
  c.fillStyle=k;
  c.fill();
  return c.canvas;
 } else if (frame < (strokes.length*2)) { //run right
  var f=this.frames[frame-strokes.length];
  c.translate(this.size, 0);
  c.scale(-1, 1);
  c.drawImage(f,0,0);
 }
 return c.canvas;
}

function vertex(size,step,steps,plane,scale){
 var a=1.05+(((step+0.5)/steps)*2*Math.PI);
 this.proximity=Math.cos(a);
 var p=0.5*Math.sin(a);
 this.leftness=0.5-p;
 if(scale!=undefined)p*=scale;
 this.x=size*(0.5-p);
 this.y=size*(plane+(0.05*this.proximity));
}

function point(size,x,y){
 this.x=size*x;
 this.y=size*y;
}

function rhombus(top,left,right,bottom){
 this.top=top;
 this.left=left;
 this.right=right;
 this.bottom=bottom;
 this.proximity=left.proximity+right.proximity;
 this.leftness=(2-left.leftness-right.leftness)/2;
}

tile.prototype.drawRhombus = function(c,rmb,color,alpha) {
 var glare=(rmb.leftness*96)&0xFF;
 color+=(glare<<16)+(glare<<8)+glare;
 c.fillStyle=this.hashcolor(color);
 c.globalAlpha=alpha;
 c.beginPath(); 
 c.moveTo(rmb.top.x,rmb.top.y);
 c.lineTo(rmb.left.x,rmb.left.y);
 c.lineTo(rmb.bottom.x,rmb.bottom.y);
 c.lineTo(rmb.right.x,rmb.right.y);
 c.lineTo(rmb.top.x,rmb.top.y);
 c.fill();
}

tile.prototype.cube = function(f,col) {
 var top=new point(this.size,0.5,0.01);
 var topLeft=new vertex(this.size,f+3.5,24,1/3);
 var topMiddle=new vertex(this.size,f+11.5,24,1/3);
 var topRight=new vertex(this.size,f+19.5,24,1/3);
 var bottomLeft=new vertex(this.size,f+7.5,24,2/3);
 var bottomMiddle=new vertex(this.size,f+15.5,24,2/3);
 var bottomRight=new vertex(this.size,f+23.5,24,2/3);
 var bottom=new point(this.size,0.5,0.99);
 var c = this.cloneContext();
 var bottomFaces = new Array();
 bottomFaces.push(new rhombus(topMiddle,bottomLeft,bottomMiddle,bottom));
 bottomFaces.push(new rhombus(topRight,bottomMiddle,bottomRight,bottom));
 bottomFaces.push(new rhombus(topLeft,bottomRight,bottomLeft,bottom));
 bottomFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<bottomFaces.length;t++) this.drawRhombus(c,bottomFaces[t],col,.6);
 var topFaces = new Array();
 topFaces.push(new rhombus(top,topLeft,topMiddle,bottomLeft));
 topFaces.push(new rhombus(top,topMiddle,topRight,bottomMiddle));
 topFaces.push(new rhombus(top,topRight,topLeft,bottomRight));
 topFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<topFaces.length;t++) this.drawRhombus(c,topFaces[t],col,.9);
 return c.canvas;
}

function triangle(axis,left,right){
 this.axis=axis;
 this.left=left;
 this.right=right;
 this.proximity=left.proximity+right.proximity;
 this.leftness=(2-left.leftness-right.leftness)/2;
}

tile.prototype.drawTriangle = function(c,tri,color,alpha) {
 var glare=(tri.leftness*96)&0xFF;
 color+=(glare<<16)+(glare<<8)+glare;
 c.fillStyle=this.hashcolor(color);
 c.globalAlpha=alpha;
 c.beginPath(); 
 c.moveTo(tri.axis.x,tri.axis.y);
 c.lineTo(tri.left.x,tri.left.y);
 c.lineTo(tri.right.x,tri.right.y);
 c.lineTo(tri.axis.x,tri.axis.y);
 c.fill();
}

tile.prototype.octohedron = function(f,col) {
 var top=new point(this.size,0.5,0.01);
 var left=new vertex(this.size,f+4.5,16,1/2);
 var front=new vertex(this.size,f+8.5,16,1/2);
 var right=new vertex(this.size,f+12.5,16,1/2);
 var back=new vertex(this.size,f+16.5,16,1/2);
 var bottom=new point(this.size,0.5,0.99);
 var c = this.cloneContext();
 var bottomFaces = new Array();
 bottomFaces.push(new triangle(bottom,left,front));
 bottomFaces.push(new triangle(bottom,front,right));
 bottomFaces.push(new triangle(bottom,right,back));
 bottomFaces.push(new triangle(bottom,back,left));
 bottomFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<bottomFaces.length;t++) this.drawTriangle(c,bottomFaces[t],col,.4);
 var topFaces = new Array();
 topFaces.push(new triangle(top,left,front));
 topFaces.push(new triangle(top,front,right));
 topFaces.push(new triangle(top,right,back));
 topFaces.push(new triangle(top,back,left));
 topFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<topFaces.length;t++) this.drawTriangle(c,topFaces[t],col,.9);
 return c.canvas;
}

tile.prototype.icosahedron = function(f, col) {
 var top=new point(this.size,0.5,0.01);
 f=f+3.3;
 var leftb=new vertex(this.size,f+0,40,2.9/4,0.866);
 var leftt=new vertex(this.size,f+4,40,1.1/4,0.866);
 var frontb=new vertex(this.size,f+8,40,2.9/4,0.866);
 var frontt=new vertex(this.size,f+12,40,1.1/4,0.866);
 var middleb=new vertex(this.size,f+16,40,2.9/4,0.866);
 var middlet=new vertex(this.size,f+20,40,1.1/4,0.866);
 var rightb=new vertex(this.size,f+24,40,2.9/4,0.866);
 var rightt=new vertex(this.size,f+28,40,1.1/4,0.866);
 var backb=new vertex(this.size,f+32,40,2.9/4,0.866);
 var backt=new vertex(this.size,f+36,40,1.1/4,0.866);
 var bottom=new point(this.size,0.5,0.99);
 var c = this.cloneContext();
 var bottomFaces = new Array();
 bottomFaces.push(new triangle(bottom,leftb,frontb));
 bottomFaces.push(new triangle(bottom,frontb,middleb));
 bottomFaces.push(new triangle(bottom,middleb,rightb));
 bottomFaces.push(new triangle(bottom,rightb,backb));
 bottomFaces.push(new triangle(bottom,backb,leftb));
 bottomFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<bottomFaces.length;t++) this.drawTriangle(c,bottomFaces[t],col,.3);
 var middleFaces = new Array();
 middleFaces.push(new triangle(leftt,leftb,frontb));
 middleFaces.push(new triangle(frontt,frontb,middleb));
 middleFaces.push(new triangle(middlet,middleb,rightb));
 middleFaces.push(new triangle(rightt,rightb,backb));
 middleFaces.push(new triangle(backt,backb,leftb));
 middleFaces.push(new triangle(frontb,leftt,frontt));
 middleFaces.push(new triangle(middleb,frontt,middlet));
 middleFaces.push(new triangle(rightb,middlet,rightt));
 middleFaces.push(new triangle(backb,rightt,backt));
 middleFaces.push(new triangle(leftb,backt,leftt));
 middleFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<middleFaces.length;t++) this.drawTriangle(c,middleFaces[t],col,.6);
 var topFaces = new Array();
 topFaces.push(new triangle(top,leftt,frontt));
 topFaces.push(new triangle(top,frontt,middlet));
 topFaces.push(new triangle(top,middlet,rightt));
 topFaces.push(new triangle(top,rightt,backt));
 topFaces.push(new triangle(top,backt,leftt));
 topFaces.sort(function(a,b){return a.proximity-b.proximity;});
 for (var t=0;t<topFaces.length;t++) this.drawTriangle(c,topFaces[t],col,.9);
 return c.canvas;
}

tile.prototype.cloneContext = function() {
 var canvas;
 try {
  canvas=document.createElement('canvas');
  canvas.setAttribute("width", this.size);
  canvas.setAttribute("height", this.size);
  canvas.context=canvas.getContext("2d");
  canvas.context.canvas=canvas;
  lastContext=canvas.context;
  lastCanvas=canvas;
 } catch (x) {
    console.log("tile.prototype.cloneContext() failed to create a context");
 }
 return canvas.context;
}

tile.prototype.addContext = function(c1,c2) {
 var b1=c1.getImageData(0, 0, this.size, this.size);
 var b2=c2.getImageData(0, 0, this.size, this.size);
 for (var i=0; i<b1.data.length; i++) if (((i&3)!=3)&&(b1.data[i]!=0)) b1.data[i]+=b2.data[i];
 c1.putImageData(b1, 0, 0);
}

tile.prototype.subContext = function(c1,c2) {
 var b1=c1.getImageData(0, 0, this.size, this.size);
 var b2=c2.getImageData(0, 0, this.size, this.size);
 for (var i=0; i<b1.data.length; i++) if (((i&3)!=3)&&(b1.data[i]!=0)) b1.data[i]-=b2.data[i];
 c1.putImageData(b1, 0, 0);
}

tile.prototype.text = function(frame) {
 var characters = [ //0x000A2280 * swapped for the menu/settings character three horizontal bars
  0x00000000,0x00421004,0x00A50000,0x00AFABEA,0x01FA7CBF,0x019D1173,0x008A364D,0x00840000,0x00221082,0x00821088,0x01F07C1F,0x00023880,0x00000088,0x00003800,0x00000080,0x00111110, //  !"#$%&'()*+,-./
  0x01F8C63F,0x0046109F,0x00E8991F,0x00E89A2E,0x010A53E4,0x01E8783E,0x00E87A2E,0x01F11108,0x00E8BA2E,0x00E8BC2E,0x00020080,0x00020088,0x00222082,0x000701C0,0x00820888,0x00E11004, // 0123456789:;<=>?
  0x00EACA0E,0x004547F1,0x01E8FA3E,0x00E8C22E,0x01E8C63E,0x01F8721F,0x01F87210,0x00E84E2E,0x0118FE31,0x01F2109F,0x00710A4C,0x013A6293,0x0108421F,0x011DD6B1,0x011CD671,0x00E8C62E, // @ABCDEFGHIJKLMNO
  0x01E8C7D0,0x00E8C64D,0x01E8FA51,0x00F8383E,0x01F21084,0x0118C62E,0x0118A944,0x011AD6AA,0x01151151,0x01151084,0x01F1111F,0x00621086,0x01041041,0x00C2108C,0x00450000,0x0000001F  // PQRSTUVWXYZ[\]^_
 ];
 var c = this.cloneContext();    
 if (frame<characters.length){
  var bits=characters[frame];
  var s = (this.size+1)/6;
  var p = s*.5;
  for(y=s;y<this.size;y+=s)for(x=s;x<this.size;x+=s,bits<<=1)if(bits&0x01000000){
   c.globalAlpha=0.9;  

   c.beginPath();
   c.fillStyle = this.hashcolor(0x3858D0 | (this.rnd()&0x07071F));
   c.moveTo(x,y);c.lineTo(x-p,y-p);c.lineTo(x-p,y+p);
   c.fill();

   c.beginPath();
   c.fillStyle = this.hashcolor(0x4060E0 | (this.rnd()&0x07071F));
   c.moveTo(x,y);c.lineTo(x-p,y-p);c.lineTo(x+p,y-p);
   c.fill();

   c.beginPath();
   c.fillStyle = this.hashcolor(0x002880 | (this.rnd()&0x03070F));
   c.moveTo(x,y);c.lineTo(x+p,y+p);c.lineTo(x-p,y+p);
   c.fill();

   c.beginPath();
   c.fillStyle = this.hashcolor(0x003090 | (this.rnd()&0x03070F));
   c.moveTo(x,y);c.lineTo(x+p,y+p);c.lineTo(x+p,y-p);
   c.fill();
  }
 }
 return c.canvas;
}

