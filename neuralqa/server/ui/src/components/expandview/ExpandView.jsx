import React, { Component } from "react";
// import { Tabs, Tab } from "carbon-components-react";
import "./expandview.css";

class ExpandView extends Component {
  constructor(props) {
    super(props);
    this.data = require("./ex.json");
    this.data = this.data || props.data;

    this.state = {
      data: this.data,
    };
  }

  componentDidUpdate(prevProps, prevState) {}

  updateGraph(data) {}

  componentDidMount() {}

  render() {
    const subTerms = [];
    const expansionTermsList = this.data.expansions.map((data, index) => {
      // const subTerms = (data.expansion || []).map((data, index) => {
      //   return <div key={"subtermrow" + index}>{data.token}</div>;
      // });
      if (data.expansion) {
        subTerms.push(data.expansion);
      }

      return (
        <div key={"termrow" + index} className="iblock  p5 h100">
          <div className="smalldesc underline pb3">
            {data.pos}{" "}
            {data.named_entity !== "" ? "| " + data.named_entity : ""}
          </div>
          <div className="pt3">{data.token}</div>
          {/* <div>{subTerms}</div> */}
        </div>
      );
    });

    console.log(subTerms);

    const subTermsList = subTerms.map((data, index) => {
      const terms = data.map((data, index) => {
        return (
          <div key={"ssubterms" + index} className="iblock mr10">
            {data.token}
          </div>
        );
      });
      return (
        <div key={"subtermrow" + index} className="iblock  p5 h100">
          <div className="p5 border">{terms}</div>
          {/* <div>{subTerms}</div> */}
        </div>
      );
    });

    return (
      <div className="expandview border p10">
        <div className="pb5 mb5 mediumdesc lhmedium">
          The visualization below indicates how the expansion terms were
          generated.
        </div>
        <div>{expansionTermsList}</div>
        <div>{subTermsList}</div>
      </div>
    );
  }
}

export default ExpandView;
