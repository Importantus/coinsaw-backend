import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm"
import { Group } from "./Group"

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

    constructor(id: string, creationTimestamp: Date, payload: string) {
        this.id = id
        this.creationTimestamp = creationTimestamp
        this.syncTimestamp = new Date()
        this.payload = payload
    }
}