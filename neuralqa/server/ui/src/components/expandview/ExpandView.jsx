import React, { Component } from "react";
import { Modal } from "carbon-components-react";
import "./expandview.css";
import { LeaderLine, animOptions } from "../helperfunctions/HelperFunctions";

class ExpandView extends Component {
  constructor(props) {
    super(props);
    this.data = props.data;

    // console.log(this.props);

    this.state = {
      data: this.data,
      showInfoModal: false,
    };
    this.blueColor = "#0062ff";
    this.greyColor = "#c4c3c3";
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.removeAllLines();
      this.drawLines();
      // console.log(this.lineHolder.length, " num lines");
    }
    if (this.props.viewChanged !== prevProps.viewChanged) {
      this.redrawAllLines();
    }
  }

  clickTerm(e) {
    // console.log(e.target.innerHTML);
    this.props.addQueryTerm(e.target.innerHTML);
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

  clickInfo(e) {
    this.setState({ showInfoModal: !this.state.showInfoModal });
  }

  render() {
    let suggestedTermList = [];
    const data = this.props.data;
    if (data.expansions && data.terms) {
      suggestedTermList = data.terms.map((data, index) => {
        return (
          <div
            key={"expansionterm" + index}
            className="smalldesc unclickable iblock mr5"
          >
            {data.token}
          </div>
        );
      });
    }
    const expansionTermsList = data.expansions.map((expansionData, index) => {
      const terms = (expansionData.expansion || []).map((data, index) => {
        return (
          <div
            key={"subterms" + index}
            id={"subterm" + expansionData.token_index + "" + index}
            className="ml10  h100 p5 subtermbox clickable"
            onClick={this.clickTerm.bind(this)}
          >
            {data.token}
          </div>
        );
      });
      const boxColor = terms.length > 0 ? this.blueColor : this.greyColor;

      return (
        <div key={"termrow" + index} className="iblock h100 termcontainer ">
          <div className="smalldesc lhsmall underline pb3">
            <div className="tooltip iblock mr5">
              {expansionData.pos}
              <span className="expandtooltiptext">
                <div className="underline boldtext pb3 mb5">
                  PART&nbsp;OF&nbsp;SPEECH
                </div>
                <div> {(expansionData.pos_desc || "").toUpperCase()}</div>
              </span>
            </div>
            <div className="tooltip iblock">
              {expansionData.named_entity !== ""
                ? "| " + expansionData.named_entity
                : ""}
              <span className="expandtooltiptext ">
                <div className="underline boldtext  pb3 mb5">
                  NAMED&nbsp;ENTITY
                </div>
                <div> {(expansionData.ent_desc || "").toUpperCase()}</div>
              </span>
            </div>
          </div>

          <div
            id={"term" + index}
            className={
              "termbox mt10 unclickable " + (terms.length > 0 ? "mb5" : "")
            }
            style={{
              color: terms.length > 0 ? "white" : "",
              backgroundColor: boxColor,
            }}
          >
            {expansionData.token}
          </div>
          <div className="">{terms}</div>
        </div>
      );
    });

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
      <div className=" ">
        <Modal
          open={this.state.showInfoModal}
          modalHeading={"How does Query Expansion Work?"}
          passiveModal={true}
          size={"lg"}
          aria-label={"Query expansion info modal"}
          modalAriaLabel={"Query expansion info modal"}
          onRequestClose={this.clickInfo.bind(this)}
          hasScrollingContent={true}
          // secondaryButtonText={"Cancel"}
        >
          <div>
            <div className="underline pb5 mb10">
              {" "}
              What is Contextual Query Expansion?{" "}
            </div>
            Query expansion works as follows. First, a set of rules are used to
            determine which token in the query to expand. These rules are chosen
            to improve recall (surface relevant queries) without altering the
            semantics of the original query. Example rules include only
            expanding ADJECTIVES AND ADVERBS. Other parts of speech such as
            nouns, proper nouns or even named entities are not expanded. Once
            expansion candidates are selected, they are then iteratively masked
            and a masked language model is used to predict tokens that best
            complete the sentence given the surrounding tokens. Additional
            details are provided in the{" "}
            <a target="_blank" href="https://arxiv.org/abs/2007.15211">
              {" "}
              NeuralQA paper.
            </a>{" "}
            <div className="underline mt10 pb5 mb10">
              {" "}
              How is this Implemented{" "}
            </div>
            Part of speech detection is implemented using Spacy NLP. A BERT
            based masked language model is used for predicting expansion terms (
            can be selected under advanced options).
          </div>
        </Modal>
        <div className=" mb10">
          <span className="boldtext">
            {" "}
            {suggestedTermList.length} Suggested Expansion Terms{" "}
          </span>
          <span className="mediumdesc">
            {" "}
            {this.props.data.took.toFixed(3)} seconds
          </span>
          .
        </div>
        <div className="expandview p10 expandview">
          {/* <span className="boldtext"> suggested terms: </span>
          <span className="mediumdesc"> {suggestedTermList} </span> */}
          <div className="positionrelative pb5 mediumdesc">
            <div className=" pt10 pb10 underline">
              Click any of the expansion candidate terms below to append it to
              your query
            </div>
            <div
              className="whatsthis clickable"
              onClick={this.clickInfo.bind(this)}
            >
              <span className="infocircle"> &#63;</span> info
            </div>
          </div>

          <div className="">{expansionTermsList}</div>
          <div className="smalldesc pt5 lhsmall ">
            {" "}
            The visualization above indicates how the expansion terms were
            generated.<br></br>
            *Note that contextual query expansion works best when the model is
            trained on the target (open-domain) dataset. To minimize the
            potential for altering the meaning of the sentence, only NOUNS,
            ADJECTIVES, and ADVERBS are expanded. Named entities are not
            expanded.
          </div>
        </div>
      </div>
    );
  }
}

export default ExpandView;
