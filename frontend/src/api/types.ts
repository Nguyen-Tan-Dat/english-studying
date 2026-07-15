export type Role = 'LEARNER' | 'ADMIN';
export type AccessRole = 'ADMIN' | 'OWNER' | 'EDITOR' | 'VIEWER';
export type NodeType = 'GROUP' | 'VOCABULARY';
export type RevisionState = 'PRIVATE' | 'PUBLISHED' | 'DRAFT';
export type StudyMode =
  | 'FLASHCARD'
  | 'PRONUNCIATION'
  | 'VI_TO_EN'
  | 'EN_TO_VI'
  | 'LISTEN_EN_WRITE_EN'
  | 'LISTEN_EN_WRITE_VI'
  | 'MULTIPLE_CHOICE';

export type PageMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type CursorMeta = {
  limit: number;
  next_cursor: string | null;
  has_more: boolean;
};

export type Page<T> = { items: T[]; meta: PageMeta };
export type CursorPage<T> = { items: T[]; meta: CursorMeta };

export type PublicUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type User = PublicUser & {
  email: string;
  roles: Role[];
  email_verified: boolean;
  created_at: string;
};

export type LearnerStats = {
  learned: number;
  mastered: number;
  streak_days: number;
  xp: number;
  accuracy: number;
  daily_goal: number;
  today_completed: number;
  continue_session_id: string | null;
};

export type Capabilities = {
  can_view: boolean;
  can_edit: boolean;
  can_add_child: boolean;
  can_manage_vocabulary: boolean;
  can_move: boolean;
  can_delete: boolean;
  can_publish: boolean;
  can_unpublish: boolean;
  can_clone: boolean;
  can_manage_collaborators: boolean;
  disabled_reasons: Record<string, string>;
};

export type Revision = {
  draft_revision: number;
  published_revision: number | null;
  state: RevisionState;
  published_at: string | null;
};

export type TopicTree = {
  id: string;
  display_name: string;
  description: string | null;
  kind: 'DEFAULT' | 'USER';
  owner: PublicUser;
  root_node_count: number;
  node_count: number;
  vocabulary_count: number;
  max_depth: number;
  revision: Revision;
  access_role: AccessRole;
  version: number;
  capabilities: Capabilities;
  created_at: string;
  updated_at: string;
};

export type TopicNode = {
  id: string;
  tree_id: string;
  parent_id: string | null;
  display_name: string;
  description: string | null;
  node_type: NodeType;
  position: number;
  depth: number;
  has_children: boolean;
  child_count: number;
  vocabulary_count: number;
  ancestor_path: Array<{ id: string; display_name: string }>;
  path_text: string;
  revision: Revision;
  is_system: boolean;
  version: number;
  capabilities: Capabilities;
  updated_at: string;
};

export type TreeWorkspace = {
  tree: TopicTree;
  root_nodes: TopicNode[];
  facets: {
    scope: Record<string, number>;
    status: Record<string, number>;
    node_type: Record<NodeType, number>;
  };
  server_time: string;
};

export type TreeSearchResult = {
  matches: TopicNode[];
  ancestors: TopicNode[];
  suggested_expanded_ids: string[];
  total_matches: number;
};

export type MovePreview = {
  valid: boolean;
  before_path: Array<{ id: string; display_name: string }>;
  after_path: Array<{ id: string; display_name: string }>;
  affected_node_count: number;
  blocking_issues: Array<string | { code?: string; message: string }>;
  warnings: Array<string | { code?: string; message: string }>;
};

export type Vocabulary = {
  id: string;
  topic_node_id: string;
  concept_id: string;
  concept_key: string;
  english: string;
  vietnamese: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  example: string | null;
  image_url: string | null;
  audio_url: string | null;
  learning_status: 'NEW' | 'LEARNING' | 'MASTERED' | 'REVIEW';
  version: number;
  created_at: string;
  updated_at: string;
};

export type VocabularyWrite = {
  english: string;
  vietnamese: string;
  sense_key?: string;
  pronunciation?: string | null;
  part_of_speech?: 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' | 'PHRASE' | 'OTHER' | null;
  example?: string | null;
  image_url?: string | null;
};

export type Publication = {
  id: string;
  source_tree_id: string;
  source_root_node_id: string | null;
  scope: 'TREE' | 'BRANCH';
  display_name: string;
  description: string | null;
  slug: string;
  status: 'PUBLISHED' | 'UNPUBLISHED';
  published_revision: number;
  node_count: number;
  vocabulary_count: number;
  clone_count: number;
  published_at: string;
  unpublished_at: string | null;
};

export type PublicationPreview = {
  scope: 'TREE' | 'BRANCH';
  root_node?: TopicNode;
  root_node_id?: string | null;
  draft_revision?: number;
  node_count: number;
  vocabulary_count: number;
  max_depth?: number;
  estimated_index_seconds?: number;
  warnings: Array<string | { code?: string; message: string }>;
  blockers?: Array<{ code?: string; message: string }>;
  blocking_issues?: Array<string | { code?: string; message: string }>;
  can_publish?: boolean;
};

export type PublicLibraryItem = Publication & {
  level: string | null;
  tags: string[];
  can_clone: boolean;
  updated_at: string;
};

export type Collaborator = {
  id: string;
  tree_id: string;
  user: PublicUser | null;
  email: string;
  role: 'EDITOR' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  version?: number;
  created_at: string;
  accepted_at: string | null;
};

export type QueryAlias = {
  alias: string;
  topic_node_id: string;
  topic_display_name?: string | null;
};

export type QueryParseResponse = {
  valid: boolean;
  normalized_expression: string | null;
  ast: unknown;
  referenced_aliases: string[];
  errors: Array<{ field: string; code: string; message: string }>;
};

export type QueryPreviewResponse = {
  parse: QueryParseResponse;
  result_count: number;
  items: Vocabulary[];
  meta: PageMeta;
  source_versions: Record<string, number>;
  truncated: boolean;
};

export type SavedQuery = {
  id: string;
  display_name: string;
  mode: 'DYNAMIC' | 'SNAPSHOT';
  visibility: 'PRIVATE' | 'PUBLISHED';
  expression: string;
  normalized_expression: string;
  ast: unknown;
  universe: 'ALIASES_UNION' | 'ALL_ACCESSIBLE';
  aliases: QueryAlias[];
  result_count: number;
  version: number;
  created_at: string;
  updated_at: string;
};

export type ImportPolicy = {
  allowed_extensions: string[];
  max_file_size_bytes: number;
  max_rows: number;
  required_columns: string[];
  optional_columns: string[];
  virus_scan_required: boolean;
};

export type ImportSummary = {
  total_rows: number;
  valid_rows: number;
  warning_rows: number;
  error_rows: number;
  created_count: number;
  skipped_count: number;
};

export type ImportJob = {
  id: string;
  topic_node_id: string;
  operation_id: string | null;
  status: 'UPLOADED' | 'SCANNING' | 'VALIDATING' | 'READY' | 'COMMITTING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  summary: ImportSummary;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ImportRow = {
  row_number: number;
  status: 'VALID' | 'WARNING' | 'ERROR' | 'DUPLICATE';
  raw: Record<string, unknown>;
  normalized: Record<string, unknown> | null;
  errors: Array<{ field?: string; code?: string; message: string }>;
};

export type Operation = {
  id: string;
  type: 'TREE_CLONE' | 'IMPORT_VALIDATE' | 'IMPORT_COMMIT' | 'PRONUNCIATION_SCORE' | 'TTS_GENERATE';
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  progress_percent: number;
  result: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
};

export type StudyItem = {
  id: string;
  position: number;
  concept_id: string;
  prompt: {
    text: string;
    english: string;
    vietnamese: string;
    pronunciation: string | null;
  };
  answer_type: 'SELF_RATE' | 'CHOICE' | 'AUDIO' | 'TEXT';
  choices: Array<{ id: string; label: string }>;
  audio_url: string | null;
  max_replays: number | null;
};

export type StudySession = {
  id: string;
  mode: StudyMode;
  source: { type: 'TOPIC_NODE' | 'SAVED_QUERY' | 'WRONG_ANSWERS'; id: string };
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  total_items: number;
  current_index: number;
  correct_count: number;
  current_item: StudyItem | null;
  started_at: string;
  completed_at: string | null;
};

export type StudyAnswerResult = {
  correct: boolean;
  feedback: { expected: string; submitted: string };
  session: StudySession;
};

export type StudyCompletion = {
  session_id: string;
  correct_count: number;
  total_items: number;
  accuracy: number;
  xp_earned: number;
  streak_days: number;
  wrong_concept_ids: string[];
};

export type PronunciationAttempt = {
  id: string;
  operation_id: string;
  concept_id: string;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scores: Record<string, unknown> | null;
  feedback: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
};

export type AdminDashboard = {
  draft_trees: number;
  published_trees: number;
  content_issues: number;
  pending_imports: number;
  recent_activity: AuditLog[];
};

export type AuditLog = {
  id: number;
  actor: PublicUser | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  trace_id: string | null;
  created_at: string;
};

export type ClientPolicy = {
  tree: { max_depth: number; max_nodes_per_tree: number };
  imports: ImportPolicy;
  query: { max_preview_concepts: number; timeout_ms: number };
  rate_limits: { auth_per_minute: number; general_per_minute: number };
};
