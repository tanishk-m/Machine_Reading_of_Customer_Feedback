import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-info">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold gradient-text">CFIS</span>
            <span className="text-xs text-muted-foreground">E-Commerce Analytics</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/analyze" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Analyze
          </Link>
          <Link 
            to="/insights" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Insights
          </Link>
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-2">
        </div>
      </div>
    </header>
  );
}
