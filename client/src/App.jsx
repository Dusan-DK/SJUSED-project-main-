import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Avatar from './pages/Avatar';
import Products from './pages/Products';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import NameAvatar from './pages/NameAvatar';
import PublicOnlyRoutes from './components/PublicOnlyRoutes';
import QuizRoute from './components/QuizRoute';
function App() {
  return (
    

    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<PublicOnlyRoutes><Home /></PublicOnlyRoutes>} />
        <Route path="/login" element={<PublicOnlyRoutes><Login /></PublicOnlyRoutes>} />
        <Route path="/register" element={<PublicOnlyRoutes><Register /></PublicOnlyRoutes>} />
        <Route path="/avatar/name" element={<QuizRoute><NameAvatar /></QuizRoute>} />
        <Route path="/quiz" element={<QuizRoute><Quiz /></QuizRoute>} />
        <Route path="/avatar" element={<ProtectedRoute><Avatar /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
