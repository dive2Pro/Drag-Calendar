import { EventEnum } from "./constants";
const uniqid = require("uniqid");
const random = require("lodash.random");

export const logGroup = (title, ...args) => {
  console.group(title);
  log(args);
  console.groupEnd();
};
export const log = console.log.bind(console);
const dayMilliseconds = 86400000;

export const plusDays = days => {
  return dayMilliseconds * days;
};

export const minusDays = days => {
  return -1 * dayMilliseconds * days;
};

export const helperDate = new Date();

export const getDayOfMonth = time => {
  helperDate.setTime(time);
  return helperDate.getDate() + "日";
};

export const getDayOfWeek = time => {
  helperDate.setTime(time);
  return helperDate.getDay();
};

export const sortByStartTime = (a, b) => {
  return a.startTime - b.startTime;
};

export const sortByIndex = (a, b) => a.index - b.index;

export const sortByEventEnum = (a, b) => {
  return a.type.localeCompare(b.type);
};

export const sortByStartTimeOrLastTime = (a, b) => {
  if (a.startTime === b.startTime) {
    if (b.endTime === a.endTime) {
      return sortByEventEnum(a, b);
    }
    return b.endTime - a.endTime;
  } else {
    return a.startTime - b.startTime;
  }
};

/**
 *
 * 根据 type 和 startTime & endTime 排序
 *
 * @param {{type: string, startTime: number, endTime: number}[]} events
 * @return {{type: string, startTime: number, endTime: number}[]} sortedEvents
 */
export const eventSort = (events = []) => {
  // 1. 根据 type 分 group
  const types = {};
  events.forEach(event => {
    types[event.type] = types[event.type] || [];
    types[event.type].push(event);
  });

  // 2. 各个 group 再 sort
  let arrays = [];
  Object.keys(types)
    .sort((a,b) => a.localeCompare(b))
    .forEach(key => {
      // 3.合并
      arrays = arrays.concat(types[key].sort(sortByStartTimeOrLastTime));
    });
  return arrays;
};

export const hasHead = (event, time) => {
  const hashead = event.startTime < time;
  return hashead ? " hashead " : " ";
};

export const hasTrail = (event, time) => {
  const _4_1 = helperDate.setMonth(3, 1);
  if (_4_1 === time) {
    // debugger
  }
  const hastrail = event.endTime >= time + plusDays(1);

  return hastrail ? " hastrail " : " ";
};

// export const isInthe
/**
 *
 * @param {null | number[]} activeRange
 * @param {string} time
 * @return " _active " | " "
 */
export const hasActive = (activeRange, time) => {
  if (Array.isArray(activeRange)) {
    logGroup(" hasActive ", activeRange, time);
    if (time <= activeRange[1] && time >= activeRange[0]) {
      // debugger
      return " _active ";
    }
  }
  return " ";
};

export const geneNewId = (...args) => {
  return uniqid();
};

export const showContent = (e, time) => {
  if (hasHead(e, time) == " " || getDayOfWeek(time) === 0) {
    return e.content;
  }
  return null;
};

const COLORS = ["#ff9a9e", "#a18cd1", "#a1c4fd", "#d4fc79"];

export const randomColor = () => {
  return COLORS[random(0, COLORS.length - 1)];
};
