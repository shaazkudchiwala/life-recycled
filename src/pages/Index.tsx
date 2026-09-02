import { Navigate } from 'react-router-dom';

// Index redirects to the default campaign
const Index = () => {
  return <Navigate to="/pledge/life-recycled" replace />;
};

export default Index;