function action() {
 // Animation system Copyright Lyall Ward 2015
 this.anime = null;
 this.mosaic = null;
 this.key = null;
}

var motion = new action();

action.prototype.init = function(anime, key) {
 this.anime = anime;
 this.mosaic = anime.mosaic;
 this.key = key;
}

action.prototype.update = function(w,h) {
 this.anime.updateImageData(w-20,h-20);
 this.anime.drawTitle();
 if(menu.Play()){
  this.anime.drawSplash();
  this.anime.drawMouse();
  this.mosaic.freezeActors();
  this.mosaic.cleanup();
  this.mosaic.updateActors(this.key);
  this.mosaic.vanishingActors();
  this.mosaic.redraw();
 }else{
  if(menu.Resize())this.mosaic.adjust();else if(menu.Placement()){
   this.anime.drawCursor(this.mosaic.modifier);
   this.mosaic.modify();
  }
  this.mosaic.save();
 }
}

function mosaic(tileSize,tileSet,level) {
 this.alive = true;
 this.modifier = types.blank;
 this.cursorX = 1;
 this.cursorY = 1;
 this.tileSize = tileSize;
 this.tiles = tileSet;
 this.level = level;
 this.size(level.field.width,level.field.height);

 mosaic.prototype.pull = function(src,dst) {this.clean(dst);dst.w=src.w;dst.h=src.h;dst.x=src.x;dst.y=src.y;this.mark[src.w][src.h]=dst;}
 mosaic.prototype.fill_type = function(w,h) {return ((h==0)||(h==this.ymax-1)||(w==0)||(w==this.xmax-1))?this.level.field.border:this.level.field.fill;}
 mosaic.prototype.static_item = function(w,h) {return new actor(this.tiles[this.fill_type(w,h)],w,h);}
 mosaic.prototype.actor_item = function(f) {return this.mark[f[0]][f[1]]=new actor(this.tiles[f[2]],f[0],f[1]);}
 mosaic.prototype.clean = function(t) {this.context.drawImage(this.tiles[types.blank].pic(),t.x,t.y);}
 mosaic.prototype.move = function(src,dst) {var dst_w=dst.w;var dst_h=dst.h;this.pull(src,dst);src.w=dst_w;src.h=dst_h;this.mark[src.w][src.h]=src;}
 mosaic.prototype.fill_mosaic = function() {for(var w=0;w<this.xmax;w++)for(var h=0;h<this.ymax;h++){var t=this.mark[w][h];this.context.drawImage(t.pic(),t.x,t.y);};}
 mosaic.prototype.populate = function() {this.fill_static();this.fill_actors();this.fill_mosaic();}
 mosaic.prototype.resize = function(x,y) {this.size(x,y);this.populate();}
 
 mosaic.prototype.freezeActors = function() {for (var i=0;i<this.doer.length;i++) {if(this.doer[i].freezing) {this.doer.splice(i,1);}}}
 mosaic.prototype.cleanup = function() {for (var i=0;i<this.doer.length;i++) this.clean(this.doer[i]);}
 mosaic.prototype.updateActors = function(key) {for (var i=0;i<this.doer.length;i++) this.doer[i].action(this,key);}
 mosaic.prototype.vanishingActors = function() {for (var i=0;i<this.doer.length;i++) if(this.doer[i].vanishing) this.doer.splice(i,1);}
 mosaic.prototype.redraw = function() {for (var i=0;i<this.doer.length;i++) {var t=this.doer[i];this.context.drawImage(t.pic(),t.x,t.y);};}

 this.populate();
}

mosaic.prototype.adjust = function(){
 var k=key.oneShot();
 if(key.punching){
  var f=function(){};
  switch(k){
   case key.left:f=function(t){t[0]--;};break;
   case key.right:f=function(t){t[0]++;};break;
   case key.up:f=function(t){t[1]--;};break;
   case key.down:f=function(t){t[1]++;};break;
  }
  this.level.anime.forEach(f)
 }
 switch(k){
  case key.left:if(this.xmax>3)this.resize(this.xmax-1,this.ymax);break;
  case key.right:if(this.xmax<80)this.resize(this.xmax+1,this.ymax);break;
  case key.up:if(this.ymax>3)this.resize(this.xmax,this.ymax-1);break;
  case key.down:if(this.ymax<80)this.resize(this.xmax,this.ymax+1);break;
  default:return;
 }
}

mosaic.prototype.modify = function(){
 var k=key.oneShot();
 var w=key.oneWheel();
 if(w<0){this.modifier--;if(this.modifier<0)this.modifier=types.max_type-2;}
 if(w>0){this.modifier++;if(this.modifier>types.max_type-2)this.modifier=0;}
 if(key.punching){
  switch(k){
   case key.up:case key.left:this.modifier--;if(this.modifier<0)this.modifier=types.max_type-2;break;
   case key.down:case key.right:this.modifier++;if(this.modifier>types.max_type-2)this.modifier=0;break;
  }
  var t=new actor(this.tiles[this.modifier],this.cursorX,this.cursorY);
  this.mark[this.cursorX][this.cursorY]=t;
  this.context.drawImage(this.tiles[types.blank].pic(),t.x,t.y);
  this.context.drawImage(t.pic(),t.x,t.y);
 }else switch(k){
  case key.up:this.cursorY=(this.cursorY>1)?(this.cursorY-1):1;break;
  case key.down:this.cursorY=(this.cursorY<(this.ymax-2))?(this.cursorY+1):this.cursorY;break;
  case key.left:this.cursorX=(this.cursorX>1)?(this.cursorX-1):1;break;
  case key.right:this.cursorX=(this.cursorX<(this.xmax-2))?(this.cursorX+1):this.cursorX;break;
 }
 anime.X(this.tileSize*this.cursorX);
 anime.Y(this.tileSize*this.cursorY);
}

mosaic.prototype.save = function(){
 var level = JSON.parse(this.asString());
 for (var i=0;i<local.levels.length;i++){
  if(local.levels[i].title=='CUSTOM'){
   level.value = local.levels[i].value;
   local.levels[i] = level;
   return;
  }
 }
 level.value=i;
 local.levels.push(level);
}

mosaic.prototype.size = function(x,y){
 this.xmax = x;
 this.ymax = y;
 this.width = x*this.tileSize;
 this.height = y*this.tileSize;
 this.canvas=document.createElement('canvas');
 this.canvas.setAttribute('width', this.width);
 this.canvas.setAttribute('height', this.height);
 this.context=this.canvas.getContext('2d');
}

mosaic.prototype.fill_static = function() {
 this.mark = new Array();
 for (var w=0;w<this.xmax;w++){
  this.mark.push(new Array());
  for (var h=0;h<this.ymax;h++) this.mark[w].push(this.static_item(w,h));
 }
}

mosaic.prototype.fill_actors = function() {
 var x=this.xmax-1;
 var y=this.ymax-1;
 this.doer = new Array();
 for (var i=0;i<this.level.anime.length;i++){
  var a=this.level.anime[i];
  if(a.length<3)a.push(types.blank);
  if((a[0]>0)&(a[1]>0)&(a[0]<x)&(a[1]<y))this.doer.push(this.actor_item(a));
 }
}

mosaic.prototype.asString = function(){
 var comma=false;
 var string = '{"title":"CUSTOM","value":0,"description":"DESIGNER","two":"GENERATED","three":"LEVEL","time":600,"score":0,"field":{';
 string+='"width":'+this.xmax+',"height":'+this.ymax+',"border":'+types.brick+',"fill":'+types.dirt+'},"anime":[';
 for(var y=1;y<this.ymax-1;y++){
  for(var x=1;x<this.xmax-1;x++){
   var t=this.mark[x][y].tile.kind;
   if(t!=types.dirt){
    if(comma)string+=',';else comma=true;
	string+='['+x+','+y;
	if(t!=types.blank)string+=','+t;
	string+=']';
   }
  }
 }
 string+=']}';
 return string;
}

mosaic.prototype.explosion = function(w_0,h_0,filler){
 var field = [[0,0],[1,0],[-1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]];
 for (var i=0;i<field.length;i++) {
  var w=w_0+field[i][0]; var h=h_0+field[i][1];
  var victim=this.mark[w][h];
  if(victim.tile.breakable==true){
   victim.vanishing=true;
   var index=this.doer.indexOf(victim);
   switch(victim.tile.kind){
    case types.crawler:this.tiles[types.burrow].activated=true;break;
	case types.critter:this.tiles[types.mound].activated=true;break;
   }
   if(i<filler.length){victim=this.mark[w][h]=new actor(this.tiles[filler[i]],w,h);}else{victim=this.mark[w][h]=new actor(this.tiles[types.boulder],w,h);}
   if(index>=0)this.doer[index]=victim; else this.doer.push(victim);
  }
 }
 snd.play(snd.bang);
}

mosaic.prototype.kill = function(w,h){
 var victim=this.mark[w][h];
 if (victim.tile.breakable==true){
  victim.vanishing=true;
  var index=this.doer.indexOf(victim);
  switch(victim.tile.kind){
   case types.crawler:this.tiles[types.burrow].activated=true;break;
   case types.critter:this.tiles[types.mound].activated=true;break;
  }
  victim=this.mark[w][h]=new actor(this.tiles[types.blank],w,h);
  if (index>=0) this.doer[index]=victim; else this.doer.push(victim);
 }
 snd.play(snd.fizz);
}
