// Web interface to visualize example Anomaly Detection Interaction.
// Data is visualized using the Carbon Desgin System Data Table.
// Data is


import React, { Component } from "react";
import { Button, TextInput, Loading, Dropdown } from 'carbon-components-react';
import { postJSONData } from "../helperfunctions/HelperFunctions"
import "./queryview.css"

// const { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } = DataTable;


class QueryView extends Component {
    constructor(props) {
        super(props)

        // Advanced options
        this.sizeOptions = [{ id: "opt1", text: "5", value: 5, type: "size" }, { id: "opt2", text: "10", value: 10, type: "size" }]
        this.qaModelOptions = [{ id: "opt1", text: "DistilBert", value: "distilbert", type: "model" }, { id: "opt2", text: "Bert", value: "bert", type: "model" }]
        this.highlightSpanOptions = [{ id: "opt1", text: "450", value: 450, type: "highlight" }, { id: "opt2", text: "650", value: 650, type: "highlight" }, { id: "opt3", text: "850", value: 850, type: "highlight" }]
        this.chunkStrideOptions = [{ id: "opt1", text: "0", value: 0, type: "stride" }, { id: "opt2", text: "50", value: 50, type: "stride" }, { id: "opt3", text: "100", value: 100, type: "stride" }, { id: "opt4", text: "300", value: 300, type: "stride" }]

        this.selectedSize = 0
        this.selectedQaModel = 0
        this.selectedHighlightSpan = 0
        this.selectedChunkStride = 0

        this.state = {
            apptitle: "CaseQA",
            passages: { "took": 0, hits: { hits: [] } },
            answers: { "took": 0, answers: [] },
            passageIsLoading: false,
            answerIsLoading: false,
            errorStatus: "",
            showAdvancedConfig: true,
            showSearchConfig: true,
            resultSize: this.sizeOptions[this.selectedSize].value,
            qaModel: this.qaModelOptions[this.selectedQaModel].value,
            highlightSpan: this.highlightSpanOptions[this.selectedHighlightSpan].value,
            chunkStride: this.chunkStrideOptions[this.selectedChunkStride].value,
        }

        this.serverBasePath = "http://localhost:3008"
        this.passageEndpoint = "/passages"
        this.answerEndpoint = "/answer"
        this.interfaceTimedDelay = 400



    }

    componentDidMount() {
        this.askQuestion()
    }

    askQuestion() {
        let searchText = document.getElementById("questioninput").value
        let postData = {
            size: this.state.resultSize,
            searchtext: searchText || "what is a fourth amendment right violation?",
            highlightspan: this.state.highlightSpan,
            model: this.state.qaModel,
            stride: this.state.chunkStride
        }
        this.getPassages(postData)
        this.getAnswers(postData)
    }

    getAnswers(postData) {
        // this.setState({ answers: { "took": 0, answers: [] } })
        let self = this
        this.setState({ answerIsLoading: true })
        let answerUrl = this.serverBasePath + this.answerEndpoint

        let answers = postJSONData(answerUrl, postData)
        answers.then((data) => {
            if (data) {
                this.setState({ answers: data })
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
            if (data) {
                this.setState({ passages: data })
                // console.log(Object.keys(data));
                setTimeout(() => {
                    this.setState({ passageIsLoading: false })
                }, this.interfaceTimedDelay);
            }
        })
            .catch(function (err) {
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

    updateConfigParams(e) {

        switch (e.selectedItem.type) {
            case "size":
                this.setState({ resultSize: e.selectedItem.value })
                break
            case "model":
                this.setState({ qaModel: e.selectedItem.value })
                break
            case "stride":
                this.setState({ chunkStride: e.selectedItem.value })
                break
            case "highlight":
                this.setState({ highlightSpan: e.selectedItem.value })
                break

            default:
                break
        }


    }



    render() {

        let loadingStatus = this.state.passageIsLoading || this.state.answerIsLoading;
        let passageList = this.state.passages["hits"]["hits"].map((data, index) => {
            let dataTitle = ""
            if (data.highlight["name"] !== undefined) {
                for (let title of data.highlight["name"]) {
                    dataTitle = dataTitle + " ... " + title
                }
            } else {
                dataTitle = data._source.name
            }

            // let answerSpan = ""
            // if (this.state.answers.answers[index] !== undefined) {
            //     for (let [i, answer] of this.state.answers.answers[index].entries()) {
            //         answerSpan = answerSpan + "[" + answer.took.toFixed(2) + "s] " + answer.answer + (i !== this.state.answers.answers[index].length - 1 ? ", " : ""
            //         )
            //     }
            //     if (this.state.answers.answers[index].length === 0) {
            //         answerSpan = "no answers found in this section."
            //     }
            // } else {
            //     answerSpan = " reading retrieved text .."
            // }
            return (
                <div className="passagerow flex" key={"passagerow" + index}>
                    <div className="answerrowtitletag mr10"> P{index} </div>
                    <div className="flexfull">
                        <div className="passagetitle highlightsection " dangerouslySetInnerHTML={{ __html: dataTitle }} />

                        <div className="mediumdesc lhmedium passagexcerpt">
                            {/* <div className="answerrowtitletag mr10"> P{index} </div> */}
                            <div className="highlightsection underline " dangerouslySetInnerHTML={{ __html: "... " + data.highlight["casebody.data.opinions.text"] + " ... " }} />
                            {/* <div className="pb5"> {data.highlight["casebody.data.opinions.text"]}</div> */}
                            <div className="pt5"> <span className="excerpttitle"> Case Excerpt: </span> {data.fields.opinion_excerpt} ... </div>
                        </div>
                    </div>
                </div>
            )
        })

        let answerList = this.state.answers.answers.map((data, index) => {
            let answerSubSpan = data.map((sub, subindex) => {
                return (
                    <div className={"answersubrow " + (data.length > 1 ? " underline " : "")} key={"answersubrow" + subindex}>
                        {sub.answer}
                        <div className="smalldesc pt5">
                            Time: {sub.took.toFixed(3)}s | Probability {(sub.start_probability * 1).toFixed(4)}
                        </div>
                    </div>
                )
            })

            if (data.length > 0) {
                return (
                    <div className="flex  p10 answerrow" key={"answerrow" + index}>
                        <div className="answerrowtitletag mr10"> A{index} </div>
                        <div className="flexfull"> {answerSubSpan}</div>
                    </div>
                )
            } else {
                return (<div key={"answerrow" + index}></div>)
            }



        })

        let configBar = (
            <div ref="modelconfigbar" style={{ zIndex: 100 }} className={"w100 unselectable greyhighlight   modelconfigbar "}>

                <div className="underline p10">
                    {<div className="smallblueball pulse iblock"></div>}
                    Select QA model configuration.
                </div>
                <div className="w100  displayblock   p10">

                    <div className="iblock mr10 ">
                        <div className="mediumdesc pb7 pt5"> Result Size <span className="boldtext"> {this.state.resultSize} </span> </div>
                        <Dropdown
                            id="sizedropdown"
                            label="Result Size"
                            items={this.sizeOptions}
                            initialSelectedItem={this.sizeOptions[0]}
                            itemToString={item => (item ? item.text : "")}
                            onChange={this.updateConfigParams.bind(this)}
                        />
                    </div>

                    <div className="iblock mr10 ">
                        <div className="mediumdesc pb7 pt5"> Highligh Span <span className="boldtext"> {this.state.highlightSpan} </span> </div>
                        <Dropdown
                            id="qamodeldropdown"
                            label="Highlight Span"
                            items={this.highlightSpanOptions}
                            initialSelectedItem={this.highlightSpanOptions[0]}
                            itemToString={item => (item ? item.text : "")}
                            onChange={this.updateConfigParams.bind(this)}
                        />
                    </div>



                    <div className="pl10 borderleftdash iblock mr10">
                        <div className="mediumdesc pb7 pt5"> QA Model <span className="boldtext"> {this.state.qaModel} </span> </div>
                        <Dropdown
                            id="qamodeldropdown"
                            label="QA Model"
                            items={this.qaModelOptions}
                            initialSelectedItem={this.qaModelOptions[0]}
                            itemToString={item => (item ? item.text : "")}
                            onChange={this.updateConfigParams.bind(this)}
                        />
                    </div>



                    <div className="iblock mr10">
                        <div className="mediumdesc pb7 pt5"> Token Stride <span className="boldtext"> {this.state.chunkStride} </span> </div>
                        <Dropdown
                            id="qamodeldropdown"
                            label="Token Stride"
                            items={this.chunkStrideOptions}
                            initialSelectedItem={this.chunkStrideOptions[0]}
                            itemToString={item => (item ? item.text : "")}
                            onChange={this.updateConfigParams.bind(this)}
                        />
                    </div>





                </div>

            </div>
        )

        return (
            <div>
                <div className="mynotif mt10 h100 lh10  lightbluehightlight maxh16  mb10">
                    <div className="boldtext mb5">{this.state.apptitle}:  Question Answering on Case Law Documents</div>
                    {this.state.apptitle} is an interactive tool for exploring
                    the two stage process of candidate retrieval and document reading required for question answering.
                    Search is powered by datasets from <a href="http://case.law" rel="noopener noreferrer" target="_blank"> case.law</a> dataset.
                    <br></br>
                    To begin, type in a question query below.

                </div>

                <div className={" mb10" + (this.state.showAdvancedConfig ? "" : " displaynone")}>

                    {/* config panel and content */}
                    <div onClick={this.toggleSearchConfig.bind(this)} className="unselectable mt10 p10 clickable  flex greymoreinfo">
                        <div className="iblock flexfull minwidth485">
                            <strong> {!this.state.showSearchConfig && <span>&#x25BC;  </span>} {this.state.showSearchConfig && <span>&#x25B2;  </span>} </strong>
                            QA Configuration
                            </div>
                        <div className="iblock   ">
                            <div className="iblock mr5"> <span className="boldtext"> </span></div>
                            <div className="iblock">
                                <div className="smalldesc"> {this.state.resultSize} Results | {this.state.qaModel.toUpperCase()} </div>
                            </div>
                        </div>

                    </div>

                    {<div className={"flex underline p10 modelconfigdiv w100  " + (this.state.showSearchConfig ? "" : " displaynone")} >
                        {/* <div> Advanced configuration settings </div> */}
                        <div className="w100"> {configBar}</div>
                    </div>}
                </div>

                <div className="flex searchbar">
                    <div className="flexfull">
                        <TextInput
                            id="questioninput"
                            defaultValue="what is a fourth amendment right violation? "
                            labelText=""
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
                <div className="mediumdesc pt7 pb7">

                    {this.state.answerIsLoading && <span> Asking BERT for answers ...   </span>}

                </div>
                {this.state.errorStatus.length > 1 && <div className="errormessage">{this.state.errorStatus}</div>}

                {
                    answerList.length > 0 &&
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
                                {!this.state.answerIsLoading && <span className="mediumdesc"> {answerList.length} items | {this.state.answers["took"].toFixed(3)} seconds </span>}
                            </div>
                            <div className="lh2m">
                                {this.state.answerIsLoading && <span className="mediumdesc"> Loading answers ... </span>}
                            </div>
                        </div>
                        <div>{answerList}</div>
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


            </div>

        );
    }
}

export default QueryView;