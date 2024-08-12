import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Group } from "./Group";
import { Session } from "./Session";
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Share {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    name: string

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

    static factory(group: Group, admin: boolean, maxSessions: number, name: string): Share {
        const shareToken = new Share();

        shareToken.name = name;
        shareToken.id = uuidv4();
        shareToken.admin = admin;
        shareToken.maxSessions = maxSessions;
        shareToken.group = group;
        shareToken.active = true;

        return shareToken;
    }
}