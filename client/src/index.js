import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import Loading from "./utils/Loading";
import Crashed from "./utils/Crashed";
import DocumentTitle from "./utils/DocumentTitle";

const ExperimentWrapper = lazy(() =>
  import("./experiment/components/ExperimentWrapper")
);

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

const Startup = lazy(() => import("./startup/Startup"));

ReactDOM.render(
  <Suspense fallback={<Loading>Loading...</Loading>}>
    <Router>
      <Switch>
        <Route exact path="/viewer">
          <DocumentTitle title="Distribution Viewer">
            <DistributionViewer />
          </DocumentTitle>
        </Route>

        <Route exact path="/">
          <DocumentTitle title="Experiment Startup">
            <Startup />
          </DocumentTitle>
        </Route>

        <Route exact path="/experiment">
          <ExperimentWrapper />
        </Route>

        <Route path="*">
          <DocumentTitle title="Not found">
            <Crashed>
              <h1>Not found</h1>
              This page does not exist
            </Crashed>
          </DocumentTitle>
        </Route>
      </Switch>
    </Router>
  </Suspense>,
  document.getElementById("root")
);
