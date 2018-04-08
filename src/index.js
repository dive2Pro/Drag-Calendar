import React from "react";
import { render } from "react-dom";
import { Provider as UnStatedProvider } from "unstated";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { datesourceShared } from "./provider";
import { Headers, Title, Days } from "./components";
import "./styles.scss";

console.clear();

@DragDropContext(HTML5Backend)
class Calender extends React.PureComponent {
  constructor(props) {
    super(props)
    datesourceShared.init(props);
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

render(<Calender showDate={"2018/4/1"} />, document.getElementById("root"));
