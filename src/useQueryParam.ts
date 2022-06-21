import { useHistory } from 'react-router-dom'
import { useCallback, useState } from 'react'
import useDidMount from './useDidMount'

export interface UseQueryParamOptions<T extends string> {
  initialValue?: T,
  replaceState?: boolean,
  multi?: boolean,
}

const getValue = (param: URLSearchParams, key: string, multi?: boolean) => (multi ? param.getAll(key) : param.get(key))

const getParamFromLocation = <TParam extends string>(search: string, param: string, options: UseQueryParamOptions<TParam>) => {
  const params = new URLSearchParams(search)
  return (getValue(params, search, options.multi) || options.initialValue || '') as TParam
}

/**
 * Ease the process of modify the query string in the URL for the current location.
 */
const useQueryParam = <TParam extends string>(param: string, options: UseQueryParamOptions<TParam> = {}) => {
  const history = useHistory()
  const onMount = useDidMount()
  const [value, setValue] = useState<TParam>(getParamFromLocation<TParam>(history.location.search, param, options))

  const setParam = useCallback((nextValue?: TParam) => {
    const params = new URLSearchParams()
    if (!nextValue) {
      params.delete(param)
    } else {
      params.set(param, nextValue)
    }

    if (options.replaceState) {
      history.replace({ search: params.toString() })
      return
    }

    history.push({ search: params.toString() })
    setValue(nextValue)
  }, [options.replaceState, history])

  onMount(() => {
    const current = new URLSearchParams(history.location.search)

    if (!getValue(current, param, options.multi) && options.initialValue) {
      setParam(options.initialValue)
    }
  })

  return [value, setParam] as [TParam, (nextValue?: TParam) => void]
}

export default useQueryParam
