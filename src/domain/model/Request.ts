import moment from 'moment';
import * as tg from 'type-guards';

export type Status = keyof typeof _Status;
const _Status = {
  Request: 'Request',
  Approve: 'Approve',
  Rejected: 'Rejected',
};


export type Request = {
  readonly id: string;
  start: moment.Moment;
  end: moment.Moment;
  status: Status;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
};

/**
 * Request型か判定する
 *
 * @param obj 型判定対象のオブジェクト
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isRequest(obj: any): obj is Request {
  // Option属性の型判定
  // NOTE: type-guardsライブラリがまだOptionalに対応してないので手作り
  // see: https://github.com/lazarljubenovic/type-guards/pull/37
  for (const validate of [
    { key: 'createdAt', type: moment.isMoment },
    { key: 'updatedAt', type: moment.isMoment },
  ]) {
    if (tg.isNotNullish(obj[validate.key]) && !validate.type(obj[validate.key])) {return false;}
  }

  return tg.isOfShape({
    id: tg.isString,
    start: moment.isMoment,
    end: moment.isMoment,
    status: tg.isEnum(...Object.keys(_Status)),
  })(obj);
}