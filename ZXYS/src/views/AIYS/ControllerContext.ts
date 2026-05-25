// src/views/Call/ControllerContext.ts

import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type AUIAICallController from '@/utils/AIYS/controller/AUIAICallController'

// 定义注入键（使用 Symbol 确保唯一性）
export const ControllerContextKey: InjectionKey<Ref<AUIAICallController | null>> =
  Symbol('ControllerContext')

// 提供控制器上下文
export function provideController(controller: Ref<any | null>) {
  console.log('🔍 provideController called with:', controller.value)
  provide(ControllerContextKey, controller)
}

// 注入控制器上下文
export function useController() {
  const controller = inject(ControllerContextKey)
  console.log('🔍 useController - inject result:', controller?.value)

  if (!controller) {
    console.error('❌ ControllerContext not provided. Available injections:', inject)
    throw new Error(
      'ControllerContext not provided. Make sure to call provideController() in parent component.',
    )
  }

  return controller
}

export default {
  ControllerContextKey,
  provideController,
  useController,
}
