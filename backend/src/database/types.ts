import type { ColumnType, Generated } from 'kysely';

type Timestamp = ColumnType<Date, Date | string, Date | string>;
type GeneratedTimestamp = ColumnType<
  Date,
  Date | string | undefined,
  Date | string
>;
type NullableTimestamp = ColumnType<Date | null, Date | string | null, Date | string | null>;
type DateOnly = ColumnType<string, string, string>;
type BigIntId = Generated<string>;

export interface UsersTable {
  id: BigIntId;
  email: string;
  user_name: string;
  password: string;
  pin: string;
  pin_wrong: Generated<number>;
  img: string | null;
  theme: Generated<number>;
  last_login_at: NullableTimestamp;
  locked_until: NullableTimestamp;
  created_at: GeneratedTimestamp;
}

export interface TokensTable {
  id: BigIntId;
  user_id: string;
  token: string;
  token_type: string;
  ip_address: string;
  user_agent: string;
  expires_at: Timestamp;
  created_at: GeneratedTimestamp;
}

export interface RolesTable {
  id: BigIntId;
  name: string;
  description: string | null;
}

export interface PermissionsTable {
  id: BigIntId;
  name: string;
  description: string | null;
}

export interface RolePermissionsTable {
  id: BigIntId;
  role_id: string;
  permission_id: string;
  created_at: GeneratedTimestamp;
}

export interface UserRolesTable {
  id: BigIntId;
  user_id: string;
  role_id: string;
  created_at: GeneratedTimestamp;
}

export interface EnglishWordsTable {
  id: BigIntId;
  word: string;
  phonetic: string | null;
  audio_url: string | null;
}

export interface VietnameseMeaningsTable {
  id: BigIntId;
  translation: string;
  description: string | null;
}

export interface UserVocabulariesTable {
  id: BigIntId;
  user_id: string;
  english_id: string;
  vietnamese_id: string;
  part_of_speech: string | null;
  image_url: string | null;
  ease_factor: Generated<number>;
  interval_days: Generated<number>;
  consecutive_correct: Generated<number>;
  next_review_date: NullableTimestamp;
  created_at: GeneratedTimestamp;
  last_practiced_at: NullableTimestamp;
}

export interface ReviewLogsTable {
  id: BigIntId;
  user_vocabulary_id: string;
  user_id: string;
  question_type: string;
  grade: number;
  created_at: GeneratedTimestamp;
}

export interface ReadingMaterialsTable {
  id: BigIntId;
  title: string;
  original_text: string;
  reading_priority: Generated<string | null>;
  user_id: string | null;
  created_at: GeneratedTimestamp;
}

export interface ReadingAnnotationsTable {
  id: BigIntId;
  material_id: string;
  user_id: string;
  selected_text: string;
  explanation: string;
  created_at: GeneratedTimestamp;
}

export interface ReadingReflectionsTable {
  id: BigIntId;
  material_id: string;
  user_id: string;
  practical_application: string | null;
  shared_notes: string | null;
  created_at: GeneratedTimestamp;
}

export interface DailyJournalsTable {
  id: BigIntId;
  user_id: string;
  entry_date: DateOnly;
  lessons_learned: string | null;
  gratitude_notes: string | null;
  behavioral_improvements: string | null;
  created_at: GeneratedTimestamp;
  updated_at: GeneratedTimestamp;
}

export interface Database {
  users: UsersTable;
  tokens: TokensTable;
  roles: RolesTable;
  permissions: PermissionsTable;
  role_permissions: RolePermissionsTable;
  user_roles: UserRolesTable;
  english_words: EnglishWordsTable;
  vietnamese_meanings: VietnameseMeaningsTable;
  user_vocabularies: UserVocabulariesTable;
  review_logs: ReviewLogsTable;
  reading_materials: ReadingMaterialsTable;
  reading_annotations: ReadingAnnotationsTable;
  reading_reflections: ReadingReflectionsTable;
  daily_journals: DailyJournalsTable;
}
