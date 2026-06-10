import { statusText } from "../components/status"

export function setStatus(message: string) {
    statusText.content = message
}
