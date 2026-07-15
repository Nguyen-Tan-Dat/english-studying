import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import TopicTreeList from './pages/TopicTrees/TopicTreeList';
import TreeWorkspace from './pages/TopicTrees/TreeWorkspace';
import PublicLibrary from './pages/PublicLibrary/PublicLibrary';
import QueryBuilder from './pages/Queries/QueryBuilder';
import VocabularySearch from './pages/Vocabulary/VocabularySearch';
import Study from './pages/Study/Study';
import Operations from './pages/Operations/Operations';
import SystemStatus from './pages/System/SystemStatus';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';
import AcceptInvitation from './pages/Invitations/AcceptInvitation';

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/invitations/:token/accept" element={<AcceptInvitation />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trees" element={<TopicTreeList />} />
        <Route path="/trees/:treeId" element={<TreeWorkspace />} />
        <Route path="/vocabulary" element={<VocabularySearch />} />
        <Route path="/queries" element={<QueryBuilder />} />
        <Route path="/library" element={<PublicLibrary />} />
        <Route path="/study" element={<Study />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/system" element={<SystemStatus />} />
        <Route path="/profile" element={<Profile />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}
