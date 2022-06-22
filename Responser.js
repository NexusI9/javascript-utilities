export default class RESPONSER{

  /*
  #
  #
  #Check media queries and execute given callback
  #v.1.1
  #

  */



  constructor(){ this.query_array = []; }

  toArray(vr){ return (Array.isArray(vr)  == false) ? Array(vr) : vr; }

  addMediaQuery(query, callback = null, flag=null){
    /*
    query  {
        maxWidth: (int),
        minWidth: (int),
        unit: (str, defult : px),
      }

    callback      FN/ ARRAY containing callback functions taking effects on window matches
    flag          STRING return a flag when matches taking effect (useful to detect which screen size);

    */

    if(callback == null){ return; }

    query = (typeof query == 'object') ? this.objectToQuery(query) : query;
    callback = this.toArray( callback );

    window.matchMedia( query ).addEventListener('change', (e) => {
      if(e.matches){
        for(const cb of callback){ cb(); }
      }
    });

    this.query_array.push({ query: query, callback: callback, flag:flag });

  }

  checkQuery(){
    var callback = null;

    if(this.query_array.length == 0){ return; }

    this.query_array.forEach((Query) => {
      if(window.matchMedia(Query.query).matches){
        for(const cb of Query.callback){ cb(); }
      }
    });

    return callback;

  }

  getFlag(){

    var flag = null;

    if(this.query_array.length == 0){ return; }

    this.query_array.forEach((Query) => {
      if(window.matchMedia(Query.query).matches){ flag = Query.flag;  }
    });

    return flag;

  }


  objectToQuery(mql){

    var req = [];

    mql.unit = (mql.unit == null) ? 'px' : mql.unit;
    if(mql.minWidth){ req.push( "(min-width:"+mql.minWidth+mql.unit+")" ); }
    if(mql.maxWidth){ req.push( "(max-width:"+mql.maxWidth+mql.unit+")" ); }

    if(req.length > 1){ req = req.join(' and '); }
    else{ req = req.join(''); }

    return req;

  }


}
