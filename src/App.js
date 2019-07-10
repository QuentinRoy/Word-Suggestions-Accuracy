import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import ExperimentWrapper from "./experiment/ExperimentsWrapper";

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

const DistributionViewerRoute = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <DistributionViewer />
  </Suspense>
);

const App = () => (
  <Router>
    <Route exact path="/" component={ExperimentWrapper} />
    <Route path="/distribution-viewer" component={DistributionViewerRoute} />
  </Router>
);

export default App;
