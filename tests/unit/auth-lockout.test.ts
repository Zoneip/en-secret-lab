/** 登录限流回归测试:锁定必须真实触发(防止清理逻辑误删进行中计数) */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  loginBlocked,
  recordLoginFailure,
  clearLoginFailures,
} from '../../src/lib/admin/auth'

describe('登录限流', () => {
  beforeEach(() => {
    clearLoginFailures('10.0.0.1')
    clearLoginFailures('10.0.0.2')
  })

  it('4 次失败未达阈值不锁定', () => {
    for (let i = 0; i < 4; i++) recordLoginFailure('10.0.0.1')
    expect(loginBlocked('10.0.0.1')).toBe(false)
  })

  it('第 5 次失败触发锁定', () => {
    for (let i = 0; i < 5; i++) recordLoginFailure('10.0.0.1')
    expect(loginBlocked('10.0.0.1')).toBe(true)
  })

  it('持续失败仍保持锁定,且不影响其他 IP', () => {
    for (let i = 0; i < 10; i++) recordLoginFailure('10.0.0.1')
    recordLoginFailure('10.0.0.2')
    expect(loginBlocked('10.0.0.1')).toBe(true)
    expect(loginBlocked('10.0.0.2')).toBe(false)
  })

  it('登录成功后清零计数', () => {
    for (let i = 0; i < 4; i++) recordLoginFailure('10.0.0.1')
    clearLoginFailures('10.0.0.1')
    recordLoginFailure('10.0.0.1')
    expect(loginBlocked('10.0.0.1')).toBe(false)
  })
})
