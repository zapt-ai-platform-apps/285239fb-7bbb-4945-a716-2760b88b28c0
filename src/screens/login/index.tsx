import Auth from '../../components/auth/Auth';
import PublicRoute from '../../components/layout/PublicRoute';

const Login = () => {
  return (
    <PublicRoute redirectAuthenticated>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
          <Auth />
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;