import{useAuth}from'../../hooks/useAuth';export default function Profile(){const{user}=useAuth();return <pre>{JSON.stringify(user,null,2)}</pre>}
