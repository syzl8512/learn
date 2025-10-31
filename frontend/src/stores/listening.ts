import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ListeningContent } from '@/types/listening'

export const useListeningStore = defineStore('listening', () => {
  // 状态
  const listeningContents = ref<ListeningContent[]>([])
  const currentContent = ref<ListeningContent | null>(null)
  const isLoading = ref(false)

  // 操作
  const setListeningContents = (contents: ListeningContent[]) => {
    listeningContents.value = contents
  }

  const setCurrentContent = (content: ListeningContent | null) => {
    currentContent.value = content
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const addContent = (content: ListeningContent) => {
    listeningContents.value.unshift(content)
  }

  const updateContent = (id: number, contentData: Partial<ListeningContent>) => {
    const index = listeningContents.value.findIndex(content => content.id === id)
    if (index !== -1) {
      listeningContents.value[index] = { ...listeningContents.value[index], ...contentData }
    }
    if (currentContent.value && currentContent.value.id === id) {
      currentContent.value = { ...currentContent.value, ...contentData }
    }
  }

  const removeContent = (id: number) => {
    const index = listeningContents.value.findIndex(content => content.id === id)
    if (index !== -1) {
      listeningContents.value.splice(index, 1)
    }
    if (currentContent.value && currentContent.value.id === id) {
      currentContent.value = null
    }
  }

  return {
    // 状态
    listeningContents,
    currentContent,
    isLoading,

    // 操作
    setListeningContents,
    setCurrentContent,
    setLoading,
    addContent,
    updateContent,
    removeContent
  }
})