let impl = null;

export function configureProjectStore(nextImpl) {
  impl = nextImpl;
}

function must() {
  if (!impl) throw new Error('Project store not configured');
  return impl;
}

export const projectStore = {
  async createProject(args) {
    return must().createProject(args);
  },
  async listProjects(args) {
    return must().listProjects(args);
  },
  async getProject(args) {
    return must().getProject(args);
  },
  async saveProject(args) {
    return must().saveProject(args);
  },
  async saveVersionSlot(args) {
    return must().saveVersionSlot(args);
  },
  async restoreVersionSlot(args) {
    return must().restoreVersionSlot(args);
  },
};

