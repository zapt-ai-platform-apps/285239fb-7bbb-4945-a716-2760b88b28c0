import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './screens/home';
import Login from './screens/login';
import PostDetail from './screens/post';
import CommunityPage from './screens/community';
import CreateCommunity from './screens/create-community';
import Submit from './screens/submit';
import Profile from './screens/profile';
import Search from './screens/search';
import './index.css';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/r/:communityName" element={<CommunityPage />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;