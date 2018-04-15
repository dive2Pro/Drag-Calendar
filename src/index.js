import React from "react";
import { Provider as UnStatedProvider } from "unstated";

import createHTML5Backend from "react-dnd-html5-backend";
import { dateSourceShared, eventSource } from "./provider";
import { Headers, Title, Days } from "./components";
import "./styles.scss";
import CustomDragLayer from "./components/CustomDragLayer";

import { logGroup, getDayOfWeek, log, randomColor } from "./util";
// import { DragDropContext } from "react-dnd";
const DragDropContext = require('react-dnd').DragDropContext

@DragDropContext(createHTML5Backend)
export class DragCalender extends React.PureComponent {
  constructor(props) {
    super(props);
    dateSourceShared.init(props);
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

export default DragCalender
export { randomColor }