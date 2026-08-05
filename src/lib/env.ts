/** 环境变量校验:启动即失败,避免带着错配置上线 */
import { z } from 'zod'

const schema = z.object({
  ASTRO_MODE: z.enum(['static', 'server']).default('static'),
  SITE_URL: z
    .url()
    .transform((u) => u.toString())
    .default('http://localhost:4321'),
  ADMIN_USERNAME: z.string().min(1).default('admin'),
  ADMIN_PASSWORD: z.string().min(8).default('change-me'),
  SESSION_SECRET: z.string().min(16).default('dev-secret-do-not-use-in-prod'),
  DATABASE_PATH: z.string().default('./data/enlab.db'),
})

export type AppEnv = z.infer<typeof schema>

export function loadEnv(env: Record<string, string | undefined>): AppEnv {
  const result = schema.safeParse({
    ASTRO_MODE: env.ASTRO_MODE,
    SITE_URL: env.SITE_URL,
    ADMIN_USERNAME: env.ADMIN_USERNAME,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    SESSION_SECRET: env.SESSION_SECRET,
    DATABASE_PATH: env.DATABASE_PATH,
  })
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`环境变量配置无效:${detail}`)
  }
  return result.data
}
