class SCROLLANIM{


    constructor(selector, obj){

      const self = this;
      this.globalArray = [];

      this.target = (selector.length != 0) ? selector : null;                   //STRING
      this.threshold = obj.threshold || window.innerHeight/2;   //INT
      this.legacy = obj.legacy || true;                         //BOOLEAN
      this.chosenAnim = obj.animation || 'default';              //STRING
      this.delay = obj.delay || 300;


      if(this.target == null){ return; }

      this.setEvent();
      this.target.each(function(index){
        self.globalArray.push({
          element:this,
          triggered:false,
          defaultStyle:this.style.cssText,
          children:self.setChildren(this),
          top: this.getBoundingClientRect().top
        });

        self.hide(this)

      });


      if(this.globalArray.length == 0){ return; }

    }

    objToString(obj){
      var cleanArray = [];
      for(const param of Object.entries(obj) ){  cleanArray.push(param.join(": ")); }
      cleanArray = cleanArray.join("; ");
      cleanArray += "; ";
      return cleanArray;
    }

    animation(){

      switch(this.chosenAnim){
        case 'default':
          return {
            opacity: '0',
            transition: 'opacity 0.5s ease-out, transform 0.8s ease-out'
          };
          break;
      }
    }

    setChildren(element){

      var arChild = [];

      if(element.children.length > 0){
        for(const child of element.children){
          arChild.push({
            element: child,
            defaultStyle: child.style.cssText
          });
        }
      }

      return arChild;

    }
    setEvent(){

      window.addEventListener('scroll',() => {
        const scroll = window.pageYOffset;

        for(const elt of this.globalArray){
          if( scroll > elt.top - this.threshold && elt.triggered == false){

            elt.triggered = true;

            if(this.legacy){ //TRIGGER

              for(const ch in elt.children){

                const child = elt.children[ch];
                const finalCSS = child.defaultStyle + ' transition :' + this.animation()['transition'];
                setTimeout( () => child.element.style.cssText = finalCSS, ch * this.delay);

              }
            }else{  elt.element.style = elt.defaultStyle;  }

          }
        }


      });

    }

    hide(element){

      if(this.legacy && element.children.length > 0){
        for(const child of element.children){
          child.style.cssText += this.objToString( this.animation() );
        }
      }else{
          element.style.cssText += this.objToString( this.animation() );
      }
    }




}


(function($){

  $.prototype.Scrollanim = function(ob){ return new SCROLLANIM(this, ob); }

})(jQuery);
