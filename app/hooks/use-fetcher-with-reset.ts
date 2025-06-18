import { useEffect, useState } from "react"
import { useFetcher } from "react-router"

/**
 * A higher-order function that creates a new FetcherWithComponentsReset
 * instance, which extends the FetcherWithComponents interface. The new
 * instance includes an additional method `reset` that can be used to reset
 * the state of the fetcher.
 *
 * @template T - The type of data returned by the fetcher.
 * @param fetcherWithComponents - The FetcherWithComponents instance to be extended.
 * @returns A new FetcherWithComponentsReset instance.
 */
export type FetcherWithReset<T> = ReturnType<typeof useFetcher<T>> & {
  reset: () => void
}

/**
 * Custom hook that wraps the useFetcher hook with the ability to reset data.
 *
 * @param {Object} opts - Optional options to pass to the useFetcher hook.
 * @returns {Object} - An object containing fetcher properties with added reset functionality.
 */
export function useFetcherWithReset<T = unknown>(
  opts?: Parameters<typeof useFetcher>[0],
): FetcherWithReset<T> {
  const fetcher = useFetcher<T>(opts)
  const [data, setData] = useState(fetcher.data)
  useEffect(() => {
    if (fetcher.state === "idle") {
      setData(fetcher.data)
    }
  }, [fetcher.state, fetcher.data])
  return {
    ...fetcher,
    data,
    reset: () => setData(undefined),
  }
}
