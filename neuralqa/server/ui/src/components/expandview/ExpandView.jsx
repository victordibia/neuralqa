import React, { Component } from "react";
// import { Tabs, Tab } from "carbon-components-react";
import "./expandview.css";
import { LeaderLine, animOptions } from "../helperfunctions/HelperFunctions";

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

  drawLeaderLine(startElement, endElement, startAnchor, endAnchor) {
    let lineColor = "grey";
    let lineWidth = 1;
    let plugType = "disc";

    let line = new LeaderLine(
      LeaderLine.pointAnchor(startElement, startAnchor),
      LeaderLine.pointAnchor(endElement, endAnchor),
      {
        color: lineColor,
        startPlug: plugType,
        endPlug: plugType,
        startPlugColor: lineColor,
        path: "magnet",
        size: lineWidth,
        hide: true,
        // dash: { gap: 2, animation: params.endId === "latent" ? this.state.isTraining : false }
        // dash: { gap: 3 },
      }
    );
    // document.querySelector('.leader-line').style.zIndex = -100
    animOptions.duration = this.state.animationDuration;
    line.show("draw", animOptions);
    this.lineHolder.push({
      line: line,
      startId: startElement,
      endId: endElement,
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

    for (const ex of this.data.expansions) {
      if (ex.expansion) {
        for (const [i, v] of ex.expansion.entries()) {
          const startId = "term" + ex.token_index;
          const endId = "subterm" + ex.token_index + i;
          const startEl = this.getElement("id", startId);
          const endEl = this.getElement("id", endId);
          this.drawLeaderLine(
            startEl,
            endEl,
            this.bottomAnchor,
            this.topAnchor
          );
        }
      }
    }
  }

  componentWillUnmount() {
    this.removeAllLines();
  }

  render() {
    console.log(this.data);
    const expansionTermsList = this.data.expansions.map((data, index) => {
      return (
        <div
          key={"termrow" + index}
          id={"term" + index}
          className="iblock  h100 termcontainer "
        >
          <div className="smalldesc underline pb3">
            {data.pos}{" "}
            {data.named_entity !== "" ? "| " + data.named_entity : ""}
          </div>
          <div className="termbox">{data.token}</div>
          {/* <div>{subTerms}</div> */}
        </div>
      );
    });

    const subTermsList = this.data.expansions
      .filter((data) => {
        if (data.expansion) {
          return true;
        }
        return false;
      })
      .map((expansionData, termIndex) => {
        const terms = expansionData.expansion.map((data, index) => {
          return (
            <div
              key={"subterms" + index}
              id={"subterm" + expansionData.token_index + "" + index}
              className="iblock p5 subtermbox"
            >
              {data.token}
            </div>
          );
        });
        return (
          <div key={"subtermrow" + termIndex} className="iblock h100">
            <div className="border subtermgroupbox">{terms}</div>
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
        <div className="mt10">{subTermsList}</div>
      </div>
    );
  }
}

export default ExpandView;
