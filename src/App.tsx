import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { GameLayout } from './layouts/GameLayout';

export function App() {
  return (
    <BrowserRouter>
      <GameLayout>
        <AppRoutes />
      </GameLayout>
    </BrowserRouter>
  );
}

export default App;
