import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Group } from "./Group";
import { Session } from "./Session";
import { v4 as uuidv4 } from 'uuid';
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";

@Entity()
export class ShareToken {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    token: string

    @Column()
    admin: boolean

    @Column()
    active: boolean

    @Column()
    maxSessions: number

    @ManyToOne(() => Group, group => group.shareTokens)
    group: Group

    @OneToMany(() => Session, session => session.shareToken)
    sessions: Session[]

    constructor(group: Group, admin: boolean, maxSessions: number) {
        this.id = uuidv4();
        this.admin = admin;
        this.maxSessions = maxSessions;
        this.group = group;

        const shareTokenContent: ShareTokenJWT = {
            groupId: group.id,
            server: environment.externalUrl,
            tokenId: uuidv4()
        }

        this.token = jwt.sign(shareTokenContent, environment.jwtSecret);
    }
}