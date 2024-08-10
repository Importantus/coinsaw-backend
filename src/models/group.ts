import { Group } from "../entity/Group";
import { AppDataSource } from "../data-source";
import { logger } from "../utils/logger";
import APIError from "../utils/apiError";

export async function createGroup(id: string): Promise<Group> {
    logger.debug(`Creating group with id ${id}`);

    const groupRepository = AppDataSource.getRepository(Group);

    // Check if group already exists
    const groupExists = await groupRepository.findOne({
        where: {
            id
        }
    });

    if (groupExists) {
        throw APIError.badRequest("Group already exists");
    }

    const [group, token] = await Group.factory(id);

    await groupRepository.save(group);

    group.recoveryToken = token;

    return group;
}

export async function deleteGroup(id: string, adminGroupId: string): Promise<void> {
    logger.debug(`Deleting group with id ${id}`);

    if (id !== adminGroupId) {
        throw APIError.notFound();
    }

    const groupRepository = AppDataSource.getRepository(Group);

    await groupRepository.delete(id);
}