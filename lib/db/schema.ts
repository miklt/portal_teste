import {
  pgTable,
  jsonb,
  serial,
  varchar,
  date,
  text,
  timestamp,
  vector,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}
/// new items

// Definição da tabela 'autores'
export const autores = pgTable("autores", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  sobrenome: varchar("sobrenome", { length: 255 }).notNull(),
  dataNascimento: date("data_nascimento").notNull(),
  dataCadastro: timestamp("data_cadastro").defaultNow().notNull(),
  dataAlteracao: timestamp("data_alteracao").defaultNow().notNull(),
});

// Inferir o modelo baseado no schema
export type Autor = typeof autores.$inferSelect;
export type NewAutor = typeof autores.$inferInsert;

// const documentoTipo = pgEnum("tipo", [
//   "Livro",
//   "Periódico",
//   "Artigo(s)",
//   "Artigo Periódico",
//   "Audiovisual",
//   "Currículo",
//   "Livro Indígena",
// ]);

// Tabela de Documentos com suporte a full-text search
export const documentos = pgTable("documentos", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  assunto: text("assunto"),
  editora: varchar("editora", { length: 255 }),
  serie: varchar("serie", { length: 255 }),
  suporte: varchar("suporte", { length: 255 }),
  ano: integer("ano"),
  cdu: varchar("cdu", { length: 50 }),
  cdd: varchar("cdd", { length: 50 }),
  idioma: varchar("idioma", { length: 50 }),
  local: varchar("local", { length: 255 }),
  classificacao: varchar("classificacao", { length: 255 }),
  isbn: varchar("isbn", { length: 13 }),
  issn: varchar("issn", { length: 9 }),
  edicao: varchar("edicao", { length: 50 }),
  numeroTombo: varchar("numero_tombo", { length: 50 }).unique(),
  codigoBarras: varchar("codigo_barras", { length: 50 }).unique(),
  dgm: varchar("dgm", { length: 50 }),
  numeroChamada: varchar("numero_chamada", { length: 50 }),
  resumo: text("resumo"),
  destinoUso: varchar("destino_uso", { length: 255 }),
  genero: varchar("genero", { length: 50 }),
  nivel: varchar("nivel", { length: 50 }),

  dataCadastro: timestamp("data_cadastro").defaultNow().notNull(),
  dataAlteracao: timestamp("data_alteracao").defaultNow().notNull(),
  notas: jsonb("notas"),
  marc21: jsonb("marc21"),

  // CREATE TRIGGER update_search_vector BEFORE INSERT OR UPDATE
  // ON documentos
  // FOR EACH ROW EXECUTE FUNCTION
  // tsvector_update_trigger(search_vector, 'pg_catalog.portuguese', titulo, assunto, editora, serie, resumo);
  // CREATE INDEX idx_search_vector ON documentos USING GIN(search_vector);

  // Coluna para armazenar o tsvector gerado a partir de campos de texto
  // searchVector: vector("search_vector",),
});

// Tabela intermediária para o relacionamento muitos-para-muitos entre Documentos e Autores
export const autoresDocumentos = pgTable("autores_documentos", {
  autorId: integer("autor_id")
    .references(() => autores.id)
    .notNull(),
  documentoId: integer("documento_id")
    .references(() => documentos.id)
    .notNull(),
  autorPrincipal: integer("autor_principal").notNull(), // 1 se for autor principal, 0 caso contrário
});

export type Documento = typeof documentos.$inferSelect;
export type NewDocumento = typeof documentos.$inferInsert;
export type AutorDocumento = typeof autoresDocumentos.$inferSelect;
export type NewAutorDocumento = typeof autoresDocumentos.$inferInsert;
