import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardCardProps {
  title: string;
  description: string;
  content: string;
  shortContent?: string; // Mobile-optimized content
  buttonText: string;
  icon: LucideIcon;
  onClick: () => void;
  isPrimary?: boolean;
  variant?: 'default' | 'outline';
  mobileOptimized?: boolean; // Enable mobile optimizations
}

export function DashboardCard({
  title,
  description,
  content,
  shortContent,
  buttonText,
  icon: Icon,
  onClick,
  isPrimary = false,
  variant = 'default',
  mobileOptimized = false
}: DashboardCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        isPrimary ? "border-primary/50 bg-primary/5" : "hover:border-border/60",
        mobileOptimized ? "p-4" : "p-6"
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        mobileOptimized ? "pb-3 p-0 mb-3" : "pb-4"
      )}>
        <div className="space-y-1 flex-1">
          <CardTitle className={cn(
            "flex items-center gap-2 font-semibold leading-tight",
            mobileOptimized ? "text-base" : "text-lg"
          )}>
            <Icon className={cn(
              "flex-shrink-0 h-5 w-5",
              isPrimary ? "text-primary" : "text-muted-foreground"
            )} />
            <span>{title}</span>
          </CardTitle>
          {!mobileOptimized && (
            <CardDescription className="text-xs md:text-sm">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        mobileOptimized ? "pt-0 p-0" : "space-y-3 pt-0 px-4 pb-4 md:px-6"
      )}>
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          mobileOptimized ? "text-sm line-clamp-2" : "text-sm md:text-base"
        )}>
          {isMobile && shortContent ? shortContent : content}
        </p>
      </CardContent>
    </Card>
  );
}