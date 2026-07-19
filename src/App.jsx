import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Collection from './pages/Collection';
import DeckBuilder from './pages/DeckBuilder';
import { usePlayerStore } from './store/usePlayerStore';

function App() {
  const devMode = usePlayerStore(state => state.devMode);
  const toggleDevMode = usePlayerStore(state => state.toggleDevMode);
  const addCredits = usePlayerStore(state => state.addCredits);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        
        {devMode && (
          <div className="dev-banner">
            <span>Developer Mode Active (Infinite Credits)</span>
            <div>
              <button onClick={() => addCredits(1000)}>+1000 Credits</button>
              <button onClick={toggleDevMode}>Disable Dev Mode</button>
            </div>
          </div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/deck-builder" element={<DeckBuilder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
