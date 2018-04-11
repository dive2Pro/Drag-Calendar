import React, { PureComponent } from "react";
import { DragSource } from "react-dnd";
import { ItemTypes } from "../constants";
import { eventSource, dateSourceShared } from "../provider";
import { getDragPreview } from "../util";
const spec = {
  beginDrag(props) {
    const { time } = props;

    return {
      time
    };
  },

  endDrag(props, monitor) {
    const activeRange = dateSourceShared.getActiveRange();
    if (activeRange) {
      const newEvent = {
        startTime: activeRange[0],
        endTime: activeRange[1],
      };
      eventSource.createNewOne(newEvent);
    }
    dateSourceShared.resetActiveRange();
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
};

@DragSource(ItemTypes.EMPTY, spec, collect)
export class EmptyPart extends PureComponent {
  componentDidMount() {
    this.props.connectDragPreview(getDragPreview())
  }
  render() {
    const { isDragging, connectDragSource, onCreate } = this.props;
    return connectDragSource(
      <div
        onDoubleClick={onCreate}
        style={{
          opacity: isDragging ? 0.5 : 1
        }}
        className="_empty-part"
      >
      </div>
    );
  }
}
