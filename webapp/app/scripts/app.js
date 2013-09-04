var App = new Model({
  init: function(data){
    this.data = data;
    this.places = {};
    colorOffset = 0;
    data.forEach(function(value, index){
      var name;
      value.segments.forEach(function(value, index){
        if(value.type == 'move'){
          if(!this.places.moves){
            this.places.moves = new Move('hsl('+colorOffset+', 100%, 50%)');
            colorOffset += 70;
            if(colorOffset >= 360){
              colorOffset = 10;
            }
          }
          this.places.moves.addActivity(value.startTime, value.endTime);
          return;
        }
        name = value.place.name;
        name = name == 'Home' || name == 'Work' ? name : 'Other';
        if(!this.places[name]){
          this.places[name] = new Place(value.place.location,'hsl('+colorOffset+', 100%, 50%)');
          colorOffset += 70;
          if(colorOffset >= 360){
            colorOffset = 10;
          }
        }
        this.places[name].addVisit(value.startTime, value.endTime);
      }, this);
    }, this);
  },
  getShares: function(){
    var value, key, total = [], totalTime = 0;
    for(key in this.places){
      value = this.places[key];
      totalTime += value.getTotalTime();
      total.push({ name: key, time: value.getTotalTime(), color: value.color});
    }
    total.forEach(function(value, index){
      total[index].share = total[index].time/totalTime * 100;
    });
    total.sort(function(a, b){
      return b.share - a.share;
    })
    return total;
  },
  getDay: function(date){
    var data = {},
    temp;
    for(key in this.places){
      temp = this.places[ key ].getDataFromDay(date);
      if(temp.length > 0)
        data[ key ] = temp
    }
    return data
  },
  drawDays: function(){
    var earliest,
      latest,
      date,
      data,
      key,
      items,
      ele = $('<div class="dailies chronic"><div class="control"><span class="active" data-switch="chronic ">chronic</span> <span data-switch="aggregate">aggregate</span></div></div>'),
      day;
      ele.find('span').click(function(event){
        var element = $(event.currentTarget);
        ele.find('.active').removeClass('active');
        element.addClass('active');
        ele.removeClass("chronic aggregate").addClass(element.attr('data-switch'));

      });
    for(key in this.places){
      if(this.places[key].visits){
        items = this.places[key].visits;
      }else{
        items = this.places[key].activity;
      }
      items.forEach(function(value, index){
        if(!earliest){
          earliest = value.start;
        }
        if(!latest){
          latest = value.end;
        }
        if(earliest > value.start){
          earliest = value.start;
        }
        if(latest < value.end){
          latest = value.end;
        }
      });
    }
    date = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate());
    data = this.getDay(date);
    date = new Date( date*1 );
    $('body').append(ele);
    while(date < latest){
      day = $('<div class="day"></div>');
      day.attr('data-date', date.toDateString());
      for(var key in data){
        data[key].forEach(function(value, index){
          var time,
          block = $('<div></div>');
          left = 0,
          width = 0;
          if(value.start < date){
            value.start = date;
          }
          if(value.end > date * 1 + (1000*60*60*24)){
            value.end = new Date(date * 1 + (1000*60*60*24));
          }
          left += value.start.getHours()*40;
          left += value.start.getMinutes() / 60 * 40;
          width = (( value.end*1 - value.start ) / 1000 / 60 / 60 ) * 40;
          block.width(width);
          block.css('left', left);
          block.css('background', value.color)
          day.append(block);

        });
      }


      //ele.append($('<h2>'+date.toDateString()+'</h2>'));
      ele.append(day);
      date = new Date(date*1 + (24*60*60*1000));
      data = this.getDay(date);
    }
  },
  getCrapDate: function(date){
    return date.getFullYear() +
      ('0' + (date.getMonth()+1)).slice(-2) +
      ('0' + date.getDate()).slice(-2);
  }



});
