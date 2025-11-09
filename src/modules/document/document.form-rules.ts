export const typeRules = [(v: string) => !!v || "Тип документа обязателен"];

export const numberRules = [
    (v: string) => !!v || "Номер документа обязателен",
    (v: string) => (v && v.length >= 3) || "Минимум 3 символа",
    (v: string) => (v && v.length <= 50) || "Максимум 50 символов",
];

export const dateRules = [
    (v: string) => !!v || "Дата документа обязательна",
    (v: string) => {
        const date = new Date(v);
        const now = new Date();
        return date <= now || "Дата не может быть в будущем";
    },
];

export const employeeRules = [(v: string) => !!v || "Сотрудник обязателен"];

export const descriptionRules = [
    (v: string) => !!v || "Описание обязательно",
    (v: string) => (v && v.length >= 10) || "Минимум 10 символов",
    (v: string) => (v && v.length <= 500) || "Максимум 500 символов",
];