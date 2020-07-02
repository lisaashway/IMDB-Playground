
//create svg sizes
var svgWidth = 800;
var svgHeight = 650;

//create margins for chart
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 60
};

//calculate width and height of chart based on svg sizes and margin sizes
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//create an SVG wrapper, append an SVG element that will hold the scatter plot, and add in svg sizes.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//create group and move entire svg to margin locations
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "metascore";

// function used for updating x-scale var upon click on axis label
function xScale(movieData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(movieData, d => d[chosenXAxis]))
    .range([0, width]);

  return xLinearScale;
}

// function used for updating x-axis  
function renderAxes(newXScale, xAxis) {
  
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//function used to update circle labels 
function renderCircleLabels(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//function used to update circle locations
function renderCircles(circleLabels, newXScale, chosenXAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circleLabels;
}

//import Data
d3.csv("assets/data/data.csv").then(function(movieData) {

    // turn strings read from csv into numbers for revenue and metascore
    movieData.forEach(function(data) {
      data.revenue = +data.revenue;
      data.metascore = +data.metascore;
      data.votes = +data.votes;
    });

    // create scaling functions based off of data
    var xLinearScale = xScale(movieData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(movieData, d => d.revenue))
      .range([height, 0]);

    // create axes from scaling functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    //create function to scale colors to revenue amounts
    var myColor = d3.scaleLinear().domain(d3.extent(movieData, d=> d.revenue))
    .range(["#44D1C8", "#FF5CDA"])

    //create circles from metascore/revenue
    var circlesGroup = chartGroup.selectAll("circle")
    .data(movieData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.revenue))
    .attr("r", "12")
    .attr("fill", d => myColor(d.revenue))
    .attr("opacity", ".9");

    //add text from rating to circles
    var circleLabels = chartGroup.selectAll("null")
      .data(movieData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.revenue)+4)
      .text(d => d.rating)
      .attr("font-family", "sans-serif")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    // create tooltip pop-up
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -100])
      .html(function(d) {
        return (d.title +
        "<br>Year: " + d.year + 
        "<br>Revenue: $" + d.revenue + " Million" +
        "<br>Metascore: " + d.metascore +
        "<br>Votes: " + d.votes +
        "<br>Rating: " + d.rating + 
        "<br>Actors: " + d.actors);
      });

    // adding tooltop to chartGroup
    chartGroup.call(toolTip);

    // create event listener for pop-up on mouse-over
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // hide when mouse moves away
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // create y axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 5)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Revenue (in Millions)");


      //create group for x axes
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
      //metascore x axis label
    var metascoreLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "metascore") //event listener value
      .classed("active", true)
      .text("IMDB Metascore");
      //votes x axis label
    var votesLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "votes") //event listener value
      .classed("inactive", true) 
      .text("Number of IMBD Votes");

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(movieData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates circle labels with new x values
          circleLabels = renderCircleLabels(circleLabels, xLinearScale, chosenXAxis);

          // change axis to bold text when selected
          if (chosenXAxis === "votes") {
            votesLabel
              .classed("active", true)
              .classed("inactive", false);
            metascoreLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            votesLabel
              .classed("active", false)
              .classed("inactive", true);
            metascoreLabel
              .classed("active", true)
              .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
