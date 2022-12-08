export type GQLResponseType = {
    cursor: string | null
    node: {
      id: string
      tags: KeyValueType[]
      data: {
        size: string
        type: string
      }
    }
  }

export interface PoolType {
    id: string
    state: PoolStateType
}

export interface PoolStateType {
    title: string
    image: string
    briefDescription: string
    description: string
    link: string
    owner: string
    ownerInfo: string
    timestamp: string
    contributors: { [key: string]: string }
    tokens: { [key: string]: string }
    totalContributions: string
    totalSupply: string
    balance: string
}

export type PoolConfigType = {
    appType: string,
    contracts: {
        nft: {
            id: NStringType
            src: NStringType
        },
        pool: {
            id: NStringType
            src: NStringType
        }
    },
    state: {
        owner: {
            pubkey: string
            info: string
        },
        title: string
        description: string
        briefDescription: string
        link: string
        rewards: string
        image: NStringType
        timestamp: NStringType
    },
    walletPath: string
    bundlrNode: string
    twitter: {
        userIds: string[]
    },
    keywords: string[]
    twitterApiKeys: any,
    clarifaiApiKey: string
}

export type TagFilterType = { name: string, values: string[] }

type NStringType = string | null
export type KeyValueType = { [key: string]: string }