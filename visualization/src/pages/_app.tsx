import React from "react"
import PropTypes from "prop-types"
import Head from "next/head"
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "../theme"
import "@fontsource/roboto"
import { AppProps } from "next/app"

declare module "@mui/material/styles" {
  interface Theme {}
}

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

  return (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </StyledEngineProvider>
    </React.Fragment>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}
