export const getObjectForm = <T = any>(form: any) => {
    return Object.fromEntries(new FormData(form.target ?? form).entries()) as T;
}

export const copyText = async (value: string | undefined) => {
    if (!value) {
        return
    }
    await navigator?.clipboard?.writeText(value);
}