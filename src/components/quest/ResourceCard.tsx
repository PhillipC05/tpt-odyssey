import { ExternalLink, Play, FileText, GraduationCap, Users, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const typeConfig = {
  VIDEO: { icon: Play, label: "Video", color: "bg-red-100 text-red-700" },
  ARTICLE: { icon: FileText, label: "Article", color: "bg-blue-100 text-blue-700" },
  COURSE: { icon: GraduationCap, label: "Course", color: "bg-purple-100 text-purple-700" },
  COMMUNITY: { icon: Users, label: "Community", color: "bg-green-100 text-green-700" },
  TOOL: { icon: Wrench, label: "Tool", color: "bg-orange-100 text-orange-700" },
} as const;

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    url: string;
    type: keyof typeof typeConfig;
    description?: string | null;
  };
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { icon: Icon, label, color } = typeConfig[resource.type];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all group"
    >
      <div className={`p-1.5 rounded-md ${color} shrink-0 mt-0.5`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {resource.title}
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {resource.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{resource.description}</p>
        )}
        <Badge variant="outline" className="mt-1 text-xs py-0 px-1.5 h-4">
          {label}
        </Badge>
      </div>
    </a>
  );
}
