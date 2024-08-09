import { Group } from "../entity/Group";
import { AppDataSource } from "../data-source";

export async function createGroup(id: string): Promise<Group> {
    const groupRepository = AppDataSource.getRepository(Group);

    const group = new Group(id);

    await groupRepository.save(group);

    return group;
}

export async function deleteGroup(id: string): Promise<void> {
    const groupRepository = AppDataSource.getRepository(Group);

    await groupRepository.delete(id);
}