import React, { PureComponent } from "react";
import { DragSource } from "react-dnd";
import { hasHead, hasTrail, logGroup, showContent } from "../util";
import { ItemTypes, rows, EventEnum } from "../constants";
import { eventSource } from "../provider";
import { StretchPart } from "./StretchPart";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

const EventDragSource = {
  beginDrag(props) {
    const { e, time } = props;
    eventSource.generateTempOne(e);
    eventSource.cleanEditing()
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

const dragPreview = document.createElement("div");
dragPreview.id = "drag-preview";
document.body.appendChild(dragPreview);

@DragSource(ItemTypes.EVENT, EventDragSource, collect)
export class Event extends React.PureComponent {
  state = {};
  componentDidMount() {
    const { connectDragPreview } = this.props;
    if (connectDragPreview) {
      const div = document.createElement("div");
      div.style.opacity = 0;
      div.style.height = "100px";
      div.style.width = "100px";
      div.style.background = "blue";
      div.innerHTML = "This is div";
      connectDragPreview(dragPreview);
      // connectDragPreview(<div className="_drag_preview"> This is a div </div>);
      const img = new Image();
      img.style.opacity = 0;
      // img.style.display = 'none'
      img.className = "drag-preview-img";
      img.src =
        "https://www.jqueryscript.net/images/Simplest-Responsive-jQuery-Image-Lightbox-Plugin-simple-lightbox.jpg";
      img.onload = () => {
      };
    }
  }

  _handleClick = event => {
    const { e, time, onEventEdit } = this.props;
    eventSource.setEditing(e.id, time);
    if (onEventEdit) {
      // onEventEdit(event, e, time);
    }
  };
  _domRef = n => {
    this.setState({
      dom: n
    });
  };
  render() {
    const { e, time, isDragging, connectDragSource } = this.props;
    const canTrailStretch = hasTrail(e, time) === " ";
    const canHeadStretch = hasHead(e, time) === " ";

    const isTooltipVisible = eventSource.isEditingEvent(e, time);
    return (
      <Tooltip
        visible={isTooltipVisible}
        overlay={isTooltipVisible && eventSource.renderEditForm()}
        getTooltipContainer={() => this.state.dom}
        placement="right"
        style={{ zIndex: 2 }}
      >
        {connectDragSource(
          <div
            key={e.id}
            data-time={e.startTime}
            data-content={e.content}
            ref={this._domRef}
            data-index={e.index}
            className={
              "event" + hasHead(e, time) + hasTrail(e, time) + " " + e.type
            }
            onClick={this._handleClick}
          >
            {canHeadStretch && (
              <StretchPart e={e} direction="left" time={time} />
            )}
            <div
              className={`event-content ${isDragging ? 'is-dragging' : ''}`}
              style={{
                backgroundColor: `hsl(${e.color}, 78%, 91%)`,
                color: `hsl(${e.color}, 90%, 33%)`,
                opacity: isDragging ? 0.5 : 1,
                cursor:  isDragging ? "none" : "move"
              }}
            >
              {showContent(e, time)}
            </div>
            {canTrailStretch && (
              <StretchPart e={e} direction="right" time={time} />
            )}
          </div>
        )}
      </Tooltip>
    );
  }
}
