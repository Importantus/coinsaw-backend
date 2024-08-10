import { Entity, Column, OneToMany, PrimaryColumn } from "typeorm"
import { Entry } from "./Entry"
import { Session } from "./Session"
import { Share } from "./Share"
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { v4 as uuidv4 } from 'uuid';
import { ShareTokenJWT } from "../types";
import * as argon2 from "argon2";

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

    @OneToMany(() => Share, shareToken => shareToken.group)
    shareTokens: Share[]

    /**
     * This function creates a new group and a recovery token for it.
     * @param id The id of the group. This is a UUID created by the client.
     * @returns A tuple containing the group and the recovery token.
     */
    static async factory(id: string): Promise<[Group, string]> {
        const group = new Group();

        group.id = id

        const recoveryTokenContent: ShareTokenJWT = {
            groupId: id,
            server: environment.externalUrl,
            tokenId: uuidv4()
        }

        const token = jwt.sign(recoveryTokenContent, environment.jwtSecret);

        group.recoveryToken = await argon2.hash(token, {
            memoryCost: 2 ** 16,
            timeCost: 3,
            hashLength: 128,
        });

        return [group, token];
    }
}