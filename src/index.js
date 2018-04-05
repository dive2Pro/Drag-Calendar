import React from "react";
import { render } from "react-dom";
import "./styles.scss";

const log = console.log.bind(console);

console.clear();
const styles = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

const plusDays = days => {
  return dayMilliseconds * days;
};

const minusDays = days => {
  return -1 * dayMilliseconds * days;
};

const columns = 7;
const rows = 6;
const dayMilliseconds = 86400000;
const helperDate = new Date();
const getDayOfMonth = time => {
  helperDate.setTime(time);
  return helperDate.getDate();
};

const { Provider, Consumer } = React.createContext({});

class Item extends React.PureComponent {
  render() {
    const { className = "", time } = this.props;
    return (
      <div className={"__calendar_item " + className}>
        <div>{time}</div>
        <div>{getDayOfMonth(time)}</div>
      </div>
    );
  }
}

class Header extends React.PureComponent {
  render() {
    const { className = "", index } = this.props;

    return (
      <div className={"__calendar_item_header " + className}> {index} </div>
    );
  }
}

class Title extends React.PureComponent {
  constructor(props) {
    super(props);
    this._prevMonth = this._prevMonth.bind(this);
    this._nextMonth = this._nextMonth.bind(this);
  }
  _prevMonth() {}
  _nextMonth() {}

  render() {
    const { className = "", currentMonth, currentYear } = this.props;

    return (
      <Consumer>
        {({ state: { currentMonth, currentYear }, change }) => (
          <div className={"__calendar_item_title " + className}>
            {currentYear + " - " + (currentMonth + 1)}
            <button
              type="button"
              onClick={() => {
                let newMonth = currentMonth - 1;
                let newYear = currentYear;
                if (currentMonth == 0) {
                  newYear -= 1;
                  newMonth = 11;
                }
                change({
                  currentMonth: newMonth,
                  currentYear: newYear
                });
              }}
            >
              {" "}
              <span role="img" aria-label="prev month">
                {" "}
                ⬅️{" "}
              </span>{" "}
            </button>
            <button
              onClick={() => {
                let newMonth = currentMonth + 1;
                let newYear = currentYear;
                if (currentMonth == 11) {
                  newYear += 1;
                  newMonth = 0;
                }
                change({
                  currentMonth: newMonth,
                  currentYear: newYear
                });
              }}
            >
              <span role="img" aria-label="next month">
                {" "}
                ➡️{" "}
              </span>{" "}
            </button>
          </div>
        )}
      </Consumer>
    );
  }
}
const _processState = newState => {
  const Day1 = new Date(
    newState.currentYear + "/" + (newState.currentMonth + 1)
  );

  const firstDayOfWeek = Day1.getDay();
  const dayoffset = firstDayOfWeek;
  newState.dayoffset = dayoffset;
  newState.day1Time = Day1.getTime();

  log(newState, " = newState");
  return newState;
};
class Calender extends React.PureComponent {
  constructor(props) {
    super(props);
    this._change = this._change.bind(this);
    this.state = {};
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log(nextProps)
    // log(new Date("2018/4").toLocaleDateString())

    const date = new Date(nextProps.showDate);
    let newState = {};
    // log(date.getMonth())
    if (nextProps.showDate) {
      newState.currentYear = date.getFullYear();
      newState.currentMonth = date.getMonth();
    }
    return _processState(newState);
  }

  _change(state, cb) {
    let newState = state;
    this.setState(prev => {
      if (typeof state === "function") {
        newState = state(prev);
      }
      newState = Object.assign({}, prev.state, newState);
      return _processState(newState);
    }, cb);
  }

  render() {
    const { currentYear, currentMonth, dayoffset, day1Time } = this.state;
    const days = [];
    const headers = [];
    new Array(columns).fill(0).forEach((_, i) => {
      headers.push(
        <Header key={"header " + i} className="_header" index={i} />
      );
    });
    log(dayoffset, " = dayoffset ", this.state);
    new Array(dayoffset).fill(0).forEach((_, i) => {
      days.push(
        <Item key={"prev - " + i} time={day1Time + minusDays(dayoffset - i)} />
      );
    });

    for (let i = 0; i < columns * rows - dayoffset; i++) {
      days.push(<Item key={"now - " + i} time={day1Time + plusDays(i)} />);
    }

    return (
      <Provider value={{ state: this.state, change: this._change }}>
        <section className="__calendar">
          <Title />
          <div className="_calendar_content">
            {headers}
            {days}
          </div>
        </section>
      </Provider>
    );
  }
}
const App = () => (
  <div style={styles}>
    <Calender showDate={"2018/4/1"} />
  </div>
);

render(<App />, document.getElementById("root"));

// Day [ 0 - 6]  -> offset 是第一行中 第一天 与 第一个格子的距离
// Month [ 0 - 11]
// keep render -> 到最后一格, 每一格增加 24小时
// 检查 是否在这个月, 设置不同的 class
// log(d.getTime(), d.getMonth() , d.getDay())
