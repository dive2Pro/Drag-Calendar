import React, { PureComponent } from 'react'

import { Container } from "unstated";
import { EventEnum, DefaultActiveRange } from "./constants";
import cloneDeep from "lodash.clonedeep";
import { geneNewId, logGroup, helperDate } from "./util";

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

  setActiveRange = (time1, time2) => {
    if (parseInt(time1) > parseInt(time2)) {
      [time2, time1] = [time1, time2];
    }
    // logGroup(" set active Range", time1, time2)
    this.setState({
      activeRange: [time1, time2]
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

  init = props => {
    this._props = props;
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
      content: "TEMP@",
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

  changeEvent = ({id, ...rest}) => {
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
  }
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
          endTime: endTime + delta,
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
    if (item.startTime + delta < item.endTime) {
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
        _performProps("onEventCreated", event);
        break;
      case EventPerformTypes.Update:
        _performProps("onEventUpdated", event);
        break;
      case EventPerformTypes.Remove:
        _performProps("onEventRemoved", event);
        break;
      default:
    }
  };
  createNewOne = obj => {
    const newOne = {
      id: geneNewId(),
      ...obj,
      type: EventEnum.new
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
  setEditing = e => {
    this.setState({
      editing: e
    });
  };

  isEditingEvent = e => {
    return this.state.editing && this.state.editing.id == e.id;
  };
  cleanEditing = () => {
    this.setState({
      editing: null
    });
    this._rendered = false;
  };

  _rendered;
  renderEditForm = (args = {}) => {
    if (this._rendered) {
      return;
    }
    args.removeOne = this.removeOne
    args.handleClose = this.cleanEditing
    args.changeEvent = this.changeEvent

    const rendered = this._performProps("renderForm", {
      ...args,
      handleClose: this.cleanEditing
    });
    if (rendered && React.isValidElement(rendered)) {

      this._rendered = rendered;
    } else {
      console.error(`Please check the prop [renderForm], make sure it will return a Component`)
    }
    return rendered;
  };
}

const eventSource = new EventSource();
const datesourceShared = new DateSource();

export { datesourceShared, DateSource, eventSource, EventSource };
