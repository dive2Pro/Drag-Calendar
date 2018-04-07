import React, { PureComponent } from 'react'

import {Subscribe} from 'unstated'
import {datesourceShared} from '../provider'

export class Title extends React.PureComponent {

  constructor(props) {
    super(props);
    this._prevMonth = this._prevMonth.bind(this);
    this._nextMonth = this._nextMonth.bind(this);
  }
  _prevMonth() {}
  _nextMonth() {}

  render() {
    const { className = "", currentMonth, currentYear } = this.props;

    return (
      <Subscribe to={[datesourceShared]}>
        {({ state: { currentMonth, currentYear }, change }) => {
          return (
            <div className={"__calendar_item_title " + className}>
              {currentYear + " - " + (currentMonth + 1)}
              <button
                type="button"
                onClick={() => {
                  let newMonth = currentMonth - 1;
                  let newYear = currentYear;
                  if (currentMonth == 0) {
                    newYear -= 1;
                    newMonth = 11;
                  }
                  change({
                    currentMonth: newMonth,
                    currentYear: newYear
                  });
                }}
              >
                {" "}
                <span role="img" aria-label="prev month">
                  {" "}
                  ⬅️{" "}
                </span>{" "}
              </button>
              <button
                onClick={() => {
                  let newMonth = currentMonth + 1;
                  let newYear = currentYear;
                  if (currentMonth == 11) {
                    newYear += 1;
                    newMonth = 0;
                  }
                  change({
                    currentMonth: newMonth,
                    currentYear: newYear
                  });
                }}
              >
                <span role="img" aria-label="next month">
                  {" "}
                  ➡️{" "}
                </span>{" "}
              </button>
            </div>
          );
        }}
      </Subscribe>
    );
  }
}