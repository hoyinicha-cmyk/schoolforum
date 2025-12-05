import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatBox from "./pages/ChatBox";
import StudentDashboard from "./pages/StudentDashboard";
import Layout from "./components/Layout/Layout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Upload from "./pages/Upload";
import AdminPanel from "./pages/AdminPanel";
import ForumG11 from "./pages/ForumG11";
import ForumG12 from "./pages/ForumG12";
import ForumGeneral from "./pages/ForumGeneral";
import ThreadDetail from "./pages/ThreadDetail";
import ThreadRedirect from "./pages/ThreadRedirect";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import Messages from "./pages/Messages";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import UserStatusMonitor from "./components/Common/UserStatusMonitor";

function App() {
  return (
    <Router>
  <AuthProvider>
    <ToastProvider>
      {/* <UserStatusMonitor /> */}
      <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />

      {/* Thread redirect route (for notifications) */}
      <Route path="/thread/:postId" element={<ProtectedRoute><ThreadRedirect /></ProtectedRoute>} />
      
      {/* Access Denied Page */}
      <Route path="/access-denied" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
      
      {/* 404 Page */}
      <Route path="/404" element={<NotFound />} />

      {/* Protected Routes inside Layout (with Header + Sidebar) */}
      <Route path="/" element={<Layout />}>
        
        <Route index element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route
          path="home"
          element={<Home />}
        />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="chatbox"
          element={
            <ProtectedRoute>
              <ChatBox />
            </ProtectedRoute>
          }
        />

        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="messages/:userId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="user/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        {/* Forums */}
        <Route
          path="forum/general"
          element={
            <ProtectedRoute>
              <ForumGeneral />
            </ProtectedRoute>
          }
        />

        <Route
          path="forum/general/thread/:postId"
          element={
            <ProtectedRoute>
              <ThreadDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="forum/g11"
          element={
            <ProtectedRoute requiresApproval={true} requiredGrade="G11">
              <ForumG11 />
            </ProtectedRoute>
          }
        />

        <Route
          path="forum/g11/thread/:postId"
          element={
            <ProtectedRoute requiresApproval={true} requiredGrade="G11">
              <ThreadDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="forum/g12"
          element={
            <ProtectedRoute requiresApproval={true} requiredGrade="G12">
              <ForumG12 />
            </ProtectedRoute>
          }
        />

        <Route
          path="forum/g12/thread/:postId"
          element={
            <ProtectedRoute requiresApproval={true} requiredGrade="G12">
              <ThreadDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin/*"
          element={
            <ProtectedRoute requiresAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  </AuthProvider>
</Router>

  );
}

export default App;
