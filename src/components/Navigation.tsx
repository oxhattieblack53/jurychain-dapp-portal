import { Link, useLocation } from "react-router-dom";
import { Scale, Home, Vote } from "lucide-react";

// Navigation component for JuryChain
export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-gold rounded-lg shadow-glow group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6 text-legal-blue-dark" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-legal-blue to-legal-gold bg-clip-text text-transparent">
              JuryChain
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${isActive("/") 
                  ? "bg-primary text-primary-foreground shadow-elegant" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              to="/dapp"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${isActive("/dapp") 
                  ? "bg-primary text-primary-foreground shadow-elegant" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              <Vote className="w-4 h-4" />
              <span className="font-medium">DApp</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
