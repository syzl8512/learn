import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有store
export { useUserStore } from './user'
export { useBookStore } from './book'
export { useVocabularyStore } from './vocabulary'
export { useListeningStore } from './listening'
export { useAppStore } from './app'