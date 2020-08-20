import React, { Component } from "react";
import { Tabs, Tab } from "carbon-components-react";
class ExplainView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.state = {
      data: this.data,
    };
  }

  componentDidMount() {}
  render() {
    let denseViz = this.data.token_words.map((xdata, xindex) => {
      return (
        <span
          style={{
            backgroundColor:
              "rgba(0, 98, 255, " + this.data.gradients[xindex] + ")",
          }}
          className="explanationspan"
          key={"expspan" + xindex}
        >
          {xdata} &nbsp;
        </span>
      );
    });
    return (
      <div className="border">
        <div className="p10 mediumdesc lhmedium">
          The visualization below indicates how each word in the query and
          context contributes to the model's selection an answer span. Darker
          words indicate larger impact.
        </div>

        <Tabs type="container" selected={1}>
          <Tab id="tab-2" label="Tab label 2">
            <div className="some-content">
              <p>Content for second tab goes here.</p>
            </div>
          </Tab>
          <Tab id="tab-3" label="Tab label 2">
            <div className="some-content">
              <p>Content for second tab goes here.</p>
            </div>
          </Tab>
          <Tab id="tab-2" label="Tab label 2">
            <div className="some-content">
              <p>Content for second tab goes here.</p>
            </div>
          </Tab>
        </Tabs>

        <div className="p10">{denseViz}</div>
      </div>
    );
  }
}

export default ExplainView;
