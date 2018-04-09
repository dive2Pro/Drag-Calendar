- [x] 处理 "事件"
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
- [x] 处理拖拽
      1. [x] 方向
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

      2. [x] 记录拖拽 handle 位置, 该位置的移动会 使 事件中其他日期的位置 跟着相对变化
            由 item 实现
      3. [x] 拖拽时 有阴影
            由 hover event实现
    [x] bug : 
      当 drag 事件的第二行时, endDrag 立即被 call****
      原因是因为 drag 第二行 时, 此时的 index 已经和上一行的不同, 重新计算后, 第二行 dragging 位置的 dom 可能已经消失
- [x] Item 处理逻辑
      1. SourceProvider 存储 data
      2. 和每一个 data 比较 并生成事件 EventItem, EventItem 分为下面几种情况
          1. 有前一天和后一天 *****
          2. 有前一天 ****
          3. 有后一天 ***
          4. 一天内 **
            - 一天内按时间排序
      3. 渲染每一个 事件到 Item, 要保证事件渲染时的 顺序
          1.  4.1 - 4.2 有一个事件,
          2.  4.2 天内事件
          3.  3.30 - 4.1 有一个事件
          ```
          3.30  4.1 4.2
          3     3   2
                1   1
          ```
          假如 : 
          3. 3.30 - 4.2
          ```
          3.30  4.1   4.2
          3     3     3
                1     1
                      2

          ```

    solution :
      1. 当 event 出现在 item 中的时候, 可以拿到改 item 中的所有 event
      2. 检查 是 event 头 (startTime 出现的 item 位置), 检查他在 该 item 中的位置, 这个位置就是这个事件在 item 中的位置
      3. 以上面的 的 3) 为例子
        i) :
          
          1. 1
          2. 排序后应该是在 1 之后 2 的位置, 但发现 0 的位置是没有人占用的, 所以换到 0
          3. 0
        ii) :
          1. 1
          2. 2
          3. 0
      

## bug 贴顶问题

> 在 跨周 的事件渲染的时候, index 已经被设置, 依照其 进行的逻辑处理 会造成 event div 上面有 empty-content, 不能贴顶. 并且由于在 sortEvent 时已经处理了 lowStar 的 index, 同样会使 empty-content 出现的位置错误

考虑:

  1. ~~取消 event data 中的 index 属性, 改为 渲染前计算~~. 不修改 event 中的 data, 而是在 Week 中复制 data, 计算后赋值 index, 在本周中的 Day 都以改 index 为值来计算

- [x] 处理空白位置 响应 mouse 事件
  - [x] double click
  - [x] 划拉一段, 生成一个事件, 以 这段为起止时间
        
- [ ] style
    [ ] 修改 drag 时 preview  
    [x] 修改样式
    [ ] 使用 popmotion 添加动画

- [ ] edit 接口
    1. 点击 event 时, 渲染 edit form
    2. editform 应该在点击位置打开 -- 计算位置
    3. editform 可以拿到 function(修改当前 event 的 data)
    4.  修改后, 应该可以通过 props 告知
      - update
      - delete
      - create
    5. editform 修改完成 | 关闭时, 通知 Calendar
    