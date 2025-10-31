import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Vocabulary } from '@/types/vocabulary'

export const useVocabularyStore = defineStore('vocabulary', () => {
  // 状态
  const vocabularies = ref<Vocabulary[]>([])
  const isLoading = ref(false)

  // 操作
  const setVocabularies = (vocabList: Vocabulary[]) => {
    vocabularies.value = vocabList
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const addVocabulary = (vocab: Vocabulary) => {
    vocabularies.value.unshift(vocab)
  }

  const updateVocabulary = (id: number, vocabData: Partial<Vocabulary>) => {
    const index = vocabularies.value.findIndex(vocab => vocab.id === id)
    if (index !== -1) {
      vocabularies.value[index] = { ...vocabularies.value[index], ...vocabData }
    }
  }

  const removeVocabulary = (id: number) => {
    const index = vocabularies.value.findIndex(vocab => vocab.id === id)
    if (index !== -1) {
      vocabularies.value.splice(index, 1)
    }
  }

  return {
    // 状态
    vocabularies,
    isLoading,

    // 操作
    setVocabularies,
    setLoading,
    addVocabulary,
    updateVocabulary,
    removeVocabulary
  }
})