import { INSTANCE, VERSION } from "@/constants"

export const genUserAgent = () => {
    return `SoloSocius/${VERSION} (https://${INSTANCE})`
}