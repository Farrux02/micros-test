import { defineStore } from 'pinia'
import api from '@/services/api'
import type { IDocument } from './document.types'

export const useDocumentStore = defineStore('documents', {
    state: () => ({
        documents: [] as IDocument[],
        currentDocument: null as IDocument | null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        },
        filters: {
            employeeId: null,
            type: null
        } as {
            employeeId: number | null,
            type: string | null
        },
        loading: false as boolean,
        error: null as string | null
    }),

    getters: {
        getDocumentById: (state) => (id: string) => {
            return state.documents.find(doc => doc.id === parseInt(id))
        },

        totalPages: (state) => {
            return Math.ceil(state.pagination.total / state.pagination.limit)
        },

        filteredDocuments: (state) => {
            let filtered = state.documents

            if (state.filters.employeeId) {
                filtered = filtered.filter(doc => doc.employeeId === state.filters.employeeId)
            }

            if (state.filters.type) {
                filtered = filtered.filter(doc => doc.type === state.filters.type)
            }

            return filtered
        }
    },

    actions: {
        async fetchDocuments(page: number = 1, limit: number = 10, employeeId: number | null = null, type = null) {
            this.loading = true
            this.error = null

            try {
                const params: Record<string, number | string> = {
                    _page: page,
                    _limit: limit
                }

                if (employeeId) {
                    params.employeeId = employeeId
                }

                if (type) {
                    params.type = type
                }

                const response = await api.get('/documents', { params })

                this.documents = response.data
                this.pagination = {
                    page,
                    limit,
                    total: parseInt(response.headers['x-total-count'] || response.data.length)
                }

                this.filters = { employeeId, type }
            } catch (error) {
                this.error = 'Ошибка при загрузке документов'
                console.error('Error fetching documents:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchDocumentById(id: string) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get(`/documents/${id}`)
                this.currentDocument = response.data
                return response.data
            } catch (error) {
                this.error = 'Ошибка при загрузке документа'
                console.error('Error fetching document:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async createDocument(documentData: IDocument) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/documents', documentData)
                this.documents.push(response.data)
                return response.data
            } catch (error) {
                this.error = 'Ошибка при создании документа'
                console.error('Error creating document:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateDocument(id: string, documentData: IDocument) {
            this.loading = true
            this.error = null

            try {
                const response = await api.put(`/documents/${id}`, documentData)
                const index = this.documents.findIndex(doc => doc.id === parseInt(id))
                if (index !== -1) {
                    this.documents[index] = response.data
                }
                if (this.currentDocument?.id === parseInt(id)) {
                    this.currentDocument = response.data
                }
                return response.data
            } catch (error) {
                this.error = 'Ошибка при обновлении документа'
                console.error('Error updating document:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteDocument(id: string) {
            this.loading = true
            this.error = null

            try {
                await api.delete(`/documents/${id}`)
                this.documents = this.documents.filter(doc => doc.id !== parseInt(id))
                if (this.currentDocument?.id === parseInt(id)) {
                    this.currentDocument = null
                }
            } catch (error) {
                this.error = 'Ошибка при удалении документа'
                console.error('Error deleting document:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        setFilters(filters: { employeeId?: number | null, type?: string | null }) {
            this.filters = { ...this.filters, ...filters }
        },

        clearFilters() {
            this.filters = {
                employeeId: null,
                type: null
            }
        },

        clearError() {
            this.error = null
        }
    }
})