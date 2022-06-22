
(function( $ ){


    $.prototype.shrink = function(param = {}){

      const min = param.min || 0;
      const max = param.max || 2;
      const delay = param.delay || 0;
      const speed = param.speed || 200;
      const easing = param.easing || 'ease';

      this.each(function(index){
          $(this).css({transition:'transform '+ speed/1000 +'s '+ easing});
          setTimeout(() => $(this).css({transform:'scale('+ max +')'}), delay*index);
          setTimeout(() => $(this).css({transition:''}),speed+delay*index);
      });

    }



})(jQuery);
