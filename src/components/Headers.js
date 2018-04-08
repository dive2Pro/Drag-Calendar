import React from "react";
import { Subscribe } from "unstated";
import { datesourceShared } from "../provider";
import { columns } from "../constants";

const WeekNames = ["日", "一","二","三","四","五","六"]
export class Header extends React.PureComponent {
  render() {
    const { className = "", index } = this.props;
    return (
      <div className={"__calendar_item_header " + className}> {WeekNames[index]} </div>
    );
  }
}

export class Headers extends React.PureComponent {
  render() {
    return (
      <Subscribe to={[datesourceShared]}>
        {() => {
          const headers = [];
          new Array(columns).fill(0).forEach((_, i) => {
            headers.push(
              <Header key={"header " + i} className="_header" index={i} />
            );
          });
          return <div className="__headers">{headers}</div>;
        }}
      </Subscribe>
    );
  }
}
