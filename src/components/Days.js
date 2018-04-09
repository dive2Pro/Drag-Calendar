import React, { PureComponent , Children } from 'react'

import { Subscribe } from "unstated";
import { datesourceShared, eventSource } from "../provider";
import { Day } from './Day'
import { rows , columns } from '../constants'
import { plusDays, minusDays, log, logGroup} from '../util'
const cloneDeep = require('lodash.clonedeep')

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
    return (
      <div className="__week" ref={this.__weekRef}>
        <Subscribe to={[eventSource]}>
          {({ state, changeIndex }) => {
            this._data = cloneDeep(state.data);
            return Children.map(this.props.children, function map(child) {
              return React.cloneElement(child, {
                changeIndex: self._changeIndex,
                data: self._data,
                ...self.props
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
      <Subscribe to={[datesourceShared]}>
        {dateSource => {
          const days = [];
          const { dayoffset, day1Time, activeRange } = dateSource.state;
          let _dayOff = dayoffset;
          let weeks = [];
          let time 
          for (let i = 0; i < rows; i++) {
            let week = [];
            
            for (let c = 0; c < columns; c++) {
              if (_dayOff != 0) {
                time = day1Time + minusDays(_dayOff)
                week.push(
                  <Day
                    key={"prev - " + i + " - " + c}
                    time={time}
                    isCurrentMonth={dateSource.isCurrentMonth(time)}
                  />
                );
                _dayOff -= 1;
              } else {
                time = day1Time + plusDays(c + i * 7 - dayoffset)
                week.push(
                  <Day
                    key={i + " now " + c}
                    time={time}
                    isCurrentMonth={dateSource.isCurrentMonth(time)}
                  />
                );
              }
            }
            weeks.push(<Week key={i + " week- "} activeRange={activeRange} >{week}</Week>);
          }
          return <React.Fragment> {weeks} </React.Fragment>;
        }}
      </Subscribe>
    );
  }
}