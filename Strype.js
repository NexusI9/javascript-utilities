
const SPACE = "&nbsp;"

export default class STRYPE{

  constructor(ob){

    this.selector = ob.selector || 'body';
    this.maxLetter = ob.maxLetter || 20;
    this.delay = ob.delay || 0;
    this.speed = ob.speed || 2;
    this.size = ob.size || '1em';

    this.isActive = false;
    this.history = null;

    this.nodes = "<div><section><h1></h1><h1></h1><h1 style='visibility:hidden'>W</h1></section></div>";
  //  $(this.selector).append("<style> .strype_animation{ animation: strype_slideup "+this.speed+"s; }     @keyframes strype_slideup{ 100%{ top:-"+this.size+"; } } </style>");

    this.init();
//    this.setEvents();

  }

  init(){

    if(   $(this.selector).length == 0 ){ return; }
    for(var l = 0; l < this.maxLetter; l++){
      document.querySelectorAll(this.selector)[0].insertAdjacentHTML('beforeend',this.nodes);
    }

  }

  setEvents(){
    const self = this;
    $(this.selector).find('section').on('animationend',function(){
      console.log("done");
      return;
      const $first = $(this).find('h1:first-of-type');
      const $last = $(this).find('h1:nth-of-type(2)');
      $first.html( $last.text() );
      $last.html( " " );
      $(this).css({top:0});

    });

  }

  endLine(){
    const ratio = window.innerWidth / $(this.selector).find('section').width() ;
    return Math.floor(ratio)-1;
  }

  display(str, self=this){

    this.history = str;
    var lastSpace = null;

    if(this.isActive || $(this.selector).length == 0 || !str){ return; }
    this.isActive = true;

    var conv_str = str.replace("  "," ").split("");

    //handle backspace
    for(var index in conv_str){

      if(conv_str[index] == " " || conv_str[index] == undefined){ conv_str[index] = SPACE; lastSpace = index; }
      if(index == self.endLine() && conv_str[index+1] != SPACE && lastSpace != null && lastSpace != 0 ){
        for(var sp = 0 ; sp < self.endLine() - lastSpace; sp++){
          const ad = Number(sp) + Number(lastSpace);
          conv_str.splice(ad,0,SPACE);
        }
      }

    }

    //chop if too long
    if(conv_str.length > this.maxLetter){
      conv_str = conv_str.slice(0,this.maxLetter);
      conv_str[this.maxLetter - 1] = "...";
    }


    //fillup sections
    $(this.selector).find('section').each(function(index){

      const $section = $(this);
      const oldWidth = $section.width();
      const $first = $section.find('h1:first-of-type');
      const $last = $section.find('h1:nth-of-type(2)');

      $last.html( (index < conv_str.length) ? conv_str[index] : SPACE );
      const newWidth = $section.width();
      var delay = index * self.delay;
      if(conv_str[index] == SPACE){ delay = 0; }
      const decal =  ( -1*self.size.replace("em","") ) + "em";

      $section.stop().animate({top:decal },self.speed,'swing',function(){
        $first.html( $last.text() );
        $last.html( " " );
        $section.css({top:0});

        if(index == conv_str.length - 1 ){
          self.isActive = false;
          if( self.history && self.history != str){ self.display(self.history); }
        }

      });




    });

  }




}



//add backspace if there's space from eigth
/*if(str.length > 10){
  for(var c = 10; c < str.length; c++){
    if(str[c] == "&nbsp;" || str[c] == " "){
      console.log(c);
      for(var a = 0; a < 3; a++){ str.splice(c, 0, "&nbsp;")  }
      break;
    }
  }
}*/
