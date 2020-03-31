import React from "react";
import "./App.css";
import Graph from "./Graph";
import Attribution from "./Attribution";
import { Header, Divider } from "semantic-ui-react";
import ReactGA from "react-ga";

ReactGA.initialize("UA-000000-01");

function App() {
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
