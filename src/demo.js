
import React from "react";
import { logGroup, getDayOfWeek, log, randomColor } from "./util";
import { DatePicker, Popover, Button, Input, Icon } from "antd";
import moment from "moment";
import "antd/dist/antd.css";
import { render } from "react-dom";
import { data } from '../example/antd/data'
import DragCalendar from './index';

class RenderForm extends React.PureComponent {
  state = {
    startValue: moment(this.props.e.startTime),
    endValue: moment(this.props.e.endTime),
    content: null,
    startOpen: false,
    endOpen: false
  };

  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };
  onChange = (field, value) => {
    const { changeEvent, e } = this.props;
    this.setState(
      {
        [field]: value
      },
      () => {
        const { startValue, endValue } = this.state;
        changeEvent({ ...e, startTime: startValue, endTime: endValue });
      }
    );
  };

  onStartChange = value => {
    this.onChange("startValue", value);
  };

  onEndChange = value => {
    this.onChange("endValue", value);
  };
  handleStartOpenChange = open => {
    if (open) {
      this.setState({
        endOpen: false
      });
    }
    this.setState({
      startOpen: open
    });
  };

  handleEndOpenChange = open => {
    if (open) {
      this.setState({
        startOpen: false
      });
    }
    this.setState({
      endOpen: open
    });
  };
  render() {
    const { args } = this.props;
    const { removeOne, e, handleClose, changeEvent } = this.props;
    const { startValue, endValue, endOpen, startOpen } = this.state;
    const suffix = !!e.content ? (
      <Icon
        type="close-circle"
        onClick={() =>
          changeEvent({
            ...e,
            content: ""
          })
        }
      />
    ) : null;
    return (
      <React.Fragment>
        <div className="render-form-title">Title</div>
        <div className="render-form-content">
          <div>
            <span>Content:</span>
            <Input
              style={{ width: "auto" }}
              placeholder={"Change Event Content"}
              ref={n => (this.contentInput = n)}
              value={e.content}
              onChange={ev => {
                changeEvent({ ...e, content: ev.target.value });
              }}
              suffix={suffix}
            />
          </div>
          <div>
            Start Time:
            <DatePicker
              disabledDate={this.disabledStartDate}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={startValue}
              open={startOpen}
              placeholder="Start"
              onChange={this.onStartChange}
              onOpenChange={this.handleStartOpenChange}
            />
          </div>
          <div>
            End Time:
            <DatePicker
              disabledDate={this.disabledEndDate}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={endValue}
              placeholder="End"
              onChange={this.onEndChange}
              open={endOpen}
              onOpenChange={this.handleEndOpenChange}
            />
          </div>
        </div>
        <div>
          <Button
            type="primary"
            onClick={() => {
              handleClose();
            }}
          >
            OK
          </Button>
          <Button
            icon="delete"
            type="danger"
            onClick={() => {
              removeOne(e);
              handleClose();
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}


render(
  <DragCalendar
    initialEventSource={data.map(d => ({...d, color: randomColor()}))}
    newOneContent="新建事件"
    onEventCreated={(...args) => {
      // log(args)
    }}
    onEventUpdated={(...args) => {
      // log(args)
    }}
    onEventRemoved={(...args) => {
      // log(args)
    }}
    renderForm={(...args) => {
      const e = args[0];
      // logGroup("23", typeof e);
      return <RenderForm {...e} />;
    }}
    showDate={"2018/4/1"}
  />,
  document.getElementById("root")
);
