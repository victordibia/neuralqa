// Web interface to visualize example Anomaly Detection Interaction.
// Data is visualized using the Carbon Desgin System Data Table.
// Data is


import React, { Component } from "react";
import { DataTable, InlineLoading } from 'carbon-components-react';
import { getJSONData, probabilityColor, abbreviateString, postJSONData } from "../helperfunctions/HelperFunctions"
import "./queryview.css"
const { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } = DataTable;


class QueryView extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }



    componentDidMount() {
    }


    render() {

        return (
            <div>

                <div className=" pt10">
                    Welcome to Oracle
                </div>



            </div>

        );
    }
}

export default QueryView;