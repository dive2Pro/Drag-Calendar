import { Container } from "unstated";
import {EventEnum} from './constants'
import cloneDeep from "lodash.clonedeep";


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
    this.state.data.push(this._temp)
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
const datesourceShared = new DateSource();

export {
  datesourceShared,
  DateSource,
  eventSource,
  EventSource
}