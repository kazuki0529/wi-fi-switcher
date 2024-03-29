import { useAuthenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';
import { Request, Status } from '../type/Request';

export interface RequestState {
  readonly data?: Request;
  readonly loading: boolean;
  readonly error: string | undefined;
  setData: (data: Request) => void;
  create: (
    data: Omit<Request, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  approve: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
}

const API_ENDPOINT = process.env.REACT_APP_API_URL ?? '';

export function useRequest(): RequestState {
  const [data, setData] = useState<Request | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { user } = useAuthenticator();

  const updateStatus = async (id: string, status: Status) => {
    setError(undefined);
    setLoading(true);

    try {
      const response = await axios.put(
        `${API_ENDPOINT}/v1/requests/${id}`,
        { status: status },
        {
          headers: {
            Authorization:
              user.getSignInUserSession()?.getIdToken().getJwtToken() ?? '',
          },
        },
      );
      setData({
        ...response.data,
        start: moment(response.data.start),
        end: moment(response.data.end),
        createdAt: moment(response.data.createdAt),
        updatedAt: moment(response.data.updatedAt),
      } as Request);
      // } catch (e) {
      //   setError(e.message)
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    await updateStatus(id, 'Approve');
  };
  const reject = async (id:string) => {
    await updateStatus(id, 'Rejected');
  };

  const create = async (
    data:Omit<Request, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ) => {
    setError(undefined);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/v1/requests`,
        {
          ...data,
          status: 'Request',
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        },
        {
          headers: {
            Authorization:
              user.getSignInUserSession()?.getIdToken().getJwtToken() ?? '',
          },
        },
      );
      setData({
        ...response.data,
        start: moment(response.data.start),
        end: moment(response.data.end),
        createdAt: moment(response.data.createdAt),
        updatedAt: moment(response.data.updatedAt),
      } as Request);
      // } catch (e) {
      //   setError(e.message)
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    setData,
    loading,
    error,
    create,
    approve,
    reject,
  };
}
