// Web interface to visualize example Anomaly Detection Interaction.
// Data is visualized using the Carbon Desgin System Data Table.
// Data is


import React, { Component } from "react";
import { Button, TextInput, Loading } from 'carbon-components-react';
import { getJSONData, postJSONData } from "../helperfunctions/HelperFunctions"
import "./queryview.css"
import { thresholdFreedmanDiaconis } from "d3";
// const { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } = DataTable;


class QueryView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            apptitle: "CaseQA",
            passages: { "took": 0, hits: { hits: [] } },
            answers: { "took": 0, answers: [] },
            passageIsLoading: false,
            answerIsLoading: false,
            errorStatus: ""
        }

        this.serverBasePath = "http://localhost:3008"
        this.passageEndpoint = "/passages"
        this.answerEndpoint = "/answer"
        this.interfaceTimedDelay = 800
        this.resultSize = 5
    }

    componentDidMount() {
        this.askQuestion()
    }

    askQuestion() {
        this.getPassages()
        this.getAnswers()
    }

    getAnswers() {
        let self = this
        this.setState({ answerIsLoading: true })
        let searchText = document.getElementById("questioninput").value
        let answerUrl = this.serverBasePath + this.answerEndpoint
        let postData = {
            size: this.resultSize,
            searchtext: searchText || "what is a fourth amendment right violation? "
        }
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

    getPassages() {
        let self = this
        this.setState({ passageIsLoading: true })
        let searchText = document.getElementById("questioninput").value
        let passageUrl = this.serverBasePath + this.passageEndpoint
        let postData = {
            size: this.resultSize,
            searchtext: searchText || "what is a fourth amendment right violation?"
        }
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


    render() {


        let passageList = this.state.passages["hits"]["hits"].map((data, index) => {
            let dataTitle = ""
            if (data.highlight["name"] !== undefined) {
                for (let title of data.highlight["name"]) {
                    dataTitle = dataTitle + " ... " + title
                }
            } else {
                dataTitle = data._source.name
            }

            let answerSpan = ""
            if (this.state.answers.answers[index] !== undefined) {
                for (let [i, answer] of this.state.answers.answers[index].entries()) {
                    answerSpan = answerSpan + "[" + answer.took.toFixed(2) + "s] " + answer.answer + (i !== this.state.answers.answers[index].length - 1 ? ", " : ""
                    )
                }
                if (this.state.answers.answers[index].length === 0) {
                    answerSpan = "no answers found in this section."
                }
            } else {
                answerSpan = " reading retrieved text .."
            }


            return (
                <div className="passagerow " key={"passagerow" + index}>
                    <div className="answerspan"> <span className="boldtext">BERT Answer: </span> {answerSpan} </div>
                    <div className="passagetitle highlightsection " dangerouslySetInnerHTML={{ __html: dataTitle }} />

                    <div className="mediumdesc lhmedium passagexcerpt">
                        <div className="highlightsection underline " dangerouslySetInnerHTML={{ __html: "... " + data.highlight["casebody.data.opinions.text"] + " ... " }} />
                        {/* <div className="pb5"> {data.highlight["casebody.data.opinions.text"]}</div> */}
                        <div className="pt5"> <span className="excerpttitle"> Case Excerpt: </span> {data.fields.opinion_excerpt} ... </div>
                    </div>
                </div>
            )
        })

        return (
            <div>
                <div className="mynotif mt10 h100 lh10  lightbluehightlight maxh16  mb10">
                    <div className="boldtext mb5">{this.state.apptitle}:  Question Answering on Case Law Documents</div>
                    {this.state.apptitle} is an interactive tool for exploring
                    the two stage process of candidate retrieval and document reading required for question answering.
                    Search is powered by datasets from <a href="http://case.law" rel="noopener noreferrer" target="_blank"> case.law</a> dataset.
                    <br></br>
                    To begin, type in a question query below.
                    {/* <div className=" mediumdesc boldtext">
                        <span className=""> Disclaimer: </span> This prototype is built for demonstration purposes only
                        and is not intended for use in any medical setting.
                    </div> */}
                </div>

                <div className="flex searchbar">
                    <div className="loaderbox" style={{ opacity: (this.state.passageIsLoading) ? 1 : 0, width: (this.state.passageIsLoading) ? "34px" : "0px" }} >

                        <Loading
                            className=" "
                            active={true}
                            small={true}
                            withOverlay={false}
                        > </Loading>
                    </div>
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
                    {!this.state.passageIsLoading && <span>{this.state.passages["hits"]["hits"].length} items | Query time: {this.state.passages["took"]} milliseconds</span>}
                    {this.state.passageIsLoading && <span> loading passages ... </span>}
                </div>
                {this.state.errorStatus.length > 1 && <div className="errormessage">{this.state.errorStatus}</div>}

                {passageList.length > 0 &&
                    <div>
                        <div className="boldtext mt10 mb10"> Search Results</div>
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