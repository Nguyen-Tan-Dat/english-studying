export const normalizeText = (value: string) => value.trim().toLocaleLowerCase('en').normalize('NFKD');
export const slugify = (value: string) => normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
