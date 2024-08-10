export interface ShareTokenJWT {
    groupId: string,
    server: string,
    tokenId: string
}

export interface SessionTokenJWT {
    tokenId: string,
    groupId: string,
}