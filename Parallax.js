export default class PARALLAX{


  constructor(ob){
    this.target = ob.target;
    this.array = [];

    this.init();
  }

  init(){

    const self = this;

    $(self.target).each(function(){
      self.array.push({
        $elt: this,
        topPos: this.offsetTop,
        limit: this.offsetTop + this.offsetHeight,
        height : this.offsetHeight
      });
    });


    this.scrollHandler();

  }

  scrollHandler(){

    const self = this;

    window.addEventListener('scroll',function(){
      let scrollPos = window.pageYOffset; //count from bottom to catch enter on viewport

      for(var t of self.array){
          if(t["topPos"] < (scrollPos + window.innerHeight) && t["limit"] > scrollPos) {
            setTimeout( ()=> t.$elt.style.backgroundPositionY = (100*( 1-(scrollPos/t["limit"])) ) + "%",60);
          }else{
            t.$elt.style.backgroundPositionY = '0%';
          }

      }


    });

  }

}
