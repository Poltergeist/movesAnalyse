var Visit = new Model({
  init: function(start, end){
    this.start = start;
    this.end = end;
  },
  getTime: function(){
    return this.end*1 - this.start;
  }
});
