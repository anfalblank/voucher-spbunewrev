import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  href?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = "neutral",
  href,
}: StatsCardProps) {
  const cardContent = (
    <Card className={cn("h-full", href && "cursor-pointer transition-colors hover:bg-gray-50 hover:shadow-sm")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {change !== undefined && (
              <p
                className={cn(
                  "text-xs mt-1",
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  trend === "neutral" && "text-gray-600"
                )}
              >
                {trend === "up" && "+"}
                {change}% dari bulan lalu
              </p>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
