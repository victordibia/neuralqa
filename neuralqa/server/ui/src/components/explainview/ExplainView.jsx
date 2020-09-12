import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
import "./explainview.css";
import BarViz from "../barviz/BarViz";

class ExplainView extends Component {
  constructor(props) {
    super(props);

    // console.log(props);
    this.state = {
      minCharWidth: null,
    };
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
    const denseViz = this.props.data.gradients.map((xdata, xindex) => {
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
                  data={this.props.data}
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
