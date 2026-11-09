import {
  Activity,
  BookOpen,
  Brain,
  Coffee,
  Cpu,
  Dumbbell,
  Flag,
  Gauge,
  GraduationCap,
  Heart,
  House,
  Network,
  Pencil,
  Radio,
  Star,
  Sun,
  Target,
  Timer,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { isPaceIcon, type PaceIconId } from "../lib/icons";

const ICONS: Record<PaceIconId, LucideIcon> = {
  "graduation-cap": GraduationCap,
  cpu: Cpu,
  gauge: Gauge,
  network: Network,
  radio: Radio,
  dumbbell: Dumbbell,
  heart: Heart,
  "book-open": BookOpen,
  brain: Brain,
  target: Target,
  flag: Flag,
  star: Star,
  house: House,
  users: Users,
  activity: Activity,
  timer: Timer,
  pencil: Pencil,
  coffee: Coffee,
  sun: Sun,
  zap: Zap,
};

export function PaceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = isPaceIcon(name) ? ICONS[name] : Target;
  return <Icon className={className} aria-hidden />;
}
