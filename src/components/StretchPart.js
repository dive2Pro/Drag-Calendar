import React, { PureComponent } from 'react'
import { DragSource } from 'react-dnd'
import {ItemTypes} from '../constants'


const spec = {
  beginDrag(props, monitor) {
    const { e, direction, time } = props
    const item = {
      id: e.id,
      direction,
      startTime: e.startTime,
      endTime: e.endTime,
      time
    }
    return item
  }
}

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}
/**
 * direction : right | left
 * e: Event
 * 
 * 根据 direction 确定 改变的是 e 的 startTime 或者 endTime
 * direction 也需要告诉 monitor, 通过在 monitor.getDifferenceFromInitialOffset() 知道 相反方向时 不改变 event 的属性
 * 改变时 right : 不可小于 startTime
 *       left  : 不可 大于 endTime
 */
@DragSource(ItemTypes.STRETCH, spec, collect )
export class StretchPart extends PureComponent {

  render () {
    const {direction, connectDragSource, isDragging } = this.props
    if (direction == void 0)    {
      throw new Error(`must set field: direction`)
    }
    return  connectDragSource(<div 
      style={{
        opacity: isDragging ? 0.5 : 1
      }}
      className={`_stretch ${direction}`}></div>)
  }
}