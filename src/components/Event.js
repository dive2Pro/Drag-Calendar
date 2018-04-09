import React, { PureComponent } from "react";
import { DragSource } from "react-dnd";
import { hasHead, hasTrail, logGroup, showContent } from "../util";
import { ItemTypes, rows, EventEnum } from "../constants";
import { eventSource } from "../provider";
import { StretchPart } from "./StretchPart";
const EventDragSource = {
  beginDrag(props) {
    const { e, time } = props;
    eventSource.generateTempOne(e);
    return {
      id: e.id,
      time,
      startTime: e.startTime,
      endTime: e.endTime
    };
  },
  endDrag(props, monitor, component) {
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

@DragSource(ItemTypes.EVENT, EventDragSource, collect)
export class Event extends React.PureComponent {
  componentDidMount() {}

  _handleClick = (event) => {
    const { e, time, onEventEdit } = this.props;
    eventSource.setEditing(e)
    if (onEventEdit) {
      // onEventEdit(event, e, time);
    }
  };

  _handleClose = () => {
    
  }

  render() {
    const { e, time, isDragging, connectDragSource } = this.props;
    const canTrailStretch = hasTrail(e, time) === " ";
    const canHeadStretch = hasHead(e, time) === " ";
    return connectDragSource(
      <div
        key={e.id}
        data-time={e.startTime}
        data-content={e.content}
        data-index={e.index}
        className={
          "event" + hasHead(e, time) + hasTrail(e, time) + " " + e.type
        }
        onClick={this._handleClick}
      >
        {canHeadStretch && <StretchPart e={e} direction="left" time={time} />}
        <div
          className={"event-content"}
          style={{
            backgroundColor: `hsla(${e.index * 30 + 50}, 100%, 50%, 1)`,
            opacity: isDragging ? 0.5 : 1,
            cursor: "move"
          }}
        >
          {showContent(e, time)}
        </div>
        {canTrailStretch && <StretchPart e={e} direction="right" time={time} />}
      </div>
    );
  }
}
