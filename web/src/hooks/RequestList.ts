import { useEffect, useState } from 'react'
import { Request } from '../type/Request'
import moment from 'moment'
import axios from 'axios'

export interface RequestList {
  readonly data: Array<Request>
  readonly loading: boolean
  readonly error: string | undefined
  reload: () => Promise<void>
}

const API_ENDPOINT = process.env.REACT_APP_API_URL ?? ''

export function useRequestList(): RequestList {
  const [data, setData] = useState<Array<Request>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const getAll = async () => {
    setError(undefined)
    setLoading(true)

    try {
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/requests`
      )
      setData(
        response.data
          .map(
            (e: Record<string, string>) =>
              ({
                ...e,
                start: moment(e.start),
                end: moment(e.end),
                createdAt: moment(e.createdAt),
                updatedAt: moment(e.updatedAt),
              } as Request)
          )
          .sort((curr: Request, prev: Request) => prev.start.diff(curr.start))
      )
      // } catch (e) {
      //   setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAll()
  }, [])

  const reload = async () => {
    await getAll()
  }

  return {
    data,
    loading,
    error,
    reload,
  }
}
