export const gradeToLabel=(grade:number)=>['Again','Hard','Good','Easy'][Math.max(0,Math.min(3,grade))];
