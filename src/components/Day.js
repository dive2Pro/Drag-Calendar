import React, { PureComponent } from 'react'
import {DropTarget} from 'react-dnd'
import {logGroup, log , plusDays, getDayOfMonth} from '../util'
import {Event} from './Event'
import { eventSource } from "../provider"
import { sortEvent } from '../sortEvent'
import {ItemTypes} from '../constants'

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
    const delta = dropTime - item.time;
    // delta 应用到 event 的 startTime 和 endTime
    logGroup("drop end ", delta);

    eventSource.changeEventDate(item, delta);
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
export class Day extends React.PureComponent {

  
  componentDidUpdate(prevProps) {
    if (!prevProps.isOver && this.props.isOver) {
      // drag item { id, time}
      const { monitor } = this.props;
      const item = monitor.getItem();
      // 拿到 event
      const found = eventSource.state.data.find(e => e.id == item.id);
      // props time
      logGroup(" item did up ", item);
      const { time: movingTime } = this.props;
      // 比较 time 和 drop time  = delta
      const delta = movingTime - item.time;

      // delta 应用到 event 的 startTime 和 endTime
      logGroup("dragging  ", delta);

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