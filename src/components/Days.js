import React, { PureComponent , Children } from 'react'

import { Subscribe } from "unstated";
import { datesourceShared, eventSource } from "../provider";
import { Day } from './Day'
import cloneDeep from 'lodash.cloneDeep'
import { rows , columns } from '../constants'
import { plusDays, minusDays, log, logGroup} from '../util'

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
            log("__deep");
            return Children.map(this.props.children, function map(child) {
              return React.cloneElement(child, {
                changeIndex: self._changeIndex,
                data: self._data
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
          const { dayoffset, day1Time } = dateSource.state;
          let _dayOff = dayoffset;
          let weeks = [];

          for (let i = 0; i < rows; i++) {
            let week = [];
            for (let c = 0; c < columns; c++) {
              if (_dayOff != 0) {
                week.push(
                  <Day
                    key={"prev - " + i + " - " + c}
                    time={day1Time + minusDays(_dayOff)}
                  />
                );
                _dayOff -= 1;
              } else {
                week.push(
                  <Day
                    key={i + " now " + c}
                    time={day1Time + plusDays(c + i * 7 - dayoffset)}
                  />
                );
              }
            }
            weeks.push(<Week key={i + " week- "}>{week}</Week>);
          }
          return <React.Fragment> {weeks} </React.Fragment>;
        }}
      </Subscribe>
    );
  }
}