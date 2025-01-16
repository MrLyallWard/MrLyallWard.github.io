function sound_system() {
 // Sound System Copyright Lyall Ward 2015
 this.min_track = 0;
 this.push = 0;
 this.ding = 1;
 this.bong = 2;
 this.tack = 3;
 this.boom = 4;
 this.bang = 5;
 this.tick = 6;
 this.nomm = 7;
 this.exit = 8;
 this.fizz = 9;
 this.max_track = 9;
 this.context;
 this.rate;
 this.angle;
 this.channels = 1;
 this.volume = 0.01;
 this.tracks = new Array();

 sound_system.prototype.start = function(b) {
  var s = this.context.createBufferSource(); 
  s.buffer = b;
  s.connect(this.context.destination);
  //var v = this.context.createGain();
  //s.connect(v);
  //v.connect(this.context.destination);
  //v.gain.value = 0.001;//this.volume;
  s.start(); // this.context.currentTime + 10);
 }
 
 sound_system.prototype.gen = function() {  
  var samples;
  var buffer;
  var data;
  for (t=0;t<(this.max_track+1);t++)
  {
   switch(t) { 
	case this.push: samples = this.rate; break;
    case this.ding: samples = this.rate; break;
    case this.bong: samples = this.rate*2; break;
	case this.tack: samples = this.rate/3; break;
	case this.tick: samples = this.rate/3; break;
	case this.boom: samples = this.rate; break;
    case this.bang: samples = this.rate; break;
    case this.nomm: samples = this.rate/3; break;
    case this.exit: samples = this.rate*3; break;
    case this.fizz: samples = 2*this.rate/3; break;
   }
   buffer = this.context.createBuffer(this.channels, samples, this.context.sampleRate);
   data = buffer.getChannelData(0);
   switch(t) {
    case this.push:this.add(data,this.rnd,1);this.low(data,0,30);this.fnc(data,this.pks,3);this.low(data,0,1000);this.frq(data,this.sin,50);this.env(data);break;
    case this.ding:this.frq(data,this.sin,3000);this.mul(data,this.dec,0.1);break;
    case this.bong:this.frq(data,this.sin,66);this.frq(data,this.sin,70);this.frq(data,this.sin,34);this.frq(data,this.sin,36);this.mul(data,this.dec,0.25);break;
    case this.tack:this.tic(data,0,2);this.low(data,0,150);this.mul(data,this.rnd,0.2); this.low(data,0,75);this.low(data,0,75);break;
    case this.tick:this.tic(data,0,8);this.low(data,0,50);this.mul(data,this.rnd,0.002); this.low(data,0,75);break;
    case this.boom:this.add(data,this.rnd,4);this.frq(data,this.sin,33);this.mul(data,this.dec,4);this.low(data,5,44);this.low(data,0,44);break;
	case this.bang:this.frq(data,this.sin,33);this.mul(data,this.dec,3);this.add(data,this.rnd,2);this.mul(data,this.dec,1);this.low(data,1,50);break;
    case this.nomm:this.frq(data,this.sin,50);this.add(data,this.dec,7);this.frq(data,this.sin,100);this.add(data,this.dec,3);this.frq(data,this.sin,200);this.mul(data,this.dec,.5);this.env(data);break;
    case this.exit:this.frq(data,this.sin,300);this.add(data,this.sin,297);this.mul(data,this.dec,0.1); break;
 	case this.fizz:this.add(data,this.rnd,.5);this.mul(data,this.dec,4);this.low(data,1,25);this.env(data);break;
  }
   this.tracks.push(buffer)
  }
 }

 sound_system.prototype.fnc = function(b, f, p) {for (var i=0;i<b.length;i++) b[i]=f(b[i],p);}
 sound_system.prototype.add = function(b, f, p) {for (var i=0;i<b.length;i++) b[i]+=f(i,p);}
 sound_system.prototype.mul = function(b, f, p) {for (var i=0;i<b.length;i++) b[i]*=p*f(i,b.length);}
 sound_system.prototype.low = function(b, f, p) {for (var i=0;i<b.length;i++) b[i]=(f+=b[i]-(f/p))/p;}
 sound_system.prototype.frq = function(b, f, p) {var d=p*this.angle; var w=0; for (var i=0;i<b.length;i++) b[i]+=f(w+=d,1);}
 sound_system.prototype.tic = function(b, f, p) {for (var i=0;i<p;i++) b[(b.length/(2*p)) + (i*(b.length/p))]=(i&1)?1:-1;}
 sound_system.prototype.rnd = function(i, p) {return p*(Math.random()-0.5);}
 sound_system.prototype.sin = function(i, p) {return Math.sin(i*p);}
 sound_system.prototype.dec = function(i, p) {return (p/(p + 9*i))-0.1;}
 sound_system.prototype.pks = function(i, p) {return (i>0)?p:-p;}
 sound_system.prototype.env = function(b) {for (var i=0;i<b.length;i++) b[i]*=0.5-(0.5*Math.cos(i*2*Math.PI/b.length));}
}
var snd = new sound_system();

sound_system.prototype.init = function() {
 this.context = new (window.AudioContext || window.webkitAudioContext);
 this.rate = this.context.sampleRate;
 this.angle = (2 * Math.PI) / this.rate;
 this.gen();
}

sound_system.prototype.play = function(t) {
 this.start(this.tracks[t]);
}

