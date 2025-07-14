
import { Navigate } from 'react-router-dom';

// Redirect from Index page to Dashboard
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
