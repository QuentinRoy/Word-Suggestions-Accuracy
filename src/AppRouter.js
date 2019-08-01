import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import Loading from "./utils/Loading";

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

const ExperimentWrapper = lazy(() => import("./experiment/ExperimentsWrapper"));

const AppRouter = () => (
  <Suspense fallback={<Loading>Loading the application...</Loading>}>
    <Router>
      <Route exact path="/" component={ExperimentWrapper} />
      <Route path="/distribution-viewer" component={DistributionViewer} />
    </Router>
  </Suspense>
);

export default AppRouter;
