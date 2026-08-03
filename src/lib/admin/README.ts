/**
 * 动态版控制台服务端模块(M5 实装)
 *
 * 设计约束:
 * - 只允许在 server 模式构建/运行,静态构建不得引用本目录
 * - 密码 bcrypt 哈希、会话 HttpOnly cookie + SESSION_SECRET 签名
 * - SQLite 单文件(data/enlab.db),便于单机部署与备份
 */
export const ADMIN_ROUTES = ['/', '/login', '/themes', '/site'] as const
