import React, { Children } from "react";
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
          startTime: new Date("2018-3-1").getTime(),
          endTime: new Date("2018-4-1").getTime(),
          content: "play DOTA"
        },
        {
          id: 6,
          type: EventEnum.data,
          startTime: new Date("2018-3-1").getTime(),
          endTime: new Date("2018-4-2").getTime(),
          content: "play basket"
        },
        {
          id: 1,
          type: EventEnum.data,
          startTime: new Date("2018-4-2").getTime(),
          endTime: new Date("2018-4-12").getTime(),
          content: "play Music"
        },
        {
          id: 2,
          type: EventEnum.data,
          startTime: new Date("2018-4-1").getTime(),
          endTime: new Date("2018-4-4, 00:01").getTime(),
          content: "play 3333"
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
        },
        {
          id: 5,
          type: EventEnum.data,
          startTime: new Date("2018-4-3 , 12:12").getTime(),
          endTime: new Date("2018-4-14 , 13:11").getTime(),
          content: "smoking"
        },

        {
          id: 7,
          type: EventEnum.data,
          startTime: new Date("2018-4-3 , 12:12").getTime(),
          endTime: new Date("2018-4-3, 13:11").getTime(),
          content: "Swimming"
        },
        {
          id: 8,
          type: EventEnum.data,
          startTime: new Date("2018-4-6 , 12:12").getTime(),
          endTime: new Date("2018-4-17, 13:11").getTime(),
          content: "Driv to 北京"
        },

        {
          id: 9,
          type: EventEnum.data,
          startTime: new Date("2018-4-6, 11:12").getTime(),
          endTime: new Date("2018-4-6, 13:11").getTime(),
          content: "Driving 上海"
        },
        {
          id: 10,
          type: EventEnum.data,
          startTime: new Date("2018-4-17, 11:12").getTime(),
          endTime: new Date("2018-4-18, 13:11").getTime(),
          content: " 迟到在"
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
      // this.setState({});
    }
  }

  /**
   * 0. 计算 这个 month 中 42 格的 起点 beginTime 和 终点 endTime
   * 1. 过滤 不在该 [beginTime, endTime] 的 event
   * 2.
   *
   * @param {string} date Year, Month : [year-month]
   */
  updateIndex(date) {
    const { data } = this.state;
    //
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

const getDayOfWeek = time => {
  helperDate.setTime(time);
  return helperDate.getDay();
};
const { Provider, Consumer } = React.createContext({});

const sortByStartTime = (a, b) => {
  return a.startTime - b.startTime;
};

const sortByIndex = (a, b) => a.index - b.index;

const sortByStartTimeOrLastTime = (a, b) => {
  if (a.startTime === b.startTime) {
    return b.endTime - a.endTime;
  } else {
    return a.startTime - b.startTime;
  }
};

const logGroup = (title, ...args) => {
  console.group(title);
  log(args);
  console.groupEnd();
};
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
  let fiveStar = [];
  let fourStar = [];
  let threeStar = [];
  let twoStar = [];
  let changed = false;

  events.forEach(e => {
    if (e.startTime < time && e.endTime >= time + plusDays(1)) {
      fiveStar.push(e);
    } else if (e.startTime < time && e.endTime < time + plusDays(1)) {
      fourStar.push(e);
    } else if (e.startTime >= time && e.endTime > time + plusDays(1)) {
      threeStar.push(e);
    } else {
      twoStar.push(e);
    }
  });

  twoStar = twoStar.sort(sortByStartTime);
  threeStar = threeStar.sort(sortByStartTimeOrLastTime);
  const allStar = fiveStar
    .concat(fourStar)
    .concat(threeStar)
    .concat(twoStar);

  fiveStar.concat(fourStar).forEach(e => {
    let index = 0;
    if (getDayOfWeek(time) === 0) {
      // 在每周日, 检查 fiveStar 和 fourStar 的 index
      // fiveStar 根据 起止 时间排序
      fiveStar = fiveStar.sort(sortByStartTimeOrLastTime);
      fiveStar.forEach((e, i) => {
        if (e.index == void 0) {
          // 没有设置
          changeIndex(e, i);
        }
      });
      const fiveStarLastIndex = fiveStar.length
        ? fiveStar[fiveStar.length - 1].index
        : -1;
      fourStar = fourStar.sort(sortByStartTimeOrLastTime);

      fourStar.forEach((e, i) => {
        if (e.index == void 0) {
          // changed = true
          log(
            JSON.stringify(e),
            fiveStarLastIndex + 1 + i,
            i,
            fiveStarLastIndex
          );
          changeIndex(e, fiveStarLastIndex + 1 + i);
          log(JSON.stringify(e), fiveStarLastIndex + 1 + i);
          // e.index = fiveStar.length + 1 + i
        }
      });
    }
  });
  // logGroup('fourStar', fourStar)

  // 事件的起点在 这个 time 内
  // 不关联 4星和5星的排序
  // 排完序后 是  [0 , 1 , 2]
  // 如 4 星 和 5 星的排序是  [0 , 2]

  // 如果 index 和 高星有冲突
  // 变成  [1, 3, 4]
  const highStar = fiveStar.concat(fourStar).sort(sortByIndex);
  let lowStar = threeStar.concat(twoStar);

  lowStar.forEach(e => {
    let index = 0;
    // 3星, 如果 e 在三星中, 该位置 offset,  e.index = index + offset
    const threeIndex = threeStar.findIndex(ev => ev === e);

    if (threeIndex > -1) {
      index += threeIndex;
    } else {
      // 4星, 如果 index 不为 0 , 找到 5 星 4 星 和 3 星中最index 最大的值
      const _sorted =
        // fiveStar
        // .concat(fourStar)
        threeStar.sort(sortByIndex);
      // log(_sorted)
      if (threeStar.length) {
        index = _sorted[_sorted.length - 1].index + 1;
      }
      const twoIndex = twoStar.findIndex(ev => ev === e);

      if (time === new Date("2018-4-3").getTime()) {
        // log(fiveStar, events, time, time + plusDays(1))
        // log(twoIndex, index, threeStar)
      }
      index += twoIndex;
    }
    if (Number.isNaN(index)) {
      log(index);
      return;
    }
    if (e.index != index) {
      // changed = true
      // e.index = index
    }
    changeIndex(e, index);
  });
  // log(lowStar)
  const result = [];
  const addToResult = res => {
    result.push(res);
  };
  // console.group(" index changed ");
  // log(highStar, lowStar, events);
  // console.groupEnd();
  lowStar = lowStar.sort(sortByIndex);
  let currentEvent;
  while ((currentEvent = highStar.shift())) {
    let lowCurrentEvent;

    while ((lowCurrentEvent = lowStar.shift())) {
      // log(lowCurrentEvent, ' = ' , currentEvent)
      if (lowCurrentEvent.index < currentEvent.index) {
        // result.push(lowCurrentEvent);
        addToResult(lowCurrentEvent);
      } else {
        lowStar.unshift(lowCurrentEvent);
        break;
      }
    }
    // lowCurrentEvent.index ++
    lowStar.forEach(ev => {
      changeIndex(ev, ev.index + 1);
      // e.index ++
    });
    // result.push(currentEvent);
    addToResult(currentEvent);
  }
  if (lowStar.length) {
    lowStar.forEach(addToResult);
  }
  // [0, undefined, 2]
  // log(result.length, events)
  // logGroup("result", result , events)
  return result;

  // return events.sort((a, b) => a.index - b.index);
};

const hasHead = (event, time) => {
  const hashead = event.startTime < time;
  return hashead ? " hashead " : "";
};

const hasTrail = (event, time) => {
  const hastrail = event.endTime > time + plusDays(1);

  return hastrail ? " hastrail " : " ";
};

const Event = ({ e, time }) => {
  return (
    <div
      key={e.id}
      data-time={e.startTime}
      data-content={e.content}
      data-index={e.index}
      style={{
        backgroundColor: `hsla(${e.index * 30 + 50}, 100%, 50%, 0.32)`
      }}
      className={"event" + hasHead(e, time) + hasTrail(e, time)}
    >
      <div className={hasHead(e, time) + " left-drag"}> </div>
      <div className={"event-content"}>
        {hasHead(e, time) !== "!" && e.content}
        - - {e.index}
      </div>
      <div className={" right-drag " + hasTrail(e, time)} />
    </div>
  );
};
class Item extends React.PureComponent {
  componentDidUpdate() {}
  render() {
    const { className = "", time, pushEmpty } = this.props;
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
            let emptykey = 0;
            const sortedEvents = sortEvent(changeIndex, filtedEvent, time);
            const maxIndex = sortedEvents[sortedEvents.length - 1].index;
            for (let i = 0; i <= maxIndex; i++) {
              const found = sortedEvents.find(e => e.index == i);
              if (found) {
                events[i] = <Event e={found} time={time} />;
              } else {
                // 检查:
                //  如果是 每一周的第一天,
                events[i] = <div key={i + "_empty"} className="event-empty" />;
                pushEmpty(i, getDayOfMonth(time))
                if (getDayOfWeek(time) === 0) {
                } else {
                  // 不然检查是否有
                }
              }
            }
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
        <Headers />
        <div className="_calendar_content">
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
          return <div className="__headers">{headers}</div>;
        }}
      </Subscribe>
    );
  }
}
class Week extends React.PureComponent {
  _emptys = [];
  constructor(props) {
    super(props);
  }
  componentDidUpdate() {
    this._removeEmpty();
  }

  componentDidMount() {
    this._removeEmpty();
  }

  _removeEmpty = () => {
    if (this._weekDiv) {
      const events = this._weekDiv.getElementsByClassName("__item_events");
      const canEraseFirstChild = [].every.call(events, function(e) {
        if (e.firstChild) {
          return e.firstChild.className === "event-empty";
        }
        return true;
      });
      if (canEraseFirstChild) {
        // this._weekDiv.className += " erase-first-empty-child ";
      }
      log(canEraseFirstChild);
    }
  };
  __weekRef = n => {
    this._weekDiv = n;
  };
  _pushEmpty = (level, index) => {
    this._emptys[level] = this._emptys[level] || []
    this._emptys[level].push(index)

  };
  render() {
    const self = this;
    return (
      <div className="__week" ref={this.__weekRef}>
        {Children.map(this.props.children, function map(child) {
          return React.cloneElement(child, { pushEmpty: self._pushEmpty });
        })}
      </div>
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
          let _dayOff = dayoffset;
          let weeks = [];

          for (let i = 0; i < rows; i++) {
            let week = [];
            for (let c = 0; c < columns; c++) {
              if (_dayOff != 0) {
                week.push(
                  <Item
                    key={"prev - " + i + " - " + c}
                    time={day1Time + minusDays(_dayOff)}
                  />
                );
                _dayOff -= 1;
              } else {
                week.push(
                  <Item
                    key={i + " " + c}
                    time={day1Time + plusDays(c + i * 7 - dayoffset)}
                  />
                );
              }
            }
            weeks.push(<Week>{week}</Week>);
          }
          return <React.Fragment> {weeks} </React.Fragment>;
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
