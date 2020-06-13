/**
 * @license
 * Copyright 2019 Victor Dibia. https://github.com/victordibia
 * Anomagram - Anomagram: Anomaly Detection with Autoencoders in the Browser.
 * Licensed under the MIT License (the "License"); 
 * =============================================================================
 */

import React, { Component } from "react";
import {
    NavLink
} from "react-router-dom";
import { LogoGithub16 } from '@carbon/icons-react';

import "./header.css"

class Header extends Component {
    constructor(props) {
        super(props)

        this.appName = "NeuralQA"
        this.appDescription = "Question Answering."


    }
    render() {
        return (
            <div>
                <div className="headermain" aria-label={this.appDescription}>

                    <div className="container-fluid w100 headerrow pl10 ">

                        <div className="flex    h100">
                            <div className="h100   flex flexjustifycenter mr10 ">
                                <a href={process.env.PUBLIC_URL + "/#"}>
                                    <img className="headericon" src="images/icon.png" alt="anomagram logo" />

                                </a>
                            </div>
                            <div className="h100 apptitle  flex flexjustifycenter  mr10">
                                <div className="whitetext boldtext  iblock mr10">  {this.appName} </div>
                            </div>
                            <div className="h100   flex flexjustifycenter  navbarlinks ">
                                <NavLink exact to="/"> QA </NavLink>
                            </div>
                            {/* <div className="h100   flex flexjustifycenter  navbarlinks mr10">
                                <NavLink exact to="/train"> Experiments</NavLink>
                            </div> */}
                            <div className="h100   flex flexjustifycenter   navbarlinks mr10">
                                <a className=" dispalyblock h100  " href="https://github.com/victordibia/qa/" target="_blank" rel="noopener noreferrer">
                                    <LogoGithub16 className=" whitefill gitlogo  "></LogoGithub16>
                                    <span className="gitlogotext">Git</span><span className=" apptitle">hub</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
                <div></div>
                <div className="headerboost">  </div>
            </div>

        );
    }
}

export default Header;