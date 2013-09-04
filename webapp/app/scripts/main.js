var app, graph;
$.ajax('/export/all.json').success(function(data){
  app = new App(data);
  graph = new Graph(app.getShares());
  app.drawDays();
});

