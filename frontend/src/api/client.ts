import axios from'axios';import{tokenStore}from'./token-store';
export const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL??'/api/v1',withCredentials:true,headers:{Accept:'application/json'}});
api.interceptors.request.use((config)=>{const token=tokenStore.get();if(token)config.headers.Authorization=`Bearer ${token}`;return config});
let refreshing:Promise<string>|null=null;
api.interceptors.response.use((response)=>response,async(error)=>{const original=error.config;if(error.response?.status!==401||original?._retry||original?.url?.includes('/auth/'))throw error;original._retry=true;refreshing??=api.post('/auth/refresh').then((r)=>{tokenStore.set(r.data.access_token);return r.data.access_token}).finally(()=>{refreshing=null});const token=await refreshing;original.headers.Authorization=`Bearer ${token}`;return api(original)});
export function problemMessage(error:unknown){if(axios.isAxiosError(error))return error.response?.data?.title??error.response?.data?.message??error.message;return error instanceof Error?error.message:'Đã xảy ra lỗi'}
