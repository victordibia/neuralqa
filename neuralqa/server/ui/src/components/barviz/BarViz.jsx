import React, { Component } from "react";
import * as d3 from "d3";
import "./barviz.css";

class BarViz extends Component {
  constructor(props) {
    super(props);

    this.grads = props.data.gradients;

    // this.minChartWidth = 900;
    this.minChartHeight = 250;
    this.minChartWidth = this.props.minChartWidth || 800;

    this.brushHeight = 60;
    this.barColor = "#0062ff";
    this.inactiveColor = "rgba(85, 85, 85, 0.586)";
    this.initialBrushPercentage = 35 / this.grads.length;

    // window.addEventListener("resize", handleResize);
  }

  getLabel(d, i) {
    return i + "*.*" + d.token + " *.* (" + d.gradient.toFixed(2) + ")";
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps, prevState) {}

  setupScalesAxes(data) {
    let self = this;
    this.chartMargin = { top: 5, right: 0, bottom: 0, left: 0 };
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
  createBarRects = (svg, x, y, data, chartclass, transparency) => {
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
      .attr("class", transparency ? "strokedbarrect" : "")
      .attr(
        "fill",
        (d) => "rgba(0, 98, 255, " + (transparency ? d.gradient : 1) + ")"
      );
  };

  drawBrushGraph(data) {
    let self = this;
    this.brushXScale = this.xScale.copy();
    this.brushYScale = this.yScale.copy().range([this.brushHeight, 0]);
    const x = this.brushXScale;
    const y = this.brushYScale;
    const mainXZoom = d3
      .scaleLinear()
      .range([this.chartMargin.left, this.chartWidth - this.chartMargin.right])
      .domain([
        this.chartMargin.left,
        this.chartWidth - this.chartMargin.right,
      ]);

    const svg = this.createSVGBox("div.d3brush", this.brushHeight);

    this.createBarRects(svg, x, y, data, "minibars", false);
    const brush = d3
      .brushX()
      .extent([
        [this.chartMargin.left, 0.5],
        [this.chartWidth - this.chartMargin.right, this.brushHeight],
      ])
      .on("brush", brushed)
      .on("start", brushStarted)
      .on("end", brushEnded);

    const defaultSelection = [
      x.range()[0],
      (x.range()[1] - x.range()[0]) * self.initialBrushPercentage,
    ];

    svg.append("g").call(brush).call(brush.move, defaultSelection);

    function brushStarted() {
      // console.log("brush started");
      d3.select("div.barviz")
        .selectAll("text.textlabel")
        .attr("class", "textinvisible textlabel");
    }
    function brushEnded() {
      d3.select("div.barviz")
        .selectAll("text.textlabel")
        .attr("class", "textlabel");
      const extentX = d3.event.selection;
      // console.log("brush ended", extentX);
      if (extentX) {
        // const selected = x
        //   .domain()
        //   .filter(
        //     (d) =>
        //       extentX[0] - x.bandwidth() + 1e-2 <= x(d) &&
        //       x(d) <= extentX[1] - 1e-2
        //   );

        updateScalePostBrush(extentX);

        const svg = d3.select("div.barviz");
        svg
          .selectAll("text.textlabel")
          .data(data)
          .attr("x", (d, i) => {
            return (
              self.xScale(self.getLabel(d, i)) + self.xScale.bandwidth() / 2
            );
          })
          .attr("y", (d) => {
            return self.yScale.range()[0];
          });
      }
    }

    function brushed() {
      const extentX = d3.event.selection;
      const selected = x
        .domain()
        .filter(
          (d) =>
            extentX[0] - x.bandwidth() + 1e-2 <= x(d) &&
            x(d) <= extentX[1] - 1e-2
        );

      d3.select("div.d3brush")
        .select(".minibars")
        .selectAll("rect")
        .style("fill", (d, i) => {
          return selected.indexOf(self.getLabel(d, i)) > -1
            ? self.barColor
            : self.inactiveColor;
        });

      updateScalePostBrush(extentX);
      update(self.grads);
    }

    function updateScalePostBrush(extentX) {
      let originalRange = mainXZoom.range();
      mainXZoom.domain(extentX);

      self.xScale.domain(data.map((d, i) => self.getLabel(d, i)));
      self.xScale
        .range([mainXZoom(originalRange[0]), mainXZoom(originalRange[1])])
        .paddingInner(0.1);
    }

    function update(data) {
      const x = self.xScale;
      const y = self.yScale;
      const svg = d3.select("div.barviz");
      svg
        .selectAll("rect.mainbars")
        .data(data)
        .join("rect")
        .attr("x", (d, i) => x(self.getLabel(d, i)))
        .attr("y", (d) => y(d.gradient))
        .attr("height", (d) => y(0) - y(d.gradient))
        .attr("width", x.bandwidth());
    }
  }

  createToolTip(svg) {
    // create tooltip
    let tooltip = svg
      .append("g")
      .attr("class", "tooltiptext")
      .style("display", "none");

    tooltip.append("rect").attr("class", "tooltiprect");

    tooltip.append("text").attr("x", 10).attr("dy", "1.2em");
    // .style("text-anchor", "middle");

    return tooltip;
  }

  drawGraph(data) {
    let self = this;
    this.setupScalesAxes(data);
    const x = this.xScale;
    const y = this.yScale;

    const svg = this.createSVGBox("div.barviz", this.chartHeight);
    const bar = svg.selectAll("g").data(data).join("g");

    bar
      .append("rect")
      .attr("class", "strokedbarrect mainbars")
      .attr(
        "fill",
        (d) =>
          "rgba(0, 98, 255, " +
          (d.gradient > 0.5 ? 1 : 0.5 + 0.5 * d.gradient) +
          ")"
      )
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.gradient))
      .on("mouseover", function () {
        tooltip.style("display", null);
        d3.select(this).attr("fill", "lightgrey");
      })
      .on("mouseout", function (d) {
        tooltip.style("display", "none");
        d3.select(this).attr(
          "fill",
          "rgba(0, 98, 255, " +
            (d.gradient > 0.5 ? 1 : 0.5 + 0.5 * d.gradient) +
            ")"
        );
      })
      .on("mousemove", function (d) {
        var xPosition = d3.mouse(this)[0] + 10;
        var yPosition = d3.mouse(this)[1] - 20;
        tooltip.attr(
          "transform",
          "translate(" + xPosition + "," + yPosition + ")"
        );
        tooltip.select("text").text(d.token);
        tooltip
          .select("rect")
          .attr(
            "width",
            tooltip.select("text").node().getComputedTextLength() + 20
          );
      });

    bar
      .append("text")
      // .attr("fill", "white")
      .attr("x", (d, i) => {
        return x(self.getLabel(d, i));
      })
      .attr("y", (d) => y(d.gradient))
      .attr("class", "textlabel")
      .text((d) => d.token);

    let tooltip = this.createToolTip(svg);
  }

  componentDidMount() {
    let barvizElement = document.getElementById("barviz");
    barvizElement.style.width = this.minChartWidth + "px";

    this.drawGraph(this.grads);
    this.drawBrushGraph(this.grads);
  }

  render() {
    return (
      <div className=" barvizcontent ">
        <div className=" ">
          <div id="barviz" className="barviz "></div>
          <div id="d3brush" className="d3brush  "></div>
        </div>
      </div>
    );
  }
}

export default BarViz;
