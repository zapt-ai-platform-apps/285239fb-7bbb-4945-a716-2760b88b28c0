import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './screens/home';
import SubredditPage from './screens/subreddit';
import PostDetailPage from './screens/post';
import CreatePostPage from './screens/submit';
import ProfilePage from './screens/profile';
import AuthPage from './screens/auth';
import ZaptBadge from './components/ui/ZaptBadge';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/r/:subredditName" element={<SubredditPage />} />
              <Route path="/r/:subredditName/comments/:postId" element={<PostDetailPage />} />
              <Route path="/u/:username" element={<ProfilePage />} />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
          <ZaptBadge />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;