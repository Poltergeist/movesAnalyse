var Graph = new Model({

  init: function(data){
    var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2,
      arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0),
      pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.share; }),

      svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "graph")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
      g;

      data.forEach(function(d){
        d.time = +d.time;
      });
      g = svg.selectAll(".arc")
          .data(pie(data))
        .enter().append("g")
          .attr("class", "arc");

      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return d.data.color; });

      g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d)+ ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.name; });
      data.forEach(function(value, index){
        $('.list').append($('<div>'+value.name+': '+(value.time / 1000 / 60 / 60).toFixed(2)+' Std. (' + value.share.toFixed(2)+'%)</div>').css('background',value.color).css('width', value.share+"%"));

      });
  }
});
