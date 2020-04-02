import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import Loading from "./common/components/Loading";
import Crashed from "./common/components/Crashed";
import DocumentTitle from "./common/components/DocumentTitle";

const ExperimentWrapper = lazy(() =>
  import("./experiment/components/ExperimentWrapper")
);

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

const ParticipantSetup = lazy(() =>
  import("./participant-setup/ParticipantSetup")
);

const ParticipantStartup = lazy(() =>
  import("./participant-startup/ParticipantStartup")
);

const ExperimenterStartup = lazy(() =>
  import("./experimenter-startup/ExperimenterStartup")
);

const TypingTest = lazy(() => import("./typing-test/TypingTest"));

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
          <DocumentTitle title="Setup">
            <ParticipantSetup />
          </DocumentTitle>
        </Route>

        <Route exact path="/startup">
          <DocumentTitle title="Experiment Startup">
            <ParticipantStartup />
          </DocumentTitle>
        </Route>

        <Route exact path="/experimenter">
          <DocumentTitle title="Experimenter Dashboard">
            <ExperimenterStartup />
          </DocumentTitle>
        </Route>

        <Route exact path="/experiment">
          <ExperimentWrapper />
        </Route>

        <Route exact path="/typing">
          <DocumentTitle title="Typing Test">
            <TypingTest />
          </DocumentTitle>
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
