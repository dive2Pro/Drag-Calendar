- [ ] 处理 "事件"
      事件 : {
        mode: "temp" | "data" !default
        startTime 
        endTime
        content
        id: unique 
          当点击某个事件时
      }
      eg: 
      [
        {
          startTime: 2018-4-1
          endTime : 2018-4-3,
          content: 'play dota'
        },
        {
          startTime: 2018-4-5/18:00
          endTime: 2018-4-6/19:00,
          content: 'sleep'
        },
        {
          startTime: 2018-4-5/12:12
          endTime: 2018-4-5/13:11
          content: 'eat'
        }
      ]
- [ ] 处理拖拽
      1. [ ] 方向
            每一个 DataSquare 都有自己的 time,
            记录点击时的位置 (time)
            点击时的 event ( id )
            修改其  成为 一个 temp event 到 source
            添加一个 hover event 到 source
            拖拽时 修改的是hover的 event 的数据
                clickEvent
                dragEvent [] 应该可以由 DND 提供 isOver
                计算 :
                      1. 离开始时间的 days
                      2. isOver 时 移动了的 days
                      3. 修改 hover event 的 startTime 和 endTime
            拖拽完毕
                1. 删除 temp event
                2. 修改 hover event 为 data event

      2. [ ] 记录拖拽 handle 位置, 该位置的移动会 使 事件中其他日期的位置 跟着相对变化
            由 item 实现
      3. [ ] 拖拽时 有阴影
            由 hover event实现
- [ ] Item 处理逻辑
      1. SourceProvider 存储 data
      2. 和每一个 data 比较 并生成事件 EventItem, EventItem 分为下面几种情况
          1. 有前一天和后一天 *****
          2. 有前一天 ****
          3. 有后一天 ***
          4. 一天内 **
            - 一天内按时间排序
      3. 渲染每一个 事件到 Item
