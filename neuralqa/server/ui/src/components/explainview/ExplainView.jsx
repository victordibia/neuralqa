import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
import * as d3 from "d3";
import "./explainview.css";

class ExplainView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.data = this.data || props.data;

    this.state = {
      data: this.data,
      svgPath: "",
    };

    // this.minChartWidth = 1600;
    this.minChartHeight = 210;
    this.barWidth = 20;
    this.brushWidth = 150;

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
    // this.setState({
    //   data: prevProps.explanationData[prevProps.selectedExplanation],
    // });
  }

  setupScalesAxes(data) {
    // console.log(this.minChartWidth);

    let self = this;
    this.chartMargin = { top: 10, right: 15, bottom: 15, left: 20 };
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

    let color = "steelblue";
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
      .attr("fill", (d) => "rgba(0, 98, 255, " + d.gradient + ")");
    //   .style("opacity", (d) => d.gradient);

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
      .attr("class", "x axis")
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

  drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
  }

  drawBrushCanvas() {
    this.brushCanvas = document.getElementById("brushcanvas");
    this.brushCtx = this.brushCanvas.getContext("2d");

    this.drawBar(this.brushCtx, 0, 50, 10, 60, "green");
  }

  drawBrushSVG() {
    let chartPath = "M0 " + this.brushHeight;
    let barWidth = this.brushBoxWidth / this.state.data.gradients.length;
    let i = 0;
    let pointY = 0;
    let pointX = 0;
    this.state.data.gradients.forEach((data) => {
      pointY = this.brushHeight - data.gradient * this.brushHeight;
      pointX = i * barWidth;
      const nextPoint =
        "L" +
        pointX +
        " " +
        pointY +
        " " +
        "L" +
        (pointX * 1 + barWidth * 1) +
        " " +
        pointY;
      i++;
      chartPath = chartPath + " " + nextPoint;
    });
    chartPath =
      chartPath +
      " L" +
      (pointX + barWidth) +
      " " +
      this.brushHeight +
      " L0 " +
      this.brushHeight +
      " Z";
    // chartPath = chartPath + " Z"
    this.setState({ svgPath: chartPath });
  }

  componentDidMount() {
    this.drawGraph(this.data.gradients);

    let self = this;
    // this.drawBrushCanvas();
    // setTimeout(() => {
    //   console.log("updating");
    //   self.updateGraph(self.data.gradients.slice(20, 50));
    // }, 5000);
    this.brushBoxWidth = document.getElementById("brushboxdiv").offsetWidth;
    this.brushElement = document.getElementById("brushdiv");
    this.drawBrushSVG();
    this.brushClicked = false;
  }

  brushMouseDown(e) {
    this.brushClicked = true;
  }
  //   brushMouseMove(e) {
  //     if (this.brushClicked) {
  //     }
  //   }
  brushMouseUp(e) {
    this.brushClicked = false;
  }
  brushBoxMouseMove(e) {
    if (this.brushClicked) {
      this.brushX = e.clientX - this.brushWidth / 2;
      this.brushX = this.brushX <= 0 ? 0 : this.brushX;
      this.brushX =
        this.brushX + this.brushWidth >= this.brushBoxWidth
          ? this.brushBoxWidth - this.brushWidth
          : this.brushX;
      this.brushElement.style.left = this.brushX + "px";
    }
  }

  brushMouseOut(e) {
    this.brushClicked = false;
  }
  render() {
    const denseViz = this.data.gradients.map((xdata, xindex) => {
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

    const answerText = (
      <div className="pb10 mediumdesc boldtext">
        <span className="answerquote">&#8220;</span> {this.state.data.answer}{" "}
        <span className="pt10 answerquote">&#8221;</span>{" "}
      </div>
    );

    const brushBars = this.state.data.gradients.map((data, index) => {
      return <div key="brushb"></div>;
    });

    return (
      <div className="expview p10">
        <div className="pb5 mb5   mediumdesc lhmedium">
          The visualization below indicates how each word in the query and
          context contributes to the model's selection of an answer span.
        </div>

        <Tabs type="default" selected={1}>
          <Tab id="tab-2" label="Density">
            {answerText}
            <div className="viztabcontent p10">
              <div className="smalldesc mb10">
                * Darker words indicate larger impact on answer span selection.
              </div>
              <div className="some-content ">
                <div className="mediumdesc lhmedium">{denseViz}</div>
              </div>
            </div>
          </Tab>
          <Tab id="tab-2" label="Bar">
            {answerText}
            <div className="viztabcontent p10">
              <div className="smalldesc mb10">
                * Darker bars indicate larger impact on answer span selection.
              </div>
              <div className="barviz scrollwindow "></div>
              <div
                id="brushboxdiv"
                className="brushbox mt10 positionrelative"
                onMouseMove={this.brushBoxMouseMove.bind(this)}
                // style={{ height: this.brushHeight }}
              >
                <div
                  id="brushdiv"
                  style={{ height: this.brushHeight, width: this.brushWidth }}
                  className="brushhandle positionabsolute"
                  onMouseDown={this.brushMouseDown.bind(this)}
                  onMouseUp={this.brushMouseUp.bind(this)}
                  //   onMouseMove={this.brushMouseMove.bind(this)}
                  onMouseOut={this.brushMouseOut.bind(this)}
                ></div>
                <svg
                  className="graphsvgbox"
                  style={{
                    width: "100%",
                    height: this.brushHeight,
                  }}
                >
                  <path className="graphsvgpath" d={this.state.svgPath} />
                </svg>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default ExplainView;
