import { CssBaseline } from "@material-ui/core"
import * as React from "react"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <div>
    <CssBaseline />
    <SEO title="404: Not found" />
    <h1>404: Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </div>
)

export default NotFoundPage
