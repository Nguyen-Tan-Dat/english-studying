export const formatDate=(value:string)=>new Intl.DateTimeFormat('vi-VN',{dateStyle:'medium'}).format(new Date(value));
