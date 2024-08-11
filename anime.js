function anim() {
 // Animated things Copyright Lyall Ward 2015
 this.splashs = [ //need different colors, sizes and times for differnt scores
  [["176px Impact",.13,"#E0FFE0",64],["154px Impact",.25,"#C0FFC0",56],["132px Impact",.38,"#A0FFA0",48],["110px Impact",.5,"#80FF80",40],
   ["88px Impact",.63,"#60FF60",32],["66px Impact",.75,"#40FF40",24],["44px Impact",.88,"#20FF20",16],["20px Impact",1,"#00FF00",8]],
  [["176px Impact",.13,"#FFE0E0",64],["154px Impact",.25,"#FFC0C0",56],["132px Impact",.38,"#FFA0A0",48],["110px Impact",.5,"#FF8080",40],
   ["88px Impact",.63,"#FF6060",32],["66px Impact",.75,"#FF4040",24],["44px Impact",.88,"#FF2020",16],["20px Impact",1,"#FF0000",8]],
  [["176px Impact",.13,"#E0E0FF",64],["154px Impact",.25,"#C0C0FF",56],["132px Impact",.38,"#A0A0FF",48],["110px Impact",.5,"#8080FF",40],
   ["88px Impact",.63,"#6060FF",32],["66px Impact",.75,"#4040FF",24],["44px Impact",.88,"#2020FF",16],["20px Impact",1,"#0000FF",8]]
  ];
 this.tileSize = 0;
 this.width = 480;
 this.height = 480;
 this.left = 0;
 this.top = 0;
 this.centreX=0;
 this.centreY=0;
 this.tx=0;
 this.ty=0;
 this.score=0;
 this.flash=0;
 this.splash;
 this.text="none";
 anim.prototype.adjustTime = function(time) {this.runTime-=(time/1000);if (this.runTime<0)this.runTime=0;this.mosaic.alive=this.runTime>0}
 anim.prototype.X = function(x) {if(x!=undefined)this.centreX=x;return this.centreX;};
 anim.prototype.Y = function(y) {if(y!=undefined)this.centreY=y;return this.centreY;};
}

var anime = new anim();

anim.prototype.init = function(tileSize,canvas,level) {
 this.text=JSON.stringify(level);
 level=JSON.parse(this.text);
 this.setSize(tileSize);
 this.mosaic = new mosaic(this.tileSize,this.tileSet,level);
 this.runTime = this.mosaic.level.time;
 this.runScore = this.mosaic.level.score;
 this.canvas=document.getElementById(canvas);
 this.canvas.setAttribute("width", this.width);
 this.canvas.setAttribute("height", this.height);
 this.context=this.canvas.getContext("2d");
 return this.canvas;
}

anim.prototype.setSize = function(tileSize) {
 if (this.tileSize!=tileSize) {
  this.tileSize=tileSize; 
  this.tileSet = new Array();
  for (var i=0;i<types.max_type;i++) this.tileSet.push(new tile(this.tileSize,i));
 }
 for (var i=0;i<types.max_type;i++) this.tileSet[i].activated=false;
}

anim.prototype.setScore = function(score) {
 this.splash=this.splashs[score-types.emerald];
 this.flash=8;
 switch(score){
  case types.emerald:this.score=1;break;
  case types.ruby:this.score=5;break;
  case types.diamond:this.score=10;break;
 }
 this.runScore-=this.score;
 if(this.runScore<0)this.runScore=0;
 if(this.runScore==0)this.tileSet[types.exit].activated=true;
}

anim.prototype.drawString = function(x,y,s) {
 for (var i=0;i<s.length;i++,x++) {this.context.drawImage(this.tileSet[types.text].image(s,i),x*this.tileSize,y*this.tileSize);}
}

anim.prototype.drawTitle = function() {
 if(menu.Play()){
  this.drawString(0,0,"GEMS:"+this.runScore);
  var t = this.runTime;
  if (t==0) t='FINISHED'; else {
   if (t<10) t='TIME:'+(Math.round(this.runTime*10)/10).toPrecision((t<1)?1:2);
   else {t=Math.round(t);if (t<100) t='TIME:0'+t;else t='TIME:'+t;}
  } 
  this.drawString(9,0,t);
  this.context.drawImage(this.tileSet[types.text].image("*",0),this.width-this.tileSize,0);
 }else if(menu.Resize()){
  this.drawString(0,0,this.mosaic.xmax+" X "+this.mosaic.ymax);
 }
}

anim.prototype.drawSplash = function() {
 if (this.flash>0) {
  var format=this.splash[--this.flash];
  this.context.font=format[0];
  this.context.globalAlpha=format[1];
  this.context.fillStyle=format[2];
  this.context.textAlign = "center";
  this.context.fillText(this.score, this.tx, this.ty+format[3]); 
  this.context.globalAlpha=1;
 }
}

anim.prototype.drawMouse = function() {
 if (key.motionDown) {
  this.context.strokeStyle=key.motionColor; 
  this.context.globalAlpha=0.33;
  this.context.lineWidth=Math.round(key.motionRadius/8);
  this.context.beginPath();
  this.context.arc(key.motionOriginX,key.motionOriginY,key.motionRadius,0,2*Math.PI);
  this.context.stroke();
  this.context.beginPath();
  this.context.arc(key.motionOriginX,key.motionOriginY,key.motionRadius/2,0,2*Math.PI);
  this.context.stroke();
  this.context.globalAlpha=1;
 }
}

anim.prototype.drawCursor = function(selection) {
 var x=this.tx-(this.tileSize>>1);
 var y=this.ty-(this.tileSize>>1);
 this.context.globalAlpha=0.75;
 this.context.fillStyle='#FFFFFF';
 this.context.fillRect(x,y,this.tileSize,this.tileSize);
 for(var i=0;i<7;i++){
  var s=selection+i-3;
  var a=(i+1)/4;
  if(a>1)a=2-a;
  this.context.globalAlpha=a*a;
  x=(i+2)*this.tileSize;
  if (s<0) s+=this.tileSet.length-1;
  if (s>=this.tileSet.length-1) s-=this.tileSet.length-1;
  this.context.fillStyle='#000000';
  this.context.globalAlpha=0.9;
  this.context.fillRect(x,0,this.tileSize,this.tileSize);
  this.context.globalAlpha=a*a;
  this.context.drawImage(this.tileSet[s].frames[0],x,0);
 }
 this.context.globalAlpha=1;
}

anim.prototype.clear = function() {
 this.context.fillStyle='#000000';
 this.context.fillRect(0,0,this.width,this.height);
}

anim.prototype.updateImageData = function(w,h) {
 this.resize(w,h);
 var sx=this.centreX-(this.width>>1); 
 var sy=this.centreY-(this.height>>1); 
 var wx=this.mosaic.width-this.width;
 var wy=this.mosaic.height-this.height;
 if (sx>wx) sx=wx; if (sx<0) sx=0;
 if (sy>wy) sy=wy; if (sy<0) sy=0;
 wx = Math.min(this.width,this.mosaic.width);
 wy = Math.min(this.height,this.mosaic.height);
 this.context.fillStyle='#000000';
 if (menu.Play()&(wx<this.width)) this.context.fillRect(wx,0,this.width-wx,this.height); else this.context.fillRect(0,0,this.width,this.height);
 this.context.drawImage(this.mosaic.context.canvas,sx,sy,wx,wy,0,0,wx,wy);
 this.tx=this.centreX-sx+(this.tileSize>>1);
 this.ty=this.centreY-sy+(this.tileSize>>1);
}

anim.prototype.resize = function(w,h)  {
 if((w!=this.width)||(h!=this.height)) {
  this.width=w;
  this.height=h;
  this.canvas.setAttribute("width", this.width);
  this.canvas.setAttribute("height", this.height);
 }
}

function actor(tile,w,h) {
 if(tile==undefined)tile=types.blank;
 this.tile=tile;
 this.w=w;
 this.h=h;
 this.direction=(tile.kind==types.critter)?0:key.down;
 this.step=0;
 this.frame=0;
 this.rotating=0;
 this.moving=false;
 this.falling=false;
 this.wasMoving=false;
 this.wasFalling=false;
 this.vanishing=false;
 this.freezing=false;
 this.killable=false;
 this.turning=false;
 this.another=0;
 this.x=this.tile.size*w;
 this.y=this.tile.size*h;
 this.tummy=new Array();
 actor.prototype.action=function(a,b,c){this.inherit=this.tile.action;return this.inherit(a,b,c);}
 actor.prototype.pic=function(){return this.tile.pic(this.direction,this.frame);}
 //actor.prototype.is=function(m,w,h,t){return m.mark[w][h].tile.kind==t;};
 actor.prototype.eat=function(f){this.tummy.push(f);}
 switch (this.tile.kind) {
  case types.pac:case types.crawler:this.eat(types.emerald);break;
  case types.ball:case types.critter:this.eat(types.ruby);break;
  case types.poc:this.eat(types.diamond);break;
 }
}

actor.prototype.push = function(mosaic,direction) {
 if ((this.tile.kind==types.boulder) && !this.moving && !this.falling) {
  var w=this.w;
  switch (direction) {case key.right:w++;break;case key.left:w--;break;case key.up:case key.down:return false;}
  if ((mosaic.mark[w][this.h].tile.kind==types.blank)&&(mosaic.mark[this.w][this.h+1].tile.kind!=types.blank)){
   this.moving=true;
   this.direction=direction;
   this.frame=0;
   this.frames=this.tile.frames.length;
   mosaic.move(this,mosaic.mark[w][this.h]);
   snd.play(snd.push);
   return true;
  }
 }
 return false;
}

function pathway(m,d,w,h) {
 this.turn = false;
 switch (d) {
  case 0:this.ahead=m[w][h-1];this.left=m[w-1][h].tile.track;this.right=m[w+1][h].tile.track;this.leftTurn=m[w-1][h-1].tile.track;this.rightTurn=m[w+1][h-1].tile.track;break;//up
  case 1:this.ahead=m[w+1][h];this.left=m[w][h-1].tile.track;this.right=m[w][h+1].tile.track;this.leftTurn=m[w+1][h-1].tile.track;this.rightTurn=m[w+1][h+1].tile.track;break;//right
  case 2:this.ahead=m[w][h+1];this.left=m[w+1][h].tile.track;this.right=m[w-1][h].tile.track;this.leftTurn=m[w+1][h+1].tile.track;this.rightTurn=m[w-1][h+1].tile.track;break;//down
  case 3:this.ahead=m[w-1][h];this.left=m[w][h+1].tile.track;this.right=m[w][h-1].tile.track;this.leftTurn=m[w-1][h+1].tile.track;this.rightTurn=m[w-1][h-1].tile.track;break;//left
 }
 if(this.ahead.tile.kind!=types.brick)  switch (d) {
  case 0:this.turn=m[w][h-2].tile.track;break;
  case 1:this.turn=m[w+2][h].tile.track;break;
  case 2:this.turn=m[w][h+2].tile.track;break;
  case 3:this.turn=m[w-2][h].tile.track;break;
 }
}

anim.prototype.crawlLeft = function() {
 return function(mosaic) {
  this.frame=(this.frame&0xF8)|((this.frame+1)%8);
  if ((this.frame&7)==0) {  
   this.direction=(this.direction+this.rotating)&3;//complete rotation
   var path = new pathway(mosaic.mark,this.direction,this.w,this.h);
   if (path.ahead.tile.kind==types.man){mosaic.explosion(path.ahead.w,path.ahead.h,path.ahead.tummy);}else{
    var track = path.ahead.tile.track;
    this.moving=track;
    if(this.moving) {mosaic.move(this,path.ahead);}
    this.rotating=0;   
    if (!track||(track&path.leftTurn&!path.left)) this.rotating=-1;
    else if (!path.turn) { if (path.rightTurn) this.rotating=1; else if (track) this.rotating=-1; }
    switch (this.rotating) {
     case -1: this.frame=(((4-this.direction)&3)*8)+32;break;
	 case  1: this.frame=(((4-this.direction)&3)*8)+64;break;
	 default : this.frame=8*this.direction;break;
    }
    snd.play(snd.tick);
   }
  }
  if (this.moving) {var s=this.tile.size/8; switch (this.direction) {case 0:this.y-=s;break;case 1:this.x+=s;break;case 2:this.y+=s;break;case 3:this.x-=s;break;}} 
  else {this.x=this.w*this.tile.size;this.y=this.h*this.tile.size;}
 }
}

anim.prototype.crawlRight = function() {
 return function(mosaic) {
  this.frame=(this.frame&0xF8)|((this.frame+1)%8);
  if ((this.frame&7)==0) {  
   this.direction=(this.direction+this.rotating)&3;//complete rotation
   var path = new pathway(mosaic.mark,this.direction,this.w,this.h);
   if (path.ahead.tile.kind==types.man){mosaic.explosion(path.ahead.w,path.ahead.h,path.ahead.tummy);}else{
    var track = path.ahead.tile.track;
    this.moving=track;
    if(this.moving) {mosaic.move(this,path.ahead);}
    this.rotating=0;   
    if (!track|(track&path.rightTurn&!path.right)) this.rotating=1;
    else if (!path.turn) { if (path.leftTurn) this.rotating=-1; else if (track) this.rotating=1; }
    switch (this.rotating) {
     case -1: this.frame=(((4-this.direction)&3)*8)+32;break;
 	case  1: this.frame=(((4-this.direction)&3)*8)+64;break;
 	default : this.frame=8*this.direction;break;
    }
    snd.play(snd.tick);
   }
  }
  if (this.moving) {var s=this.tile.size/8; switch (this.direction) {case 0:this.y-=s;break;case 1:this.x+=s;break;case 2:this.y+=s;break;case 3:this.x-=s;break;}} 
  else {this.x=this.w*this.tile.size;this.y=this.h*this.tile.size;}
 }
}

anim.prototype.boulder = function() {
 return function(mosaic) {
  if(!this.moving && !this.falling) {
   this.falling=mosaic.mark[this.w][this.h+1].tile==mosaic.tiles[types.blank];
   if (this.falling) {mosaic.move(this,mosaic.mark[this.w][this.h+1]);this.frames=8;}
   else {
    if (this.wasFalling==true) {
	 if (mosaic.mark[this.w][this.h+1].tile.killable) {
	  mosaic.explosion(this.w,this.h+1,mosaic.mark[this.w][this.h+1].tummy);
	 } else snd.play(snd.boom);
     this.wasFalling=false;
	}
	if(mosaic.mark[this.w][this.h+1].tile.unstable&&!mosaic.mark[this.w][this.h-1].tile.unstable){
	 var b=mosaic.tiles[types.blank];
	 if ((mosaic.mark[this.w+1][this.h+1].tile==b)&&(!mosaic.mark[this.w+1][this.h-1].tile.unstable)&&((this.tile.rnd()&15)==0)) {this.push(mosaic,key.right);}
	 else if ((mosaic.mark[this.w-1][this.h+1].tile==b)&&(!mosaic.mark[this.w-1][this.h-1].tile.unstable)&&((this.tile.rnd()&15)==0)) {this.push(mosaic,key.left);}
	}
   }
  }
  if (this.moving) {
   var s=this.tile.size/this.tile.frames.length;
   var i=(this.direction==key.right)?1:-1;
   this.x+=s*i;
   this.frame=(this.frame+1)&(this.tile.frames.length-1);
   this.frames--;
   this.moving=this.frames!=0; 
  } 
  if (this.falling) {
   this.y+=this.tile.size/8;
   this.frame=0;
   this.frames--;
   this.falling=this.frames!=0;
   this.wasFalling=(this.wasFalling||this.falling);
  }
  if (!this.moving && !this.falling) {
   this.x=this.w*this.tile.size;
   this.y=this.h*this.tile.size;
   this.direction=key.stop;
  }
 }
}

anim.prototype.blank = function() {return function() {this.freezing=true; return false;}}

anim.prototype.freeze = function() {
 return function() {
  this.freezing=true; 
 }
}

// /*********************************************************************************************************************************************/ //
// /**********************************************************[     work zone     ]**************************************************************/ //
// /*********************************************************************************************************************************************/ //
anim.prototype.laser = function() {
 return function(mosaic) {
  var d=this.frame>>3;
  var f=this.frame&7;
  var s=this.tile.size/8;   
  if(f==0){  
   this.x=this.w*this.tile.size;
   this.y=this.h*this.tile.size;
   var w=this.w; var h=this.h;
   switch(d){case 0:h--;break;case 1:w++;break;case 2:h++;break;case 3:w--;break;}
   var victim=mosaic.mark[w][h];
   if(victim.tile.kind==types.blank){mosaic.move(this,victim);}else{
    mosaic.doer.push(mosaic.mark[this.w][this.h]=new actor(mosaic.tiles[types.blank],this.w,this.h));
	mosaic.kill(w,h);
	this.vanishing=true;
   }
  }
  this.frame=((f+1)&7)+(d<<3);
  switch(d){case 0:this.y-=s;break;case 1:this.x+=s;break;case 2:this.y+=s;break;case 3:this.x-=s;break;}
 }
}

anim.prototype.turret = function() {
 return function(mosaic) {
  var d=this.frame>>3;
  var f=this.frame&7;
  var w=this.w; var h=this.h;
  switch(d){case 0:h--;break;case 1:w++;break;case 2:h++;break;case 3:w--;break;}
  if(f!=0){
   f=(f+1)&7; 
   if(f==0){
    if(mosaic.mark[w][h].tile.kind==types.blank) {
	 var bolt=new actor(mosaic.tiles[types.laser],w,h);
     var s=this.tile.size/2;   
     mosaic.doer.push(mosaic.mark[w][h]=bolt);
     bolt.frame=(d<<3)+4;
	 bolt.x=this.w*this.tile.size;
	 bolt.y=this.h*this.tile.size;
     switch(d){case 0:bolt.y-=s;break;case 1:bolt.x+=s;break;case 2:bolt.y+=s;break;case 3:bolt.x-=s;break;}
	 snd.play(snd.fizz);
    }
   }
   this.frame=f+(d<<3);
  }else while(mosaic.mark[w][h].tile.kind==types.blank) {
   switch(d){case 0:h--;break;case 1:w++;break;case 2:h++;break;case 3:w--;break;}
   if(mosaic.mark[w][h].tile.killable){this.frame=1+(d<<3);return true;}
  }
 }
}

anim.prototype.exit = function() {
 return function() {
  if(this.tile.activated){
   // flash the door animation?
  }
 }
}

anim.prototype.burrow = function() {
 return function(mosaic) {
  if(this.tile.activated){
   var w=this.w; var h=this.h-1;
   var a=mosaic.mark[w][h];
   if((this.delay==undefined)|(this.delay==0)){
    if(a.tile.kind==types.blank){
     mosaic.mark[w][h]=new actor(mosaic.tiles[types.crawler],w,h);
	 mosaic.doer.push(mosaic.mark[w][h]);
     this.delay=8|(this.tile.rnd()&0x3F);
    }
   } else {
    this.delay--;
   }
  }
 }
}

anim.prototype.mound = function() {
 return function(mosaic) {
  if(this.tile.activated){
   var w=this.w; var h=this.h-1;
   var a=mosaic.mark[w][h];
   if((this.delay==undefined)|(this.delay==0)){
    if(a.tile.kind==types.blank){
     mosaic.mark[w][h]=new actor(mosaic.tiles[types.critter],w,h);
	 mosaic.doer.push(mosaic.mark[w][h]);
     this.delay=8|(this.tile.rnd()&0x3F);
    }
   } else {
    this.delay--;
   }
  }
 }
}

anim.prototype.man = function() {
 return function(mosaic,key) {
  var w=this.w; var h=this.h;
  if (!mosaic.alive) {mosaic.explosion(w,h,mosaic.mark[w][h].tummy);return false;}
  if ((this.frame!=0)&&!this.pushing&&key.backwards(this.direction)) { // double back
   switch (key.direction) {case key.right:w++;break;case key.down:h++;break;case key.left:w--;break;case key.up:h--;break;}
   if (mosaic.mark[w][h].tile.kind==types.blank) {
    mosaic.move(this,mosaic.mark[w][h]);
    this.frame=this.tile.frames.length-this.frame;
    this.direction=key.direction;
   }
  }
  if (!this.moving&&!this.pushing) { //change of action
   this.direction=key.direction;
   this.moving=false;
   this.pushing=false;
   if (key.moving()) { // moving/pushing
    switch (this.direction) {case key.right:w++;break;case key.down:h++;break;case key.left:w--;break;case key.up:h--;break;}
	var ahead = mosaic.mark[w][h];
	switch (ahead.tile.kind) {
	 case types.boulder: if(this.pushing=ahead.push(mosaic,this.direction)) {mosaic.move(this,mosaic.mark[w][h]);snd.play(snd.tack);this.frames=16;}break;
     case types.ruby:case types.emerald:case types.diamond:anime.setScore(ahead.tile.kind);this.eat(ahead.tile.kind);snd.play(snd.ding);
     case types.dirt:ahead.tile=mosaic.tiles[types.blank];
	 case types.blank:mosaic.move(this,ahead);snd.play(snd.tack);this.moving=true;break;
	 case types.exit:if(ahead.tile.activated){menu.nextLevel();mosaic.mark[this.w][this.h].tile=mosaic.tiles[types.blank];}break;
    }
   } else if (key.punching&&(key.direction!=key.stop)) { // punching
    switch (key.direction) {case key.right:w++;break;case key.down:h++;break;case key.left:w--;break;case key.up:h--;break;}
	var m=mosaic.mark[w][h];
    if ((m.x==this.x)||(m.y==this.y)) switch (m.tile.kind) {
     case types.ruby:case types.emerald:case types.diamond:anime.setScore(m.tile.kind);this.eat(m.tile.kind);snd.play(snd.ding);
     case types.dirt:m.tile=mosaic.tiles[types.blank];mosaic.clean(m);break;
    }
   }
  }
  if (this.pushing) {
   var s=this.tile.size/16;
   switch (this.direction) {case key.right:this.x+=s;break;case key.left:this.x-=s;break;}
   this.frame=(this.frame+1)%8;
   this.pushing=((--this.frames)!=0);
  } else if (this.moving) { // animate action
   var s=this.tile.size/8;
   switch (this.direction) {case key.right:this.x+=s;break;case key.down:this.y+=s;break;case key.left:this.x-=s;break;case key.up:this.y-=s;break;}
   this.frame=(this.frame+1)%8;
   this.moving=(this.frame!=0);
  } else {this.x=this.w*this.tile.size;this.y=this.h*this.tile.size;}
  anime.centreX=this.x;
  anime.centreY=this.y;
 }
}

anim.prototype.spin = function() {
 return function(mosaic) {
  if(!this.moving) {
   this.frame=5;
   this.moving=mosaic.mark[this.w][this.h+1].tile==mosaic.tiles[types.blank];
   if (this.moving) {mosaic.move(this,mosaic.mark[this.w][this.h+1]);}
   else if (this.wasMoving==true) {this.wasMoving=false;snd.play(snd.ding);}
  } 
  if (this.moving) {
   this.y+=this.tile.size/8;
   this.frame=(this.frame+1)%this.tile.frames.length;
   this.moving=this.frame!=5;
   this.wasMoving|=this.moving;
  }
 }
}

anim.prototype.spinning = function() {
 return function(mosaic) {
  this.frame=(this.frame+1)%this.tile.frames.length;
 }
}

anim.prototype.emeraldMon = function() {
 return function(mosaic) {
  var clockwise=[key.up,key.right,key.down,key.left];
  if (!(this.step&7)) {
   var w=this.w; var h=this.h;
   switch (this.direction) {case key.right:w++;break;case key.up:h--;break;case key.left:w--;break;case key.down:h++;break;}
   var k = mosaic.mark[w][h].tile.kind;
   switch (k) {
    case types.ruby:
	 this.tile=mosaic.tiles[types.ball];
	 mosaic.mark[this.w][this.h].tile=mosaic.tiles[types.ball];
	 this.eat(k);
	 mosaic.mark[w][h].tile=mosaic.tiles[types.blank];
	 snd.play(snd.ding);
	 break;
    case types.man:mosaic.explosion(w,h,mosaic.mark[w][h].tummy);break;
    case types.emerald:this.eat(k);mosaic.mark[w][h].tile=mosaic.tiles[types.blank];snd.play(snd.ding);break;
   }
   this.moving=(mosaic.mark[w][h].tile.kind==types.blank);
   if(this.moving)mosaic.move(this,mosaic.mark[w][h]);
  }
  if (!this.moving) {this.direction=clockwise[this.direction-key.left];} else {
   var s=this.tile.size/8;
   switch(this.direction){case key.right:this.x+=s;break;case key.up:this.y-=s;break;case key.left:this.x-=s;break;case key.down:this.y+=s;break;}
   this.step++;
  }
  if((this.frame&7)!=0)this.frame++;else if((this.another!=0)|(this.tile.rnd()%250)==1){this.frame++;snd.play(snd.nomm);this.another=this.tile.rnd()&1;}
  this.frame&=7;
  switch(this.direction){case key.left:this.frame+=8;break;case key.down:this.frame+=16;break;case key.up:this.frame+=24;break;}
 }
}

anim.prototype.rubyMon = function() {
 return function(mosaic) {
  var widershins=[key.down,key.left,key.up,key.right];
  if (!(this.step&7)) {
   var w=this.w; var h=this.h;
   switch (this.direction) {case key.right:w++;break;case key.up:h--;break;case key.left:w--;break;case key.down:h++;break;}
   var k = mosaic.mark[w][h].tile.kind;
   switch (k) {
    case types.diamond:
	 this.tile=mosaic.tiles[types.poc];
	 mosaic.mark[this.w][this.h].tile=mosaic.tiles[types.poc];
	 this.eat(k);
	 mosaic.mark[w][h].tile=mosaic.tiles[types.blank];
	 snd.play(snd.ding);
	 break;
    case types.man:mosaic.explosion(w,h,mosaic.mark[w][h].tummy);break;
    case types.emerald:case types.ruby:this.eat(k);mosaic.mark[w][h].tile=mosaic.tiles[types.blank];snd.play(snd.ding);break;
   }
   this.moving=(mosaic.mark[w][h].tile.kind==types.blank);
   if(this.moving)mosaic.move(this,mosaic.mark[w][h]);
  }
  if (!this.moving) {this.direction=widershins[this.direction-key.left];} else {
   var s=this.tile.size/8;
   switch (this.direction) {case key.right:this.x+=s;break;case key.up:this.y-=s;break;case key.left:this.x-=s;break;case key.down:this.y+=s;break;}
   this.step++;
  }
  if((this.frame&7)!=0)this.frame++;else if((this.another!=0)|(this.tile.rnd()%250)==1){this.frame++;snd.play(snd.nomm);this.another=this.tile.rnd()&1;}
  this.frame&=7;
  switch(this.direction){case key.left:this.frame+=8;break;case key.down:this.frame+=16;break;case key.up:this.frame+=24;break;}
 }
}

anim.prototype.diamondMon = function() {
 return function(mosaic) {
  if (!(this.step&7)) {
   var w=this.w; var h=this.h;
   switch (this.direction) {case key.right:w++;break;case key.up:h--;break;case key.left:w--;break;case key.down:h++;break;}
   var k = mosaic.mark[w][h].tile.kind;
   switch (k) {
    case types.man:mosaic.explosion(w,h,mosaic.mark[w][h].tummy);break;
    case types.emerald:case types.ruby:case types.diamond:this.eat(k);mosaic.mark[w][h].tile=mosaic.tiles[types.blank];snd.play(snd.ding);break;
   }
   this.moving=(mosaic.mark[w][h].tile.kind==types.blank);
   if(this.moving)mosaic.move(this,mosaic.mark[w][h]);
  }
  if (!this.moving) {this.direction=key.left+(this.tile.rnd()&3);} else {
   var s=this.tile.size/8;
   switch (this.direction) {case key.right:this.x+=s;break;case key.up:this.y-=s;break;case key.left:this.x-=s;break;case key.down:this.y+=s;break;}
   this.step++;
  }
  if((this.frame&7)!=0)this.frame++;else if((this.another!=0)|(this.tile.rnd()%25)==1){this.frame++;snd.play(snd.nomm);this.another=this.tile.rnd()&1;}
  this.frame&=7;
  switch(this.direction){case key.left:this.frame+=8;break;case key.down:this.frame+=16;break;case key.up:this.frame+=24;break;}
 }
}

anim.prototype.character = function() {
 return function(string, position) {
  if(position<string.length) {
   var c=string.charCodeAt(position)-32;
   if((c>0)&&(c<this.frames.length)) return this.frames[c];
  }
  return this.frames[0];
 }
}

