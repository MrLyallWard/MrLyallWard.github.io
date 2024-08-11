function custom_load(){
 try{ // FUDGE during development
  var asString=localStorage.getItem('CUSTOM')
  var asObject=JSON.parse(asString);
  document.getElementById("JSON").innerHTML=asString;
  if(local.levels[local.levels.length-1].title==asObject.title){
   asObject.value=local.levels.length-1;
   local.levels[local.levels.length-1]=asObject;
  }else{
   asObject.value=local.levels.length;
   local.levels.push(asObject);
  }
 }catch(e){};
}


function custom_save(){
 try{ // FUDGE during development
  if(!menu.Play()) {
   var asString=motion.mosaic.asString();
   var asObject=JSON.parse(asString);
   document.getElementById("JSON").innerHTML=asString;
   localStorage.setItem(asObject.title,asString);
   if(local.levels[local.levels.length-1].title==asObject.title){
    asObject.value=local.levels.length-1;
    local.levels[local.levels.length-1]=asObject;
   }else{
    asObject.value=local.levels.length;
    local.levels.push(asObject);
   }
  } 
 }catch(e){};
}
