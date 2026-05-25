<template>
  <div style="padding: 50px">
    <h2>AI学习总结测试</h2>

    <button @click="generateSummary" :disabled="loading">
      {{ loading ? '生成中...' : '1. 请求生成总结' }}
    </button>

    <button @click="pollSummary" :disabled="polling" style="margin-left: 20px">
      {{ polling ? '轮询中...' : '2. 轮询获取结果' }}
    </button>

    <div
      v-if="result"
      style="margin-top: 30px; background: #f5f5f5; padding: 20px; border-radius: 8px"
    >
      <h3>结果：</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div v-if="code === 202" style="margin-top: 30px; color: #e6a23c">
      ⚠️ 无昨日学习数据，请先刷题后再测试
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getUserId } from '@/utils/storage'

const loading = ref(false)
const polling = ref(false)
const result = ref(null)
const code = ref(null)

const generateSummary = async () => {
  const userId = getUserId()
  loading.value = true
  result.value = null

  try {
    const res = await fetch('http://localhost:3000/api/summary/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId) }),
    })
    const data = await res.json()
    code.value = data.code

    if (data.code === 102) {
      console.log('生成中，开始轮询...')
      startPolling()
    } else if (data.code === 202) {
      console.log('无昨日数据')
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

let pollTimer = null

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  polling.value = true

  pollTimer = setInterval(async () => {
    const userId = getUserId()
    try {
      const res = await fetch(`http://localhost:3000/api/summary/today/${userId}`)
      const data = await res.json()

      if (data.code === 200) {
        result.value = data
        console.log('总结完成！', data)
        clearInterval(pollTimer)
        polling.value = false
      } else if (data.code === 102) {
        console.log('仍在生成中...')
      }
    } catch (err) {
      console.error(err)
    }
  }, 3000)
}

const pollSummary = async () => {
  const userId = getUserId()
  polling.value = true

  try {
    const res = await fetch(`http://localhost:3000/api/summary/today/${userId}`)
    const data = await res.json()

    if (data.code === 200) {
      result.value = data
    }
  } catch (err) {
    console.error(err)
  } finally {
    polling.value = false
  }
}
</script>
