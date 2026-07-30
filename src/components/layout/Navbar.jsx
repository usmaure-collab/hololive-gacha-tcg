import { NavLink } from 'react-router-dom';
import { Coins, LayoutDashboard, ShoppingBag, Layers, Library, RefreshCw, FlaskConical } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useInventoryStore } from '../../store/useInventoryStore';

export default function Navbar() {
  const credits = usePlayerStore(state => state.credits);
  const resetPlayer = usePlayerStore(state => state.resetPlayer);
  const resetInventory = useInventoryStore(state => state.resetInventory);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to completely wipe your collection and credits? This cannot be undone.")) {
      resetPlayer();
      resetInventory();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Library size={24} color="#6366f1" />
        <span>HoloOCG Gacha</span>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/shop" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={18} /> Shop
        </NavLink>
        <NavLink to="/collection" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Layers size={18} /> Collection
        </NavLink>
        <NavLink to="/deck-builder" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Library size={18} /> Deck Builder
        </NavLink>
        <NavLink to="/laboratory" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <FlaskConical size={18} /> Laboratory
        </NavLink>
      </div>

      <div className="nav-stats">
        <button onClick={handleReset} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px', fontSize: '12px' }}>
          <RefreshCw size={12} /> Reset WIPE
        </button>
        <div className="credit-badge">
          <Coins size={16} />
          <span>{credits.toLocaleString()} CR</span>
        </div>
      </div>
    </nav>
  );
}
