import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PostStat = ({
  count,
  active,
  icon,
  label,
  onClick,
}: {
  count?: number
  active?: boolean
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="action"
          size="sm"
          data-active={active || undefined}
          onClick={onClick}
        >
          {icon}
          {count && count > 0 ? <span>{count}</span> : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {active ? `Undo ${label}` : label}
      </TooltipContent>
    </Tooltip>
  )
}

export default PostStat
