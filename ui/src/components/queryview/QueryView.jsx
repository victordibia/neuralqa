// Web interface to visualize example Anomaly Detection Interaction.
// Data is visualized using the Carbon Desgin System Data Table.
// Data is


import React, { Component } from "react";
import { Button, TextInput } from 'carbon-components-react';
import { getJSONData, postJSONData } from "../helperfunctions/HelperFunctions"
import "./queryview.css"
// const { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } = DataTable;


class QueryView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            apptitle: "Case Oracle",
            passages: { "took": 0, hits: { hits: [] } },
            queryResponseTime: 0,
        }

        this.serverBasePath = "http://localhost:3008"
        this.passageEndpoint = "/passages"

    }

    componentDidMount() {
        this.getPassages()
    }

    getPassages() {
        let searchText = document.getElementById("questioninput").value
        let passageUrl = this.serverBasePath + this.passageEndpoint
        let postData = {
            size: 5,
            searchtext: searchText || "which cases cite dwayne vs the united states"
        }

        let passages = postJSONData(passageUrl, postData)
        passages.then((data) => {
            if (data) {
                this.setState({ passages: data, queryResponseTime: data["took"] })
                // console.log(Object.keys(data));

            }
        })
    }

    askQuestionClick(e) {
        this.getPassages()
    }

    inputKeyPress(e) {
        if (e.keyCode === 13) {
            this.getPassages()
        }
    }


    render() {


        let passagelist = this.state.passages["hits"]["hits"].map((data, index) => {
            let dataTitle = ""
            if (data.highlight["name"] !== undefined) {
                for (let title of data.highlight["name"]) {
                    dataTitle = dataTitle + " ... " + title
                }
            } else {
                dataTitle = data._source.name
            }


            return (
                <div className="passagerow clickable" key={"passagerow" + index}>
                    <div className="passagetitle highlightsection " dangerouslySetInnerHTML={{ __html: dataTitle }} />

                    <div className="mediumdesc lhmedium passagexcerpt">
                        <div className="highlightsection underline " dangerouslySetInnerHTML={{ __html: "... " + data.highlight["casebody.data.opinions.text"] + " ... " }} />
                        {/* <div className="pb5"> {data.highlight["casebody.data.opinions.text"]}</div> */}
                        <div className="pt5"> {data.fields.opinion_excerpt} ... </div>
                    </div>
                </div>
            )
        })

        return (
            <div>

                <div className="mynotif mt10 h100 lh10  lightbluehightlight maxh16  mb10">
                    <div className="boldtext mb5"> Case Oracle:  Question Answering on Case Law Documents</div>
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
                    <div className="flexfull">
                        <TextInput
                            id="questioninput"
                            labelText=""
                            onKeyDown={this.inputKeyPress.bind(this)}
                            placeholder="Enter question. e.g. Which cases cite dwayne vs the united states."
                        >
                        </TextInput>
                    </div>
                    <div> <Button
                        onClick={this.askQuestionClick.bind(this)}
                        size="field"> Get Answer </Button>
                    </div>
                </div>
                <div className="smalldesc pt5 pb5"> {this.state.passages["hits"]["hits"].length} items | Query time: {this.state.passages["took"]} milliseconds</div>

                <div className="boldtext mt10 mb10"> Search Results</div>
                <div className="passagebox  mt10">
                    {passagelist}
                </div>


            </div>

        );
    }
}

export default QueryView;