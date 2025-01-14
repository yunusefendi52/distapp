import { FetchError, type FetchContext } from 'ofetch'

export function normalizeError(error: FetchContext | FetchError): string {
    function getFetchError(): FetchError | undefined {
        const errorAny: any = error
        if (errorAny.data) {
            return error as FetchError
        } else {
            return errorAny
        }
    }
    const message: string = error.response?._data?.message || error.response?.statusText || getFetchError()?.data?.message || getFetchError() || 'Unexpected happen'
    if (message.includes(`undefined (reading 'userId')`)) {
        return 'Unauthorized. Try login again'
    }
    return message
}

export function showErrorAlert(error: FetchContext) {
    if (import.meta.dev) {
        console.log('show error alert', error)
    }
    const message = normalizeError(error)
    alert(message)
}