import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const openapi = readFileSync(resolve(root, 'openapi/openapi.yaml'), 'utf8');
const operationIds = [...openapi.matchAll(/^\s+operationId:\s*([^\s#]+)/gm)].map((match) => match[1]);

const uiCoverage = {
  getHealth: '/system',
  getClientPolicy: '/system',
  registerAccount: '/register',
  login: '/login',
  refreshSession: 'AuthProvider / Axios interceptor',
  logout: 'Header',
  getCurrentUser: 'AuthProvider + /profile',
  updateCurrentUser: '/profile',
  getLearnerStats: '/dashboard',
  listTopicTrees: '/trees',
  createTopicTree: '/trees',
  getTopicTree: '/trees/:treeId',
  updateTopicTree: '/trees',
  deleteTopicTree: '/trees',
  getTopicTreeWorkspace: '/trees/:treeId',
  listTopicNodes: '/trees/:treeId?tab=structure',
  createTopicNode: '/trees/:treeId?tab=structure',
  searchTopicTree: '/trees/:treeId?tab=structure',
  getTopicNode: '/trees/:treeId?tab=structure',
  updateTopicNode: '/trees/:treeId?tab=structure',
  deleteTopicNode: '/trees/:treeId?tab=structure',
  listTopicNodeChildren: '/trees/:treeId?tab=structure',
  previewTopicNodeMove: '/trees/:treeId?tab=structure',
  moveTopicNode: '/trees/:treeId?tab=structure',
  listNodeVocabularies: '/trees/:treeId?tab=vocabulary',
  createVocabulary: '/trees/:treeId?tab=vocabulary',
  getVocabulary: '/vocabulary',
  updateVocabulary: '/trees/:treeId?tab=vocabulary',
  deleteVocabulary: '/trees/:treeId?tab=vocabulary',
  searchAccessibleVocabulary: '/vocabulary',
  previewPublication: '/trees/:treeId?tab=publishing',
  publishTopicTreeScope: '/trees/:treeId?tab=publishing',
  listTreePublications: '/trees/:treeId?tab=publishing',
  unpublishPublication: '/trees/:treeId?tab=publishing',
  listPublicLibrary: '/library',
  getPublicLibraryItem: '/library',
  listPublicPublicationNodes: '/library',
  clonePublicItem: '/library',
  listTreeCollaborators: '/trees/:treeId?tab=collaboration',
  inviteTreeCollaborator: '/trees/:treeId?tab=collaboration',
  updateCollaboratorRole: '/trees/:treeId?tab=collaboration',
  revokeCollaborator: '/trees/:treeId?tab=collaboration',
  acceptTreeInvitation: '/invitations/:token/accept',
  parseBooleanQuery: '/queries',
  previewBooleanQuery: '/queries',
  listSavedQueries: '/queries',
  createSavedQuery: '/queries',
  getSavedQuery: '/queries',
  updateSavedQuery: '/queries',
  deleteSavedQuery: '/queries',
  getVocabularyImportPolicy: '/trees/:treeId?tab=import',
  uploadVocabularyImport: '/trees/:treeId?tab=import',
  getImportJob: '/trees/:treeId?tab=import',
  listImportPreviewRows: '/trees/:treeId?tab=import',
  commitVocabularyImport: '/trees/:treeId?tab=import',
  createStudySession: '/study',
  getStudySession: '/study',
  submitStudyAnswer: '/study',
  completeStudySession: '/study',
  createPronunciationAttempt: '/study',
  getPronunciationAttempt: '/study',
  getOperation: '/operations',
  getAdminDashboard: '/admin',
  listAdminTopicTrees: '/admin',
  createAdminTopicTree: '/admin',
  getAdminContentHealth: '/admin',
  listAuditLogs: '/admin'
};

const missing = operationIds.filter((id) => !uiCoverage[id]);
const unknown = Object.keys(uiCoverage).filter((id) => !operationIds.includes(id));
const duplicateIds = operationIds.filter((id, index) => operationIds.indexOf(id) !== index);

if (missing.length || unknown.length || duplicateIds.length) {
  console.error('[LexiGo] UI/API coverage FAILED');
  if (missing.length) console.error('Missing UI mapping:', missing.join(', '));
  if (unknown.length) console.error('Unknown operation IDs:', unknown.join(', '));
  if (duplicateIds.length) console.error('Duplicate operation IDs:', [...new Set(duplicateIds)].join(', '));
  process.exit(1);
}

console.log(`[LexiGo] UI/API coverage PASS: ${operationIds.length}/${operationIds.length} OpenAPI operations mapped.`);
