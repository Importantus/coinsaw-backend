import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm"
import { Group } from "./Group"
import { AppDataSource } from "../data-source"
import APIError from "../utils/apiError"

@Entity()
export class Entry {
    @PrimaryColumn("uuid")
    id: string

    @Column({ type: 'timestamp' })
    syncTimestamp: Date

    @Column({ type: 'timestamp' })
    creationTimestamp: Date

    @Column()
    payload: string

    @ManyToOne(() => Group, group => group.entries)
    group: Group

    static async factory(id: string, creationTimestamp: Date, groupId: string, payload: string) {
        const entry = new Entry();
        entry.id = id
        entry.creationTimestamp = creationTimestamp
        entry.syncTimestamp = new Date()
        entry.payload = payload

        // Get the group from the database
        const groupRepository = AppDataSource.getRepository(Group);
        const group = await groupRepository.findOne({
            where: {
                id: groupId
            }
        });

        // If the group doesn't exist, throw an error
        if (!group) {
            throw APIError.badRequest("Group not found");
        }

        entry.group = group

        return entry;
    }
}