

class VIEWER{


  /*
    CSS guide
        - main container : .viewerjs

        - large frame container : .viewerjs_mainframe
        - large frame pictures : .viewerjs_large

        - thumbnail container : .viewerjs_thumbnails
        - thumbnail pictures : .viewerjs_small
        - inactive thumbnail : .viewerjs_inactive
        - active thumbnail : .viewerjs_active
  */


  css = {
    VIEWER: 'viewerjs',

    MAINFRAME: 'viewerjs_mainframe',
    LARGE: 'viewerjs_large',

    THUMBNAILS : 'viewerjs_thumbnails',
    SMALL : 'viewerjs_small',

    ACTIVE: 'viewerjs_active',
    INACTIVE: 'viewerjs_inactive',

    TRANSITION : 'transform "+this.speed/1000+"s ease-in-out',

    class: (sel) => "."+ this.css[sel],
    id: (sel) =>  "#"+ this.css[sef]
  }




  constructor(parent, ob){

    //public
    this.pictures = ob.pictures || 'img';
    this.direction = ob.direction || 'vertical';
    this.thumbnail = ob.thumbnail || null;
    this.thumbNumber = ob.thumbNumber || 5;
    this.ratio = ob.ratio || [16,9];
    this.speed = ob.speed || 800;
    this.hideHover = ob.hideHover || true;

    //private
    this.parent = parent;
    this.height = 0;
    this.lastSwitch = 0;
    this.lastVelo = 0;
    this.maxVelo = 0;
    this.thumbScrollPos = 0;
    this.mainScrollPos = 0;
    this.active = false;


    //-------------------------------------------------------------------
    //-------------------------------------------------------------------
    //-------------------------------------------------------------------


    if(parent.length == 0){ return; }
    //define initials elements ( viewer, main frame, thumbnail frame)
    this.viewer = $("<div class='"+this.css.VIEWER+"'></div>");
    this.mainFrame = $("<div id='"+this.css.MAINFRAME+"'></div>");
    this.thumbnails = $("<div id='"+this.css.THUMBNAILS+"'></div>");

    //fill up and check if pictures exists
    this.pictures = $(this.parent).find(this.pictures);
    if(this.pictures.length == 0){return;}

    //clean up initial selector and build viewer
    this.pictures.remove();
    $(this.parent).append(this.viewer);
    this.populate();

    this.allThumbnails = $(this.css.class('SMALL'));

    this.setCSS();
    this.setEvents();


  }

  //UTILITIES
  getStage(){
    const len = $(this.css.class("LARGE")).length;
    if(len == 2 && this.index == 0 ){

      /*$( $(this.css.class("LARGE"))[0] ).attr('data-pos','top');
      $( $(this.css.class("LARGE"))[1] ).attr('data-pos','bottom');*/

      return {
        length:len,
        top: null,
        mid: $( $(this.css.class("LARGE"))[0] ),
        bottom: $( $(this.css.class("LARGE"))[1] )
      }

    }else if(len == 2 && this.index == this.pictures.length - 1){
          return {
            length:len,
            top: $( $(this.css.class("LARGE"))[0] ),
            mid: $( $(this.css.class("LARGE"))[1] ),
            bottom: null
          }
    }else if( len == 2 && this.lastSpawn == 'top'){

      return {
        length:len,
        top: $( $(this.css.class("LARGE"))[0] ),
        mid: $( $(this.css.class("LARGE"))[1] ),
        bottom: null
      }

    }else if( len == 2 && this.lastSpawn == 'bottom'){

      return {
        length:len,
        top: null,
        mid: $( $(this.css.class("LARGE"))[0] ),
        bottom: $( $(this.css.class("LARGE"))[1] )
      }

    }else{

      /*$( $(this.css.class("LARGE"))[0] ).attr('data-pos','top');
      $( $(this.css.class("LARGE"))[1] ).attr('data-pos','mid');
      $( $(this.css.class("LARGE"))[2] ).attr('data-pos','bottom');*/

      return {
        length:len,
        top: $( $(this.css.class("LARGE"))[0] ),
        mid: $( $(this.css.class("LARGE"))[1] ),
        bottom: $( $(this.css.class("LARGE"))[2] )
      }
    }

  }

  //DOM INIT
  populate(){

    var self = this;
    var array = [];

    this.pictures.each(function(index){

      array.push({
          full: $(this).clone().addClass(self.css.LARGE).attr("draggable","false"),
          small: $( "<div class='"+self.css.SMALL+"'></div>").append( $(this).clone().attr("draggable","false") ),
          index:index
      });

      self.thumbnails.append( array[index].small );
      if(index < 2){  self.mainFrame.append( array[index].full ); }

    });


    this.pictures = array;
    array = null;

    $(this.viewer).append(this.mainFrame);
    $(this.viewer).append(this.thumbnails);

    this.index = 0;


  }

  //CSS STYLE & BEHAVIOR
  setCSS(){

    function updateHeight(width, ratio){  return (width * ratio[1] / ratio[0]); }

    this.height = updateHeight( this.viewer.width(), this.ratio );

    this.viewer.css({
      width:"100%",
      height: this.height + "px",
      position:'relative',
    });

    this.mainFrame.css({
      height: "100%",
      display: "block",
      overflow:"hidden",
      position:"relative"
    });

    this.thumbnails.css({
      maxHeight:'100%',
      zIndex:2,
      top: (this.pictures.length < this.thumbNumber) ? (this.height / 2) - (this.thumbnails.height()/2) : 0
    });


    for(var p of this.pictures){
      p.full.css({
        height:"100%",
        objectFit:"contain",
        transition:this.css.TRANSITION,
        position:'absolute',
        left:0,
        top:0
      });

      p.small.css({
        position:'relative',
        height:"calc(100%/"+this.thumbNumber+")",
        width: "fit-content",
        padding:'none'
      });

      p.small.find('img').css({
        height:'100%',
        objectFit:"contain"
      });
    }

    //init
    this.pictures[1].full.css({transform:'translateY(100%)'});
    this.setThumbnail(this.pictures[0]);

    //window.addEventListener('resize',() => this.setCSS() );

  }
  setTransition(){
    const top = this.getStage().top;
    const mid = this.getStage().mid;
    const bot = this.getStage().bottom;
    if( top && top.css('transition') == "all 0s ease 0s" ){ top.css({transition:"transform "+this.speed/1000+"s ease-in-out"});    }
    if( mid && mid.css('transition') == "all 0s ease 0s" ){ mid.css({transition:"transform "+this.speed/1000+"s ease-in-out"});    }
    if( bot && bot.css('transition') == "all 0s ease 0s"){  bot.css({transition:"transform "+this.speed/1000+"s ease-in-out"});    }
  }

  //NEXT / PREVIOUS PICTURE PROCESS
  translate(val){

    switch (this.direction) {
      case 'vertical':
        return 'translateY('+val+')';
      break;

      case 'horizontal':
        return 'translateX('+val+')';
      break;
    }

  }
  spawn(elt, type){

    switch(type){
      case 'bottom':
        elt.css({transform:'translateY(100%)'});
        $(this.mainFrame).append(elt);
      break;

      case 'top':
        elt.css({transform:'translateY(-100%)'});
        $(this.mainFrame).prepend(elt);
      break;
    }

    this.lastSpawn = type;


  }
  switch(np){

    if(this.active){ return; }
    this.active = true;
     // start/end exception
    if( this.index == 0 && np == 'prev' || this.index == this.pictures.length - 1 && np == 'next' ){
      this.getStage().mid.css({transform:this.translate('0%')});
      this.active = false;
      return;
    }

    const actualStage = this.getStage();
    this.setTransition();
    switch(np){

      case 'next':

        if(actualStage.top){ actualStage.top.remove(); }
        actualStage.mid.css({transform:this.translate("-100%")});
        actualStage.bottom.css({transform:this.translate("0%")});

       this.index++;
       if(this.pictures[this.index+1]){ this.spawn(this.pictures[this.index+1].full,'bottom'); };

      break;

      case 'prev':

        if(actualStage.bottom){actualStage.bottom.remove();}
        actualStage.top.css({transform:this.translate("0%")});
        actualStage.mid.css({transform:this.translate("100%")});

        this.index--;
        if(this.pictures[this.index-1]){ this.spawn(this.pictures[this.index-1].full,'top'); }

      break;
    }

    actualStage.mid.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => { this.active = false; });
    this.autoScrollThumb( this.pictures[this.index] );
    this.setThumbnail( this.pictures[this.index] );

   }
  goTo(pic = null){

    this.active = true;
    var currentStage = this.getStage();

    if(currentStage.bottom){ currentStage.bottom.remove(); }
    if(currentStage.top){ currentStage.top.remove(); }

    switch(pic.index > this.index){
      case true:

        this.spawn(pic.full,'bottom');

        //apply translation
        this.setTransition();
        currentStage = this.getStage();
        currentStage.mid.css({transform:this.translate("-100%")});
        currentStage.bottom.css({transform:this.translate("0%")});

      break;

      case false:

        this.spawn(pic.full,'top');

        //apply translation
        this.setTransition();
        currentStage = this.getStage();
        currentStage.top.css({transform:this.translate("0%")});
        currentStage.mid.css({transform:this.translate("100%")});


      break;
    }

    //replace top picture with logical previous one once animation is done
    currentStage.mid.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", (e) => {
      e.target.remove();

      if(this.pictures[this.index-1]){this.spawn(this.pictures[this.index-1].full,'top');  }
      if(this.pictures[this.index+1]){this.spawn(this.pictures[this.index+1].full,'bottom');  }

      this.active = false;

    });

    this.index = pic.index;
    this.setThumbnail(this.pictures[this.index]);

  }

 //THUMBNAILS PROCESS
 linkThumbnail(pic){

  if(this.active){ return; }

   //catch full pictures selected
   for(var p of this.pictures){

     if( pic == p.small[0] ){

       const newIndex =  p.index;
       if(newIndex != null){
         if(this.index < newIndex){ this.goTo(p); }
         else if(this.index > newIndex){ this.goTo(p); }
       }
     }

   }
 }
 setThumbnail(pic){

   for(var p of this.pictures){

     p.small.removeClass(this.css.ACTIVE);
     p.small.addClass(this.css.INACTIVE);

     if(p.full == pic.full){

       p.small.addClass(this.css.ACTIVE);
       p.small.removeClass(this.css.INACTIVE);
     }
   }
 }
 autoScrollThumb(pic){
    const thumbHeight = pic.small.height();
    const lastVisible = this.thumbNumber + Math.abs( Math.ceil( (this.thumbScrollPos) / thumbHeight ) );
    const lastHidden = Math.abs( Math.ceil( (this.thumbScrollPos) / thumbHeight ) );


    if( pic.index == lastVisible-1 && lastVisible < this.pictures.length - 1 ){
      this.thumbScrollPos -= thumbHeight * Math.ceil( this.thumbNumber /2 );
      this.thumbnails.animate({top:this.thumbScrollPos+"px"},600,'swing');
   }else if(pic.index == lastHidden-1 && lastHidden > 1){
      this.thumbScrollPos += thumbHeight * Math.ceil( this.thumbNumber /2 );
      this.thumbnails.animate({top:this.thumbScrollPos+"px"},600,'swing');
   }


  }

  //EVENTS
  setEvents(){
    //KEYEVENTS
    window.addEventListener('keydown',this.keyEvent.bind(this));

    //MOUSE SLIDE
    var bindedMouseMove = this.mouseMove.bind(this);
    this.mainFrame[0].addEventListener('mousedown', () => this.mainFrame[0].addEventListener('mousemove', bindedMouseMove) );
    window.addEventListener('mouseup', () =>   {

      //removed transition during the mousedown event so we put them back
      this.setTransition();
      //remove mouseMove event
      this.mainFrame[0].removeEventListener('mousemove', bindedMouseMove)

      if(this.lastSwitch < -0.5){ this.switch('next');  }
      if(this.lastSwitch > 0.5){  this.switch('prev');  }
      this.lastSwitch = 0;

    });

    this.scrollPos = 0;
    this.mainFrame.bind('mousewheel DOMMouseScroll',this.mainScroll.bind(this));
    this.thumbnails.bind('mousewheel DOMMouseScroll',this.thumbScroll.bind(this));

    this.allThumbnails.on('click',(e) => { this.linkThumbnail(e.currentTarget)} );

  }
  manualTranslate(pos){

  const actualStage = this.getStage();
  //we aldready know the tY of the pictures (top : -100%; mid : 0%; bottom : 100%)
  if(actualStage.top){ actualStage.top.css({transition:"", transform: this.translate( pos.top + "%" ) });       }
  if(actualStage.mid){ actualStage.mid.css({transition:"", transform: this.translate( pos.mid + "%" ) });       }
  if(actualStage.bottom){ actualStage.bottom.css({transition:"", transform: this.translate( pos.bottom + "%" ) }); }


  }
  keyEvent(e){

       e.preventDefault();
       if(e.key == "ArrowUp" || e.key == "ArrowLeft" ){ this.switch("prev"); }
       else if (e.key == "ArrowDown" || e.key == "ArrowRight"){ this.switch("next"); }

  }
  mouseMove(e){
    e.preventDefault();
    const normalize = (this.direction == 'vertical') ? (e.layerY - this.height/2) / (this.height/2) : (e.layerX - this.viewer.width()/2) / (this.viewer.width()/2) ;
    const velocity = this.lastSwitch - normalize;
    const scale = 50;

    const topPos = -100 + normalize * scale;
    const midPos = normalize * scale;
    const botPos = 100 + normalize * scale;

    setTimeout( () => this.manualTranslate({
      top:topPos,
      mid:midPos,
      bottom:botPos
    }),40);

    this.lastSwitch = normalize;
  }
  mainScroll(e){


    if(this.active){ e.preventDefault(); return; }

    var velocity = e.originalEvent.deltaY;
    if(this.index == this.pictures.length -1 && velocity > 0 || this.index == 0 && velocity < 0){ return; }

    e.preventDefault();
    const speed = 10;


    if(velocity > 100){ velocity == 100; }
    if(velocity < -100){ velocity == -100; }

    switch(velocity > 0){
      case true:
        this.mainScrollPos -= (velocity/100) * speed;
      break;

      case false:
        this.mainScrollPos += (Math.abs(velocity)/100) * speed;
      break;
    }


    if(this.mainScrollPos < -50){ this.switch('next'); this.mainScrollPos = 0; return; }
    if(this.mainScrollPos > 50){ this.switch('prev'); this.mainScrollPos = 0; return; }

    this.manualTranslate({
      top: -100 + this.mainScrollPos,
      mid: this.mainScrollPos,
      bottom: 100 + this.mainScrollPos
    });

    this.lastScroll = this.mainScrollPos;


  }
  thumbScroll(e){
    e.preventDefault();

    var velocity = e.originalEvent.deltaY;
    const speed = 12;
    const realHeight = (this.viewer.height() / this.thumbNumber * this.pictures.length) - this.viewer.height()

    if(velocity < 0 && this.thumbScrollPos >= 0 ||  velocity > 0 && Math.abs(this.thumbScrollPos) > realHeight ){ return; }

    switch(velocity > 0){
      case true:
        this.thumbScrollPos -= (velocity/100)*speed;
      break;

      case false:
        this.thumbScrollPos += (Math.abs(velocity)/100)*speed;
      break;
    }

    this.thumbnails.css({top:this.thumbScrollPos+"px"});

  }


}

(function( $ ){

  $.prototype.Viewer = function(ob){ return new VIEWER(this, ob); }

})(jQuery);
