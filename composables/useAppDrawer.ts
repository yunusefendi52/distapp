export const useAppDrawer = () => {
    const drawer = useState<boolean>()
    return {
        isOpen: drawer,
    }
}
