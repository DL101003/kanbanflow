import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{ title: string; path?: string }>;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs = [], actions }: PageHeaderProps) {
  return (
    <div className="bg-background border-b px-6 py-5 mb-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          {/* Custom Breadcrumb using Tailwind */}
          <nav className="flex items-center text-sm text-muted-foreground mb-2">
            <Link to="/" className="flex items-center hover:text-primary transition-colors">
               <Home className="h-3.5 w-3.5 mr-1" /> Home
            </Link>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
                {item.path ? (
                  <Link to={item.path} className="hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.title}</span>
                )}
              </div>
            ))}
          </nav>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}