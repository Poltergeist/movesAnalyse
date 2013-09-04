var express = require('express'),
  levelup = require('level'),
  db = levelup('./mydb'),
  Moves = require('moves'),
  fs = require('fs'),
  config = require('./config.js'),
  moves = new Moves(config),
  token = {},
  app = express(),
  getCrapDate = function(date){
    return date.getFullYear() +
      ('0' + (date.getMonth()+1)).slice(-2) +
      ('0' + date.getDate()).slice(-2);
  },
  refreshData = function(){
    var startDate = "20130713",
    month, year, date, dates = {}, start, end, total = {},
    today = new Date();
    db.get('token', function(err, value){
      if(err){
        return moves.authorize({
            scope: ['activity', 'location']
            //state: 'my_state' //optional state as per oauth
        }, res);
      }
      token = JSON.parse(value);
      month = startDate.slice(4,6) - 1;
      month = month.length > 1 ? month : ""+0+month;
      year = startDate.slice(0,4);
      date = startDate.slice(6,8);
      date = date.length > 1 ? date : ""+0+date;
      dates.start = new Date(year,month,date);
      dates.end = new Date ( dates.start*1 + (1000*60*60*24*6));
      while(dates.end < today){
        start = getCrapDate(dates.start);
        end = getCrapDate(dates.end);
        console.log(start, end);
        moves.get('/user/storyline/daily?from='+start+'&to='+end, token.access_token, function(error, response, body) {
            data = JSON.parse(body);
          data.forEach(function(value, index){
            value.segments.forEach(function(value, index){
              var start, end;
              if(value.type == 'place'){
                if(!total[value.place.name]){
                  total[value.place.name] = 0
                }
                foo = value.startTime;
                start = new Date(foo.slice(0, 4), foo.slice(4, 6) - 1, foo.slice(6, 8), foo.slice(9, 11), foo.slice(11, 13), foo.slice(13, 15))
                foo = value.endTime;
                end = new Date(foo.slice(0, 4), foo.slice(4, 6) - 1, foo.slice(6, 8), foo.slice(9, 11), foo.slice(11, 13), foo.slice(13, 15))
                total[value.place.name] += ((end*1 - start)/1000/60/60);
              }
            });
          });
          db.put('total', JSON.stringify(total));
        });
        dates.start = new Date(dates.end*1 + (1000*60*60*24) );
        dates.end = new Date ( dates.start*1 + (1000*60*60*24*6));
      }
    });
  };

console.log();
app.get('/', function(req, res){
  db.get('token', function(err, value){
    if(err){
      return moves.authorize({
          scope: ['activity', 'location']
          //state: 'my_state' //optional state as per oauth
      }, res);
    }
    token = JSON.parse(value);
    res.redirect('/refresh');
  });
});
app.get('/redirect', function(req, res){
  var code = req.query.code;
  //res.send(req.query.code);
  moves.token(code, function(error, response, body) {
    token = JSON.parse(body);
    db.put('token', body, function(err){
      if(err){
        console.log('could not store token');
      }
    });
    console.log(typeof(token));
    res.redirect('/story');
    res.send('done'+ token);
    //moves.get('/user/profile', function(error, response, body) {
      //res.send(body);
    //});
  });
});
app.get('/token', function(req, res){
  console.log(token.access_token);
  moves.token_info(token.access_token, function(err, response, body){
    console.log(res);
    console.log(body);
    res.send(body);
  });
});
app.get('/profile', function(req, res){
  console.log(token.access_token);
  moves.get('/user/profile', token.access_token, function(error, response, body) {
    db.put('profile', body, function(err){
      if(err){
        console.log('could not store profile');
      }
    });
    res.send(body);
  });
});
app.get('/story', function(req, res){
  var startDate = "20130713",
  month, year, date, dates = {}, start, end, total = {},
  today = new Date();
  if(!token.access_token){
    res.redirect('/');
  }
  month = startDate.slice(4,6) - 1;
  month = month.length > 1 ? month : ""+0+month;
  year = startDate.slice(0,4);
  date = startDate.slice(6,8);
  date = date.length > 1 ? date : ""+0+date;
  dates.start = new Date(year,month,date);
  dates.end = new Date ( dates.start*1 + (1000*60*60*24*6));
  while(dates.end < today){
    start = getCrapDate(dates.start);
    end = getCrapDate(dates.end);
    getAll = function(start, end){
    moves.get('/user/storyline/daily?from='+start+'&to='+end, token.access_token, function(error, response, body) {
        data = JSON.parse(body);
            console.log(start, end, "calc");
            fs.writeFile("export/"+start+end+".json", body, function(err){
              if(err){
                console.log(err);
                return;
              }
              console.log(start+end+"writte");
            })

      data.forEach(function(value, index){
        value.segments.forEach(function(value, index){
          var start, end;
          if(value.type == 'place'){
            if(!total[value.place.name]){
              total[value.place.name] = 0
            }
            foo = value.startTime;
            start = new Date(foo.slice(0, 4), foo.slice(4, 6) - 1, foo.slice(6, 8), foo.slice(9, 11), foo.slice(11, 13), foo.slice(13, 15))
            foo = value.endTime;
            end = new Date(foo.slice(0, 4), foo.slice(4, 6) - 1, foo.slice(6, 8), foo.slice(9, 11), foo.slice(11, 13), foo.slice(13, 15))
            total[value.place.name] += ((end*1 - start)/1000/60/60);
          }
        });
      });
      db.put('total', JSON.stringify(total));
    });
    };
    getAll(start, end);
    dates.start = new Date(dates.end*1 + (1000*60*60*24) );
    dates.end = new Date ( dates.start*1 + (1000*60*60*24*6));
  }
  console.log(total, 'total');


  db.get('profile', function(err, value){
    if(!err){
      value = JSON.parse(value)
      res.send(JSON.stringify(total) + value.profile.firstDate);
    }
    res.send(JSON.stringify(total));
  });

});
app.get('/places', function(req, res){
  if(!token.access_token){
    res.redirect('/');
  }
  moves.get('/user/places/daily?from=20130713&to=20130719', token.access_token, function(error, response, body) {
    res.send(body);
  });
});
app.get('/locs', function(req, res){
  var locs = [];
  if(!token.access_token){
    res.redirect('/');
  }
  moves.get('/user/storyline/daily?from=20130713&to=20130719', token.access_token, function(error, response, body) {
    var data = JSON.parse(body);
    data.forEach(function(value, index){
      value.segments.forEach(function(value, index){
        console.log(value);
        if(value.place && value.place.location){
          locs.push(value.place);
        }
      });
    });
    res.send(locs);
  });
});
app.get('/total', function(req, res){
  db.get('total', function(err, value){
    console.log(req);
    res.send(value);
  });
});
app.get('/db', function(req, res){
  db.get('20*', function(err, value){
    res.send(err+' '+value);
  });
});
app.get('/refresh', function(req, res){
  console.log(token);
  moves.refresh_token(token.refresh_token, function(error, response, body) {
    token = JSON.parse(body);
    db.put('token', body, function(err){
      if(err){
        console.log('could not store token');
      }
    });
    console.log(typeof(token));
    res.redirect('/story');
    res.send('done'+ token);
  });
});
refreshData();
app.listen(3000);
console.log('Listening on port 3000');
