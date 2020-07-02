/**
 * @license
 * Copyright 2019 Fast Forward Labs.  
 * Written by / Contact : https://github.com/victordibia
 * NeuralQA - NeuralQA: Question Answering on Large Datasets with BERT.
 * Licensed under the MIT License (the "License"); 
 * =============================================================================
 */


import React, { Component } from "react";
import { Button, Select, SelectItem, TextInput, TextArea, Loading } from 'carbon-components-react';
import { postJSONData, SampleQA, abbreviateString } from "../helperfunctions/HelperFunctions"
import "./queryview.css"
// import * as _ from "lodash"

// const { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } = DataTable;


class QueryView extends Component {
    constructor(props) {
        super(props)

        console.log(props);


        // Advanced options 
        this.numPassages = [{ id: "opt1", text: "5", value: 5, type: "size" }, { id: "opt2", text: "10", value: 10, type: "size" }]
        this.qaModelOptions = [{ id: "opt1", text: "DistilBert SQUAD2", value: "distilbertcasedsquad2", type: "model" }, { id: "opt2", text: "BERT SQUAD2", value: "bertcasedsquad2", type: "model" }]
        this.highlightSpanOptions = [{ id: "opt5", text: "150", value: 150, type: "highlight" }, { id: "opt4", text: "250", value: 250, type: "highlight" }, { id: "opt1", text: "350", value: 350, type: "highlight" }, { id: "opt2", text: "650", value: 650, type: "highlight" }, { id: "opt3", text: "850", value: 850, type: "highlight" }]
        this.chunkStrideOptions = [{ id: "opt1", text: "0", value: 0, type: "stride" }, { id: "opt2", text: "50", value: 50, type: "stride" }, { id: "opt3", text: "100", value: 100, type: "stride" }, { id: "opt4", text: "300", value: 300, type: "stride" }]
        this.datasetOptions = [{ id: "opt1", text: "Case Law", value: "cases", type: "dataset" }, { id: "opt2", text: "Manual", value: "manual", type: "dataset" }]

        this.selectedSize = 0
        this.selectedQaModel = 0
        this.selectedHighlightSpan = 1
        this.selectedChunkStride = 2
        this.selectedDataset = 1

        this.state = {
            apptitle: props.data.intro.title,
            appsubtitle: props.data.intro.subtitle,
            passages: { "took": 0, hits: { hits: [] } },
            answers: { "took": 0, answers: [] },
            passageIsLoading: false,
            answerIsLoading: false,
            errorStatus: "",

            resultSize: this.numPassages[this.selectedSize].value,
            qaModelName: this.qaModelOptions[this.selectedQaModel].value,
            highlightSpan: this.highlightSpanOptions[this.selectedHighlightSpan].value,
            chunkStride: this.chunkStrideOptions[this.selectedChunkStride].value,
            dataset: this.datasetOptions[this.selectedDataset].value,
            sampleQA: SampleQA(),
            selectedSampleIndex: 0,
            explanations: {},

            showAdvancedConfig: props.data.views.advanced,
            showExplanations: props.data.views.explanations,
            showPassages: props.data.views.passages,
            showSearchConfig: false,
            showSamples: props.data.views.samples,
            showAllAnswers: props.data.views.allanswers,
            showIntro: props.data.views.intro
        }

        this.serverBasePath = window.location.protocol + "//" + window.location.host
        this.serverBasePath = "http://localhost:5000"
        this.passageEndpoint = "/passages"
        this.answerEndpoint = "/answer"
        this.explainEndpoint = "/explain"
        this.interfaceTimedDelay = 400
        this.maxStatusElasped = 6  // Remove error/status msgs after maxStatusElasped secs

    }

    componentDidMount() {
        this.askQuestion()
    }

    resetAnswer() {
        this.setState({
            passages: { "took": 0, hits: { hits: [] } },
            answers: { "took": 0, answers: [] },
            errorStatus: "",
            explanations: {}
        })
    }
    resetExplanations() {
        this.setState({
            explanations: {}
        })
    }

    askQuestion() {
        this.resetExplanations()
        let question = document.getElementById("questioninput").value
        let context = document.getElementById("contextinput") ? document.getElementById("contextinput").value : null
        let postData = {
            size: this.state.resultSize,
            context: context || this.state.sampleQA[0].context,
            question: question || this.state.sampleQA[0].context,
            highlightspan: this.state.highlightSpan,
            modelname: this.state.qaModelName,
            dataset: this.state.dataset,
            stride: this.state.chunkStride
        }
        if (this.state.dataset !== "manual") {
            this.getPassages(postData)
        }

        // console.log(postData);


        this.getAnswers(postData)
        this.lastAsked = new Date();
    }

    getAnswers(postData) {
        // this.setState({ answers: { "took": 0, answers: [] } })
        let self = this
        this.setState({ answerIsLoading: true })
        let answerUrl = this.serverBasePath + this.answerEndpoint

        let answers = postJSONData(answerUrl, postData)
        answers.then((data) => {
            if (data) {
                // console.log(data)
                this.setState({ answers: data, errorStatus: "" })
                setTimeout(() => {
                    this.setState({ answerIsLoading: false })
                }, this.interfaceTimedDelay);
            }
        })
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
                self.setState({ answerIsLoading: false, errorStatus: "Failed to fetch answer. Answer server may need to be restarted." })
            });
    }

    getPassages(postData) {
        let self = this
        this.setState({ passageIsLoading: true })
        let passageUrl = this.serverBasePath + this.passageEndpoint

        let passages = postJSONData(passageUrl, postData)
        passages.then((data) => {
            // console.log(data);

            if (data.status) {
                this.setState({ passages: data.result })
                // console.log(Object.keys(data)); 
            } else {

            }
            let errorStatus = data.status ? "" : data.result;
            setTimeout(() => {
                this.setState({ passageIsLoading: false, errorStatus: errorStatus })
            }, this.interfaceTimedDelay);
        }).catch(function (err) {
            console.log('Fetch Error :-S', err);
            self.setState({ passageIsLoading: false, errorStatus: "Failed to fetch passages. Passage server may need to be restarted." })
        });
    }

    askQuestionButtonClick(e) {
        this.askQuestion()
    }

    inputKeyPress(e) {
        if (e.keyCode === 13) {
            this.askQuestion()
        }
    }

    toggleAdvancedOptions(e) {
        this.setState({ showAdvancedConfig: !(this.state.showAdvancedConfig) })
    }

    toggleSearchConfig(e) {
        this.setState({ showSearchConfig: !(this.state.showSearchConfig) })
    }

    clickSampleQuestion(e) {
        this.setState({
            passages: { "took": 0, hits: { hits: [] } },
            answers: { "took": 0, answers: [] },
            selectedSampleIndex: e.target.getAttribute("qindex")
        }, () => {
            this.askQuestion()
        })
    }

    getExplanation(selectedAnswerId) {
        let self = this
        let answerData = this.state.answers.answers[selectedAnswerId]
        let postData = {
            question: answerData.question,
            context: answerData.context
        }
        // console.log(postData);

        this.setState({ answerIsLoading: true })
        let explainUrl = this.serverBasePath + this.explainEndpoint

        let explanation = postJSONData(explainUrl, postData)
        explanation.then((data) => {
            if (data) {
                let explanationHolder = this.state.explanations
                explanationHolder[selectedAnswerId] = data
                this.setState({ explanations: explanationHolder })
                // console.log(data);
                setTimeout(() => {
                    this.setState({ answerIsLoading: false })
                }, this.interfaceTimedDelay);
            }
        })
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
                self.setState({ answerIsLoading: false, errorStatus: "Failed to fetch explainations. Explaination server may need to be restarted." })
            });
    }
    clickExplainButton(e) {
        // console.log(e.target.getAttribute("id"));
        let selectedAnswerId = e.target.getAttribute("id")
        this.getExplanation(selectedAnswerId)
    }


    updateConfigSelectParams(e) {
        let configType = e.target.options[e.target.selectedIndex].getAttribute("type")
        let selectedValue = e.target.options[e.target.selectedIndex].value
        switch (configType) {
            case "size":
                this.setState({ resultSize: selectedValue })
                break
            case "model":
                this.setState({ qaModelName: selectedValue })
                break
            case "stride":
                this.setState({ chunkStride: selectedValue })
                break
            case "highlight":
                this.setState({ highlightSpan: selectedValue })
                break
            case "dataset":
                this.setState({ dataset: selectedValue })
                break
            default:
                break
        }
        this.resetAnswer()
    }

    getSelectItems(selectData, defaultValue) {
        let selectItems = selectData.map((data, i) => {
            return (
                <SelectItem key={"select" + data.type + i}
                    value={data.value}
                    text={data.text}
                    type={data.type}
                />
            )
        })
        let selectElement = (<Select
            id={selectData[0].type + "select"}
            defaultValue={defaultValue}
            hideLabel={true}
            style={{ width: "100%" }}
            onChange={this.updateConfigSelectParams.bind(this)}
        >
            {selectItems}
        </Select>)

        return selectElement
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }




    render() {

        let loadingStatus = this.state.passageIsLoading || this.state.answerIsLoading;
        // Create a list view for passages
        let passageList = this.state.passages["hits"]["hits"].map((data, index) => {
            let dataTitle = ""
            if (data.highlight["name"] !== undefined) {
                for (let title of data.highlight["name"]) {
                    dataTitle = dataTitle + " ... " + title
                }
            } else {
                dataTitle = data._source.name
            }
            let caseHighlight = data.highlight["casebody.data.opinions.text"] || "No highlight."

            return (
                <div className="passagerow flex" key={"passagerow" + index}>
                    <div className="answerrowtitletag mr10"> P{index} </div>
                    <div className="flexfull">
                        <div className="passagetitle highlightsection lhmedium" dangerouslySetInnerHTML={{ __html: dataTitle }} />

                        <div className="mediumdesc lhmedium passagexcerpt">
                            {/* <div className="answerrowtitletag mr10"> P{index} </div> */}
                            <div className="highlightsection underline " dangerouslySetInnerHTML={{ __html: "... " + caseHighlight + " ... " }} />
                            {/* <div className="pb5"> {data.highlight["casebody.data.opinions.text"]}</div> */}
                            <div className="pt5"> <span className="excerpttitle"> Case Excerpt: </span> {data.fields.opinion_excerpt} ... </div>
                        </div>
                    </div>
                </div>
            )
        })

        // Create list view for answers
        let answerList = this.state.answers.answers.slice(0, this.state.showAllAnswers ? this.state.answers.answers.length : 1)
            .map((data, index) => {
                let explanationsList = []
                let currentExplanation = this.state.explanations[index]
                if (currentExplanation) {
                    explanationsList = currentExplanation.token_words.map((xdata, xindex) => {
                        return (
                            <span style={{ backgroundColor: "rgba(0, 98, 255, " + currentExplanation.gradients[xindex] + ")" }} className="explanationspan" key={"expspan" + index + "" + xindex}>
                                {xdata} &nbsp;
                            </span>
                        )
                    })
                }
                return (
                    <div className={"flex  p10 answerrow " + (index === 0 ? "topanswer" : "")} key={"answerrow" + index}>
                        <div className="answerrowtitletag mr10"> A{data.index} </div>
                        <div className="flexfull mediumdesc lhmedium">
                            <div>
                                <div className="smalldesc pt5">
                                    Time: {data.took.toFixed(3)}s | {(data.probability * 1).toFixed(4)}
                                    {/* | Total Probability {(data.probability * 1).toFixed(4)} [  {((data.start_probability * 1) / 2).toFixed(4)} | {((data.end_probability * 1) / 2).toFixed(4)} ] */}
                                </div>
                                <div className="boldtext">  <span className="answerquote">&#8220;</span> {data.answer} <span className="pt10 answerquote">&#8221;</span> </div>
                                {(!currentExplanation) && <div>
                                    <div className="p10 mt10 mb10 contextrow lightgreyhighlight" dangerouslySetInnerHTML={{ __html: data.context }} />
                                    {this.state.showExplanations && <Button
                                        id={index}
                                        onClick={this.clickExplainButton.bind(this)}
                                        size="small"
                                    > Explain </Button>}
                                </div>}

                            </div>

                            {currentExplanation &&
                                <div className="mt10 ">
                                    {explanationsList}
                                </div>}
                        </div>
                    </div>
                )
            })


        // Create sample qa passages for manual QA
        let qaSamples = this.state.sampleQA.map((data, index) => {
            return (
                <div qindex={index} onClick={this.clickSampleQuestion.bind(this)} key={"qasample" + index} className={"samplequestionrow mediumdesc clickable iblock " + (this.state.selectedSampleIndex + "" === index + "" ? " selected " : " ")}>
                    {data.question}
                </div>
            )
        })

        let askedElapsed = (new Date() - this.lastAsked) / 1000 > this.maxStatusElasped;

        // Create configuration bar 
        let configBar = (
            <div ref="modelconfigbar" style={{ zIndex: 100 }} className={"w100 unselectable greyhighlight   modelconfigbar "}>

                <div className="underline p10">
                    {<div className="smallblueball pulse iblock"></div>}
                    Select QA model configuration.
                </div>

                <div className="w100  displayblock   p10">
                    <div className="  iblock mr10">
                        <div className="mediumdesc pb7 pt5"> Dataset <span className="boldtext"> {this.state.dataset} </span> </div>
                        {this.getSelectItems(this.datasetOptions, this.datasetOptions[this.selectedDataset].value)}
                    </div>

                    <div className="pl10 borderleftdash iblock mr10">
                        <div className="mediumdesc pb7 pt5"> QA Model <span className="boldtext"> {abbreviateString(this.state.qaModelName, 16)} </span> </div>
                        {this.getSelectItems(this.qaModelOptions, this.qaModelOptions[0].value)}
                    </div>

                    <div className="iblock mr10">
                        <div className="mediumdesc pb7 pt5"> Token Stride <span className="boldtext"> {this.state.chunkStride} </span> </div>
                        {this.getSelectItems(this.chunkStrideOptions, this.chunkStrideOptions[0].value)}
                    </div>

                    {/* show IR search pipeline config is dataset is not manual  */}
                    {this.state.dataset !== "manual" && <div className="pl10 borderleftdash iblock mr10 ">
                        <div className="mediumdesc pb7 pt5"> Passages <span className="boldtext"> {this.state.resultSize} </span> </div>
                        {this.getSelectItems(this.numPassages, this.numPassages[0].value)}
                    </div>}

                    {this.state.dataset !== "manual" && <div className="iblock mr10 ">
                        <div className="mediumdesc pb7 pt5"> IR Highlight Span <span className="boldtext"> {this.state.highlightSpan} </span> </div>
                        {this.getSelectItems(this.highlightSpanOptions, this.highlightSpanOptions[0].value)}
                    </div>}
                </div>
            </div>
        )


        return (
            <div>
                {this.state.showIntro && <div className="mynotif mt10 h100 lh10  lightbluehightlight maxh16  mb10">
                    <div className="boldtext mb5">{this.state.apptitle}</div>
                    <div> {this.state.appsubtitle}</div>
                </div>}

                <div className={" mb10" + (this.state.showAdvancedConfig ? "" : " displaynone")}>

                    {/* config panel and content */}
                    <div onClick={this.toggleSearchConfig.bind(this)} className="unselectable mt10 p10 clickable  flex greymoreinfo">
                        <div className="iblock flexfull minwidth485">
                            <strong> {!this.state.showSearchConfig && <span>&#x25BC;  </span>} {this.state.showSearchConfig && <span>&#x25B2;  </span>} </strong>
                            Advanced Options
                            </div>
                        <div className="iblock   ">
                            <div className="iblock mr5"> <span className="boldtext"> </span></div>
                            <div className="iblock">
                                <div className="smalldesc"> {this.state.resultSize} Results | {this.state.qaModelName.toUpperCase()} </div>
                            </div>
                        </div>

                    </div>

                    {<div className={"flex underline p10 modelconfigdiv w100  " + (this.state.showSearchConfig ? "" : " displaynone")} >
                        {/* <div> Advanced configuration settings </div> */}
                        <div className="w100"> {configBar}</div>
                    </div>}
                </div>

                {(this.state.dataset === "manual" && this.state.showSamples) &&
                    <div className=" mb10">
                        <div className="smalldesc p5"> Select any sample question/passage pair below </div>
                        {qaSamples}
                    </div>
                }
                <div className="mt5 mt10 mb10 mediumdesc"> Enter question </div>
                <div className="flex searchbar">

                    <div key={"questioninput" + this.state.selectedSampleIndex} className="flexfull">
                        <TextInput
                            id="questioninput"
                            defaultValue={this.state.sampleQA[this.state.selectedSampleIndex].question}
                            hideLabel={true}
                            labelText="Hi there"
                            onKeyDown={this.inputKeyPress.bind(this)}
                            placeholder="Enter question. e.g. Which cases cite dwayne vs the united states."
                        >
                        </TextInput>
                    </div>

                    <div> <Button
                        onClick={this.askQuestionButtonClick.bind(this)}
                        size="field"> Get Answer </Button>
                    </div>
                </div>



                {/* {this.state.sampleQA[this.state.selectedSampleIndex].context} */}

                {this.state.dataset === "manual" &&
                    <div key={"contexttextarea" + this.state.selectedSampleIndex} className="mt10">
                        <div className="mt5 mb10 mediumdesc"> Enter passage </div>
                        <TextArea
                            id="contextinput"
                            className="contextinputarea"
                            defaultValue={this.state.sampleQA[this.state.selectedSampleIndex].context}
                            labelText="Enter a passage"
                            hideLabel={true}
                        >

                        </TextArea>
                    </div>
                }

                <div className="mediumdesc pt7 pb7">

                    {this.state.answerIsLoading && <span> Asking BERT for answers ...   </span>}

                </div>
                {(!askedElapsed && this.state.errorStatus.length > 1) && <div className="errormessage">{this.state.errorStatus}</div>}

                {answerList.length > 0 &&
                    <div>
                        {/* <Loading
                            active={this.state.answerIsLoading}
                            description="Active loading indicator" withOverlay={true}
                        /> */}
                        <div className="flex mt10 ">
                            <div className="loaderbox" style={{ opacity: (loadingStatus) ? 1 : 0, width: (loadingStatus) ? "34px" : "0px" }} >

                                <Loading
                                    className=" "
                                    active={true}
                                    small={true}
                                    withOverlay={false}
                                > </Loading>
                            </div>

                            <div className="flexfull  sectionheading">
                                <span className="boldtext">  BERT Answer Results</span>
                                {!this.state.answerIsLoading && <span className="mediumdesc"> {answerList.length} item{answerList.length > 1 ? "s" : ""} | {this.state.answers["took"].toFixed(3)} seconds </span>}
                            </div>
                            <div className="lh2m">
                                {this.state.answerIsLoading && <span className="mediumdesc"> Loading answers ... </span>}
                            </div>
                        </div>
                        <div>{answerList}</div>
                    </div>
                }

                {(!askedElapsed && answerList.length === 0 && !(this.state.answerIsLoading)) &&
                    <div className="p10 orangehighlight">
                        No answers found.
                    </div>
                }

                {passageList.length > 0 &&
                    <div>
                        <div className="mt10 mb10">
                            <span className="boldtext">Passage Query Results </span>
                            {this.state.passageIsLoading && <span className="mediumdesc"> Loading passages ... </span>}
                            {!this.state.passageIsLoading && <span className="mediumdesc"> {this.state.passages["hits"]["hits"].length} items | {this.state.passages["took"] / 1000} seconds </span>}
                        </div>
                        <div className="passagebox  mt10">
                            {passageList}
                        </div>
                    </div>
                }

                {(!askedElapsed && passageList.length === 0 && this.state.dataset !== "manual" && !(this.state.passageIsLoading)) &&
                    <div className="p10 mt5 orangehighlight">
                        Your query did not match any passages. Try a different query.
                    </div>
                }

                {/* {askedElapsed + ""} bingo */}
                <br />
                <br />
                <br />


            </div>

        );
    }
}

export default QueryView;