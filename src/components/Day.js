import React, { PureComponent } from "react";
import { DropTarget } from "react-dnd";
import { logGroup, log, plusDays, getDayOfMonth } from "../util";
import { Event } from "./Event";
import { eventSource } from "../provider";
import { sortEvent } from "../sortEvent";
import { ItemTypes } from "../constants";

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
      logGroup("drop end ", delta);

      eventSource.changeEventDate(item, delta);
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
@DropTarget([ItemTypes.EVENT, ItemTypes.STRETCH], eventItemTarget, dropCollect)
export class Day extends React.PureComponent {
  componentDidUpdate(prevProps) {
    if (!prevProps.isOver && this.props.isOver) {
      const { monitor } = this.props;
      const item = monitor.getItem();
      if (this.props.draggingType === ItemTypes.EVENT) {
        // drag item { id, time}
        // props time
        logGroup(" item did up ", item);
        const { time: movingTime } = this.props;
        // 比较 time 和 drop time  = delta
        const delta = movingTime - item.time;
        // delta 应用到 event 的 startTime 和 endTime
        logGroup("dragging  ", delta);
        eventSource.changeEventDate(item, delta);
      } else {
        // TODO:  set with STRETCH
        logGroup(" Stretch ", item);
        
        const { time : draggingTime } = this.props
        const {time: itemTime, direction } = item
        const { x, y } = monitor.getDifferenceFromInitialOffset()

        let delta = draggingTime - itemTime

        if (direction === 'right') {
          // change endTime
          eventSource.changeEventEndTime(item, delta)
        } else {
          // change startTime
          eventSource.changeEventStartTime(item, delta)
        }
      }
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
          events[i] = (
            <div key={i + "_empty " + time} className="event-empty" />
          );
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
