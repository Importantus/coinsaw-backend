interface ShareTokenJWT {
    groupId: string,
    server: string,
    tokenId: string
}

interface SessionTokenJWT {
    tokenId: string,
    groupId: string,
}