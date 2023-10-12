export * from './event'
export * from './filter'
export * from './keys'
export * as nip04 from './nip04'
export * as nip05 from './nip05'
export * as nip06 from './nip06'
export * as nip19 from './nip19'
export * as nip26 from './nip26'
export * from './path'
export * from './relay'

// monkey patch secp256k1
import {hmac} from '@noble/hashes/hmac'
import {sha256} from '@noble/hashes/sha256'
import * as secp256k1 from '@noble/secp256k1'
secp256k1.utils.hmacSha256Sync = (key, ...msgs) =>
  hmac(sha256, key, secp256k1.utils.concatBytes(...msgs))
secp256k1.utils.sha256Sync = (...msgs) =>
  sha256(secp256k1.utils.concatBytes(...msgs))
