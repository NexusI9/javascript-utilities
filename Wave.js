/*
WAVE SVG generator
Nassim El KHantour 2022
*/

gsap.registerPlugin(MotionPathPlugin);
const NS = "http://www.w3.org/2000/svg";
import ViewScope from './ViewScope.js';

export default class Wave{

  svg;
  ctx;
  margin=50;
  noise={
    c1:{x:40, y:40},
    c2:{x:40, y:40}
  };

  constructor({container='body', direction='both', fill='#000000', strokeWidth=2, strokeColor="#000000", amplitude=50, strokeWaves=true, speed = 1, onEnter= () => 'enter', onExit=() => 'exit', animated=true }){
    this.container=container;
    this.direction=direction;
    this.fill= fill;
    this.strokeColor=strokeColor;
    this.amplitude = amplitude;
    this.strokeWaves = strokeWaves;
    this.speed = speed;
    this.tween = null;

    this.onEnter = onEnter;
    this.onExit = onExit;

    this.animated = animated;
  }

  //utilities
  setFill(fill){

    /*
      const deg = {
      start: { color: #000000, offset: 0% },
      end: { color: #FFFFFF, offset:100% },
      rotate: 0
    }
    */
    //create a linear gradient if fill is an objects
    switch(typeof fill){

      case 'string':
        return fill;

      case 'object':

        const linearGradient = document.createElementNS(NS,'linearGradient');
        linearGradient.setAttribute('id','linearGradient');
        if(fill.rotate){
          linearGradient.setAttributeNS(null,'gradientTransform',`rotate(${fill.rotate})`);
        }

        this.svg.appendChild(linearGradient);

        if(fill.start){
          const stop1 = document.createElementNS(NS,'stop');
          stop1.setAttributeNS(null, 'offset', fill.start.offset || '0%' );
          stop1.setAttributeNS(null, 'stop-color', fill.start.color || '#000000' );
          linearGradient.appendChild(stop1);
        }

        if(fill.end){
          const stop2 = document.createElementNS(NS,'stop');
          stop2.setAttributeNS(null, 'offset', fill.end.offset || '100%' );
          stop2.setAttributeNS(null, 'stop-color', fill.end.color || '#000000' );
          linearGradient.appendChild(stop2);
        }


        return 'url(#linearGradient)';

      default:
        return '#000000';

    }

  }

  //events
  setSize(){

    this.size = {
      w:this.container.getBoundingClientRect().width,
      h:this.container.getBoundingClientRect().height,
      cx:this.container.getBoundingClientRect().width/2,
      cy:this.container.getBoundingClientRect().height/2
    }
  }
  updateSVGSize(){
    this.svg.setAttribute('width','100%');
    this.svg.setAttribute('height',this.size.h + 4*this.amplitude);
    this.svg.setAttributeNS(null,'viewBox',[0, 0, this.size.w, this.size.h].join(' ') );
  }
  onResize(){
    this.setSize();
    this.updateSVGSize();
    this.draw();
  }

  //control points utilities
  setControlPoints(y=0, inverted = null){
    return {
      startX: !inverted ? 0 : this.size.w,
      startY:y,
      endX: !inverted ? this.size.w : 0,
      endY:y,
      cx1:this.size.cx + this.noise.c1.x,
      cy1:y + this.noise.c1.y * (inverted ? -1 : 1),
      cx2:this.size.cx + this.noise.c2.x,
      cy2:y - this.noise.c2.y * (inverted ? -1 : 1),
    }
  }
  controlPointsToSVG(cp, init=true){
      //concat the parameters from setControlPonts method to SVG path compatible values // stringify values
     let params = {
      M:[
          [cp.startX, cp.startY]
        ],
      C:[
        [cp.cx1, cp.cy1],
        [cp.cx2, cp.cy2],
        [cp.endX, cp.endY]
      ],
    };
    let queryString = '';
    Object.keys(params).forEach( key => {

      if(!init && key === 'M'){ return; }
      queryString += key;

      const convertCoo = params[key].map( coo => coo.join(',') );
      queryString += convertCoo.join(' ');

    });

    return queryString;

  }
  updateControlPoints(){
      const self = this;
      //update the noise value
      const noiseValue = () => { return  Math.random() * this.amplitude * 4 };
      const tweenLength = 40;
      for(const key in this.noise){

        const tweenArray = [];
        for(let j = 0; j < tweenLength; j++){
          tweenArray.push({x:noiseValue(), y:noiseValue()});
        }

        this.tween?.kill();
        this.tween = gsap.to(this.noise[key], tweenLength/this.speed,
          {
            motionPath:{path:tweenArray, type:'soft', timeResolution:0},
            onUpdate: () => {
              this.setControlPoints();
              this.draw();
            },
            onComplete: () => this.updateControlPoints(),
            ease:Linear.easeNone
          }
        );
      }





  }

  //drawing methods
  drawMainWave(){

      const topPart =  (this.direction === 'top' || this.direction === 'both' ) ? this.controlPointsToSVG( this.setControlPoints(0) ) : ["M",[0,0].join(','),"H",[this.size.w,0].join(',')].join(' ')
      const bottomPart =  (this.direction === 'bottom' || this.direction === 'both' ) ? this.controlPointsToSVG(  this.setControlPoints(this.size.h, 'inverted'), false ) : ["L",[0,this.size.h].join(',')].join(' ')


      const attr = [
        topPart,
        ['L', [this.size.w, 0].join(','), [this.size.w, this.size.h].join(',') ].join(' '),
        bottomPart,
        'Z'
      ].join(' ');
      this.mainWave.setAttributeNS(null, 'd',attr);

  }
  drawStrokeWave(){

    const topPart = this.setControlPoints(-20);
    const bottomPart = this.setControlPoints(this.size.h + 20, 'inverted');

    if(this.strokeWaves && (this.direction === 'both' || this.direction === 'top') ){
      this.topWave.setAttributeNS(null, 'd', this.controlPointsToSVG(topPart) );
    }
    if(this.strokeWaves && (this.direction === 'both' || this.direction === 'bottom') ){
      this.bottomWave.setAttributeNS(null, 'd', this.controlPointsToSVG(bottomPart) );
    }

  }
  draw(){

    //update graphic elements attr
    this.drawMainWave();
    this.drawStrokeWave();

  }

  //populate DOM method
  createSVG(){

    this.setSize();

    this.wrapper = document.createElement('div');
    //create SVG
    this.svg = document.createElementNS(NS,'svg');

    this.updateSVGSize();
    //set CSS
    this.container.style.position = 'relative';


    this.wrapper.style.position='absolute';
    this.wrapper.style.width='100%';
    this.wrapper.style.height='100%';
    this.wrapper.style.top='0';
    this.wrapper.style.left='0';
    this.wrapper.style.display='flex';
    this.wrapper.style.alignItems='center'

    this.svg.style.position='absolute';
    this.svg.style.left=0;
    this.svg.style.width='100%';

    this.fill = this.setFill(this.fill);

    //populate DOM
    this.container.appendChild(this.wrapper);
    this.wrapper.appendChild(this.svg);

    //create wave path
    this.topWave = document.createElementNS(NS,'path');
    this.bottomWave = document.createElementNS(NS,'path');
    this.mainWave = document.createElementNS(NS,'path');

    //set graphic attributes
    this.mainWave.setAttributeNS(null,'fill', this.fill);

    this.topWave.setAttributeNS(null, 'stroke-width', this.strokeWidth);
    this.topWave.setAttributeNS(null, 'stroke', this.strokeColor);
    this.topWave.setAttributeNS(null, 'fill', 'transparent');

    this.bottomWave.setAttributeNS(null, 'stroke-width', this.strokeWidth);
    this.bottomWave.setAttributeNS(null, 'stroke', this.strokeColor);
    this.bottomWave.setAttributeNS(null, 'fill', 'transparent');

    //populate DOM
    this.svg.appendChild(this.topWave);
    this.svg.appendChild(this.mainWave);
    this.svg.appendChild(this.bottomWave);


    //set Events
    window.addEventListener('resize', this.onResize.bind(this) );
  }

  //core
  init(){
      this.createSVG();
      this.draw();

      if(this.animated){
        this.updateControlPoints();
      }

      //setup View scrop to stop animation when svg is out of viewport
      (new ViewScope({
        container:this.container,
        onViewEnter: () => {
          if(this.animated){ this.updateControlPoints(); }
          this.onEnter();
        },
        onViewExit: () => {
          this.tween?.kill();
          this.onExit();
        }
      })).init();
  }



}
