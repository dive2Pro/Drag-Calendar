import React, { Children } from "react";
import { render } from "react-dom";
import { Provider as UnStatedProvider, Subscribe, Container } from "unstated";
import cloneDeep from "lodash.clonedeep";
import { DragDropContext, DragSource, DropTarget } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import "./styles.scss";

const log = console.log.bind(console);
console.clear();

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
  data: "B_data",
  hover: "A_hover",
  temp: "C_temp"
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
          startTime: new Date("2018-4-4").getTime(),
          endTime: new Date("2018-4-15").getTime(),
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
          endTime: new Date("2018-4-18 , 13:11").getTime(),
          content: "smoking"
        },

        {
          id: 7,
          type: EventEnum.data,
          startTime: new Date("2018-4-3 , 12:12").getTime(),
          endTime: new Date("2018-4-13, 13:11").getTime(),
          content: "Swimming"
        },
        // {
        //   id: 8,
        //   type: EventEnum.data,
        //   startTime: new Date("2018-4-6 , 12:12").getTime(),
        //   endTime: new Date("2018-4-12, 13:11").getTime(),
        //   content: "Driv to 北京"
        // },

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
        },
        {
          id: 10 << 1,
          type: EventEnum.data,
          startTime: new Date("2018-4-6 , 12:12").getTime(),
          endTime: new Date("2018-4-12, 13:11").getTime(),
          content: "Driv to 北京"
        }
      ]
    };
  }
  _temp = null;
  /**
   *
   * @param {event} e
   * @param {EventEnum} type
   */
  changeEventState(e, type) {
    // log( JSON.stringify (this.state.data))
    // e.type = type
    const newData = this.state.data.map(
      ev => (ev.id === e.id ? { ...ev, type } : ev)
    );
    this.setState({ data: newData });
    // log( JSON.stringify (this.state.data))
  }
  generateTempOne = e => {
    this._temp = cloneDeep({
      ...e,
      id: e.id + "_temp",
      content: "TEMP@",
      type: EventEnum.temp
    });
    this.state.data.push(this._temp);
    this.setState({ data: this.state.data });
  };

  removeTempOne = () => {
    if (this._temp) {
      this.setState({
        data: this.state.data.filter(d => d.id !== this._temp.id)
      });
      this._temp = null;
    }
  };
  /**
   *  根据 delta 修改事件的 起止时间
   *
   * @param {monitor.getItem()} item
   * @param {number} delta
   */
  changeEventDate({id, startTime, endTime }, delta) {
    const newData = this.state.data.map(e => {
      if (e.id == id) {
        // const { startTime, endTime } = e;
        return { ...e, startTime: startTime + delta, endTime: endTime + delta };
      }

      return e;
    });
    this.setState({
      data: newData
    });
  }
  setOriginalTime(e) {
  }
}
const eventSource = new EventSource();

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

const ItemTypes = {
  EVENT: "@event"
};

const EventDragSource = {
  beginDrag(props) {
    const { e, time } = props;
    // eventSource.generateTempOne(e)
    log(e, " --");
    // const _temp = cloneDeep({ ...e, id: e.id + "_temp", type: EventEnum.temp });
    // const newData = eventSource.state.data;
    // newData.push(_temp);
    // eventSource.setState({
    //   data: newData.map(ev => (ev.id === e.id ? { ...e, type: EventEnum.hover } : ev))
    // });
    // eventSource.changeEventState(e, EventEnum.hover);
    eventSource.generateTempOne(e);
    eventSource.setOriginalTime(e)
    return {
      id: e.id,
      time,
      startTime: e.startTime,
      endTime: e.endTime
    };
  },
  endDrag(props, monitor, component) {
    // log(monitor.didDrop() , ' = didDrop')
    // throw new Error('---')
    const { e } = props;

    if (!monitor.didDrop()) {
      // You can check whether the drop was successful
      // or if the drag ended but nobody handled the drop
      // return;
    }

    eventSource.removeTempOne();
    eventSource.changeEventState(e, EventEnum.data);
  },
  isDragging(props, monitor) {
    // log('isDragging   ' , monitor.getItem(), props.e.id);
    const itIs = props.e.id === monitor.getItem().id;

    if (itIs) {
    
    }
    return itIs;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

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

const sortByEventEnum = (a, b) => {
  return a.type.localeCompare(b.type);
};

const sortByStartTimeOrLastTime = (a, b) => {
  if (a.startTime === b.startTime) {
    if (b.endTime === a.endTime) {
      return sortByEventEnum(a, b);
    }
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
    if (e.startTime < time) {
      fiveStar.push(e);
      // } else if (e.startTime < time && e.endTime < time + plusDays(1)) {
      // fourStar.push(e);
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
        changeIndex(e, i);
      });
      const fiveStarLastIndex = fiveStar.length
        ? fiveStar[fiveStar.length - 1].index
        : -1;
      fourStar = fourStar.sort(sortByStartTimeOrLastTime);

      fourStar.forEach((e, i) => {
        changeIndex(e, fiveStarLastIndex + 1 + i);
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
  threeStar = threeStar.sort(sortByStartTimeOrLastTime);
  twoStar = twoStar.sort(sortByStartTimeOrLastTime);
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
  // logGroup("result", result , events)
  return result;
};

const hasHead = (event, time) => {
  const hashead = event.startTime < time;
  return hashead ? " hashead " : "";
};

const hasTrail = (event, time) => {
  const hastrail = event.endTime > time + plusDays(1);

  return hastrail ? " hastrail " : " ";
};

@DragSource(ItemTypes.EVENT, EventDragSource, collect)
class Event extends React.PureComponent {
  componentDidMount() {
    const div = document.createElement("span");
    // this.props.connectDragPreview(div);
  }

  componentWillUnmount() {
    // log(` am out , ${this.props}`)
  }

  render() {
    const { e, time, isDragging, connectDragSource } = this.props;
    return connectDragSource(
      <div
        key={e.id}
        data-time={e.startTime}
        data-content={e.content}
        data-index={e.index}
        style={{
          backgroundColor: `hsla(${e.index * 30 + 50}, 100%, 50%, 0.32)`,
          opacity: isDragging ? 0.5 : 1,
          cursor: "move"
        }}
        className={
          "event" + hasHead(e, time) + hasTrail(e, time) + " " + e.type
        }
      >
        <div className={hasHead(e, time) + " left-drag"}> </div>
        <div className={"event-content"}>
          {hasHead(e, time) !== "!" && e.content}
          - - {e.index}
        </div>
        <div className={" right-drag " + hasTrail(e, time)} />
      </div>
    );
  }
}

const eventItemTarget = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
    }

    // drag item { id, time}
    const item = monitor.getItem();
    // 拿到 event

    // props time
    const { time: dropTime } = props;
    // 比较 time 和 drop time  = delta
    const delta = dropTime - item.time ;
    // delta 应用到 event 的 startTime 和 endTime
    logGroup("drop end ", delta);

    eventSource.changeEventDate(item, delta) ;
    // drop 完成后,
    return {
      moved: true
    };
  }
};
const dropCollect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    monitor
  };
};
@DropTarget(ItemTypes.EVENT, eventItemTarget, dropCollect)
class Item extends React.PureComponent {
  // static getDerivedStateFromProps(nextProps, prevState) {

  // }
  componentDidUpdate(prevProps) {
    if(!prevProps.isOver && this.props.isOver) {
        // drag item { id, time}
        const { monitor } = this.props
        const item = monitor.getItem();
        // 拿到 event
        const found = eventSource.state.data.find( e => e.id == item.id)
        // props time
        logGroup(' item did up ', item)
        const { time: movingTime } = this.props;
        // 比较 time 和 drop time  = delta
        const delta = movingTime - item.time;

        // delta 应用到 event 的 startTime 和 endTime
        logGroup("dragging  ",  delta);
  
        eventSource.changeEventDate(item, delta);
    }
  }

  render() {
    const {
      className = "",
      time,
      data,
      changeIndex,
      connectDropTarget,
      isOver,
      canDrop
    } = this.props;
    if (typeof data.filter !== "function") {
      log(this.props);
    }
    const filtedEvent = data.filter(d => {
      const { startTime, endTime } = d;
      return (
        (time >= startTime || startTime - time < plusDays(1)) && time <= endTime
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
          events[i] = <Event key={found.id + " - "} e={found} time={time} />;
        } else {
          // 检查:
          //  如果是 每一周的第一天,
          events[i] = (
            <div key={i + "_empty " + time} className="event-empty" />
          );
          if (getDayOfWeek(time) === 0) {
          } else {
            // 不然检查是否有
          }
        }
      }
    }

    return connectDropTarget(
      <div className={"__calendar_item " + className}>
        <div>{getDayOfMonth(time)}</div>
        <div className={`__item_events`}>{events}</div>
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

@DragDropContext(HTML5Backend)
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
  __weekRef = n => {
    this._weekDiv = n;
  };
  _changeIndex = (e, index) => {
    e.index = index;
  };

  render() {
    const self = this;
    return (
      <div className="__week" ref={this.__weekRef}>
        <Subscribe to={[eventSource]}>
          {({ state, changeIndex }) => {
            this._data = cloneDeep(state.data);
            log("__deep");
            return Children.map(this.props.children, function map(child) {
              return React.cloneElement(child, {
                changeIndex: self._changeIndex,
                data: self._data
              });
            });
          }}
        </Subscribe>
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
                    key={i + " now " + c}
                    time={day1Time + plusDays(c + i * 7 - dayoffset)}
                  />
                );
              }
            }
            weeks.push(<Week key={i + " week- "}>{week}</Week>);
          }
          return <React.Fragment> {weeks} </React.Fragment>;
        }}
      </Subscribe>
    );
  }
}

const Root = props => {
  datesourceShared.init(props);
  return (
    <UnStatedProvider>
      <Calender />
    </UnStatedProvider>
  );
};

render(<Root showDate={"2018/4/1"} />, document.getElementById("root"));
