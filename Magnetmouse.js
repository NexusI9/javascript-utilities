 export default class MAGNETMOUSE{



  constructor(ob){

    this.target = ob.target || null;
    this.distance = ob.distance || 10;
    this.maxDistance = ob.maxDistance || 15;

    this.active = false;

    if(this.target == null){ return; }

    this.nodes = document.querySelectorAll(this.target);
    if(this.nodes == null){ return; }

    this.lastPos = {
      x:0,
      y:0
    };

    const self = this;

    window.addEventListener('mousemove',(e) => {

      const pos = {
        x:e.pageX,
        y:e.pageY
      }

      this.active = true;

      this.nodes.forEach(function(element, index){

        setTimeout( () => {

          const posX = ( Math.abs(self.lastPos.x - pos.x) > self.maxDistance ) ? self.maxDistance : self.lastPos.x - pos.x;
          const posY = ( Math.abs(self.lastPos.y - pos.y) > self.maxDistance ) ? self.maxDistance : self.lastPos.y - pos.y;

          if(posX == 0 || posY == 0){ return; }


          $(element).animate({transform:'translateX('+ posX +'px) translateY('+ posY +'px)'},200);

        }, 70);

      });
      this.lastPos = pos;

    });

  }

  randomInt(mn, mx) { // min and max included
    mn = parseInt(mn);
    mx = parseInt(mx);
    return  Math.floor(Math.random() * (mx - mn + 1) + mn) ;
  }

}
