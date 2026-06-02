import {
  Columns3,
  Users,
  FileText,
  FileBarChart,
  Calendar,
} from "lucide-react";

export const marketingKpis = [
  { label: "Total Platforms", value: "0", change: "\u2014", trend: "neutral", icon: Columns3, color: "#7c3aed", bg: "bg-violet-50" },
  { label: "Total Followers", value: "0", change: "\u2014", trend: "positive", icon: Users, color: "#1a73e8", bg: "bg-blue-50" },
  { label: "Total Video Views", value: "0", change: "\u2014", trend: "positive", icon: FileText, color: "#16a34a", bg: "bg-green-50" },
  { label: "Avg Engagement Rate", value: "0%", change: "\u2014", trend: "positive", icon: FileBarChart, color: "#f97316", bg: "bg-orange-50" },
  { label: "Total Posts This Month", value: "0", change: "\u2014", trend: "positive", icon: Calendar, color: "#0d9488", bg: "bg-teal-50" },
];

export const facebookPages: string[][] = [];
export const linkedinPages: string[][] = [];
export const youtubePlaylists: string[][] = [];
export const platformFollowers: { name: string; value: number; pct: string; color: string }[] = [];
export const topMarketingPosts: string[][] = [];
export const youtubeViewsByPlaylist: { name: string; views: number }[] = [];
export const scheduledPosts: string[][] = [];
