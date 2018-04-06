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
          startTime: new Date("2018-3-1").getTime(),
          endTime: new Date("2018-4-2").getTime(),
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
        },
        {
          id: 5,
          type: EventEnum.data,
          startTime: new Date("2018-4-3 , 12:12").getTime(),
          endTime: new Date("2018-4-4 , 13:11").getTime(),
          content: "smoking"
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

const getDayOfWeek = time => {
  helperDate.setTime(time)
  return helperDate.getDay()

}
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
    if (e.startTime < time && e.endTime >= time + plusDays(1)) {
      // log(time, e, " - - - -");
      fiveStar.push(e);
    } else if (e.startTime < time && e.endTime < time + plusDays(1)) {
      fourStar.push(e);
    } else if (e.startTime >= time && e.endTime > time + plusDays(1)) {
      threeStar.push(e);
    } else {
      twoStar.push(e);
    }
  });
  const allStar = fiveStar.concat(fourStar).concat(threeStar).concat(twoStar);
  
  allStar.forEach(e => {
    let index = 0
    if (e.startTime < time && getDayOfWeek(time) === 0){
      // 在每周日, 检查 fiveStar 和 fourStar 的 index
      // fiveStar 根据 起止 时间排序
      fiveStar.sort((a, b) => {
        if (a.startTime === b.startTime) {
          return b.endTime - a.endTime
        } else {
          return a.startTime - b.startTime
        }
      }).forEach((e, i ) => {
        if(e.index == void 0) {
          // 没有设置
          changeIndex(e, i)
        }
      })
      fourStar.sort((a,b) => {
        if (a.startTime === b.startTime) {
          return b.endTime - a.endTime
        } else {
          return a.startTime - b.startTime
        }
      }).forEach((e, i) => {
        if (e.index == void 0) {
          changeIndex(e, fiveStar.length + 1 + i)
        }
      })
    } 
  })

  allStar.forEach(e => {
    let index = 0;
    // 事件的起点在 这个 time 内 或者 是每一周开始时

    if (e.startTime >= time && e.startTime <= time + plusDays(1)) {
      index += fiveStar.length;
      index += fourStar.length;

      
      // 如果这里 index 不为0 那么取 5星和4星 中 index 最大的值 , 加 1 后设置为 index
      if (index !== 0) {
        const _sorted = fiveStar.concat(fourStar).sort((a, b) => a.index - b.index)
        log(_sorted)
        index = _sorted[_sorted.length - 1].index + 1;
      }
      // 3星, 如果 e 在三星中, 该位置 offset,  e.index = index + offset
      const threeIndex = threeStar.findIndex(ev => ev === e);

      // if (time === new Date("2018-4-3").getTime()) {
      //   // log(fiveStar, events, time, time + plusDays(1))
      //   log(fiveStar, fourStar, threeStar, twoStar);
      // }
      // log(threeIndex, ' = threeIndex ', fiveStar)
      if (threeIndex > -1) {
        index += threeIndex;
      } else {
      // 4星, 如果 index 不为 0 , 找到 5 星 4 星 和 3 星中最index 最大的值
      const _sorted = fiveStar.concat(fourStar).concat(threeStar).sort((a, b) => a.index - b.index)
      log(_sorted)
      index = _sorted[_sorted.length - 1].index + 1;
        const twoIndex = twoStar.findIndex(ev => ev === e);

        if (time === new Date("2018-4-3").getTime()) {
          // log(fiveStar, events, time, time + plusDays(1))
          // log(twoIndex, index, threeStar)
        }
        // index += threeStar.length;
        index += twoIndex > -1 ? twoIndex : 0;
        // + index === 0 ? 0 : 1 ;
      }
      if (Number.isNaN(index)) {
        log(index)
        return
      }
      changeIndex(e, index);
    }
  });

  twoStar = twoStar.sort((a, b) => {
    return a.startTime - b.startTime;
  });
  return events.sort((a, b) => a.index - b.index);
};

const hasHead = (event, time) => {
  const hashead = event.startTime < time;
  return hashead ? " hashead " : "";
};

const hasTrail = (event, time) => {
  const hastrail = event.endTime > time + plusDays(1);

  return hastrail ? " hastrail " : " ";
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
            let emptykey = 0;
            // todo 检查优先级
            const sortedEvents = sortEvent(changeIndex, filtedEvent, time);
            for (let i = -1; i < sortedEvents.length - 1; i++) {
              const e = sortedEvents[i + 1];
              if (e.index !== i) {
                // events[i + 1] = (<div className="event-empty"/>)
              } else {
              }
            }
            const addEmptyContent = e => {
              if (e.index) {
                if (!sortedEvents.find(ev => ev.index === e.index - 1)) {
                  events.push(
                    <div
                      key={e.id + " empty " + emptykey++}
                      className="event-empty"
                    />
                  );
                }
              }
            };

            sortedEvents.forEach((e, i) => {
              addEmptyContent(e, i);
              events.push(
                <div
                  key={i}
                  data-time={e.startTime}
                  data-content={e.content}
                  data-index={e.index}
                  style={{
                    backgroundColor: `hsla(${e.index * 30 +
                      50}, 100%, 50%, 0.32)`
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
