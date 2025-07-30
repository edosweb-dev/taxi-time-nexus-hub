import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description: string;
  content: string;
  buttonText: string;
  icon: LucideIcon;
  onClick: () => void;
  isPrimary?: boolean;
  variant?: 'default' | 'outline';
}

export function DashboardCard({
  title,
  description,
  content,
  buttonText,
  icon: Icon,
  onClick,
  isPrimary = false,
  variant = 'default'
}: DashboardCardProps) {
  return (
    <Card className={cn(
      // Mobile-first: optimized for touch
      "transition-all duration-200 hover:shadow-lg active:scale-[0.98]",
      // Enhanced primary styling
      isPrimary && "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Icon className={cn(
              "flex-shrink-0 h-5 w-5",
              isPrimary ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-sm font-semibold md:text-base md:font-medium">{title}</span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0 px-4 pb-4 md:px-6">
        <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
          {content}
        </p>
        
        <Button 
          onClick={onClick}
          variant={isPrimary ? "default" : variant}
          className="w-full text-sm h-9 md:w-auto md:h-10 md:text-base transition-all duration-200"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}