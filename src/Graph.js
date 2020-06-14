import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Grid,
  Container,
  Loader,
  Input,
  Message,
  Button
} from "semantic-ui-react";
import queryString from "query-string";
import { numberWithCommas } from "./utils";

let url = "https://us-central1-scotts-tools.cloudfunctions.net/covid";

let colors = [
  "F26419",
  "F6AE2D",
  "2F4858",
  "33658A",
  "55DDE0",
  "61d4b3",
  "fd2eb3",
  "eab0d9",
  "ff677d",
  "d8b5b5"
];

export default class Graph extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      counties: null,
      countiesToCases: null,
      countiesToGrowth: null,
      error: null,
      searchText: "",
      selected: [
        "San Francisco, California",
        "New York City, New York",
        "Los Angeles, California"
      ]
    };
    this.getCountyLines = this.getCountyLines.bind(this);
  }
  async componentDidMount() {
    let data = await (await fetch(url)).json();
    let lastWeek = data[data.length - 8];
    let last = data[data.length - 1];
    let keys = Object.keys(last);
    let recentDates = data.slice(data.length - 14);
    let cleanedCounties = keys.filter(
      name => name !== "date" && name !== "Unknown"
    );
    cleanedCounties.sort((a, b) => last[b] - last[a]);
    console.log(last);
    let growth = Object.assign({}, last);
    for (const property in growth) {
      let increase =
        ((growth[property] - lastWeek[property]) * 100) / lastWeek[property];
      growth[property] = Math.round(increase);
    }
    let newState = {
      data: recentDates,
      counties: cleanedCounties,
      countiesToCases: last,
      countiesToGrowth: growth
    };
    let qsCounties = this.getCountiesFromQuerystring();
    if (qsCounties.length) {
      newState.selected = qsCounties;
    }
    this.setState(newState);
  }
  getCountyLines() {
    return this.state.selected.map((name, index) => (
      <Line
        strokeWidth="4"
        key={name}
        type="monotone"
        dataKey={name}
        stroke={`#${colors[index]}`}
      />
    ));
  }
  isChecked(county) {
    return this.state.selected.includes(county);
  }
  toggleCheckbox(countyToToggle) {
    const counties = this.state.selected;
    let updatedCounties = [...counties];
    if (this.isChecked(countyToToggle)) {
      updatedCounties = updatedCounties.filter(
        county => county !== countyToToggle
      );
      this.setState({ error: "" });
    } else if (counties.length < 10) {
      updatedCounties.push(countyToToggle);
    } else {
      this.setState({ error: "10 is currently the selection limit" });
    }
    this.setState({ selected: updatedCounties });
    this.saveCountiesToQuerystring(updatedCounties);
  }
  getCountiesFromQuerystring() {
    const parsed = queryString.parse(window.location.search);
    const qsCountiesRaw = parsed["counties"];
    if (qsCountiesRaw && qsCountiesRaw.length) {
      return JSON.parse(qsCountiesRaw).split("|");
    }
    return [];
  }
  saveCountiesToQuerystring(updatedCounties) {
    const newQuerystring = JSON.stringify(updatedCounties.join("|"));
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?counties=${newQuerystring}`;
    window.history.pushState({ path: newurl }, "", newurl);
  }

  getCountiesToList() {
    if (this.state.searchText) {
      return this.state.counties.filter(county =>
        county.toLowerCase().includes(this.state.searchText.toLowerCase())
      );
    }
    return this.state.counties;
  }
  render() {
    return (
      <Container>
        {this.state.data && (
          <Grid centered style={{ alignItems: "left", padding: 10 }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                width={500}
                height={300}
                data={this.state.data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid />
                <XAxis
                  padding={{ left: 20, right: 20 }}
                  allowDataOverflow={true}
                  dataKey="date"
                  interval={5}
                />
                <YAxis
                  tickFormatter={value =>
                    new Intl.NumberFormat("en").format(value)
                  }
                >
                  <Label
                    angle={-90}
                    dx={-10}
                    value="cases"
                    position="insideLeft"
                    style={{ textAnchor: "middle", margin: 20 }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{
                    stroke: "#a483ed",
                    strokeWidth: 2,
                    strokeDasharray: 5
                  }}
                  itemSorter={item => 1 - item.value}
                  formatter={value => new Intl.NumberFormat("en").format(value)}
                />
                <Legend />
                {this.getCountyLines()}
              </LineChart>
            </ResponsiveContainer>

            <Grid.Row>
              <Input
                placeholder="Search..."
                value={this.state.searchText}
                onChange={event =>
                  this.setState({ searchText: event.target.value })
                }
              />
            </Grid.Row>

            <Grid.Row>
                {this.state.error && (
                  <Message color="blue">{this.state.error}</Message>
                )}

                <Grid padded centered>
                  {this.getCountiesToList().map(county => (
                    <Grid.Column mobile={8} tablet={5} computer={3} key={county} className={this.isChecked(county) ? 'county-col': ''} >

                        <Button compact toggle active={this.isChecked(county)} onClick={() => this.toggleCheckbox(county)}>
                          {county}
                          <br/>
                          <br/>
                          <span className='light'>
                          {`Cases: ${numberWithCommas(this.state.countiesToCases[county])} `}
                          <br/>
                          {`Weekly growth: +${this.state.countiesToGrowth[county]}%`}
</span>
                        </Button>

                    </Grid.Column>
                  ))}
                </Grid>

            </Grid.Row>
          </Grid>
        )}
        <Loader active={!this.state.data} />
      </Container>
    );
  }
}
