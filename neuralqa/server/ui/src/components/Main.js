/**
 * @license
 * Copyright 2019 Fast Forward Labs.
 * Written by Victor Dibia / Contact : https://github.com/victordibia
 * CaseQA - CaseQA: Question Answering on Large Datasets with BERT.
 * Licensed under the MIT License (the "License");
 * =============================================================================
 */

import React, { Component } from "react";
import { getJSONData, sampleConfig } from "./helperfunctions/HelperFunctions";
import { Route, HashRouter } from "react-router-dom";

import QueryView from "./queryview/QueryView";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { createBrowserHistory } from "history";
import TestView from "./testview/TestView";
// import TestView from "./testview/TestView";

const history = createBrowserHistory({
  basename: "", // The base URL of the app (see below)
  forceRefresh: false, // Set true to force full page refreshes
  keyLength: 6, // The length of location.key
  // A function to use to confirm navigation with the user (see below)
  getUserConfirmation: (message, callback) => callback(window.confirm(message)),
});

history.listen((location) => {
  // console.log(location.pathname, location.hash)
});

let linkHolder = {};

function updateLh(location) {
  if (location.hash in linkHolder) {
    linkHolder[location.hash] = linkHolder[location.hash] + 1;
  } else {
    linkHolder[location.hash] = 0;
  }
}

history.listen((location) => {
  updateLh(location);
});

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      config: null,
    };
    updateLh(window.location);

    this.serverBasePath =
      window.location.protocol + "//" + window.location.host;
    // this.serverBasePath = "http://localhost:5000";
    this.configEndpoint = "/api/config";
  }

  componentDidMount() {
    let configUrl = this.serverBasePath + this.configEndpoint;
    let config = getJSONData(configUrl);
    let self = this;
    config
      .then((data) => {
        // console.log(data);
        if (data) {
          this.setState({ config: data });
        }
      })
      .catch(function (err) {
        console.log("Failed to fetch config, using default config.", err);
        self.setState({ config: sampleConfig() });
      });
  }
  render() {
    const mQueryView = (props) => {
      return <QueryView data={this.state.config.queryview} />;
    };
    return (
      <HashRouter>
        {this.state.config && (
          <div>
            <Header data={this.state.config.header}></Header>
            <main className="container-fluid p10">
              <Route exact path="/" component={mQueryView} />
              <Route exact path="/ex" component={TestView} />
            </main>
          </div>
        )}

        <div id="footer">
          <Footer />
        </div>
      </HashRouter>
    );
  }
}

export default Main;
