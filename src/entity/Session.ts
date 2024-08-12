import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Group } from "./Group";
import { Share } from "./Share";
import { v4 as uuidv4 } from 'uuid';
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { SessionTokenJWT } from "../types";


@Entity()
export class Session {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    admin: boolean

    @Column()
    name: string

    @Column({ type: 'timestamp' })
    creation_timestamp: Date

    @Column({ type: 'timestamp' })
    last_active_timestamp: Date

    @ManyToOne(() => Group, group => group.sessions, {
        onDelete: "CASCADE"
    })
    group: Group

    @ManyToOne(() => Share, share => share.sessions)
    share: Share

    /**
     * This function creates a new session and a token for it.
     * @param shareToken The share token that is used to create the session.
     * @returns A tuple containing the session and the token.
     */
    private static factoryFromShare(shareToken: Share, name: string): [Session, string] {
        const session = new Session();

        session.name = name;
        session.admin = shareToken.admin;
        session.creation_timestamp = new Date();
        session.last_active_timestamp = new Date();
        session.group = shareToken.group;
        session.share = shareToken;
        session.id = uuidv4();

        return [session, session.generateToken()];
    }

    private static factoryFromRecovery(group: Group, name: string): [Session, string] {
        const session = new Session();

        session.name = name;
        session.admin = true;
        session.creation_timestamp = new Date();
        session.last_active_timestamp = new Date();
        session.group = group;
        session.id = uuidv4();

        return [session, session.generateToken()];
    }

    static factory(shareOrGroup: Share | Group, name: string): [Session, string] {
        if (shareOrGroup instanceof Share) {
            return Session.factoryFromShare(shareOrGroup, name);
        } else {
            return Session.factoryFromRecovery(shareOrGroup, name);
        }
    }

    private generateToken(): string {
        const sessionTokenContent: SessionTokenJWT = {
            tokenId: this.id,
            groupId: this.group.id,
        }

        return jwt.sign(sessionTokenContent, environment.jwtSecret)
    }
}