
/*

shuffle array -> shuffle_array

randomInt(min, max) —> returns a random number between min and max (included)

scroll_above_height(margin) -> returns true if scroll is above window $height

getFileSize(url) -> returns a Promise blob size of a file ( getFileSize(url).then() )

getRotation(element) -> returns the rotation from a transformation

grab (selector, moveing element) -> allow to grab some element and move them in the window

setParam(name, value) ->

getParam(url, name) -> get a paramater (?&) from a urlencode

scrollToHref -> scroll to the right div from URL hash

dicoToString -> convert a dictionnary object to a string (useful for CSS)

getScrollPercent -> get Percentage of scroll

scrollVeclocity

touch_enabled -> return boolean if device is touch screen

*/


function shuffle_array(ar){
    return ar.sort( () => Math.random() - 0.5);
}

function randomInt(mn, mx) { // min and max included
  mn = parseInt(mn);
  mx = parseInt(mx);
  return  Math.floor(Math.random() * (mx - mn + 1) + mn) ;
}

function scroll_above_height(margin = 0){

    if($(window).scrollTop() > $(window).height()+margin){
      return true;
    }else {
      return false;
    }

}

function getFileSize(path){
    return new Promise(function(resolve, reject){

      xhr.open('GET', path, true);
      xhr.responseType = 'blob';
      xhr.onload = function()
      {
          blob = xhr.response;
          resolve(blob.size);
      }
      xhr.send();
    });
  }

function getRotation( el ) {
      var st = window.getComputedStyle(el[0], null);
      var tr = st.getPropertyValue("-webkit-transform") ||
           st.getPropertyValue("-moz-transform") ||
           st.getPropertyValue("-ms-transform") ||
           st.getPropertyValue("-o-transform") ||
           st.getPropertyValue("transform") ||
           "fail...";

      if( tr !== "none") {
        console.log('Matrix: ' + tr);

        var values = tr.split('(')[1];
          values = values.split(')')[0];
          values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];

        var scale = Math.sqrt(a*a + b*b);

        // First option, don't check for negative result
        // Second, check for the negative result
        /**/
        var radians = Math.atan2(b, a);
        var angle = Math.round( radians * (180/Math.PI));
        /*/
        var radians = Math.atan2(b, a);
        if ( radians < 0 ) {
          radians += (2 * Math.PI);
        }
        var angle = Math.round( radians * (180/Math.PI));
        /**/

      } else {
        var angle = 0;
      }

      // works!
      return angle;
    }

function grab(selector, move = null){

      let lastPop;
      let offsetX, offsetY;
      if(move == null){ move = selector;}


      function mouseMove(e){
        let posX = e.clientX;
        let posY = e.clientY;
        lastPop.css({
          left:posX + offsetX + "px",
          top: posY + offsetY + "px"
        });
      }

      function mouseDown(e){
        lastPop = move;
        offsetX = lastPop.offset().left - e.clientX;
        offsetY = lastPop.offset().top - e.clientY;
        document.addEventListener("mousemove",mouseMove);
      }

      selector.on("mousedown",mouseDown);
      //$(".windowsXP").not($(this)).css({zIndex:998});
      //$(this).parent().css({zIndex:999});
      document.addEventListener("mouseup",function(){
        document.removeEventListener("mousemove",mouseMove);
      });

}

function setParam(name, value){
  var href = window.location.href;
  var regex = new RegExp("[&\\?]" + name + "=");
  if(regex.test(href))
  {
    regex = new RegExp("([&\\?])" + name + "=\\d+");
    return href.replace(regex, "$1" + name + "=" + value);
  }
  else
  {
    if(href.indexOf("?") > -1)
      return href + "&" + name + "=" + value;
    else
      return href + "?" + name + "=" + value;
  }
}

function getParam(url_string,name){
  var url = new URL(url_string);
  var c = url.searchParams.get(name);
  return c;
}

function scrollToHref(){

  const url = new URL(window.location);

  if(url.hash != ""){
    var hash = url.hash.split("#")[1];
    const corres_elt = document.getElementById(hash);
    if(corres_elt){
      window.scroll({
        top:corres_elt.getBoundingClientRect().top,
        left:corres_elt.getBoundingClientRect().left,
        behavior:'smooth'
      });
    }
  }

}

function dicoToString(obj){
      var cleanArray = [];
      for(const param of Object.entries(obj) ){  cleanArray.push(param.join(": ")); }
      cleanArray = cleanArray.join("; ");
      cleanArray += "; ";
      return cleanArray;
}

function stepAnimate(set){
  /*
    set = {
      selector //string
      min   //int
      max   //int
      delay //int
      animate //CSS object
  }
  */

  const min = set.min || 0;
  const max = set.max || 1;
  const delay = set.delay || 0;
  const elt = set.selector || null;
  const animate = set.animate || null;

  if(elt == null || animate == null){ return; }

  return $({step:min}).delay(delay).animate({step:max},{
    step: function(val){
    }
  });

}

function getScrollPercent() {
    var h = document.documentElement,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight';
    return (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
}


function scrollVelocity(max = 20, self=projects){

  var velocity = lastScroll - $(window).scrollTop();
  if( velocity > max){ velocity = max; }
  if( velocity < -1*max){ velocity = -1*max; }
  if( velocity == -1 || velocity == 1){ velocity=0;}
  if(velocity != self.lastVelo){ return velocity; }

  self.lastVelo = velocity;

}


function getCSSVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function setRootVar(name,value){
  return document.documentElement.style.setProperty(name,value);
}

function touch_enabled() {
    return ( 'ontouchstart' in window ) ||
           ( navigator.maxTouchPoints > 0 ) ||
           ( navigator.msMaxTouchPoints > 0 );
}
