

class TRAIN{

  constructor(sel, ob){
    this.selector = sel;
    this.speed = ob.speed || 2;
    this.width = ob.width || '100';
    this.margin = ob.margin || '5%';
    this.sense = ob.sense || 'left';

    this.state = 'stop';
    this.container = $("<div style='width:fit-content; display:flex; column-gap:"+this.margin+"; flex-direction:row; transform: translateX(0%);'></div>");
    this.container[0].addEventListener('transitionend', () => { this.reset(); } );
    this.populate()
    setTimeout( () => this.mixer('play'), 50);

  }

  populate(){
    this.selector.parent().prepend( this.container );
    this.container.append( this.selector.clone() );
    this.container.append( this.selector.clone() );
    this.selector.remove();
  }

  offset(){
    var sign = 1;
    if(this.sense = 'right'){ sign = -1; }
    return (sign * ( this.width/2 + parseFloat(this.margin) ) ) + "%";
  }

  reset(){
    this.container.css({
      transform: "translateX(0%)",
      transition : 'none',
    });

    setTimeout( () => this.mixer(this.state), 1);
  }


  mixer(state){

    this.state = state;
    switch(state){

      case 'play':
        this.container.css({
          transform:'translateX('+ this.offset() +')',
          transition : 'transform '+ this.speed +'s linear'
        });
      break;

      case 'pause':

      break;

    }

  }



}


(function($){


  $.prototype.Train = function(ob){ return new TRAIN(this, ob); }



})(jQuery);
