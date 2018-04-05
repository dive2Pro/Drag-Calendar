import React from "react";
import { render } from "react-dom";
import { Provider as UnStatedProvider, Subscribe, Container } from "unstated";

import "./styles.scss";

const log = console.log.bind(console);
class DateSource extends Container {
  constructor() {
    super();
    this.state = {};
    this.change = this.change.bind(this);
  }
  init(props) {
    const date = new Date(props.showDate);
    let newState = {};
    newState.currentYear = date.getFullYear();
    newState.currentMonth = date.getMonth();
    this.change(newState);
  }
  change(state, cb) {
    let newState = state;
    const prev = this.state;
    if (typeof state === "function") {
      newState = state(prev);
    }
    newState = Object.assign({}, prev.state, newState);
    newState = _processState(newState);
    this.setState(newState);
  }
}

const datesourceShared = new DateSource();

const EventEnum = {
  data: "_Data",
  hover: "_Hover",
  temp: "_temp"
};
class EventSource extends Container {
  constructor() {
    super();
    this.state = {
      data: [
        {
          id: 0,
          type: EventEnum.data,
          startTime: new Date("2018-4-1").getTime(),
          endTime: new Date("2018-4-4").getTime(),
          content: "play dota"
        },

        {
          id: 1,
          type: EventEnum.data,
          startTime: new Date("2018-4-2").getTime(),
          endTime: new Date("2018-4-3").getTime(),
          content: "play dota2"
        },
        {
          id: 2,
          type: EventEnum.data,
          startTime: new Date("2018-4-1").getTime(),
          endTime: new Date("2018-4-4, 00:01").getTime(),
          content: "play dota3"
        },
        {
          id: 3,
          type: EventEnum.data,
          startTime: new Date("2018-4-5, 18:00").getTime(),
          endTime: new Date("2018-4-6, 19:00").getTime(),
          content: "sleep"
        },
        {
          id: 4,
          type: EventEnum.data,
          startTime: new Date("2018-4-5 , 12:12").getTime(),
          endTime: new Date("2018-4-5 , 13:11").getTime(),
          content: "eat"
        }
      ]
    };

    this.changeIndex = this.changeIndex.bind(this);
  }
  changeIndex(event, index) {
    let found = event;
    // const newData = this.state.data.filter(e => {
    //   const itis = e.id !== id;
    //   found = itis ? e : found;
    //   return itis;
    // });
    // log(newData)
    if (found && found.index != index) {
      event.index = index;
      // this.setState({ data: [...newData, found] });
      this.setState({});
    }
  }
}
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
/**
 *  和每一个 data 比较 并生成事件 EventItem, EventItem 分为下面几种情况
 *       1. 有前一天和后一天 *****
 *       2. 有前一天 ****
 *       3. 有后一天 ***
 *       4. 一天内 **
 *         - 一天内按时间排序
 * @param(any[])
 *
 *  */
const sortEvent = (changeIndex, events, time) => {
  const fiveStar = [];
  const fourStar = [];
  const threeStar = [];
  let twoStar = [];

  events.forEach(e => {
    if (e.startTime < time && e.endTime > time + plusDays(1)) {
      // log(time, e, " - - - -");
      fiveStar.push(e);
    } else if (e.startTime < time && e.endTime < time + plusDays(1)) {
      fourStar.push(e);
    } else if (e.startTime > time && e.endTime > time + plusDays(1)) {
      threeStar.push(e);
    } else {
      twoStar.push(e);
    }
  });

  events.forEach(e => {
    let index = -1;
    if (e.startTime >= time && e.startTime <= time + plusDays(1)) {
      index += fiveStar.length;
      index += fourStar.length;
      const threeIndex = threeStar.findIndex(ev => ev === e);
      // log(threeIndex, ' = threeIndex ', fiveStar)
      index += threeIndex > -1 ? threeIndex : threeStar.length;
      index += twoStar.findIndex(ev => ev === e);
      changeIndex(e, index);
    }
  });

  twoStar = twoStar.sort((a, b) => {
    return a.startTime - b.startTime;
  });
  return events.sort((a, b) => a.index - b.index);
};

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { className = "", time } = this.props;
    return (
      <Subscribe to={[EventSource]}>
        {({ state, changeIndex }) => {
          const filtedEvent = state.data.filter(d => {
            const { startTime, endTime } = d;
            return (
              (time >= startTime || startTime - time < plusDays(1)) &&
              time <= endTime
            );
          });

          let events = [];
          if (filtedEvent.length) {
            // todo 检查优先级
            events = sortEvent(changeIndex, filtedEvent, time).map((e, i) => {
              return (
                <div key={i} data-index={e.index}>
                  {" "}
                  {e.content}{" "}
                </div>
              );
            });
          }
          return (
            <div className={"__calendar_item " + className}>
              <div>{getDayOfMonth(time)}</div>
              <div className={`__item_events`}>{events}</div>
            </div>
          );
        }}
      </Subscribe>
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
      <Subscribe to={[datesourceShared]}>
        {({ state: { currentMonth, currentYear }, change }) => {
          return (
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
          );
        }}
      </Subscribe>
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

  // log(newState, " = newState");
  return newState;
};

class Calender extends React.PureComponent {
  render() {
    return (
      <section className="__calendar">
        <Title />
        <div className="_calendar_content">
          <Headers />
          <Days />
        </div>
      </section>
    );
  }
}
class Headers extends React.PureComponent {
  render() {
    return (
      <Subscribe to={[datesourceShared]}>
        {() => {
          const headers = [];
          new Array(columns).fill(0).forEach((_, i) => {
            headers.push(
              <Header key={"header " + i} className="_header" index={i} />
            );
          });
          return headers;
        }}
      </Subscribe>
    );
  }
}
class Days extends React.PureComponent {
  render() {
    return (
      <Subscribe to={[datesourceShared]}>
        {dateSource => {
          const days = [];
          const { dayoffset, day1Time } = dateSource.state;
          new Array(dayoffset).fill(0).forEach((_, i) => {
            days.push(
              <Item
                key={"prev - " + i}
                time={day1Time + minusDays(dayoffset - i)}
              />
            );
          });

          for (let i = 0; i < columns * rows - dayoffset; i++) {
            days.push(
              <Item key={"now - " + i} time={day1Time + plusDays(i)} />
            );
          }
          return <React.Fragment> {days} </React.Fragment>;
        }}
      </Subscribe>
    );
  }
}

const Root = props => {
  datesourceShared.init(props);
  // log(datesourceShared.state, ' = datasourceShared' , newState)
  return (
    <UnStatedProvider>
      <Calender />
    </UnStatedProvider>
  );
};
const App = () => (
  <div style={styles}>
    <Calender />
  </div>
);

render(<Root showDate={"2018/4/1"} />, document.getElementById("root"));

// Day [ 0 - 6]  -> offset 是第一行中 第一天 与 第一个格子的距离
// Month [ 0 - 11]
// keep render -> 到最后一格, 每一格增加 24小时
// 检查 是否在这个月, 设置不同的 class
// log(d.getTime(), d.getMonth() , d.getDay())
