import React, { PureComponent } from "react";
import { DropTarget } from "react-dnd";
import {
  logGroup,
  log,
  plusDays,
  getDayOfMonth,
  hasActive,
  setTimeBeDayStart
} from "../util";
import { Event } from "./Event";
import { eventSource, dateSourceShared } from "../provider";
import { sortEvent } from "../sortEvent";
import { ItemTypes, EventEnum } from "../constants";
import { EmptyPart } from "./EmptyPart";
var shallowEqual = require("fbjs/lib/shallowEqual");

const eventItemTarget = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
    }

    // drag item { id, time}
    const item = monitor.getItem();
    const draggingType = monitor.getItemType();

    if (draggingType === ItemTypes.Event) {
      // 拿到 event

      // props time
      const { time: dropTime } = props;
      // 比较 time 和 drop time  = delta
      const delta = dropTime - item.time;
      // delta 应用到 event 的 startTime 和 endTime
      // eventSource.removeTempOne();
      eventSource.changeEventDate(item, delta);
    } else if (draggingType === ItemTypes.EMPTY) {
    }
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
    draggingType: monitor.getItemType(),
    monitor
  };
};
@DropTarget(
  [ItemTypes.EVENT, ItemTypes.STRETCH, ItemTypes.EMPTY],
  eventItemTarget,
  dropCollect
)
export class Day extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    // 拿到 isActive 放入 state
    const { events, time, className, activeRange } = nextProps;
    
    // 拿到 filtedEvent 放入 state
    const filtedEvent = events.filter(d => {
      const { startTime, endTime } = d;
      return (
        (time >= startTime || startTime - time < plusDays(1)) && time <= endTime
      );
    });
    const newState = {
      events: filtedEvent,
      className: className + hasActive(activeRange, time)
    };
    // console.log(" --- derived state from props");

    return newState;
  }
  state = {};

  shouldComponentUpdate(nextProps, nextState) {
    const { activeRange: nextActiveRange, events: nevents, className: nc, ...nextRestProps } = nextProps;
    const { activeRange: thisActiveRange, events, className: tc, ...thisRestProps } = this.props;

    return !shallowEqual(nextState, this.state) || !shallowEqual(thisRestProps, nextRestProps);
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.isOver && this.props.isOver) {
      const { monitor, draggingType } = this.props;
      const item = monitor.getItem();
      const { time: dayTime } = this.props;
      if (draggingType === ItemTypes.EVENT) {
        const delta = dayTime - item.time;
        // delta 应用到 event 的 startTime 和 endTime
        eventSource.changeEventDate(item, delta);
        const newItem = eventSource.state.data.find(e => e.id === item.id);
        eventSource.setActiveRange(newItem.startTime, newItem.endTime);
      } else if (draggingType === ItemTypes.STRETCH) {

        const { time: itemTime, direction } = item;
        let delta = dayTime - itemTime;

        if (direction === "right") {
          eventSource.changeEventEndTime(item, delta);
        } else {
          eventSource.changeEventStartTime(item, delta);
        }

        const newItem = eventSource.state.data.find(e => e.id === item.id);
        eventSource.setActiveRange(newItem.startTime, newItem.endTime);
      } else {
        // empty
        eventSource.setActiveRange(item.time, dayTime);
      }
    }
  }

  _handleCreate = () => {
    const { time } = this.props;
    eventSource.createNewOne({
      startTime: time,
      endTime: time
    });
  };
  render() {
    const {
      time,
      changeIndex,
      connectDropTarget,
      isCurrentMonth
    } = this.props;
    // 拿到在这一天的事件

    const {className, events} = this.state
    let eventViews = [];
    if (events.length) {
      let emptykey = 0;
      const sortedEvents = sortEvent(changeIndex, events, time);
      const maxIndex = sortedEvents[sortedEvents.length - 1].index;
      for (let i = 0; i <= maxIndex; i++) {
        const found = sortedEvents.find(e => e.index == i);
        if (found) {
          eventViews[i] = (
            <React.Fragment key={found.id + " - "}>
              <Event e={found} time={time} />
            </React.Fragment>
          );
        } else {
          eventViews[i] = (
            <EmptyPart
              key={i + "_empty " + time}
              time={time}
              onCreate={this._handleCreate}
            />
          );
        }
      }
    }
    return connectDropTarget(
      <div
        className={
          (isCurrentMonth ? "_current_month " : " ") +
          "__calendar_day " +
          className
        }
      >
        <div>{getDayOfMonth(time)}</div>
        <div className={`__item_events`}>{eventViews}</div>
        <EmptyPart time={time} onCreate={this._handleCreate} />
      </div>
    );
  }
}
