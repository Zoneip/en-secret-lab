/**
 * 资源下载计数与直链
 * GET /api/resource/[id]/download — 计数 + 302 跳转(动态版优先走 /uploads/,外部链接直接跳)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import {
  getResource,
  incrementDownloads,
} from '../../../../lib/admin/resources-store'

export const prerender = !isServer

/** 静态构建占位:不生成任何路径 */
export function getStaticPaths() {
  return []
}

export const GET: APIRoute = ({ params, redirect }) => {
  if (!isServer) return new Response('Not Found', { status: 404 })
  const id = params.id ?? ''
  const resource = getResource(id)
  if (!resource) return new Response('Not Found', { status: 404 })
  if (resource.externalUrl) {
    incrementDownloads(id)
    return redirect(resource.externalUrl, 302)
  }
  if (resource.file) {
    incrementDownloads(id)
    return redirect(resource.file, 302)
  }
  return new Response('资源没有可用的下载链接', { status: 404 })
}
