import React, { PureComponent } from "react";
import { DropTarget } from "react-dnd";
import { logGroup, log, plusDays, getDayOfMonth, hasActive } from "../util";
import { Event } from "./Event";
import { eventSource, datesourceShared } from "../provider";
import { sortEvent } from "../sortEvent";
import { ItemTypes, EventEnum } from "../constants";
import { EmptyPart } from "./EmptyPart";

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
export class Day extends React.PureComponent {

  componentDidUpdate(prevProps) {
    if (!prevProps.isOver && this.props.isOver) {
      const { monitor, draggingType } = this.props;
      const item = monitor.getItem();
      const { time: dayTime } = this.props;
      if (draggingType === ItemTypes.EVENT) {
        // drag item { id, time}
        // logGroup(" item did up ", item);
        // 比较 time 和 drop time  = delta
        const delta = dayTime - item.time;
        // delta 应用到 event 的 startTime 和 endTime
        eventSource.changeEventDate(item, delta);
      } else if (draggingType === ItemTypes.STRETCH) {
        // logGroup(" Stretch ", item);

        const { time: itemTime, direction } = item;
        const { x, y } = monitor.getDifferenceFromInitialOffset();

        let delta = dayTime - itemTime;

        if (direction === "right") {
          eventSource.changeEventEndTime(item, delta);
        } else {
          eventSource.changeEventStartTime(item, delta);
        }
      } else {
        // empty
        datesourceShared.setActiveRange(item.time, dayTime);
      }
    }
  }
  _handleCreate = () => {
    const { time } = this.props
    eventSource.createNewOne({
      startTime: time,
      endTime: time
    })
  };
  render() {
    const {
      className = "",
      time,
      data,
      changeIndex,
      connectDropTarget,
      isOver,
      canDrop,
      activeRange,
      isCurrentMonth
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
          (isCurrentMonth ? '_current_month ' : ' ')
          +  "__calendar_day " 
          + className 
          + hasActive(activeRange, time)
        }
      >
        <div>{getDayOfMonth(time)}</div>
        <div className={`__item_events`}>{events}</div>
        <EmptyPart time={time} onCreate={this._handleCreate} />
      </div>
    );
  }
}
