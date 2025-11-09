import { defineStore } from 'pinia'
import api from '@/services/api'
import type { IEmployee } from './employee.types'

export const useEmployeeStore = defineStore('employees', {
    state: () => ({
        employees: [] as IEmployee[],
        currentEmployee: null as IEmployee | null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        },
        loading: false as boolean,
        error: null as string | null
    }),

    getters: {
        getEmployeeById: (state) => (id: string) => {
            return state.employees.find(emp => emp.id === parseInt(id))
        },

        totalPages: (state) => {
            return Math.ceil(state.pagination.total / state.pagination.limit)
        },

        activeEmployees: (state) => {
            return state.employees.filter(emp => emp.isActive)
        }
    },

    actions: {
        async fetchEmployees(page = 1, limit = 10) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get('/employees', {
                    params: {
                        _page: page,
                        _limit: limit
                    }
                })

                this.employees = response.data
                this.pagination = {
                    page,
                    limit,
                    total: parseInt(response.headers['x-total-count'] || response.data.length)
                }
            } catch (error) {
                this.error = 'Ошибка при загрузке сотрудников'
                console.error('Error fetching employees:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchEmployeeById(id: number) {
            this.loading = true
            this.error = null

            try {
                const response = await api.get(`/employees/${id}`)
                this.currentEmployee = response.data
                return response.data
            } catch (error) {
                this.error = 'Ошибка при загрузке сотрудника'
                console.error('Error fetching employee:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async createEmployee(employeeData: IEmployee) {
            this.loading = true
            this.error = null

            try {
                const response = await api.post('/employees', employeeData)
                this.employees.push(response.data)
                return response.data
            } catch (error) {
                this.error = 'Ошибка при создании сотрудника'
                console.error('Error creating employee:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateEmployee(id: string, employeeData: IEmployee) {
            this.loading = true
            this.error = null

            try {
                const response = await api.put(`/employees/${id}`, employeeData)
                const index = this.employees.findIndex(emp => emp.id === parseInt(id))
                if (index !== -1) {
                    this.employees[index] = response.data
                }
                if (this.currentEmployee?.id === parseInt(id)) {
                    this.currentEmployee = response.data
                }
                return response.data
            } catch (error) {
                this.error = 'Ошибка при обновлении сотрудника'
                console.error('Error updating employee:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteEmployee(id: string) {
            this.loading = true
            this.error = null

            try {
                await api.delete(`/employees/${id}`)
                this.employees = this.employees.filter(emp => emp.id !== parseInt(id))
                if (this.currentEmployee?.id === parseInt(id)) {
                    this.currentEmployee = null
                }
            } catch (error) {
                this.error = 'Ошибка при удалении сотрудника'
                console.error('Error deleting employee:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        clearError() {
            this.error = null
        }
    }
})