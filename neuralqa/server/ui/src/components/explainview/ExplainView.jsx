import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
import * as d3 from "d3";
import "./explainview.css";

class ExplainView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.state = {
      data: this.data,
    };

    // this.minChartWidth = 1600;
    this.minChartHeight = 250;
    this.barWidth = 20;

    this.numTicks = 40;
    this.xTicks = 7;
  }

  getLabel(d, i) {
    return i + "*.*" + d.token + " *.* (" + d.gradient.toFixed(2) + ")";
  }

  setupScalesAxes(data) {
    // console.log(this.minChartWidth);

    let self = this;
    this.chartMargin = { top: 10, right: 15, bottom: 15, left: 25 };
    this.minChartWidth =
      this.barWidth * data.length +
      this.chartMargin.left +
      this.chartMargin.right;

    this.chartWidth =
      this.minChartWidth - this.chartMargin.left - this.chartMargin.right;
    this.chartHeight =
      this.minChartHeight - this.chartMargin.top - this.chartMargin.bottom;

    this.xScale = d3
      .scaleBand()
      .domain(data.map((d, i) => self.getLabel(d, i)))
      .range([this.chartMargin.left, this.barWidth * data.length]);

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.gradient)])
      .nice()
      .range([this.chartHeight, 0]);

    this.xAxis = d3
      .axisBottom(this.xScale)
      .ticks(this.xTicks)
      .tickFormat((d) => d.split("*.*")[1]);
    this.yAxis = d3.axisRight(this.yScale).tickSize(this.minChartWidth);
  }

  updateGraph(data) {
    let self = this;
    // console.log(data[0]);
    let svg = d3.select("div.barviz"); //.transition();

    this.setupScalesAxes(data);
    let color = "steelblue";
    svg
      .append("g")
      .attr("fill", color)
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => self.xScale(i))
      .attr("y", (d) => self.yScale(d.value))
      .attr("height", (d) => self.yScale(0) - self.yScale(d.gradient))
      .attr("width", self.xScale.bandwidth());

    svg.append("g").call(self.xAxis);

    svg.append("g").call(self.yAxis);
  }

  drawGraph(data) {
    let self = this;
    // data = data.slice(0, 85);
    this.setupScalesAxes(data);

    const svg = d3
      .select("div.barviz")
      .append("svg")
      .attr(
        "width",
        this.chartWidth + this.chartMargin.left + this.chartMargin.right
      )
      .attr(
        "height",
        this.chartHeight + this.chartMargin.top + this.chartMargin.bottom
      )
      .append("g")
      .attr(
        "transform",
        "translate(" + this.chartMargin.left + "," + this.chartMargin.top + ")"
      );
    let color = "#0062ff";
    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => self.xScale(self.getLabel(d, i)))
      .attr("y", (d) => self.yScale(d.gradient))
      .attr("height", (d) => self.yScale(0) - self.yScale(d.gradient))
      .attr("width", self.xScale.bandwidth())
      .attr("class", "barrect")
      .style("opacity", (d) => d.gradient);

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

    svg
      .append("g")
      .attr("transform", "translate(0," + this.chartHeight + ")")
      .call(customXAxis)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(270)")
      .style("text-anchor", "start");

    svg.append("g").call(customYAxis);
  }

  componentDidMount() {
    this.drawGraph(this.data.gradients);
  }
  render() {
    let denseViz = this.data.gradients.map((xdata, xindex) => {
      return (
        <span
          style={{
            backgroundColor: "rgba(0, 98, 255, " + xdata.gradient + ")",
          }}
          className="explanationspan"
          key={"expspan" + xindex}
        >
          {xdata.token} &nbsp;
        </span>
      );
    });

    return (
      <div className=" p10">
        <div className="pb5 mb5   mediumdesc lhmedium">
          The visualization below indicates how each word in the query and
          context contributes to the model's selection an answer span.
        </div>

        <Tabs type="default" selected={1}>
          <Tab id="tab-2" label="Density">
            <div className="smalldesc mb10">
              * Darker words indicate larger impact on answer span selection.
            </div>
            <div className="some-content ">
              <div className="mediumdesc lhmedium">{denseViz}</div>
            </div>
          </Tab>
          <Tab id="tab-2" label="Bar">
            <div className="some-content ">
              <div className="smalldesc mb10">
                * Darker bars indicate larger impact on answer span selection.
              </div>
              {/* <div className="barvizbox"> */}
              <div className="barviz"></div>
              {/* </div> */}
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default ExplainView;
