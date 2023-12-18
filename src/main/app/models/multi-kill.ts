import { millisToSeconds } from '../utils/utils';

export default class MultiKill {
  type: any;

  start: any;

  end: any;

  constructor(type: any, start: any, end: any) {
    this.type = type;
    this.start = millisToSeconds(start);
    this.end = millisToSeconds(end);
  }
}
