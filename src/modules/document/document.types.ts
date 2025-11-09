export type DocumentType = 'invoice' | 'power_of_attorney'
export type DocumentIncomeType = 'standard' | 'additional'

export interface IDocument {
    id: number,
    type: DocumentType,
    number: string,
    date: string,
    description: string,
    invoiceType?: DocumentIncomeType,
    attorneyName?: string,
    employeeId: number
}