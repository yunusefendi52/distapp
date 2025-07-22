import { OsType } from '~/utils/utils';

export const getObjectForm = <T = any>(form: any) => {
    return Object.fromEntries(new FormData(form.target ?? form).entries()) as T;
}

export const copyText = async (value: string | undefined) => {
    if (!value) {
        return
    }
    await navigator?.clipboard?.writeText(value);
}

export const getIconForOsType = (osType: OsType | null | undefined) => {
    switch (osType) {
        case 'android':
            return 'pi pi-android';
        case 'ios':
            return 'pi pi-apple';
        case 'desktop':
            return 'pi pi-desktop';
        case 'windows':
            return 'pi pi-microsoft';
        case 'macos':
            return 'pi pi-apple';
        case 'linux':
            return 'pi pi-desktop';
        case 'embedded':
            return 'pi pi-microchip';
        case 'other':
            return 'pi pi-box';
        default:
            return '';
    }
}