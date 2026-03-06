import type { Profile } from '../../types'
import type { ProfilesRepo } from '../types'
import { storage } from '../../data/storage'
import { KEYS } from '../../data/storage/keys'
import { ensureInitialized } from '../../data/seed/loadSeed'

function getProfiles(): Profile[] {
  ensureInitialized()
  return storage.get<Profile[]>(KEYS.profiles) ?? []
}

export const profilesRepo: ProfilesRepo = {
  async list() {
    return getProfiles()
  },

  async get(id) {
    return getProfiles().find((p) => p.id === id) ?? null
  },
}
