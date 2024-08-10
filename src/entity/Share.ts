import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Group } from "./Group";
import { Session } from "./Session";
import { v4 as uuidv4 } from 'uuid';
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { ShareTokenJWT } from "../types";

@Entity()
export class Share {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    admin: boolean

    @Column()
    active: boolean

    @Column()
    maxSessions: number

    @ManyToOne(() => Group, group => group.shareTokens, {
        onDelete: "CASCADE"
    })
    group: Group

    @OneToMany(() => Session, session => session.share)
    sessions: Session[]

    /**
     * This function creates a new share and a token for it.
     * @param group 
     * @param admin 
     * @param maxSessions 
     * @returns A tuple containing the share and the token.
     */
    static factory(group: Group, admin: boolean, maxSessions: number): [Share, string] {
        const shareToken = new Share();

        shareToken.id = uuidv4();
        shareToken.admin = admin;
        shareToken.maxSessions = maxSessions;
        shareToken.group = group;
        shareToken.active = true;

        const shareTokenContent: ShareTokenJWT = {
            groupId: group.id,
            server: environment.externalUrl,
            tokenId: shareToken.id
        }

        const token = jwt.sign(shareTokenContent, environment.jwtSecret);

        return [shareToken, token];
    }
}