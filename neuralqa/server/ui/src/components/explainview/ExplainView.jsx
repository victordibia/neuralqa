import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
import "./explainview.css";
import { VegaLite, Vega } from "react-vega";

class ExplainView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.data = this.data || props.data;

    this.state = {
      data: this.data,
    };
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

  updateGraph(data) {}

  componentDidMount() {}

  render() {
    const brushEncX = {
      field: "token",
      type: "ordinal",
      sort: null,
      axis: null,
    };
    const brushEncY = {
      field: "gradient",
      type: "quantitative",
      axis: { tickCount: 2, grid: true, title: null },
    };
    const mainEncY = {
      field: "gradient",
      type: "quantitative",
      axis: { tickCount: 10, grid: true, title: null },
      color: "green",
    };

    const chartConfig = {
      view: {
        stroke: "transparent",
      },
    };
    const barColor = { value: "#0062ff" };
    const spec = {
      description: "A simple bar chart with embedded data.",
      data: { values: this.data.gradients },
      // transform: [{ calculate: "datum.token", as: "gradval" }],
      autosize: {
        type: "fit-x",
        contains: "padding",
      },
      background: "transparent",
      config: chartConfig,
      vconcat: [
        //main view
        {
          width: "container",
          mark: { type: "bar", tooltip: { content: "data" } },
          encoding: {
            x: {
              field: "token",
              type: "ordinal",
              scale: { domain: { selection: "brush" } },
              axis: {
                title: "",
                labelAlign: "top",
                labelExpr: "'`   ' +datum.label",
                zindex: 1,
              },
              sort: null,
            },
            y: mainEncY,
            color: barColor,
            opacity: { field: "gradient", type: "quantitative", legend: false },
            // tooltip: { field: "gradient", type: "quantitative" },
          },
        },
        //brush view
        {
          width: "container",
          height: 60,
          mark: "bar",
          selection: {
            brush: {
              type: "interval",
              encodings: ["x"],
              // init: { x: [55, 160], y: [13, 37] },
            },
          },
          encoding: {
            x: brushEncX,
            y: brushEncY,
            color: { value: "#666" },
          },
        },
      ],
    };

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

              {/* <div id="d3brush" className="d3brush"></div> */}
              <div className="w100">
                <VegaLite className="w100" actions={false} spec={spec} />
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default ExplainView;
