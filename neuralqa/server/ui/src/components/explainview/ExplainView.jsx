import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
import "./explainview.css";
import BarViz from "../barviz/BarViz";

class ExplainView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.data = this.data || props.data;

    this.state = {
      data: this.data,
      minCharWidth: null,
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
    // this.data = prevProps.explanationData;
    // if (
    //   prevProps.explanationData &&
    //   prevProps.explanationData.answer !== this.state.data.answer
    // ) {
    //   console.log("updating .. ", this.data);
    //   this.updateGraph(this.data.gradients);
    //   this.setState({
    //     data: prevProps.explanationData,
    //   });
    // }
    // // this.setState({
    // //   data: prevProps.explanationData[prevProps.selectedExplanation],
    // // });
  }

  componentDidMount() {
    this.setState({
      minCharWidth: document.getElementById("barvizcontainer").offsetWidth - 40,
    });
  }
  render() {
    const denseViz = this.data.gradients.map((xdata, xindex) => {
      return (
        <span
          style={{
            backgroundColor: "rgba(0, 98, 255, " + xdata.gradient + ")",
          }}
          className="explanationspan "
          key={"expspan" + xindex}
        >
          {xdata.token} &nbsp;
        </span>
      );
    });

    return (
      <div className="expview ">
        <Tabs id="barvizcontainer" type="default" selected={0}>
          <Tab id="tab-2" label="Density">
            {/* {answerText} */}
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
            {/* {answerText} */}
            <div className="viztabcontent p10">
              <div className="smalldesc mb10">
                * Darker bars indicate larger impact on answer span selection.
              </div>
              {this.state.minCharWidth && (
                <BarViz
                  minChartWidth={this.state.minCharWidth}
                  data={this.props}
                ></BarViz>
              )}
            </div>
          </Tab>
        </Tabs>
        <div className="pt5 smalldesc lhmedium">
          The visualizations above indicate how each word in the query and
          context contributes to the model's selection of an answer span.
        </div>
      </div>
    );
  }
}

export default ExplainView;
