import { Project } from '../models/Project.js';

export function createMongoProjectStore() {
  return {
    async createProject({ anonUserId, title, blocks }) {
      const project = await Project.create({ anonUserId, title, blocks });
      return project.toObject();
    },
    async listProjects({ anonUserId }) {
      const projects = await Project.find({ anonUserId })
        .sort({ updatedAt: -1 })
        .limit(50)
        .select({ title: 1, blocks: 1, versions: 1 })
        .lean();
      return projects;
    },
    async getProject({ anonUserId, projectId }) {
      return Project.findOne({ _id: projectId, anonUserId }).lean();
    },
    async saveProject({ anonUserId, projectId, title, blocks }) {
      return Project.findOneAndUpdate(
        { _id: projectId, anonUserId },
        { ...(title ? { title } : {}), blocks: blocks ?? undefined },
        { new: true },
      ).lean();
    },
    async saveVersionSlot({ anonUserId, projectId, slotNumber, label, blocks }) {
      const project = await Project.findOne({ _id: projectId, anonUserId });
      if (!project) return null;

      const snapshot = {
        slotNumber,
        label: label ?? '',
        blocksSnapshot: blocks ?? project.blocks,
        createdAt: new Date(),
      };

      const nextVersions = Array.isArray(project.versions) ? [...project.versions] : [];
      const idx = nextVersions.findIndex((v) => v.slotNumber === slotNumber);
      if (idx >= 0) nextVersions[idx] = snapshot;
      else nextVersions.push(snapshot);

      project.versions = nextVersions;
      await project.save();
      return snapshot;
    },
    async restoreVersionSlot({ anonUserId, projectId, slotNumber }) {
      const project = await Project.findOne({ _id: projectId, anonUserId });
      if (!project) return null;
      const version = (project.versions ?? []).find((v) => v.slotNumber === slotNumber);
      if (!version) return null;
      project.blocks = version.blocksSnapshot ?? [];
      await project.save();
      return project.toObject();
    },
  };
}

