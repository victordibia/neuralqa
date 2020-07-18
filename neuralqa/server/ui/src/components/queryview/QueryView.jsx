/**
 * @license
 * Copyright 2019 Fast Forward Labs.
 * Written by / Contact : https://github.com/victordibia
 * NeuralQA - NeuralQA: Question Answering on Large Datasets with BERT.
 * Licensed under the MIT License (the "License");
 * =============================================================================
 */

import React, { Component } from "react";
import {
  Button,
  Select,
  Toggle,
  Modal,
  SelectItem,
  TextInput,
  TextArea,
  Loading,
} from "carbon-components-react";
import {
  postJSONData,
  abbreviateString,
} from "../helperfunctions/HelperFunctions";
import "./queryview.css";

class QueryView extends Component {
  constructor(props) {
    super(props);

    // console.log(props.data);

    this.options = props.data.options;

    this.state = {
      apptitle: props.data.intro.title,
      appsubtitle: props.data.intro.subtitle,
      passages: { took: 0, hits: { hits: [] } },
      answers: { took: 0, answers: [] },
      passageIsLoading: false,
      answerIsLoading: false,
      errorStatus: "",

      maxdocuments: this.options.maxdocuments.selected,
      reader: this.options.reader.selected,
      highlightSpan: this.options.highlightspan.selected,
      chunkStride: this.options.stride.selected,
      retriever: this.options.retriever.selected,
      expander: this.options.expander.selected,
      relsnip: this.options.relsnip.selected,

      sampleQA: this.options.samples,
      selectedSampleIndex: 0,
      explanations: {},
      showAdvancedView: false,
      showExplanationsView: props.data.views.explanations,
      showPassagesView: props.data.views.passages,
      showExpander: true, //props.data.views.expander,

      // showAdvanced: props.data.views.advanced,
      openAdvancedConfigDrawer: true,
      showSamples: props.data.views.samples,
      showAllAnswers: props.data.views.allanswers,
      showIntro: props.data.views.intro,
      showInfoModal: false,
    };

    this.serverBasePath =
      window.location.protocol + "//" + window.location.host;
    // this.serverBasePath = "http://localhost:5000";
    this.passageEndpoint = "/api/documents";
    this.answerEndpoint = "/api/answers";
    this.explainEndpoint = "/api/explain";
    this.interfaceTimedDelay = 400;
    this.maxStatusElasped = 6; // Remove error/status msgs after maxStatusElasped secs

    this.advancedOptionsDescriptions = [
      {
        title: "Retriever",
        description:
          "A list of search indexes that will be used to retrieve documents that match the search query. If set to manual, the interface will let you provide a document/passage in addition to your question",
      },
      {
        title: "Reader",
        description:
          "A Question Answering model that will take in your question and retrieved documentss (or manual passsage) and extract an answer to the question if it exists in the document.",
      },
      {
        title: "Token Stride",
        description:
          "Token stride specifies the overlap between document chunks. QA reader models have limitations on the maximum size of text tokens they can process in a single pass. Lengthy documents are typically broken down in to smaller document chunks and iteratively processed by the model. ",
      },

      {
        title: "Documents",
        description: "Number of documents to return for a retriever query.",
      },
      {
        title: "Expander",
        description:
          "Methods for identifying additional query terms that can improve recall.",
      },
      {
        title: "Highlight Span",
        description:
          "Size of each highlight fragment. Retrieved documents are automatically highlighted. ",
      },
      {
        title: "RelSnip",
        description:
          "Relevant Snippets (RelSnip) is a method for constructing smaller documents from lengthy documents. (RelSnip) is implemented as follows: For each retrieved document, we apply a highlighter (Lucene Unified Highlighter) which breaks the document into fragments and uses the BM25 algorithm to score each fragment as if they were individual documents in the corpus. Next, we concatenate the top n fragments as a new document which is then processed by the reader.",
      },
    ];
  }

  componentDidMount() {
    this.askQuestion();
  }

  resetAnswer() {
    this.setState({
      passages: { took: 0, hits: { hits: [] } },
      answers: { took: 0, answers: [] },
      errorStatus: "",
      explanations: {},
    });
  }
  resetExplanations() {
    this.setState({
      explanations: {},
    });
  }

  askQuestion() {
    this.resetExplanations();
    let question = document.getElementById("questioninput").value;
    let context = document.getElementById("contextinput")
      ? document.getElementById("contextinput").value
      : null;
    let postData = {
      max_documents: this.state.maxdocuments,
      context: context || this.state.sampleQA[0].context,
      question: question || this.state.sampleQA[0].context,
      highlight_span: this.state.highlightSpan,
      reader: this.state.reader,
      retriever: this.state.retriever,
      tokenstride: this.state.chunkStride,
      relsnip: this.state.relsnip,
      expander: this.state.expander,
    };
    if (this.state.retriever !== "manual") {
      this.getPassages(postData);
    }

    this.getAnswers(postData);
    this.lastAsked = new Date();
  }

  getAnswers(postData) {
    // this.setState({ answers: { "took": 0, answers: [] } })
    let self = this;
    this.setState({ answerIsLoading: true });
    let answerUrl = this.serverBasePath + this.answerEndpoint;

    let answers = postJSONData(answerUrl, postData);
    answers
      .then((data) => {
        if (data) {
          // console.log(data)
          this.setState({ answers: data, errorStatus: "" });
          setTimeout(() => {
            this.setState({ answerIsLoading: false });
          }, this.interfaceTimedDelay);
        }
      })
      .catch(function (err) {
        console.log("Failed to fetch answers", err);
        self.setState({
          answerIsLoading: false,
          errorStatus:
            "Failed to fetch answer. Answer server may need to be restarted. Error msg : " +
            err,
        });
      });
  }

  getPassages(postData) {
    let self = this;
    this.setState({ passageIsLoading: true });
    let passageUrl = this.serverBasePath + this.passageEndpoint;

    let passages = postJSONData(passageUrl, postData);
    passages
      .then((data) => {
        // console.log(data);

        if (data.status) {
          this.setState({ passages: data.result });
          // console.log(Object.keys(data));
        } else {
        }
        let errorStatus = data.status
          ? ""
          : "Error Fetching Passages. \n" + data.result;
        setTimeout(() => {
          this.setState({ passageIsLoading: false, errorStatus: errorStatus });
        }, this.interfaceTimedDelay);
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
        self.setState({
          passageIsLoading: false,
          errorStatus:
            "Failed to fetch passages. Passage server may need to be restarted.",
        });
      });
  }

  askQuestionButtonClick(e) {
    this.askQuestion();
  }

  inputKeyPress(e) {
    if (e.keyCode === 13) {
      this.askQuestion();
    }
  }

  toggleSearchConfig(e) {
    this.setState({
      openAdvancedConfigDrawer: !this.state.openAdvancedConfigDrawer,
    });
  }
  clickInfo(e) {
    this.setState({ showInfoModal: !this.state.showInfoModal });
  }
  clickSampleQuestion(e) {
    this.setState(
      {
        passages: { took: 0, hits: { hits: [] } },
        answers: { took: 0, answers: [] },
        selectedSampleIndex: e.target.getAttribute("qindex"),
      },
      () => {
        this.askQuestion();
      }
    );
  }

  getExplanation(selectedAnswerId) {
    let self = this;
    let answerData = this.state.answers.answers[selectedAnswerId];
    let postData = {
      question: answerData.question,
      context: answerData.context,
    };
    // console.log(postData);

    this.setState({ answerIsLoading: true });
    let explainUrl = this.serverBasePath + this.explainEndpoint;

    let explanation = postJSONData(explainUrl, postData);
    explanation
      .then((data) => {
        if (data) {
          let explanationHolder = this.state.explanations;
          explanationHolder[selectedAnswerId] = data;
          this.setState({ explanations: explanationHolder });
          // console.log(data);
          setTimeout(() => {
            this.setState({ answerIsLoading: false });
          }, this.interfaceTimedDelay);
        }
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
        self.setState({
          answerIsLoading: false,
          errorStatus:
            "Failed to fetch explainations. Explaination server may need to be restarted.",
        });
      });
  }

  clickExplainButton(e) {
    // console.log(e.target.getAttribute("id"));
    let selectedAnswerId = e.target.getAttribute("id");
    this.getExplanation(selectedAnswerId);
  }

  updateConfigSelectParams(e) {
    // console.log(e.target.options);

    let configType = e.target.options[e.target.selectedIndex].getAttribute(
      "type"
    );
    let selectedValue = e.target.options[e.target.selectedIndex].value;

    // console.log(configType, selectedValue);

    switch (configType) {
      case "maxdocuments":
        this.setState({ maxdocuments: selectedValue });
        break;
      case "reader":
        this.setState({ reader: selectedValue });
        break;
      case "stride":
        this.setState({ chunkStride: selectedValue });
        break;
      case "highlightspan":
        this.setState({ highlightSpan: selectedValue });
        break;
      case "retriever":
        this.setState({ retriever: selectedValue });
        break;
      case "relsnip":
        this.setState({ relsnip: selectedValue });
        break;
      case "expander":
        this.setState({ expander: selectedValue });
        break;
      default:
        break;
    }
    this.resetAnswer();
  }

  getOptionItems(option, defaultValue) {
    let selectItems = this.options[option].options.map((data, i) => {
      return (
        <SelectItem
          key={"select" + option + i}
          value={data.value}
          text={data.name + ""}
          type={option}
        />
      );
    });
    let selectElement = (
      <Select
        id={option + "select"}
        defaultValue={this.options[option].selected}
        hideLabel={true}
        style={{ width: "100%" }}
        onChange={this.updateConfigSelectParams.bind(this)}
      >
        {selectItems}
      </Select>
    );

    return selectElement;
  }

  toggleAdvancedOptions(e) {
    this.setState({ showAdvancedView: !this.state.showAdvancedView });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    let loadingStatus =
      this.state.passageIsLoading || this.state.answerIsLoading;

    // Whats this/info box
    let infoBox = this.advancedOptionsDescriptions.map((data, index) => {
      return (
        <div
          className="infodescrow underline pb10 pt5"
          key={"infodesc" + index}
        >
          <div className=" infodesctitle"> {data.title}</div>
          <div className=" infodescdesc"> {data.description}</div>
        </div>
      );
    });

    // Create a list view for passages
    let passageList = this.state.passages["hits"]["hits"].map((data, index) => {
      let dataTitle = "";
      if (data.highlight["name"] !== undefined) {
        for (let title of data.highlight["name"]) {
          dataTitle = dataTitle + " ... " + title;
        }
      } else {
        dataTitle = data._source.name;
      }
      let caseHighlight =
        data.highlight["casebody.data.opinions.text"] || "No highlight.";

      return (
        <div className="passagerow flex" key={"passagerow" + index}>
          <div className="answerrowtitletag mr10"> P{index} </div>
          <div className="flexfull">
            <div
              className="passagetitle highlightsection lhmedium"
              dangerouslySetInnerHTML={{ __html: dataTitle }}
            />

            <div className="mediumdesc lhmedium passagexcerpt">
              {/* <div className="answerrowtitletag mr10"> P{index} </div> */}
              <div
                className="highlightsection underline "
                dangerouslySetInnerHTML={{
                  __html: "... " + caseHighlight + " ... ",
                }}
              />
              {/* <div className="pb5"> {data.highlight["casebody.data.opinions.text"]}</div> */}
              {/* <div className="pt5">
                {" "}
                <span className="excerpttitle"> Case Excerpt: </span>{" "}
                {data.fields.opinion_excerpt} ...{" "}
              </div> */}
            </div>
          </div>
        </div>
      );
    });

    // Create list view for answers
    let answerList = this.state.answers.answers
      .slice(
        0,
        this.state.showAllAnswers ? this.state.answers.answers.length : 1
      )
      .map((data, index) => {
        let explanationsList = [];
        let currentExplanation = this.state.explanations[index];
        if (currentExplanation) {
          explanationsList = currentExplanation.token_words.map(
            (xdata, xindex) => {
              return (
                <span
                  style={{
                    backgroundColor:
                      "rgba(0, 98, 255, " +
                      currentExplanation.gradients[xindex] +
                      ")",
                  }}
                  className="explanationspan"
                  key={"expspan" + index + "" + xindex}
                >
                  {xdata} &nbsp;
                </span>
              );
            }
          );
        }
        return (
          <div
            className={
              "flex  p10 answerrow " + (index === 0 ? "topanswer" : "")
            }
            key={"answerrow" + index}
          >
            <div className="answerrowtitletag mr10"> A{data.index} </div>
            <div className="flexfull mediumdesc lhmedium">
              <div>
                <div className="smalldesc pt5">
                  Time: {data.took.toFixed(3)}s |{" "}
                  {(data.probability * 1).toFixed(4)}
                  {/* | Total Probability {(data.probability * 1).toFixed(4)} [  {((data.start_probability * 1) / 2).toFixed(4)} | {((data.end_probability * 1) / 2).toFixed(4)} ] */}
                </div>
                <div className="boldtext">
                  {" "}
                  <span className="answerquote">&#8220;</span> {data.answer}{" "}
                  <span className="pt10 answerquote">&#8221;</span>{" "}
                </div>
                {!currentExplanation && (
                  <div>
                    <div
                      className="p10 mt10 mb10 contextrow lightgreyhighlight"
                      dangerouslySetInnerHTML={{ __html: data.context }}
                    />
                    {this.state.showExplanationsView && (
                      <Button
                        id={index}
                        onClick={this.clickExplainButton.bind(this)}
                        size="small"
                      >
                        {" "}
                        Explain{" "}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {currentExplanation && (
                <div className="mt10 ">{explanationsList}</div>
              )}
            </div>
          </div>
        );
      });

    // Create sample qa passages for manual QA
    let qaSamples = this.state.sampleQA.map((data, index) => {
      return (
        <div
          qindex={index}
          onClick={this.clickSampleQuestion.bind(this)}
          key={"qasample" + index}
          className={
            "samplequestionrow mediumdesc clickable iblock " +
            (this.state.selectedSampleIndex + "" === index + ""
              ? " selected "
              : " ")
          }
        >
          {data.question}
        </div>
      );
    });

    let askedElapsed =
      (new Date() - this.lastAsked) / 1000 > this.maxStatusElasped;

    // Create configuration bar
    let configBar = (
      <div
        ref="modelconfigbar"
        style={{ zIndex: 100 }}
        className={"w100 pl10  pb10 unselectable greyhighlight modelconfigbar"}
      >
        <div className="positionrelative  ">
          <div className=" pt10 pb10 underline">
            Select QA model configuration.
          </div>
          <div
            className="whatsthis clickable"
            onClick={this.clickInfo.bind(this)}
          >
            {" "}
            &#63; what is this?{" "}
          </div>
        </div>
        <div className="w100   displayblock  ">
          <div className="  iblock mr10">
            <div className="mediumdesc pb7 pt5">
              {" "}
              {this.options.retriever.title}{" "}
              <span className="boldtext"> {this.state.retriever} </span>{" "}
            </div>
            {this.getOptionItems("retriever", "")}
          </div>

          <div className="pl10 borderleftdash iblock mr10">
            <div className="mediumdesc pb7 pt5">
              {" "}
              {this.options.reader.title}{" "}
              <span className="boldtext">
                {" "}
                {abbreviateString(this.state.reader, 16)}{" "}
              </span>{" "}
            </div>
            {this.getOptionItems("reader", "")}
          </div>

          <div className="iblock mr10">
            <div className="mediumdesc pb7 pt5">
              {" "}
              {this.options.stride.title}
              <span className="boldtext"> {this.state.chunkStride} </span>{" "}
            </div>
            {this.getOptionItems("stride", "")}
          </div>

          {/* show IR search pipeline config is dataset is not manual  */}
          {this.state.retriever !== "manual" && (
            <div className="pl10 borderleftdash iblock mr10 ">
              <div className="mediumdesc pb7 pt5">
                {" "}
                {this.options.maxdocuments.title}{" "}
                <span className="boldtext"> {this.state.maxdocuments} </span>{" "}
              </div>
              {this.getOptionItems("maxdocuments", "")}
            </div>
          )}

          {this.state.retriever !== "manual" && this.state.showExpander && (
            <div className=" iblock mr10">
              <div className="mediumdesc pb7 pt5">
                {" "}
                {this.options.expander.title}{" "}
                <span className="boldtext">
                  {" "}
                  {abbreviateString(this.state.expander + "", 16)}{" "}
                </span>{" "}
              </div>
              {this.getOptionItems("expander", "")}
            </div>
          )}

          {this.state.retriever !== "manual" && (
            <div className="iblock mr10 ">
              <div className="mediumdesc pb7 pt5">
                {" "}
                {this.options.highlightspan.title}{" "}
                <span className="boldtext"> {this.state.highlightSpan} </span>{" "}
              </div>
              {this.getOptionItems("highlightspan", "")}
            </div>
          )}

          {this.state.retriever !== "manual" && (
            <div className=" iblock mr10">
              <div className="mediumdesc pb7 pt5">
                {" "}
                {this.options.relsnip.title}{" "}
                <span className="boldtext">
                  {" "}
                  {abbreviateString(this.state.relsnip + "", 16)}{" "}
                </span>{" "}
              </div>
              {this.getOptionItems("relsnip", "")}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div>
        <Modal
          open={this.state.showInfoModal}
          modalHeading={"Description of advanced options"}
          passiveModal={true}
          aria-label={"Info Modal"}
          modalAriaLabel={"Info Modal"}
          onRequestClose={this.clickInfo.bind(this)}
          hasScrollingContent={true}
          // secondaryButtonText={"Cancel"}
        >
          {infoBox}
        </Modal>
        {this.state.showIntro && (
          <div className="clearfix mynotif positionrelative  mt10 h100 lh10  lightbluehightlight maxh16  mb10">
            {this.props.data.views.advanced && (
              <div className=" floatright lightgreyhighlight ml10  pr10 pl10 pb10 ">
                {/* <div className="mediumdesc boldtext"> Advanced Options</div> */}

                <div className="boldtext  iblock ">
                  <Toggle
                    id="advancedoptionstoggle"
                    className="smalldesc boldtext mr10"
                    labelA="Off"
                    labelB="On"
                    defaultToggled={this.state.showAdvancedView}
                    // onChange action('onChange'),
                    onToggle={this.toggleAdvancedOptions.bind(this)}
                  ></Toggle>
                </div>

                <div className="mediumdesc boldtext"> Advanced Options</div>
              </div>
            )}
            <span className="boldtext mb5">{this.state.apptitle}</span>
            <br />
            {this.state.appsubtitle}
          </div>
        )}

        <div
          className={
            " mb10" + (this.state.showAdvancedView ? "" : " displaynone")
          }
        >
          {/* config panel and content */}
          <div
            onClick={this.toggleSearchConfig.bind(this)}
            className="unselectable mt10 p10 clickable  flex greymoreinfo"
          >
            <div className="iblock flexfull minwidth485">
              <strong>
                {" "}
                {!this.state.openAdvancedConfigDrawer && (
                  <span>&#x25BC; </span>
                )}{" "}
                {this.state.openAdvancedConfigDrawer && <span>&#x25B2; </span>}{" "}
              </strong>
              Advanced Options
            </div>
            <div className="iblock   ">
              <div className="iblock mr5">
                {" "}
                <span className="boldtext"> </span>
              </div>
              <div className="iblock">
                <div className="smalldesc">
                  {" "}
                  {this.state.maxdocuments} Results |{" "}
                  {this.state.reader.toUpperCase()}{" "}
                </div>
              </div>
            </div>
          </div>

          {
            <div
              className={
                "flex underline p10 modelconfigdiv w100  " +
                (this.state.openAdvancedConfigDrawer ? "" : " displaynone")
              }
            >
              {/* <div> Advanced configuration settings </div> */}
              <div className="w100"> {configBar}</div>
            </div>
          }
        </div>

        {this.state.retriever === "manual" && this.state.showSamples && (
          <div className=" mb10">
            <div className="smalldesc p5">
              {" "}
              Select any sample question/passage pair below{" "}
            </div>
            {qaSamples}
          </div>
        )}
        <div className="mt5 mt10 mb10 mediumdesc"> Enter question </div>
        <div className="flex searchbar">
          <div
            key={"questioninput" + this.state.selectedSampleIndex}
            className="flexfull"
          >
            <TextInput
              id="questioninput"
              defaultValue={
                this.state.sampleQA[this.state.selectedSampleIndex].question
              }
              hideLabel={true}
              labelText="Hi there"
              onKeyDown={this.inputKeyPress.bind(this)}
              placeholder="Enter question. e.g. Which cases cite dwayne vs the united states."
            ></TextInput>
          </div>

          <div>
            {" "}
            <Button
              onClick={this.askQuestionButtonClick.bind(this)}
              size="field"
            >
              {" "}
              Get Answer{" "}
            </Button>
          </div>
        </div>

        {/* {this.state.sampleQA[this.state.selectedSampleIndex].context} */}

        {this.state.retriever === "manual" && (
          <div
            key={"contexttextarea" + this.state.selectedSampleIndex}
            className="mt10"
          >
            <div className="mt5 mb10 mediumdesc"> Enter passage </div>
            <TextArea
              id="contextinput"
              className="contextinputarea"
              defaultValue={
                this.state.sampleQA[this.state.selectedSampleIndex].context
              }
              labelText="Enter a passage"
              hideLabel={true}
            ></TextArea>
          </div>
        )}

        <div className="mediumdesc pt7 pb7">
          {this.state.answerIsLoading && (
            <span> Asking BERT for answers ... </span>
          )}
        </div>
        {!askedElapsed && this.state.errorStatus.length > 1 && (
          <div className="errormessage">{this.state.errorStatus}</div>
        )}

        {answerList.length > 0 && (
          <div>
            {/* <Loading
                            active={this.state.answerIsLoading}
                            description="Active loading indicator" withOverlay={true}
                        /> */}
            <div className="flex mt10 ">
              <div
                className="loaderbox"
                style={{
                  opacity: loadingStatus ? 1 : 0,
                  width: loadingStatus ? "34px" : "0px",
                }}
              >
                <Loading
                  className=" "
                  active={true}
                  small={true}
                  withOverlay={false}
                >
                  {" "}
                </Loading>
              </div>

              <div className="flexfull  sectionheading">
                <span className="boldtext">
                  {" "}
                  {answerList.length} Answer{answerList.length > 1 ? "s" : ""}{" "}
                  found{" "}
                </span>
                {!this.state.answerIsLoading && (
                  <span className="mediumdesc">
                    {" "}
                    {this.state.answers["took"].toFixed(3)} seconds.{" "}
                  </span>
                )}
              </div>
              <div className="lh2m">
                {this.state.answerIsLoading && (
                  <span className="mediumdesc"> Loading answers ... </span>
                )}
              </div>
            </div>
            <div>{answerList}</div>
          </div>
        )}

        {!askedElapsed &&
          answerList.length === 0 &&
          !this.state.answerIsLoading && (
            <div className="p10 orangehighlight">No answers found.</div>
          )}

        {(this.state.showPassagesView && passageList.length) > 0 && (
          <div>
            <div className="mt10 mb10">
              <span className="boldtext">
                {" "}
                {this.state.passages["hits"]["hits"].length} Passages found.{" "}
              </span>
              {this.state.passageIsLoading && (
                <span className="mediumdesc"> Loading passages ... </span>
              )}
              {!this.state.passageIsLoading && (
                <span className="mediumdesc">
                  {" "}
                  {this.state.passages["took"] / 1000} seconds{" "}
                </span>
              )}
            </div>
            <div className="passagebox  mt10">{passageList}</div>
          </div>
        )}

        {!askedElapsed &&
          passageList.length === 0 &&
          this.state.retriever !== "manual" &&
          !this.state.passageIsLoading && (
            <div className="p10 mt5 orangehighlight">
              Your query did not match any passages. Try a different query.
            </div>
          )}

        {/* {askedElapsed + ""} bingo */}
        <br />
        <br />
        <br />
      </div>
    );
  }
}

export default QueryView;
