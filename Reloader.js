
class PROCESS_SCRIPT{

  constructor(){
    this.scripts = null;
  }

  grab(blob){
    this.scripts = blob.find('script').clone();
    blob.find('script').remove();
    return blob;
  }

  paste(){
    if(this.scripts){ return this.scripts; }
  }

  reset(){
    this.scripts = null;
  }

}


export default class RELOADER{

  /*
    v.1.8
    RELOADER send parameters to a PHP filter, retrieve the result and append it smoothly in the target div
    RELOADER also update de window.location.href
  */


  constructor(rel){

    //DOM related
    this.target = rel.target || "body";                   //OBJECT    : will look for this specific div in the ajax return
    this.selector = rel.selector || "*";                  //STRING    : Class or elements to replace the attribute
    this.attr = rel.attr || "href";                       //STRING    : Attribute to look for and replace (href, onclick, on dblclick)

    //Events / animations related
    this.callback = rel.callback || null;                 //ARRAY     : will call the callbacks after the childs being appened (useful for events or masonry)
    this.opening = rel.opening || null;                   //PROMISE     : Array made of PROMISES, acts as a "curtain", it's a function of transition between state A and B (like a loader...)
    this.closing = rel.closing || null;                   //FUNCTION     : Array made of PROMISES, acts as a "curtain", it's a function of transition between state A and B (like a loader...)

    //AJAX related
    this.ajaxSource = rel.ajaxSource || "./index.php";    //STRING    : Default file to GET/POST
    this.ajaxMethod = rel.ajaxMethod || "GET";            //STRING    : Default method
    this.ajaxParams = rel.ajaxParams || {};               //STRING    : Default and persistent parameters added on top of the request
    this.rewriteRule = rel.rewriteRule || null;           //STRING    : PHP file that handles url rewriting (replace url with correct rewrite rule ex ?param=1 => /param/1 )

    this.percent = 0;
    this.percentage = rel.percentage || null;                            //FUNCTION  : expression where the percentage value has to take action. ex: function(val){ return $(selector).css({width:val + "%"});  }

    if(this.callback){ this.callback = (Array.isArray(this.callback)  == false) ? Array(this.callback) : this.callback; }
    //if(this.opening){ this.opening = (Array.isArray(this.opening)  == false) ? Array(this.opening) : this.opening; }
    if(this.closing){ this.closing = (Array.isArray(this.closing)  == false) ? Array(this.closing) : this.closing; }

    this.target =   (Array.isArray(this.target)  == false) ? Array(this.target) : this.target;
    this.attr =     (Array.isArray(this.attr)  == false) ? Array(this.attr) : this.attr;
    this.selector = (Array.isArray(this.selector)  == false) ? Array(this.selector) : this.selector;

    this.replace();
    this.setEvent();

  }

  setEvent(self = this){

    $("body").on("reloaded",function(){ self.replace(); });
    $(window).on("popstate",function(event){ window.location.reload(); });

  }


  replace(self = this){

    for(const slc of this.selector){

      var allElements = document.body.querySelectorAll(slc);
      for (const element of allElements) {
        for(const a in this.attr){
          if ( element.getAttributeNode(this.attr[a]) != null) {

            //exception event if on dblclick else -> click
            let $type = (element.getAttributeNode('ondblclick')) ? 'dblclick' : 'click';
            let value = element.getAttributeNode(this.attr[a]).value;

              /*clean up attribute (in case there's window.location or others...)*/
              value = value.split(/(http[^']+)/);
              for(const v in value){
                if(value[v].search("http") == 0){ value = String(value[v]); }
              }

              let new_url = undefined;
              try{
                new_url = new URL(value);
              }catch(_){
                console.warn("Invalid URL : "+ new_url + " for elements :" );
                console.log(element);
              }finally{
                if(new_url != undefined){

                  element.removeAttribute(this.attr[a]);
                  $(element).unbind($type).on($type,function(){
                    if(self.opening){
                      $.when(self.opening()).then( () => {self.redirect({url:value});});
                    }else{
                      console.log('no opening');
                      self.redirect({url:value});
                    }

                  });

                }else{
                  console.log("Bad url : " + value);
                }
              }


          }

        }//attr

      }


    }

  }

  close(){

    //call callbacks
    if(this.closing){  for(const cl of this.closing){ cl(); }  }
    if(this.callback){ for(const c of this.callback){ c();  }  }

    //reset percentage
    this.percent = 0;
    if(this.percentage){ this.percentage(this.percent); }

    //trigger event "reloaded"
    $("body").trigger("reloaded");

  }


  loadMedia(blob, selector){

      const self = this;
      const MEDIAS = 'img, video, audio';
      const all_medias = $(blob).find(MEDIAS);
      var arrayMedia = [];
      all_medias.each(function(){ arrayMedia.push(this); });

      var checkedPic = 0;
      var validPic = 0;

      function check(array){
          if( checkedPic < array.length){
              const src = array[checkedPic].getAttribute('src');
              $.get(src)
                      .done( () => {
                        //console.log({id:checkedPic, src:array[checkedPic].getAttribute('src'), state:'loaded'});
                        checkedPic++;
                        if(src != '' && src != " " && src != null){ validPic++ };
                      })
                      .fail( () => {
                        //console.log({id:checkedPic, src:array[checkedPic].getAttribute('src'), state:'error'});
                        checkedPic++;
                      })
                      .always( () =>{
                        check( array );
                        self.percent = (checkedPic*100)/array.length;
                        if(self.percentage){ self.percentage(self.percent); }
                        if(checkedPic == array.length -1){ $(selector).animate({opacity:1},200,function(){ self.close(); }); }
                      });
          }
      }

      check( arrayMedia );

  }

  populate(data,selector,self = this){

    const MEDIAS = 'img, video, audio';
    let convert = $("<div/>").append( data );
    let $mother = null; //retrieve the "mother container" = the container containing the childs to append

    /*
                        [convert]                               [convert]
                        +--------------------+                +--------------------+
                        |    [selector]      |                |     [child]        |                        [child]
    Result can          |    +-----------+   |                |     [child]        |                        [child]
    be nested within    |    | [child]   |   |                |     [child]        |                        [child]
    selector already :  |    | [child]   |   |   or simply :  |     [child]        |    what we want is :   [child]
                        |    | [child]   |   |                |                    |                        [child]
                        |    | [child]   |   |                |                    |
                        |    +-----------+   |                |                    |
                        |                    |                |                    |
                        +--------------------+                +--------------------+

      => So :
    */

    if( $(convert).find(selector).length == 0 ){  $mother = $(convert); }
    else{  $mother = $(convert).find(selector); }

    let totalElement = 0;
    let loadedElt = 0;

    //filter medias without source or that doesn't exists
    let $medias= $mother.find(MEDIAS);

    //load media
    this.loadMedia(data, selector);

    //append
    try{
      $(selector).append( $mother.children() );   //append children to target
    }catch(_){}
    
    $(convert).remove();                        //remove mock


  }

  redirect(redir,self = this){

    let url = new URL(redir.url) || null;
    let parameters = redir.parameters || {};
    let attr_param = (url) ? url.searchParams.entries() : null;
    let reloadHref = redir.reloadHref || true;
    let obj = {};

    /**
    *Set parameters
    **/
    obj = Object.assign({}, this.ajaxParams, parameters);
    //set url parameters (href/onclick) URL to Ajax parameters ( ?param=A => {param:A} )
    if(attr_param){
      for(const p of attr_param){
        obj[p[0]] = p[1];
      }
    }

    $.ajax({
      url:self.ajaxSource,
      method:self.ajaxMethod,
      data:obj,
      datatype:'json',
      success:function(data){
        //update URL

        if(self.rewriteRule && reloadHref && redir.url){
          $.post(self.rewriteRule,obj).done( (newUrl) => { window.history.pushState({},'',newUrl); } );
        }else{
          const pushUrl = (url.search != '') ? url.search : url.pathname;
          if(reloadHref && redir.url){window.history.pushState({},'',pushUrl);}
        }


        //populate targeted div
        for(const target of self.target){

            $(target).animate({opacity:0},200, () => {
              $(target).children().remove();
              self.populate(data,target);
            });
        }
      }
    });

  }


}
