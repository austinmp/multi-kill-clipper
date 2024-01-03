import { millisToSeconds } from '../utils/utils';

export default class MultiKill {
  type: any;

  start: any;

  end: any;

  id: string;

  constructor(type: any, start: any, end: any, matchId: any) {
    this.type = type;
    this.start = millisToSeconds(start);
    this.end = millisToSeconds(end);
    this.id = `${matchId}-${this.type}-${this.start}-${this.end}`;
  }
}
