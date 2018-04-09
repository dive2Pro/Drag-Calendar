import React from "react";
import { render } from "react-dom";
import { Provider as UnStatedProvider } from "unstated";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { datesourceShared, eventSource } from "./provider";
import { Headers, Title, Days } from "./components";
import { DatePicker, Popover } from "antd";
import "antd/dist/antd.css";
import "./styles.scss";
import { logGroup, getDayOfWeek } from "./util";

console.clear();

@DragDropContext(HTML5Backend)
class Calender extends React.PureComponent {
  constructor(props) {
    super(props);
    datesourceShared.init(props);
    eventSource.init(props);
  }
  render() {
    return (
      <UnStatedProvider>
        <section className="__calendar">
          <Title />
          <Headers />
          <div className="_calendar_content">
            <Days />
          </div>
        </section>
      </UnStatedProvider>
    );
  }
}

render(
  <Calender
    renderForm={(...args) => {
      logGroup(args, getDayOfWeek(args[0].time));
      const placement = getDayOfWeek(args[0].time) == 6 ? "left" : "right";
      return <Popover placement={placement} visible content={<DatePicker />} />;
    }}
    showDate={"2018/4/1"}
  />,
  document.getElementById("root")
);
