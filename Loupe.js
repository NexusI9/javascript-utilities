export class LOUPE{

  loupe;
  merch;
  activeMerch = null;
  loupe_bound;
  merch_bound;
  img;


  constructor(lp){

    this.loupe = {
      target: lp.target,
      zoomSize: lp.zoomSize || 500,
      frameSize: lp.frameSize || 25
    }

  }

  init(){

    let self = this;
    let loupe_html = '  <div id="loupe" class="roundborder XP_glow"> </div> ';
    if($("#loupe").length == 0){ $("body").append(loupe_html); }

    this.loupe.element = $("#loupe");

    this.merch = $(this.loupe.target);

    this.loupe.element.css({
      position: "absolute",
      top: 0,
      left: 0,
      width: this.loupe.frameSize+"vw",
      height: this.loupe.frameSize+"vw",
      pointerEvents: "none",
      zIndex: 9,
      overflow: "hidden",
      display:"block",
      backgroundSize: self.loupe.zoomSize+"%",
      backgroundImage:'none'
    });

    this.loupe_bound = this.loupe.element[0].getBoundingClientRect();
    this.loupe.element.css({display:"none"});

    if(this.merch.length != 0){ this.events(); }

  }


  events(){

    let self = this;
    let loupeMove = function(e){
        let leftPercent = (e.clientX - self.merch_bound.left) / self.merch_bound.width * 100;
        let topPercent = (e.clientY - self.merch_bound.top ) / (self.merch_bound.height + self.merch_bound.top) * 100;

        self.loupe.element.css({
          left:e.clientX - self.loupe_bound.left - self.loupe_bound.width/2,
          top: e.pageY - self.loupe_bound.height/2,
          backgroundPosition: leftPercent+"% "+topPercent+"%"
        });

    }

    let updateBound = function(){ self.merch_bound = self.activeMerch[0].getBoundingClientRect(); }
    this.merch.unbind().hover(
      function(){

        self.activeMerch = $(this);
        self.merch_bound = self.activeMerch[0].getBoundingClientRect();
        self.img = $(this);
        self.loupe.element.css({
          display:"block",
          backgroundImage: "url(\""+self.img.attr("src")+ "\")"
        });

        self.activeMerch.css({cursor:"none"});
        document.addEventListener("mousemove",loupeMove);
        document.addEventListener("scroll",updateBound);

      },
      function(){
        self.loupe.element.css({display:"none"});
        document.removeEventListener("mousemove",loupeMove);
        document.removeEventListener("scroll",updateBound);
      }
    );

  }


}
