import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import Loading from "./common/components/Loading";
import Crashed from "./common/components/Crashed";
import DocumentTitle from "./common/components/DocumentTitle";
import { Paths } from "./common/constants";

const ExperimentWrapper = lazy(() =>
  import("./experiment/components/ExperimentWrapper")
);

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

const ParticipantSetup = lazy(() =>
  import("./participant-setup/ParticipantSetup")
);

const WaitingRoom = lazy(() => import("./waiting-room/WaitingRoom"));

const Moderation = lazy(() => import("./moderation/Moderation"));

const TypingTest = lazy(() => import("./typing-test/TypingTest"));

ReactDOM.render(
  <Suspense fallback={<Loading>Loading...</Loading>}>
    <Router>
      <Switch>
        <Route exact path={Paths.viewer}>
          <DocumentTitle title="Distribution Viewer">
            <DistributionViewer />
          </DocumentTitle>
        </Route>

        <Route exact path={Paths.setup}>
          <DocumentTitle title="Setup">
            <ParticipantSetup />
          </DocumentTitle>
        </Route>

        <Route exact path={Paths.waitingRoom}>
          <DocumentTitle title="Waiting Room">
            <WaitingRoom />
          </DocumentTitle>
        </Route>

        <Route exact path={Paths.moderation}>
          <DocumentTitle title="Experimenter Dashboard">
            <Moderation />
          </DocumentTitle>
        </Route>

        <Route exact path={Paths.experiment}>
          <ExperimentWrapper />
        </Route>

        <Route exact path={Paths.typingTest}>
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
