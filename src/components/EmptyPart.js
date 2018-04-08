import React, { PureComponent } from "react";
import { DragSource } from "react-dnd";
import { ItemTypes } from '../constants'

const spec = {
  beginDrag(props) {
    const { time } = props

    return {
      time
    }
  }
}

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

@DragSource(ItemTypes.EMPTY, spec, collect)
export class EmptyPart extends PureComponent {
  render() {
    const { isDragging, connectDragSource} = this.props
    return connectDragSource(<div
    style={{
      opacity: isDragging ? 0.5 : 1
    }}
    className="_empty-part"
    >____</div>)
  }
}
