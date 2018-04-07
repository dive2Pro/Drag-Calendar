
import {
  logGroup,
  log,
  getDayOfWeek,
  plusDays,
  sortByIndex,
  sortByStartTime,
  sortByStartTimeOrLastTime,
} from "./util";

/**
 *  和每一个 data 比较 并生成事件 EventItem, EventItem 分为下面几种情况
 *       1. 有前一天和后一天 *****
 *       2. 有前一天 ****
 *       3. 有后一天 ***
 *       4. 一天内 **
 *         - 一天内按时间排序
 * @param(any[])
 *
 *  */
export const sortEvent = (changeIndex, events, time) => {
  let fiveStar = [];
  let fourStar = [];
  let threeStar = [];
  let twoStar = [];
  let changed = false;

  events.forEach(e => {
    if (e.startTime < time) {
      fiveStar.push(e);
      // } else if (e.startTime < time && e.endTime < time + plusDays(1)) {
      // fourStar.push(e);
    } else if (e.startTime >= time && e.endTime > time + plusDays(1)) {
      threeStar.push(e);
    } else {
      twoStar.push(e);
    }
  });

  twoStar = twoStar.sort(sortByStartTime);
  threeStar = threeStar.sort(sortByStartTimeOrLastTime);
  const allStar = fiveStar
    .concat(fourStar)
    .concat(threeStar)
    .concat(twoStar);

  fiveStar.concat(fourStar).forEach(e => {
    let index = 0;
    if (getDayOfWeek(time) === 0) {
      // 在每周日, 检查 fiveStar 和 fourStar 的 index
      // fiveStar 根据 起止 时间排序
      fiveStar = fiveStar.sort(sortByStartTimeOrLastTime);

      fiveStar.forEach((e, i) => {
        changeIndex(e, i);
      });
      const fiveStarLastIndex = fiveStar.length
        ? fiveStar[fiveStar.length - 1].index
        : -1;
      fourStar = fourStar.sort(sortByStartTimeOrLastTime);

      fourStar.forEach((e, i) => {
        changeIndex(e, fiveStarLastIndex + 1 + i);
      });
    }
  });
  // logGroup('fourStar', fourStar)

  // 事件的起点在 这个 time 内
  // 不关联 4星和5星的排序
  // 排完序后 是  [0 , 1 , 2]
  // 如 4 星 和 5 星的排序是  [0 , 2]

  // 如果 index 和 高星有冲突
  // 变成  [1, 3, 4]
  const highStar = fiveStar.concat(fourStar).sort(sortByIndex);
  threeStar = threeStar.sort(sortByStartTimeOrLastTime);
  twoStar = twoStar.sort(sortByStartTimeOrLastTime);
  let lowStar = threeStar.concat(twoStar);

  lowStar.forEach(e => {
    let index = 0;
    // 3星, 如果 e 在三星中, 该位置 offset,  e.index = index + offset
    const threeIndex = threeStar.findIndex(ev => ev === e);

    if (threeIndex > -1) {
      index += threeIndex;
    } else {
      // 4星, 如果 index 不为 0 , 找到 5 星 4 星 和 3 星中最index 最大的值
      const _sorted =
        // fiveStar
        // .concat(fourStar)
        threeStar.sort(sortByIndex);
      // log(_sorted)
      if (threeStar.length) {
        index = _sorted[_sorted.length - 1].index + 1;
      }
      const twoIndex = twoStar.findIndex(ev => ev === e);

      if (time === new Date("2018-4-3").getTime()) {
      }
      index += twoIndex;
    }
    if (Number.isNaN(index)) {
      log(index);
      return;
    }
    if (e.index != index) {
      // changed = true
      // e.index = index
    }
    changeIndex(e, index);
  });
  // log(lowStar)
  const result = [];
  const addToResult = res => {
    result.push(res);
  };
  // console.group(" index changed ");
  // log(highStar, lowStar, events);
  // console.groupEnd();
  lowStar = lowStar.sort(sortByIndex);
  let currentEvent;
  while ((currentEvent = highStar.shift())) {
    let lowCurrentEvent;

    while ((lowCurrentEvent = lowStar.shift())) {
      // log(lowCurrentEvent, ' = ' , currentEvent)
      if (lowCurrentEvent.index < currentEvent.index) {
        // result.push(lowCurrentEvent);
        addToResult(lowCurrentEvent);
      } else {
        lowStar.unshift(lowCurrentEvent);
        break;
      }
    }
    // lowCurrentEvent.index ++
    lowStar.forEach(ev => {
      changeIndex(ev, ev.index + 1);
      // e.index ++
    });
    // result.push(currentEvent);
    addToResult(currentEvent);
  }
  if (lowStar.length) {
    lowStar.forEach(addToResult);
  }
  // logGroup("result", result , events)
  return result;
};
