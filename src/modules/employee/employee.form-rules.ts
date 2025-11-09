export const nameRules = [
    (v: string) => !!v || "Поле обязательно для заполнения",
    (v: string) => (v && v.length >= 2) || "Минимум 2 символа",
    (v: string) => (v && v.length <= 50) || "Максимум 50 символов",
];

export const passportRules = [
    (v: string) => !!v || "Поле обязательно для заполнения",
    (v: string) => /^[A-Z]{2}\d{7}$/.test(v) || "Формат: AD1234567",
];

export const dateRules = [
    (v: string) => !!v || "Поле обязательно для заполнения",
    (v: string) => {
        const date = new Date(v);
        const now = new Date();
        const minDate = new Date(now.getFullYear() - 100, 0, 1);
        const maxDate = new Date(
            now.getFullYear() - 16,
            now.getMonth(),
            now.getDate()
        );
        return (
            (date >= minDate && date <= maxDate) ||
            "Возраст должен быть от 16 до 100 лет"
        );
    },
];

export const genderRules = [
    (v: string | undefined) => v !== undefined || "Поле обязательно для заполнения",
];