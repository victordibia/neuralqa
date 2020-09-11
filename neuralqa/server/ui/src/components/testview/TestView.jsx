import React, { Component } from "react";
import * as d3 from "d3";
import "./testview.css";
import BarViz from "../barviz/BarViz";

class TestView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.barVizWidth = document.getElementById("barvizcontainer").offsetWidth;
    console.log(this.barVizWidth);
  }

  render() {
    return (
      <div id="barvizcontainer" className="  ">
        <BarViz minChartWidth={700}></BarViz>
      </div>
    );
  }
}

export default TestView;
