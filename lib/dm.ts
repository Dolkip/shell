import { findExistingDM, openDM, searchUsers } from "../discord/dms"

export { searchUsers }

let _onDmCreated: ((channelId: string) => void) | null = null

export function setOnDmCreated(handler: (channelId: string) => void) {
  _onDmCreated = handler
}

export async function openDmForUser(userId: string): Promise<string | null> {
  const existing = findExistingDM(userId)
  if (existing?.id) {
    _onDmCreated?.(existing.id)
    return existing.id
  }
  try {
    const dm = await openDM(userId)
    _onDmCreated?.(dm.id)
    return dm.id
  } catch {
    return null
  }
}
