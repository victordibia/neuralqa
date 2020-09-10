import React, { Component } from "react";
// import { Tabs, Tab } from "carbon-components-react";
import * as d3 from "d3";
import "./testview.css";
// import csvdata from "./aapl.csv";

class TestView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.data = this.data || props.data;

    this.state = {
      data: this.data,
      svgPath: "",
    };

    this.minChartWidth = 1600;
    this.minChartHeight = 210;
    this.barWidth = 20;

    this.numTicks = 40;
    this.xTicks = 7;
    this.brushHeight = 60;
  }

  getLabel(d, i) {
    return i + "*.*" + d.token + " *.* (" + d.gradient.toFixed(2) + ")";
  }

  componentDidUpdate(prevProps, prevState) {
    this.data = prevProps.explanationData;

    if (
      prevProps.explanationData &&
      prevProps.explanationData.answer !== this.state.data.answer
    ) {
      console.log("updating .. ", this.data);
      this.updateGraph(this.data.gradients);
      this.setState({
        data: prevProps.explanationData,
      });
    }
  }

  setupScalesAxes(data) {
    // console.log(this.minChartWidth);

    let self = this;
    this.chartMargin = { top: 10, right: 15, bottom: 15, left: 20 };
    this.chartWidth =
      this.minChartWidth - this.chartMargin.left - this.chartMargin.right;
    this.chartHeight =
      this.minChartHeight - this.chartMargin.top - this.chartMargin.bottom;
    this.xScale = d3
      .scaleBand()
      .domain(data.map((d, i) => self.getLabel(d, i)))
      .range([this.chartMargin.left, this.chartWidth - this.chartMargin.right]);

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.gradient)])
      .nice()
      .range([this.chartHeight, 0]);

    this.xAxis = d3
      .axisBottom(this.xScale)
      .ticks(this.xTicks)
      .tickFormat((d) => d.split("*.*")[1])
      .tickSize(0);
    this.yAxis = d3.axisRight(this.yScale).tickSize(this.minChartWidth);
  }

  updateGraph(data) {
    let self = this;
    // console.log(data[0]);
    this.setupScalesAxes(data);
    let svg = d3.select("div.barviz");

    svg
      .select("svg")
      .attr(
        "width",
        this.chartWidth + this.chartMargin.left + this.chartMargin.right
      )
      .attr(
        "height",
        this.chartHeight + this.chartMargin.top + this.chartMargin.bottom
      );

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => self.xScale(self.getLabel(d, i)))
      .attr("y", (d) => self.yScale(d.gradient))
      .attr("height", (d) => self.yScale(0) - self.yScale(d.gradient))
      .attr("width", self.xScale.bandwidth())
      .attr("class", "barrect")
      .attr("fill", (d) => "rgba(0, 98, 255, " + d.gradient + ")")
      .transition();

    svg
      .select(".x.axis")
      .call(self.xAxis)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(270)")
      .style("text-anchor", "start");
  }

  createSVGBox = (selector, height) => {
    return d3
      .select(selector)
      .append("svg")
      .attr(
        "width",
        this.chartWidth + this.chartMargin.left + this.chartMargin.right
      )
      .attr("height", height + this.chartMargin.top + this.chartMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.chartMargin.left + "," + this.chartMargin.top + ")"
      );
  };
  createBarRects = (svg, x, y, data, chartclass) => {
    svg
      .append("g")
      .attr("class", chartclass)
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => x(this.getLabel(d, i)))
      .attr("y", (d) => y(d.gradient))
      .attr("height", (d) => y(0) - y(d.gradient))
      .attr("width", x.bandwidth())
      .attr("class", "barrect")
      .attr("fill", (d) => "rgba(0, 98, 255, " + d.gradient + ")");
  };

  drawBrushGraph(data) {
    let self = this;
    const x = this.xScale;
    const y = this.yScale.copy().range([this.brushHeight, 0]);
    const mainXZoom = d3
      .scaleLinear()
      .range([0, this.chartWidth])
      .domain([0, this.chartWidth]);

    const svg = this.createSVGBox("div.d3brush", this.brushHeight);

    this.createBarRects(svg, x, y, data, "minibars");
    const brush = d3
      .brushX()
      .extent([
        [this.chartMargin.left, 0.5],
        [this.chartWidth - this.chartMargin.right, this.brushHeight],
      ])
      .on("brush", brushed);
    // .on("end", (a)=>{
    //   console.log(a)
    // });

    const defaultSelection = [x.range()[0], (x.range()[1] - x.range()[0]) / 3];
    const gb = svg.append("g").call(brush).call(brush.move, defaultSelection);

    function brushed() {
      const extentX = d3.event.selection;
      const selected = x
        .domain()
        .filter(
          (d) =>
            extentX[0] - x.bandwidth() + 1e-2 <= x(d) &&
            x(d) <= extentX[1] - 1e-2
        );

      let originalRange = mainXZoom.range();
      mainXZoom.domain(extentX);

      self.xScale.domain(data.map((d, i) => self.getLabel(d, i)));
      self.xScale
        .range([mainXZoom(originalRange[0]), mainXZoom(originalRange[1])])
        .paddingInner(0.4);

      // d3.select(".wrapperGroup").select(".x-axis")
      //     .call(mainXAxis);

      update();
      console.log("we just brushed");
    }

    function update() {
      const x = self.xScale;
      const y = self.yScale;
      const svg = d3.select("div.barviz");

      svg
        .selectAll("rect")
        .data(self.data.gradients)
        .join("rect")
        .attr("x", (d, i) => self.xScale(self.getLabel(d, i)))
        .attr("y", (d) => y(d.gradient))
        .attr("height", (d) => y(0) - y(d.gradient))
        .attr("width", self.xScale.bandwidth());
      // .attr("class", "barrect")
      // .attr("fill", (d) => "rgba(0, 98, 255, " + d.gradient + ")");
      // .data(data, d => d.dayCount)
      // .attr("x", d => mainXScale(d.x))
      // .attr("y", d => mainHeight - mainYScale(d.y))
      // .attr("width", mainXScale.bandwidth())
      // .attr("height", d => mainYScale(d.y));

      // function customXAxis(g) {
      //   g.call(self.xAxis);
      //   g.select(".domain").remove();
      //   g.selectAll(".tick line").attr("x", 10);
      //   g.selectAll(".tick text").attr("y", 10);
      // }

      // svg.select(".x.axis").call(customXAxis);
    }

    function brushended({ selection }) {
      if (!selection) {
        gb.call(brush.move, defaultSelection);
      }
    }
    // const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -1)), x.range()[1]];
  }

  drawGraph(data) {
    let self = this;
    // data = data.slice(0, 85);
    this.setupScalesAxes(data);
    const x = this.xScale;
    const y = this.yScale;

    const svg = this.createSVGBox("div.barviz", this.chartHeight);

    const zoomer = d3.zoom().on("zoom", null);
    svg
      .call(zoomer)
      .on("wheel.zoom", scroll)
      .on("mousedown.zoom", null)
      .on("touchstart.zoom", null)
      .on("touchmove.zoom", null)
      .on("touchend.zoom", null);

    function scroll() {
      // const gBrush = d3.select(".brush");
      // let selection = d3.brushSelection(gBrush.node());
      // let size = selection[1] - selection[0],
      //   range = x.range(), //otodo change this to minx
      //   x0 = d3.min(range),
      //   x1 = d3.max(range) + x.bandwidth(),
      //   dx = -d3.event.deltaX,
      //   topSection;
      // if (selection[0] - dx < x0) {
      //   topSection = x0;
      // } else if (selection[1] - dx > x1) {
      //   topSection = x1 - size;
      // } else {
      //   topSection = selection[0] - dx;
      // }
      // d3.event.stopPropagation();
      // d3.event.preventDefault();
      // gBrush.call(brush.move, [topSection, topSection + size]);
    }

    this.createBarRects(svg, this.xScale, this.yScale, data, "mainbars");

    function customYAxis(g) {
      g.call(self.yAxis);
      g.select(".domain").remove();
      g.selectAll(".tick line")
        .attr("stroke", "rgba(172, 172, 172, 0.74)")
        .attr("stroke-dasharray", "2,2");
      g.selectAll(".tick text").attr("x", -20).attr("y", -0.01);
    }

    function customXAxis(g) {
      g.call(self.xAxis);
      g.select(".domain").remove();
      g.selectAll(".tick line").attr("x", 10);
      g.selectAll(".tick text").attr("y", 10);
    }

    // svg
    //   .append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + this.chartHeight + ")")
    //   .call(customXAxis)
    //   .selectAll("text")
    //   .attr("y", 0)
    //   .attr("x", 9)
    //   .attr("dy", ".35em")
    //   .attr("transform", "rotate(270)")
    //   .style("text-anchor", "start");

    svg.append("g").call(customYAxis);
  }

  componentDidMount() {
    let barvizElement = document.getElementById("barviz");
    barvizElement.style.width = barvizElement.offsetWidth + "px";
    this.minChartWidth = barvizElement.offsetWidth;
    console.log(barvizElement.offsetWidth);
    this.drawGraph(this.data.gradients);
    this.drawBrushGraph(this.data.gradients);
  }

  render() {
    return (
      <div className="  ">
        <div className=" ">
          <div id="barviz" className="barviz scrollwindow"></div>
          <div id="d3brush" className="d3brush"></div>
        </div>
      </div>
    );
  }
}

export default TestView;
