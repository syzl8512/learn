import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book } from '@/types/book'

export const useBookStore = defineStore('book', () => {
  // 状态
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const isLoading = ref(false)

  // 操作
  const setBooks = (bookList: Book[]) => {
    books.value = bookList
  }

  const setCurrentBook = (book: Book | null) => {
    currentBook.value = book
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const addBook = (book: Book) => {
    books.value.unshift(book)
  }

  const updateBook = (id: number, bookData: Partial<Book>) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...bookData }
    }
    if (currentBook.value && currentBook.value.id === id) {
      currentBook.value = { ...currentBook.value, ...bookData }
    }
  }

  const removeBook = (id: number) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value.splice(index, 1)
    }
    if (currentBook.value && currentBook.value.id === id) {
      currentBook.value = null
    }
  }

  return {
    // 状态
    books,
    currentBook,
    isLoading,

    // 操作
    setBooks,
    setCurrentBook,
    setLoading,
    addBook,
    updateBook,
    removeBook
  }
})