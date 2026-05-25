// src/common/i18nContext.ts
import { type InjectionKey, type Ref, inject, provide, ref, computed } from 'vue'
import { AICallErrorCode } from 'aliyun-auikit-aicall'
import { defineComponent } from 'vue'

import en from './locales/en'
import zh from './locales/zh'

// ==================== 类型定义 ====================

export type Lang = 'en' | 'zh'

export interface I18nContextType {
  t: (key: string, params?: Record<string, string>) => string
  e: (code?: number) => string
  lang: Ref<Lang>
  setLang: (lang: Lang) => void
}

// ==================== 语言包 ====================

const locales = { en, zh }

function getSystemLanguage(): Lang {
  const lang = (typeof navigator !== 'undefined' && navigator.language) || ''
  return lang.toLowerCase().startsWith('en') ? 'en' : 'zh'
}

// ==================== 状态管理 ====================

const currentLang = ref<Lang>(getSystemLanguage())

const messages = computed(() => locales[currentLang.value])

// ==================== 工具函数 ====================

const getNestedValue = (obj: unknown, path: string): string => {
  if (!obj || typeof obj !== 'object') return path
  const keys = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path
    }
  }
  return typeof result === 'string' ? result : path
}

// ==================== 核心函数 ====================

const t = (key: string, params?: Record<string, string>): string => {
  let value = getNestedValue(messages.value, key)
  if (value === key) {
    console.warn(`Translation key "${key}" not found`)
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`{${k}}`, 'g'), v)
    })
  }
  return value
}

const e = (code?: number): string => {
  if (code === undefined) return t('error.unknown')
  const map: Record<number, string> = {
    [AICallErrorCode.ConnectionFailed]: 'error.connectionFailed',
    [AICallErrorCode.KickedByUserReplace]: 'error.kickedByUserReplace',
    [AICallErrorCode.KickedBySystem]: 'error.kickedBySystem',
    [AICallErrorCode.LocalDeviceException]: 'error.localDeviceException',
    [AICallErrorCode.AgentLeaveChannel]: 'error.agentLeaveChannel',
    [AICallErrorCode.AgentPullFailed]: 'error.agentPullFailed',
    [AICallErrorCode.AgentASRFailed]: 'error.agentASRFailed',
    [AICallErrorCode.AvatarServiceFailed]: 'error.avatarServiceFailed',
    [AICallErrorCode.AvatarRoutesExhausted]: 'error.avatarRoutesExhausted',
    [AICallErrorCode.TokenExpired]: 'error.tokenExpired',
    [AICallErrorCode.AgentSubscriptionRequired]: 'error.subscriptionRequired',
    [AICallErrorCode.AgentNotFound]: 'error.agentNotFound'
  }
  return t(map[code] || 'error.unknown')
}

const setLang = (lang: Lang) => {
  if (['en', 'zh'].includes(lang)) {
    currentLang.value = lang
    localStorage.setItem('app-lang', lang)
  }
}

// ==================== Context ====================

const I18nContextKey: InjectionKey<I18nContextType> = Symbol('I18nContext')

// ✅ 修复：使用 defineComponent
export const I18nProvider = defineComponent({
  name: 'I18nProvider',
  setup(_, { slots }) {
    // 恢复保存的语言
    const saved = localStorage.getItem('app-lang') as Lang
    if (saved) setLang(saved)

    const context: I18nContextType = { t, e, lang: currentLang, setLang }
    provide(I18nContextKey, context)
    
    return () => slots.default?.()
  }
})

// Hook
export const useTranslation = (): I18nContextType => {
  const ctx = inject(I18nContextKey)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}

// 便捷方法
export const getText = t