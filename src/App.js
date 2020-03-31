import React, { useEffect } from "react";
import "./App.css";
import Graph from "./Graph";
import Attribution from "./Attribution";
import { Header, Divider } from "semantic-ui-react";
import ReactGA from "react-ga";

ReactGA.initialize("UA-7818756-9");

function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname);
  });

  return (
    <div className="App">
      <br />
      <Header className="light">Reported COVID-19 cases over time</Header>
      <Divider hidden style={{ height: 10 }} />

      <Graph />
      <Attribution />
    </div>
  );
}

export default App;
