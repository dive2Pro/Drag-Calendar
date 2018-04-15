import React, { PureComponent, Children } from "react";

import { Subscribe } from "unstated";
import { dateSourceShared, eventSource } from "../provider";
import { Day } from "./Day";
import { rows, columns } from "../constants";
import { plusDays, minusDays, log, logGroup } from "../util";
const cloneDeep = require("lodash.clonedeep");

class Week extends React.PureComponent {
  _emptys = [];
  constructor(props) {
    super(props);
  }
  __weekRef = n => {
    this._weekDiv = n;
  };
  _changeIndex = (e, index) => {
    e.index = index;
  };

  render() {
    const self = this;
    const { timeRange } = this.props;
    const startTime = timeRange.shift();
    const endTime = timeRange.pop();

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
                    key={"prev - " + i + " - " + c}
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
                    key={i + " now " + c}
                    time={time}
                    isCurrentMonth={dateSource.isCurrentMonth(time)}
                  />
                );
              }
            }

            weeks.push(
              <Week
                timeRange={timeRange}
                key={i + " week- "}
              >
                {week}
              </Week>
            );
          }
          return <React.Fragment> {weeks} </React.Fragment>;
        }}
      </Subscribe>
    );
  }
}
