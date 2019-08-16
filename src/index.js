import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import "./index.css";
import Loading from "./utils/Loading";

const ExperimentWrapper = lazy(() =>
  import("./experiment/components/ExperimentWrapper")
);

const DistributionViewer = lazy(() =>
  import("./distribution-viewer/DistributionViewer")
);

ReactDOM.render(
  <Suspense fallback={<Loading>Loading...</Loading>}>
    <Router>
      <Route exact path="/viewer" component={DistributionViewer} />
      <Route component={ExperimentWrapper} />
    </Router>
  </Suspense>,
  document.getElementById("root")
);
