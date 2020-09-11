import React, { Component } from "react";
import "./testview.css";
import BarViz from "../barviz/BarViz";

class TestView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    // this.data.gradients = this.data.gradients.concat(this.data.gradients);
    // console.log(this.data);
  }
  componentDidMount() {
    this.barVizWidth = document.getElementById("barvizcontainer").offsetWidth;
    // console.log(this.barVizWidth);
  }

  render() {
    return (
      <div id="barvizcontainer" className="  ">
        <BarViz data={this.data} minChartWidth={700}></BarViz>
      </div>
    );
  }
}

export default TestView;
