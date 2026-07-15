import type { Generated, ColumnType } from 'kysely';
export type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;
export interface UsersTable { id: string; email: string; display_name: string; password_hash: string; roles: string[]; avatar_url: string | null; created_at: Generated<Timestamp>; updated_at: Generated<Timestamp>; }
export interface TopicTreesTable { id: string; display_name: string; description: string | null; kind: 'DEFAULT'|'USER'; owner_id: string; draft_revision: number; published_revision: number | null; published_at: Timestamp | null; version: number; created_at: Generated<Timestamp>; updated_at: Generated<Timestamp>; deleted_at: Timestamp | null; }
export interface TopicNodesTable { id: string; tree_id: string; parent_id: string | null; display_name: string; description: string | null; node_type: 'GROUP'|'VOCABULARY'; position: number; version: number; created_at: Generated<Timestamp>; updated_at: Generated<Timestamp>; deleted_at: Timestamp | null; }
export interface Database { users: UsersTable; topic_trees: TopicTreesTable; topic_nodes: TopicNodesTable; }
