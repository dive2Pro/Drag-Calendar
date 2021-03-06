import React, { PureComponent } from "react";

import { Subscribe } from "unstated";
import { dateSourceShared } from "../provider";

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
      <Subscribe to={[dateSourceShared]}>
        {({ state: { currentMonth, currentYear }, change }) => {
          return (
            <div className={"_calendar_title " + className}>
              <section className="_year_month">
                {new Date(currentYear + "-" + (currentMonth + 1 )).toLocaleDateString()}
              </section>
              <section className="_month_switch">
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
                  <span role="img" aria-label="prev month">
                    ⬅️
                  </span>
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
                    ➡️
                  </span>
                </button>
              </section>
            </div>
          );
        }}
      </Subscribe>
    );
  }
}
