import type { PayloadRequest, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'communication'

type UserLike = { id: number | string; role?: Role | null } | null | undefined

export const userOf = (req: { user?: unknown }): UserLike => (req.user ?? null) as UserLike

export const hasRole = (user: UserLike, roles: Role[]): boolean =>
  Boolean(user?.role && roles.includes(user.role))

/** Qualquer usuário autenticado do painel. */
export const isAuthenticated = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)

/** Administrador do portal. */
export const isAdmin = ({ req }: { req: PayloadRequest }): boolean => hasRole(userOf(req), ['admin'])

/** Revisores: podem publicar e excluir conteúdo. */
export const isReviewer = ({ req }: { req: PayloadRequest }): boolean => hasRole(userOf(req), ['admin', 'editor'])

/** Equipe de conteúdo: pode criar e editar rascunhos. */
export const isStaff = ({ req }: { req: PayloadRequest }): boolean =>
  hasRole(userOf(req), ['admin', 'editor', 'communication'])

export const isAdminField: FieldAccess = ({ req }) => hasRole(userOf(req), ['admin'])
export const isReviewerField: FieldAccess = ({ req }) => hasRole(userOf(req), ['admin', 'editor'])
export const isStaffField: FieldAccess = ({ req }) =>
  hasRole(userOf(req), ['admin', 'editor', 'communication'])
