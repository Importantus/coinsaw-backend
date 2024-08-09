import { Entity, Column, OneToMany, PrimaryColumn } from "typeorm"
import { Entry } from "./Entry"
import { Session } from "./Session"
import { ShareToken } from "./ShareToken"
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Group {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    recoveryToken: string

    @OneToMany(() => Entry, entry => entry.group)
    entries: Entry[]

    @OneToMany(() => Session, session => session.group)
    sessions: Session[]

    @OneToMany(() => ShareToken, shareToken => shareToken.group)
    shareTokens: ShareToken[]

    constructor(id: string) {
        this.id = id

        const recoveryTokenContent: ShareTokenJWT = {
            groupId: id,
            server: environment.externalUrl,
            tokenId: uuidv4()
        }

        this.recoveryToken = jwt.sign(recoveryTokenContent, environment.jwtSecret);
    }
}