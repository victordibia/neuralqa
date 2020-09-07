import React, { Component } from "react";
// import { Tabs, Tab } from "carbon-components-react";
import "./expandview.css";
import { LeaderLine, animOptions } from "../helperfunctions/HelperFunctions";

class ExpandView extends Component {
  constructor(props) {
    super(props);

    this.data = require("./ex.json");
    this.data = props.data || this.data;

    console.log(this.props);

    this.state = {
      data: this.data,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      console.log("things have changed");
      this.removeAllLines();
      this.drawLines();
      // console.log(this.lineHolder.length, " num lines");
    }
    if (this.props.viewChanged !== prevProps.viewChanged) {
      console.log("view changed .. expand");
      this.redrawAllLines();
    }
  }

  updateGraph(data) {}

  drawLeaderLine(startElement, endElement, startAnchor, endAnchor) {
    let lineColor = this.blueColor;
    let lineWidth = 1.5;
    let plugType = "square";
    let endPlugType = "arrow2";

    let line = new LeaderLine(
      LeaderLine.pointAnchor(startElement, startAnchor),
      LeaderLine.pointAnchor(endElement, endAnchor),
      {
        color: lineColor,
        startPlug: plugType,
        endPlug: endPlugType,
        startPlugColor: lineColor,
        endSocketGravity: 400,
        path: "arc",
        size: lineWidth,
        hide: true,
      }
    );
    // document.querySelector('.leader-line').style.zIndex = -100
    animOptions.duration = this.state.animationDuration;
    line.show("draw", animOptions);
    this.lineHolder.push({
      line: line,
    });
  }

  removeAllLines(line) {
    this.lineHolder.forEach(function (each) {
      each.line.remove();
    });
    this.lineHolder = [];
  }

  redrawAllLines() {
    this.lineHolder.forEach(function (each) {
      each.line.position();
    });
  }
  getElement(attributeName, attributeValue) {
    return document
      .querySelector("div")
      .querySelector("[" + attributeName + "=" + attributeValue + "]");
  }
  componentDidMount() {
    this.lineHolder = [];
    this.topAnchor = { x: "50%", y: 0 };
    this.bottomAnchor = { x: "50%", y: "100%" };
    this.leftAnchor = { x: "0%", y: "50%" };
    this.rightAnchor = { x: "100%", y: "50%" };

    this.blueColor = "#0062ff";
    this.greyColor = "#c4c3c3";
    this.drawLines();
  }

  drawLines() {
    for (const ex of this.props.data.expansions) {
      if (ex.expansion) {
        for (let i = 0; i < ex.expansion.length; i++) {
          const startId = "term" + ex.token_index;
          const endId = "subterm" + ex.token_index + i;
          const startEl = this.getElement("id", startId);
          const endEl = this.getElement("id", endId);
          this.drawLeaderLine(startEl, endEl, this.leftAnchor, this.leftAnchor);
        }
      }
    }
  }

  componentWillUnmount() {
    this.removeAllLines();
  }

  render() {
    const expansionTermsList = this.props.data.expansions.map(
      (expansionData, index) => {
        const terms = (expansionData.expansion || []).map((data, index) => {
          return (
            <div
              key={"subterms" + index}
              id={"subterm" + expansionData.token_index + "" + index}
              className="ml10  h100 p5 subtermbox"
            >
              {data.token}
            </div>
          );
        });
        return (
          <div key={"termrow" + index} className="iblock h100 termcontainer ">
            <div className="smalldesc underline pb3">
              <div className="tooltip iblock mr5">
                {expansionData.pos}
                <span className="tooltiptext lhmedium">
                  {expansionData.pos_desc}
                </span>
              </div>
              <div className="tooltip iblock">
                {expansionData.named_entity !== ""
                  ? "| " + expansionData.named_entity
                  : ""}
                <span className="tooltiptext  lhmedium">
                  {expansionData.ent_desc}
                </span>
              </div>
            </div>

            <div
              id={"term" + index}
              className="termbox mt10"
              style={{
                color: terms.length > 0 ? "white" : "",
                backgroundColor:
                  terms.length > 0 ? this.blueColor : this.greyColor,
              }}
            >
              {expansionData.token}
            </div>
            <div className="">{terms}</div>
          </div>
        );
      }
    );

    // const subTermsList = this.data.expansions
    //   .filter((data) => {
    //     if (data.expansion) {
    //       return true;
    //     }
    //     return false;
    //   })
    //   .map((expansionData, termIndex) => {
    //     const terms = expansionData.expansion.map((data, index) => {
    //       return (
    //         <div
    //           key={"subterms" + index}
    //           id={"subterm" + expansionData.token_index + "" + index}
    //           className="iblock p5 subtermbox"
    //         >
    //           {data.token}
    //         </div>
    //       );
    //     });
    //     return (
    //       <div key={"subtermrow" + termIndex} className="iblock h100">
    //         <div className="border subtermgroupbox">{terms}</div>
    //       </div>
    //     );
    //   });

    return (
      <div className="expandview  mt10 p10">
        <div className="pb5 mb5 mediumdesc underline lhmedium">
          The visualization below indicates how the expansion terms were
          generated.
        </div>
        <div className="">{expansionTermsList}</div>
        {/* <div className="mt10">{subTermsList}</div> */}
      </div>
    );
  }
}

export default ExpandView;
