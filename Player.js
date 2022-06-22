export class PLAYER{

  playset;
  player_html = `
  <section class="player menu">
      <div id="player_screen" class="XP_glow">
        <span id="player_eq_circle"></span>
        <section><span id="player_disc"></span>
        <p>Title_of_sound_file.mp3</p>
        </section>
        <p>30.3kb</p>
        <p style="float:right;">00.30 : 20.30</p>
      </div>

        <span id="player_skin"></span>

        <section id="player_flex">
          <div id="player_control" class="controls">
            <span id="player_play" class="ico"></span>
          </div>

          <div id="player_playbar" class="controls">
            <span id="player_bar"></span>
            <span id="player_dot"></span>
          </div>

          <div id="player_volume" class="controls">
            <span id="player_potar" class="ico"></span>
          </div>

          <div id="player_quit" class="controls">
            <span class="quit ico"></span>
            <span class="share ico"></span>
          </div>
        </section>

  </section>`;


  new_player;

  boundBar;
  boundBar_offset;
  playerDot;
  playerDot_offset;
  playerPotar;
  potarLvl;
  playerBar;


  audio;
  audioDuration = "0.00";

  count = setInterval(() => {
    this.new_player.find("#player_screen > p")[1].innerHTML =  Math.round(this.audio.currentTime/60*100)/100 + " : " + this.audioDuration;
    this.new_player.find("#player_dot").css({left:this.convert_slide(this.audio.currentTime,[0,this.audio.duration],[this.boundBar.x-this.boundBar_offset,this.boundBar.x + this.boundBar.width - this.boundBar_offset])});
  },50);

  mouseMoveDot = (e) => {

    let newPos = e.clientX - this.playerDot_offset;
    if(newPos <= this.boundBar.x-this.boundBar_offset){ newPos = this.boundBar.x - this.boundBar_offset + 0.1;}
    if(newPos >= this.boundBar.x + this.boundBar.width - this.boundBar_offset - this.playerDot.width()){ newPos = this.boundBar.x + this.boundBar.width - this.boundBar_offset - this.playerDot.width() - 0.1;}

    this.playerDot.css({ left: newPos  });

    let newTime = this.convert_slide(newPos,[this.boundBar.x-this.boundBar_offset,this.boundBar.x + this.boundBar.width - this.boundBar_offset - this.playerDot.width()],[0,this.audio.duration]);
    if(this.audio.currentTime != newTime){ this.audio.currentTime = newTime; }
    this.new_player.find("#player_screen > p")[1].innerHTML =  Math.round(this.audio.currentTime/60*100)/100 + " : " + this.audioDuration;

  }
  potar = (e) => {

    let iniPos = -1*(this.playerPotar.offset().left + this.playerPotar.width()/2 - e.clientX);
    this.potarLvl += iniPos/10;
    let audioVolume = (this.potarLvl + 120) / (2*120) ;

    if(this.potarLvl <= -120){ this.potarLvl = -120 + 0.1; }
    if(this.potarLvl >= 120){ this.potarLvl = 120 - 0.1; }

    if(audioVolume <= 0){ audioVolume = 0; }
    if(audioVolume >= 1){ audioVolume = 1; }

    this.playerPotar.css({transform:"rotate("+this.potarLvl+"deg)"});
    this.audio.volume = audioVolume;

  }

  constructor(ps){

    this.playset = {
      pause_button: ps["pause_button"] || "",
      play_button:  ps["play_button"] || "",
    }

    clearInterval(this.count);
  }

  pop(pp){

    this.playset["url"] = pp["url"];
    this.playset["title"] = pp["url"].split("/");
    this.playset["title"] = this.playset["title"][ this.playset["title"].length-1 ];
    this.audio = new Audio(this.playset["url"]);

    if($(".player").length > 0){ this.player_remove(); }
    $("body").append(this.player_html);
    this.new_player = $("body").find(".player");

    this.audio.setAttribute("preload","metadata");
    $("body").append(this.audio);

    this.boundBar = this.new_player.find("#player_bar")[0].getBoundingClientRect();
    this.boundBar_offset = this.new_player.find("#player_bar").offset().left;
    this.playerDot = this.new_player.find("#player_dot");
    this.playerDot_offset = this.playerDot.offset().left + this.playerDot.width()/2;
    this.playerPotar = this.new_player.find("#player_potar");
    this.potarLvl = 0;
    this.playerBar = this.new_player.find("#player_bar");

    this.new_player.css({opacity:1});

    getFileSize(this.playset["url"]).then(size => this.new_player.find("#player_screen > p")[0].innerHTML = Math.round(size/100000)/10+"Mb");
    this.audio.onloadedmetadata = () => {
      this.audioDuration = Math.round(this.audio.duration/60*100)/100;
      this.new_player.find("#player_screen > p")[1].innerHTML =  this.audio.currentTime*100 + " : " + this.audioDuration;
    };
    this.new_player.find("#player_screen").find("section > p").text(this.playset["title"]);


    this.set_events();
  }

  convert_slide(pos,ref,sub){

    /*    ref[0] | ref[1] | pos |
        —————————|————————|—————|
          sub[0] |  sub[1]| ?   |

          ? = pos * sub[1] / ref[1]
    */
    return pos * sub[1] / ref[1];
  }
  player_remove(){
    this.new_player.animate({bottom:-this.new_player.height()-100},600,() => {
      this.new_player.remove();
    });
  }
  set_potar(vol){
    if(vol >= 1){ vol = 1;}
    if(vol <= 0){ vol = 0;}
    let rot = vol*2*120-120;

    this.playerPotar.css({transform:"rotate("+rot+"deg)"});
    this.audio.volume = vol;

  }
  set_events(){
    //EVENTS
    this.set_potar(0.8);
    this.playerPotar.on("mousedown",() => {
        event.preventDefault();
        document.addEventListener('mousemove',this.potar);
    });
    this.playerDot.on("mousedown",(event) => {
          event.preventDefault();
          document.addEventListener('mousemove',this.mouseMoveDot);
      });
    this.playerBar.on("click",(event) => {
      this.playerDot.css({left:event.clientX-this.boundBar_offset-this.playerDot.width()/2});
      let audioValue = convert_slide(event.clientX-this.playerDot_offset,[this.boundBar.x-this.boundBar_offset,this.boundBar.x + this.boundBar.width - this.boundBar_offset - this.playerDot.width()],[0,this.audio.duration]);
      this.new_player.find("#player_screen > p")[1].innerHTML =  Math.round(audio.currentTime/60*100)/100 + " : " + this.audioDuration;
      this.audio.currentTime = audioValue;
    });
    this.new_player.find(".quit").on("click",() => {
        this.player_remove();
      });
    this.new_player.find("#player_play").on("click",() => {

        if(this.audio.paused){

          this.audio.play();
          this.new_player.find("#player_play").css({backgroundImage:"url('"+this.playset["pause_button"]+"')"});
          this.count = setInterval(() => {
            this.new_player.find("#player_screen > p")[1].innerHTML = Math.round(this.audio.currentTime/60*100)/100 + " : " + this.audioDuration;
            let newPos = this.convert_slide(this.audio.currentTime,[this.boundBar.x-this.boundBar_offset,this.boundBar.x + this.boundBar.width - this.boundBar_offset],[0,this.audio.duration]);
            this.new_player.find("#player_dot").css({left:this.convert_slide(this.audio.currentTime,[0,this.audio.duration],[this.boundBar.x-this.boundBar_offset,this.boundBar.x + this.boundBar.width - this.boundBar_offset - this.playerDot.width()])});
          },50);

        }else{
          this.audio.pause();
          this.new_player.find("#player_play").css({backgroundImage:"url('"+this.playset["play_button"]+"')"});
          clearInterval(this.count);
        }

      });

    //unload EVENTS
    $(document).on("mouseup",() => {
      document.removeEventListener("mousemove",this.mouseMoveDot);
      document.removeEventListener("mousemove",this.potar);
    });

  }








  //grab(this.new_player);

}
