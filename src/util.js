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


const helperDate = new Date();

export const getDayOfMonth = time => {
  helperDate.setTime(time);
  return helperDate.getDate();
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

export const hasHead = (event, time) => {
  const hashead = event.startTime < time;
  return hashead ? " hashead " : " ";
};

export const hasTrail = (event, time) => {
  const hastrail = event.endTime > time + plusDays(1);

  return hastrail ? " hastrail " : " ";
};