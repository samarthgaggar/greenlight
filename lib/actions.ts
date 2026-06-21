import {
  Bike,
  Bus,
  Footprints,
  Leaf,
  Recycle,
  TimerReset,
  Waves
} from "lucide-react";
import type { ClimateActionId } from "@/lib/types";

export const climateActions: Array<{
  id: ClimateActionId;
  label: string;
  description: string;
  icon: typeof Bike;
}> = [
  {
    id: "school-commute",
    label: "Cleaner school commute",
    description: "Find bike, walking, transit, and idling barriers around a school.",
    icon: Footprints
  },
  {
    id: "bike",
    label: "Bike to school",
    description: "Check whether students can actually approach by bike.",
    icon: Bike
  },
  {
    id: "walk",
    label: "Walk more",
    description: "Surface missing sidewalks and crossing friction.",
    icon: Footprints
  },
  {
    id: "transit",
    label: "Use transit",
    description: "Spot gaps between stops, destinations, and safe routes.",
    icon: Bus
  },
  {
    id: "compost",
    label: "Compost at school",
    description: "Find placement and behavior-design gaps in waste flow.",
    icon: Leaf
  },
  {
    id: "idling",
    label: "Cut pickup idling",
    description: "Identify queue bottlenecks that keep engines running.",
    icon: TimerReset
  },
  {
    id: "reuse",
    label: "Use refill stations",
    description: "Make existing reuse options visible and easy to find.",
    icon: Waves
  },
  {
    id: "waste",
    label: "Reduce waste",
    description: "Improve recycling, compost, and refill access.",
    icon: Recycle
  }
];
