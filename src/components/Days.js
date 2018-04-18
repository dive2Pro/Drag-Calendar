import React, { PureComponent, Children } from "react";

import { Subscribe } from "unstated";
import { dateSourceShared, eventSource } from "../provider";
import { Day } from "./Day";
import { rows, columns } from "../constants";
import { plusDays, minusDays, log, logGroup } from "../util";
import posed, { PoseGroup } from 'react-pose'
const cloneDeep = require("lodash.clonedeep");

class Week extends React.PureComponent {
  _emptys = [];
  static getDeviredStateFromProps(nextProps, prevState) {
    console.log('----', nextProps);
    
    return {}
  }
  constructor(props) {
    super(props);
  }

  __weekRef = n => {
    this._weekDiv = n;
    const {hostRef} = this.props
    if(hostRef){
      hostRef(n)
    }
  };
  _changeIndex = (e, index) => {
    e.index = index;
  };

  
  render() {
    const self = this;
    const { timeRange } = this.props;
    const startTime = [...timeRange].shift();
    const endTime = [...timeRange].pop() + plusDays(1);

    return (
      <div className="__week" ref={this.__weekRef}>
        <Subscribe to={[eventSource]}>
          {({ state, changeIndex }) => {
            // 优化 不用每次都复制所有的数据
            // 复制在 这"周" 之间的 event
            // 过滤掉 event.start < timeRange && event.end < timeRange.start
            //   +   event.start > event.end
            // 优化  不是每次都需要重新复制, 可以 保存上一次更新是的 reference
            // 如果这一次的 rerender weekEvents 的数量 有改变
            const weekEvents = state.data.filter(e => {
              if (
                (e.startTime < startTime && e.endTime < startTime) ||
                e.startTime > endTime
              ) {
                return false;
              }
              return true;
            });
            const { activeRange } = state
            const data = cloneDeep(weekEvents);
            return Children.map(this.props.children, function map(child) {
              return React.cloneElement(child, {
                changeIndex: self._changeIndex,
                events: data,
                activeRange,
              });
            });
          }}
        </Subscribe>
      </div>
    );
  }
}


const AnimationWeek = posed(Week)({
  enter: { opacity: 1,
    //  left: '0%' 
    },
  exit: { opacity: 0 , 
    // left: '20%'
   }
})

export class Days extends React.PureComponent {
  render() {
    return (
      <Subscribe to={[dateSourceShared]}>
        {dateSource => {
          const days = [];
          const { dayoffset, day1Time } = dateSource.state;
          let _dayOff = dayoffset;
          let weeks = [];
          let time;
          const timeRange = [];
          for (let i = 0; i < rows; i++) {
            let week = [];

            for (let c = 0; c < columns; c++) {
              if (_dayOff != 0) {
                time = day1Time + minusDays(_dayOff);
                timeRange.push(time);
                week.push(
                  <Day
                    key={time}
                    time={time}
                    isCurrentMonth={dateSource.isCurrentMonth(time)}
                  />
                );
                _dayOff -= 1;
              } else {
                time = day1Time + plusDays(c + i * 7 - dayoffset);
                timeRange.push(time);
                week.push(
                  <Day
                    key={time}
                    time={time}
                    isCurrentMonth={dateSource.isCurrentMonth(time)}
                  />
                );
              }
            }

            weeks.push(
              <AnimationWeek
                timeRange={timeRange }
                key={timeRange[0] + '-' +i }
              >
                {week}
              </AnimationWeek>
            );
          }
          // 注意 这里 {weeks} 和' > ' '</' 符号之间的空格或其他非 Component的child  
          return <PoseGroup>{weeks}</PoseGroup>;
        }}
      </Subscribe>
    );
  }
}
