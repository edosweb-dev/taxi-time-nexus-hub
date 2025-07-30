import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      isPrimary ? "border-primary/30 shadow-md" : "",
      isMobile ? "p-0" : ""
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isMobile ? "pb-3" : "pb-2"
      )}>
        <div className="space-y-1 flex-1">
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-lg" : "text-base"
          )}>
            <Icon className={cn(
              "flex-shrink-0",
              isMobile ? "h-5 w-5" : "h-5 w-5",
              isPrimary ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={isMobile ? "text-sm font-semibold" : ""}>{title}</span>
          </CardTitle>
          <CardDescription className={cn(
            isMobile ? "text-xs" : "text-sm"
          )}>
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "space-y-3",
        isMobile ? "pt-0 px-4 pb-4" : "pt-0"
      )}>
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {content}
        </p>
        
        <Button 
          onClick={onClick}
          variant={isPrimary ? "default" : variant}
          className={cn(
            "transition-all duration-200",
            isMobile ? "w-full text-sm h-9" : "mt-2"
          )}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}