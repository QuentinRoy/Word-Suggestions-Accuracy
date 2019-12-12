import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "./index.css";
import Loading from "./utils/Loading";

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
        <Route exact path="/viewer" component={DistributionViewer} />
        <Route exact path="/startup" component={Startup} />
        <Route exact path="/" component={ExperimentWrapper} />
        <Route path="*">
          No match for <code>{window.location.href}</code>
        </Route>
      </Switch>
    </Router>
  </Suspense>,
  document.getElementById("root")
);
