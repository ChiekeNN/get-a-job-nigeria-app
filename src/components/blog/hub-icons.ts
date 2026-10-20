import {
  Building2,
  FileText,
  MessagesSquare,
  PenLine,
  Search,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { HubId } from "@/data/blog";

/** One icon per hub, kept out of the data file so content stays content. */
export const HUB_ICONS: Record<HubId, LucideIcon> = {
  cv: FileText,
  interviews: MessagesSquare,
  search: Search,
  sectors: Wallet,
  hiring: Building2,
  adverts: PenLine,
};
