import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Group } from "./Group";
import { ShareToken } from "./ShareToken";
import { v4 as uuidv4 } from 'uuid';
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";

@Entity()
export class Session {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    token: string

    @Column()
    admin: boolean

    @Column({ type: 'timestamp' })
    creation_timestamp: Date

    @Column({ type: 'timestamp' })
    last_active_timestamp: Date

    @ManyToOne(() => Group, group => group.sessions)
    group: Group

    @ManyToOne(() => ShareToken, shareToken => shareToken.sessions)
    shareToken: ShareToken

    constructor(shareToken: ShareToken) {
        this.admin = shareToken.admin;
        this.creation_timestamp = new Date();
        this.group = shareToken.group;
        this.shareToken = shareToken;
        this.id = uuidv4();

        const sessionTokenContent: SessionTokenJWT = {
            tokenId: this.id,
            groupId: this.group.id,
        }

        this.token = jwt.sign(sessionTokenContent, environment.jwtSecret)
    }
}