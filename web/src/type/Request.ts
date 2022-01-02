import moment from 'moment';
import * as tg from 'type-guards';

export type Status = keyof typeof _Status;
const _Status = {
  Request: 'Request',
  Approve: 'Approve',
  Rejected: 'Rejected',
};

export const isRequest = tg.isOfShape({
  id: tg.isString,
  start: moment.isMoment,
  end: moment.isMoment,
  status: tg.isEnum(...Object.keys(_Status)),
  createdAt: moment.isMoment,
  updatedAt: moment.isMoment,
});

export type Request = tg.FromGuard<typeof isRequest>;