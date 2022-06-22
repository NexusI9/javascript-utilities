/*
ScopeView
Detect if an elements is entering or exiting the viewport and provides callback
Nassim El Khantour 2022
*/


export default class ViewScope{

  constructor({ container, onViewEnter= () => console.log('enter'), onViewExit= () => console.log('exit') }){
    this.container = container;
    this.onViewEnter = onViewEnter;
    this.onViewExit = onViewExit;
    this.box = this.getContainerBox();

    this.state = false;
  }

  getContainerBox(){
    return this.container.getBoundingClientRect();
  }

  check(){

      const scrollPos = window.pageYOffset;
      this.box = this.getContainerBox();
      //console.log(this.box);
      if( this.box.top <= window.innerHeight &&
          this.box.bottom >= 0
      ){

        if(!this.state){ this.onViewEnter(); }

        return this.state = true;
      }else{
          if(this.state){
            this.onViewExit();
          }
          return this.state = false;
      }
  }

  init(){
    if(!this.container){
      return console.warn('[ViewScope] no container defined');
    }
    this.check();

    window.addEventListener('scroll', this.check.bind(this) );

    window.addEventListener('resize', () => this.box = this.getContainerBox() )
  }

}
