import React, { useEffect } from "react";
import "./App.css";
import Graph from "./Graph";
import Attribution from "./Attribution";
import { Header, Divider } from "semantic-ui-react";
import ReactGA from "react-ga";
import HttpsRedirect from "react-https-redirect";

ReactGA.initialize("UA-7818756-9");

function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname);
  });

  return (
    <HttpsRedirect>
      <div className="App">
        <br />
        <Header size="large" className="light">
          Reported COVID-19 cases over time
        </Header>
        <Attribution />
        <Divider hidden style={{ height: 10 }} />

        <Graph />
      </div>
    </HttpsRedirect>
  );
}

export default App;
