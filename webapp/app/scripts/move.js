var Move = new Model({
  init: function(color){
    this.activity = [];
    this.color = color;
  },
  addActivity: function(start, end){
    this.activity.push(new Visit(this.convertDateString(start), this.convertDateString(end)));
  },
  convertDateString: function(dateString){
    return new Date(dateString.slice(0, 4), dateString.slice(4, 6) - 1, dateString.slice(6, 8), dateString.slice(9, 11), dateString.slice(11, 13), dateString.slice(13, 15));
  },
  getTotalTime: function(){
    var total = 0;
    this.activity.forEach(function(value, index){
      total += value.getTime();
    });
    return total;
  },
  getDataFromDay: function(date){
    var data = [],
      end = new Date( date*1 + (1000*60*60*24));
    this.activity.forEach(function(value, index){
      var item;
      if(( value.start > date && value.start < end  )||( value.end > date && value.end < end)){
        item = {
          start: value.start,
          end: value.end,
          color: this.color

        };
        data.push(item);
      }
    }, this);
    return data;
  }

});
