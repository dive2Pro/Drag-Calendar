import React, { PureComponent } from "react";

import { Container } from "unstated";
import { EventEnum, DefaultActiveRange } from "./constants";

import {
  geneNewId,
  logGroup,
  helperDate,
  randomColor,
  log,
  setTimeBeDayStart
} from "./util";
const cloneDeep = require("lodash.clonedeep");
const throttle = require("lodash.throttle");

const _processState = newState => {
  const Day1 = new Date(
    // Firefox 需要完整的格式
    newState.currentYear + "/" + (newState.currentMonth + 1) + "/" + 1
  );

  const firstDayOfWeek = Day1.getDay();
  const dayoffset = firstDayOfWeek;
  newState.dayoffset = dayoffset;
  newState.day1Time = Day1.getTime();

  return newState;
};

class DateSource extends Container {
  state = {
    // null | [ startTime, endTime ]
    activeRange: DefaultActiveRange
  };
  init(props) {
    const date = new Date(props.showDate);
    let newState = {};
    newState.currentYear = date.getFullYear();
    newState.currentMonth = date.getMonth();
    this.change(newState);
    this._props = props;
  }

  change = state => {
    let newState = state;
    const prev = this.state;
    if (typeof state === "function") {
      newState = state(prev);
    }
    newState = Object.assign({}, prev.state, newState);
    newState = _processState(newState);
    this.setState(newState);
  };

  isCurrentMonth = time => {
    const { currentYear, currentMonth } = this.state;
    helperDate.setFullYear(currentYear);

    const startTime = helperDate.setMonth(currentMonth, 0);

    const endTime = helperDate.setMonth(currentMonth + 1, 0);
    // logGroup(' is current month ', startTime, endTime, time)
    return time >= startTime && time <= endTime;
  };
}

const EventPerformTypes = {
  Update: "_event_Update",
  Remove: "_event_Remove",
  Create: "_event_Create"
};
class EventSource extends Container {
  constructor() {
    super();
    this.state = {};
    this.setActiveRange = throttle(this.setActiveRange, 250)
  }

  _temp = null;

  init = props => {
    this._props = props;
    this.state = { data: props.initialEventSource || [] };
  };
  /**
   *
   * @param {event} e
   * @param {EventEnum} type
   */
  changeEventState(e, type) {
    // log( JSON.stringify (this.state.data))
    // e.type = type
    let targetEvent;
    const newData = this.state.data.map(ev => {
      if (ev.id === e.id) {
        targetEvent = { ...ev, type };
        return targetEvent;
      }
      return ev;
    });
    this.setState({ data: newData });
    this.triggerCbs(EventPerformTypes.Update, targetEvent);
  }
  generateTempOne = e => {
    this._temp = cloneDeep({
      ...e,
      id: e.id + "_temp",
      type: EventEnum.temp
    });
    this.state.data.push(this._temp);
    // 直接修改 不通过 setState 通知修改, 免除的这一次更新会使 "第二行"的 drag 事件不会因为 dom 重新生成而导致 dragend
  };

  removeTempOne = () => {
    if (this._temp) {
      this.setState({
        data: this.state.data.filter(d => d.id !== this._temp.id)
      });
      this._temp = null;
    }
  };

  changeEvent = ({ id, ...rest }) => {
    let targetEvent;
    const newData = this.state.data.map(e => {
      if (e.id == id) {
        // const { startTime, endTime } = e;
        targetEvent = {
          ...e,
          ...rest
        };
        return targetEvent;
      }

      return e;
    });
    this.setState({
      data: newData
    });
    this.triggerCbs(EventPerformTypes.Update, targetEvent);
  };
  /**
   *  根据 delta 修改事件的 起止时间
   *
   * @param {monitor.getItem()} item
   * @param {number} delta
   */
  changeEventDate({ id, startTime, endTime }, delta) {
    let targetEvent;
    const newData = this.state.data.map(e => {
      if (e.id == id) {
        // const { startTime, endTime } = e;
        targetEvent = {
          ...e,
          startTime: startTime + delta,
          endTime: endTime + delta
        };
        return targetEvent;
      }

      return e;
    });
    this.setState({
      data: newData
    });
    this.triggerCbs(EventPerformTypes.Update, targetEvent);
  }
  changeEventEndTime(item, delta) {
    if (item.endTime + delta > item.startTime) {
      let targetEvent;
      const newData = this.state.data.map(e => {
        if (e.id == item.id) {
          targetEvent = { ...e, endTime: item.endTime + delta };
          return targetEvent;
        }
        return e;
      });

      this.setState({
        data: newData
      });
      this.triggerCbs(EventPerformTypes.Update, targetEvent);
    }
  }
  changeEventStartTime(item, delta) {
    if (item.startTime + delta <= item.endTime) {
      let targetEvent;
      const newData = this.state.data.map(e => {
        if (e.id == item.id) {
          targetEvent = { ...e, startTime: item.startTime + delta };
          return targetEvent;
        }
        return e;
      });

      this.setState({
        data: newData
      });
      this.triggerCbs(EventPerformTypes.Update, targetEvent);
    }
  }
  _performProps = (name, ...args) => {
    const props = this._props;
    if (props[name]) {
      args.push(this.state.data);
      return props[name].apply(null, args);
    }
  };
  triggerCbs = (type, event) => {
    switch (type) {
      case EventPerformTypes.Create:
        this._performProps("onEventCreated", event);
        break;
      case EventPerformTypes.Update:
        this._performProps("onEventUpdated", event);
        break;
      case EventPerformTypes.Remove:
        this._performProps("onEventRemoved", event);
        break;
      default:
    }
  };
  createNewOne = obj => {
    const newOne = {
      id: geneNewId(),
      ...obj,
      type: EventEnum.new,
      color: randomColor(),
      content: this._props.newOneContent
    };
    this.state.data.push(newOne);
    this.setState({ data: this.state.data });
    this.triggerCbs(EventPerformTypes.Create, newOne);
  };
  removeOne = event => {
    const newData = this.state.data.filter(e => e.id !== event.id);
    this.setState({ data: newData });
    this.triggerCbs(EventPerformTypes.Remove, event);
  };
  setEditing = (id, time) => {
    this.setState({
      editing: {
        eventId: id,
        time
      }
    });
  };

  isEditingEvent = (e, time) => {
    return (
      this.state.editing &&
      this.state.editing.eventId == e.id &&
      this.state.editing.time == time
    );
  };

  cleanEditing = time => {
    this.setState({
      editing: null
    });
  };

  renderEditForm = (args = {}) => {
    args.removeOne = this.removeOne;
    args.handleClose = this.cleanEditing;
    args.changeEvent = this.changeEvent;
    if (!("e" in args)) {
      args.e = this.state.data.find(e => e.id === this.state.editing.eventId);
    }
    const rendered = this._performProps("renderForm", {
      ...args,
      handleClose: this.cleanEditing
    });

    if (!args.e) {
      console.error(`args.e doesn't exits`, this.state);
    } else if (rendered && React.isValidElement(rendered)) {
    } else {
      console.error(
        `Please check the prop [renderForm], make sure it will return a Component`
      );
    }

    return rendered;
  };

  setActiveEvent = id => {
    this.setState({
      activeId: id
    });
  };

  removeActiveEvent = () => {
    this.setState({
      activeId: null
    });
  };

  setActiveRange = (time1, time2) => {
    if (parseInt(time1) > parseInt(time2)) {
      [time2, time1] = [time1, time2];
    }
    // logGroup(" set active Range", time1, time2)

    this.setState({
      activeRange: [setTimeBeDayStart(time1), time2]
    });
  };

  resetActiveRange = () => {
    this.setState({
      activeRange: DefaultActiveRange
    });
  };

  getActiveRange = () => {
    return this.state.activeRange;
  };
}

const eventSource = new EventSource();
const dateSourceShared = new DateSource();

export { dateSourceShared, DateSource, eventSource, EventSource };
