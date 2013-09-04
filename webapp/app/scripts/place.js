var Place = new Model({
  init: function(location, color){
    this.location = location;
    this.visits = [];
    this.color = color;
  },
  addVisit: function(start, end){
    var exists = false;
    start = this.convertDateString(start);
    end = this.convertDateString(end);

    this.visits.forEach(function(value, index){
      if(value.start*1 == start*1 && end*1 == value.end*1){
        exists = true;
      }
    });
    if(!exists){
      this.visits.push(new Visit(start, end));
    }
  },
  convertDateString: function(foo){
    return new Date(foo.slice(0, 4), foo.slice(4, 6) - 1, foo.slice(6, 8), foo.slice(9, 11), foo.slice(11, 13), foo.slice(13, 15));
  },
  getTotalTime: function(){
    var total = 0;
    this.visits.forEach(function(value, index){
      total += value.getTime();
    });
    return total;
  },
  getDataFromDay: function(date){
    var data = [],
      end = new Date( date*1 + (1000*60*60*24));
    this.visits.forEach(function(value, index){
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
