import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, Search, Database, Route, Shield, Users, Briefcase,
  GraduationCap, Gamepad2, Building2, FileText, DollarSign, Settings,
  Globe, Heart, Tv, ChevronRight, ExternalLink, ArrowLeft, Home
} from "lucide-react";
import { Link } from "wouter";

// ─── Route Registry ───────────────────────────────────────────────
// Extracted from App.tsx — every page in the system
interface RouteEntry {
  path: string;
  label: string;
  category: string;
  access: "public" | "user" | "staff" | "admin" | "owner";
}

const ROUTES: RouteEntry[] = [
  // ── Public ──
  { path: "/", label: "Landing Page", category: "Public", access: "public" },
  { path: "/careers", label: "Careers", category: "Public", access: "public" },
  { path: "/join", label: "Join Journey", category: "Public", access: "public" },
  { path: "/contact", label: "Contact", category: "Public", access: "public" },
  { path: "/services", label: "Services", category: "Public", access: "public" },
  { path: "/signup", label: "Sign Up", category: "Public", access: "public" },
  { path: "/support", label: "Support", category: "Public", access: "public" },
  { path: "/donate", label: "Donate", category: "Public", access: "public" },
  { path: "/faq", label: "FAQ", category: "Public", access: "public" },
  { path: "/products", label: "Products", category: "Public", access: "public" },
  { path: "/pricing", label: "Pricing", category: "Public", access: "public" },
  { path: "/brand-guide", label: "Brand Guide", category: "Public", access: "public" },
  { path: "/purple-heart", label: "Purple Heart", category: "Public", access: "public" },
  { path: "/indigenous-rights", label: "Indigenous Rights", category: "Public", access: "public" },
  { path: "/impact-dashboard", label: "Impact Dashboard", category: "Public", access: "public" },
  { path: "/documentary", label: "Documentary", category: "Public", access: "public" },
  { path: "/podcast", label: "Podcast", category: "Public", access: "public" },
  { path: "/trial", label: "Trial Landing", category: "Public", access: "public" },
  { path: "/verify-signature", label: "Signature Verification", category: "Public", access: "public" },

  // ── Core Dashboards ──
  { path: "/dashboard", label: "Main Dashboard", category: "Core Dashboards", access: "staff" },
  { path: "/system", label: "System Dashboard", category: "Core Dashboards", access: "admin" },
  { path: "/executive-dashboard", label: "Executive Dashboard", category: "Core Dashboards", access: "admin" },
  { path: "/operations-dashboard", label: "Operations Dashboard", category: "Core Dashboards", access: "admin" },
  { path: "/system-health", label: "System Health", category: "Core Dashboards", access: "admin" },
  { path: "/mobile-dashboard", label: "Mobile Dashboard", category: "Core Dashboards", access: "staff" },
  { path: "/realtime-dashboards", label: "Realtime Dashboards", category: "Core Dashboards", access: "admin" },
  { path: "/custom-dashboard", label: "Custom Dashboard", category: "Core Dashboards", access: "admin" },

  // ── Trust & Governance ──
  { path: "/trust-governance", label: "Trust Governance", category: "Trust & Governance", access: "admin" },
  { path: "/trust-admin", label: "Trust Admin Dashboard", category: "Trust & Governance", access: "admin" },
  { path: "/trust-structure", label: "Trust Visualization", category: "Trust & Governance", access: "admin" },
  { path: "/entity-structure", label: "Entity Structure", category: "Trust & Governance", access: "admin" },
  { path: "/board-governance", label: "Board Governance", category: "Trust & Governance", access: "admin" },
  { path: "/board-meetings", label: "Board Meetings", category: "Trust & Governance", access: "admin" },
  { path: "/board-resolutions", label: "Board Resolutions", category: "Trust & Governance", access: "admin" },
  { path: "/tiered-governance", label: "Tiered Governance", category: "Trust & Governance", access: "admin" },
  { path: "/governance-workflows", label: "Governance Workflows", category: "Trust & Governance", access: "admin" },
  { path: "/operating-agreements", label: "Operating Agreements", category: "Trust & Governance", access: "admin" },
  { path: "/procedures", label: "Procedures", category: "Trust & Governance", access: "admin" },

  // ── Finance ──
  { path: "/financial-automation", label: "Financial Automation", category: "Finance", access: "staff" },
  { path: "/financial-dashboard", label: "Consolidated Financial", category: "Finance", access: "admin" },
  { path: "/financial-statements", label: "Financial Statements", category: "Finance", access: "admin" },
  { path: "/financial-reconciliation", label: "Financial Reconciliation", category: "Finance", access: "admin" },
  { path: "/revenue-cycle", label: "Revenue Cycle", category: "Finance", access: "admin" },
  { path: "/revenue-sharing", label: "Revenue Sharing", category: "Finance", access: "admin" },
  { path: "/revenue-flow", label: "Revenue Flow", category: "Finance", access: "admin" },
  { path: "/banking", label: "Banking & Credit", category: "Finance", access: "staff" },
  { path: "/payment-processing", label: "Payment Processing", category: "Finance", access: "admin" },
  { path: "/investments", label: "Investment Portfolio", category: "Finance", access: "admin" },
  { path: "/investment-governance", label: "Investment Governance", category: "Finance", access: "admin" },
  { path: "/investment-reports", label: "Investment Reports", category: "Finance", access: "admin" },
  { path: "/treasury/acquisition-fund", label: "Acquisition Fund", category: "Finance", access: "admin" },
  { path: "/tax-module", label: "Tax Module", category: "Finance", access: "admin" },
  { path: "/closed-loop-wealth", label: "Closed-Loop Wealth", category: "Finance", access: "admin" },
  { path: "/token-reporting", label: "Token Reporting", category: "Finance", access: "admin" },
  { path: "/founding-member-bonus", label: "Founding Member Bonus", category: "Finance", access: "admin" },
  { path: "/contingency-offers", label: "Contingency Offers", category: "Finance", access: "admin" },
  { path: "/donate-508", label: "Donate 508", category: "Finance", access: "public" },

  // ── HR & People ──
  { path: "/hr-management", label: "HR Management", category: "HR & People", access: "staff" },
  { path: "/hr-dashboard", label: "HR Dashboard", category: "HR & People", access: "staff" },
  { path: "/hr-admin", label: "HR Admin", category: "HR & People", access: "admin" },
  { path: "/hr-applications", label: "HR Applications", category: "HR & People", access: "staff" },
  { path: "/employees", label: "Employee Directory", category: "HR & People", access: "staff" },
  { path: "/performance-reviews", label: "Performance Reviews", category: "HR & People", access: "staff" },
  { path: "/positions", label: "Position Management", category: "HR & People", access: "admin" },
  { path: "/requisitions", label: "Position Requisitions", category: "HR & People", access: "admin" },
  { path: "/offer-letters", label: "Offer Letters", category: "HR & People", access: "admin" },
  { path: "/payroll", label: "Payroll Dashboard", category: "HR & People", access: "admin" },
  { path: "/timekeeping", label: "Timekeeping", category: "HR & People", access: "admin" },
  { path: "/worker-progression", label: "Worker Progression", category: "HR & People", access: "staff" },
  { path: "/career-path-planner", label: "Career Path Planner", category: "HR & People", access: "staff" },
  { path: "/laws-employment", label: "LAWS Employment Portal", category: "HR & People", access: "public" },
  { path: "/internship-portal", label: "Internship Portal", category: "HR & People", access: "user" },

  // ── Contractor Transition ──
  { path: "/contractor-transition", label: "Contractor Transition Pipeline", category: "Contractor Transition", access: "staff" },
  { path: "/contractor-transitions", label: "Contractor Transitions Mgmt", category: "Contractor Transition", access: "staff" },
  { path: "/contractor-agreement", label: "Contractor Agreement", category: "Contractor Transition", access: "staff" },
  { path: "/contractor-invoices", label: "Contractor Invoices", category: "Contractor Transition", access: "admin" },
  { path: "/contractor-network", label: "Contractor Network", category: "Contractor Transition", access: "admin" },
  { path: "/transition-training", label: "Transition Training", category: "Contractor Transition", access: "staff" },
  { path: "/transition-simulator", label: "Transition Simulator", category: "Contractor Transition", access: "staff" },
  { path: "/benefits-comparison", label: "Benefits Comparison", category: "Contractor Transition", access: "staff" },

  // ── Business & Entity ──
  { path: "/business-formation", label: "Business Formation", category: "Business & Entity", access: "admin" },
  { path: "/business-setup-wizard", label: "Business Setup Wizard", category: "Business & Entity", access: "admin" },
  { path: "/business-listings", label: "Business Listings", category: "Business & Entity", access: "admin" },
  { path: "/member-business", label: "Member Business Dashboard", category: "Business & Entity", access: "public" },
  { path: "/member-business/register", label: "Member Business Registration", category: "Business & Entity", access: "public" },
  { path: "/register-business", label: "Member Registration", category: "Business & Entity", access: "public" },
  { path: "/international-business", label: "International Business", category: "Business & Entity", access: "admin" },
  { path: "/international-operations", label: "International Operations", category: "Business & Entity", access: "admin" },
  { path: "/international-registration", label: "International Registration", category: "Business & Entity", access: "admin" },
  { path: "/foreign-qualification", label: "Foreign Qualification", category: "Business & Entity", access: "admin" },
  { path: "/entity-curriculum", label: "Entity Curriculum", category: "Business & Entity", access: "user" },
  { path: "/service-departments", label: "Service Departments", category: "Business & Entity", access: "admin" },

  // ── Grants & Funding ──
  { path: "/grants", label: "Grant Management", category: "Grants & Funding", access: "admin" },
  { path: "/grant-simulator", label: "Grant Simulator", category: "Grants & Funding", access: "user" },
  { path: "/grant-export", label: "Grant Export", category: "Grants & Funding", access: "user" },
  { path: "/grant-history", label: "Grant History", category: "Grants & Funding", access: "user" },
  { path: "/grant-tracking", label: "Grant Tracking", category: "Grants & Funding", access: "admin" },
  { path: "/grant-documents", label: "Grant Documents", category: "Grants & Funding", access: "admin" },
  { path: "/demographic-grants", label: "Demographic Grants", category: "Grants & Funding", access: "admin" },
  { path: "/need-statement-editor", label: "Need Statement Editor", category: "Grants & Funding", access: "admin" },
  { path: "/rfp-generator", label: "RFP Generator", category: "Grants & Funding", access: "admin" },
  { path: "/proposal-simulator", label: "Proposal Simulator", category: "Grants & Funding", access: "staff" },
  { path: "/investor-opportunities", label: "Investor Opportunities", category: "Grants & Funding", access: "admin" },
  { path: "/scholarships", label: "Scholarships", category: "Grants & Funding", access: "admin" },

  // ── Documents & Compliance ──
  { path: "/vault", label: "Document Vault", category: "Documents & Compliance", access: "admin" },
  { path: "/admin/documents", label: "Document Admin", category: "Documents & Compliance", access: "admin" },
  { path: "/admin/compliance-dashboard", label: "Compliance Dashboard", category: "Documents & Compliance", access: "admin" },
  { path: "/compliance-calendar", label: "Compliance Calendar", category: "Documents & Compliance", access: "admin" },
  { path: "/compliance-export", label: "Compliance Export", category: "Documents & Compliance", access: "admin" },
  { path: "/compliance-monitoring", label: "Compliance Monitoring", category: "Documents & Compliance", access: "admin" },
  { path: "/document-upload", label: "Document Upload", category: "Documents & Compliance", access: "admin" },
  { path: "/document-version-control", label: "Document Version Control", category: "Documents & Compliance", access: "admin" },
  { path: "/document-templates", label: "Document Templates", category: "Documents & Compliance", access: "admin" },
  { path: "/trademark-documents", label: "Trademark Documents", category: "Documents & Compliance", access: "admin" },
  { path: "/trademark-checklist", label: "Trademark Checklist", category: "Documents & Compliance", access: "admin" },
  { path: "/e-signature", label: "E-Signature", category: "Documents & Compliance", access: "admin" },
  { path: "/admin/signature-compliance", label: "Signature Compliance", category: "Documents & Compliance", access: "admin" },
  { path: "/admin/signature-audit", label: "Signature Audit Report", category: "Documents & Compliance", access: "admin" },
  { path: "/admin/bulk-signatures", label: "Bulk Signature Request", category: "Documents & Compliance", access: "admin" },
  { path: "/contract-management", label: "Contract Management", category: "Documents & Compliance", access: "admin" },
  { path: "/contract-agent", label: "Contract Agent", category: "Documents & Compliance", access: "user" },

  // ── Academy & Education ──
  { path: "/academy", label: "Academy Dashboard", category: "Academy & Education", access: "user" },
  { path: "/training-hub", label: "Training Hub", category: "Academy & Education", access: "user" },
  { path: "/training-content", label: "Training Content Manager", category: "Academy & Education", access: "admin" },
  { path: "/specialist-tracks", label: "Specialist Tracks", category: "Academy & Education", access: "admin" },
  { path: "/course-dashboard", label: "Course Dashboard", category: "Academy & Education", access: "public" },
  { path: "/library", label: "Virtual Library", category: "Academy & Education", access: "user" },
  { path: "/reading-dashboard", label: "Reading Dashboard", category: "Academy & Education", access: "user" },
  { path: "/house-of-tongues", label: "House of Tongues", category: "Academy & Education", access: "user" },
  { path: "/learning-houses", label: "Learning Houses", category: "Academy & Education", access: "user" },

  // ── Simulators ──
  { path: "/business-simulator", label: "Business Simulator", category: "Simulators", access: "user" },
  { path: "/business-plan-simulator", label: "Business Plan Simulator", category: "Simulators", access: "user" },
  { path: "/simulator/tax", label: "Tax Simulator", category: "Simulators", access: "user" },
  { path: "/simulator/finance", label: "Finance Simulator", category: "Simulators", access: "staff" },
  { path: "/education-simulator", label: "Education Simulator", category: "Simulators", access: "staff" },
  { path: "/design-simulator", label: "Design Simulator", category: "Simulators", access: "staff" },
  { path: "/media-simulator", label: "Media Simulator", category: "Simulators", access: "staff" },
  { path: "/hr-simulator", label: "HR Simulator", category: "Simulators", access: "staff" },
  { path: "/operations-simulator", label: "Operations Simulator", category: "Simulators", access: "staff" },
  { path: "/procurement-simulator", label: "Procurement Simulator", category: "Simulators", access: "staff" },
  { path: "/contracts-simulator", label: "Contracts Simulator", category: "Simulators", access: "staff" },
  { path: "/purchasing-simulator", label: "Purchasing Simulator", category: "Simulators", access: "staff" },
  { path: "/property-simulator", label: "Property Simulator", category: "Simulators", access: "staff" },
  { path: "/real-estate-simulator", label: "Real Estate Simulator", category: "Simulators", access: "staff" },
  { path: "/project-controls-simulator", label: "Project Controls Simulator", category: "Simulators", access: "staff" },
  { path: "/qaqc-simulator", label: "QA/QC Simulator", category: "Simulators", access: "staff" },
  { path: "/legal-simulator", label: "Legal Simulator", category: "Simulators", access: "staff" },
  { path: "/it-simulator", label: "IT Simulator", category: "Simulators", access: "staff" },
  { path: "/platform-simulator", label: "Platform Simulator", category: "Simulators", access: "admin" },
  { path: "/grants-simulator", label: "Grants Simulator", category: "Simulators", access: "staff" },

  // ── Departments ──
  { path: "/dept/health", label: "Health Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/education", label: "Education Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/design", label: "Design Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/media", label: "Media Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/finance", label: "Finance Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/procurement", label: "Procurement Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/contracts", label: "Contracts Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/purchasing", label: "Purchasing Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/property", label: "Property Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/real-estate", label: "Real Estate Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/project-controls", label: "Project Controls Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/qaqc", label: "QA/QC Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/legal", label: "Legal Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/it", label: "IT Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/grants", label: "Grants Dashboard", category: "Departments", access: "staff" },
  { path: "/dept/platform", label: "Platform Admin", category: "Departments", access: "admin" },
  { path: "/dept/business", label: "Business Dashboard", category: "Departments", access: "staff" },
  { path: "/property-management", label: "Property Management", category: "Departments", access: "admin" },
  { path: "/design-department", label: "Design Department", category: "Departments", access: "admin" },
  { path: "/design-services", label: "Design Services", category: "Departments", access: "admin" },
  { path: "/media-services", label: "Media Services", category: "Departments", access: "admin" },
  { path: "/creative-enterprise", label: "Creative Enterprise", category: "Departments", access: "admin" },
  { path: "/marketing-dashboard", label: "Marketing Dashboard", category: "Departments", access: "admin" },

  // ── Games ──
  { path: "/game-center", label: "Game Center", category: "Games", access: "user" },
  { path: "/gaming-dashboard", label: "Employee Gaming Dashboard", category: "Games", access: "user" },
  { path: "/games/tic-tac-toe", label: "Tic Tac Toe", category: "Games", access: "user" },
  { path: "/games/memory-match", label: "Memory Match", category: "Games", access: "user" },
  { path: "/games/connect-four", label: "Connect Four", category: "Games", access: "user" },
  { path: "/games/sudoku", label: "Sudoku", category: "Games", access: "user" },
  { path: "/games/word-search", label: "Word Search", category: "Games", access: "user" },
  { path: "/games/hangman", label: "Hangman", category: "Games", access: "user" },
  { path: "/games/snake", label: "Snake", category: "Games", access: "user" },
  { path: "/games/checkers", label: "Checkers", category: "Games", access: "user" },
  { path: "/games/2048", label: "2048", category: "Games", access: "user" },
  { path: "/games/chess", label: "Chess", category: "Games", access: "user" },
  { path: "/games/battleship", label: "Battleship", category: "Games", access: "user" },
  { path: "/games/solitaire", label: "Solitaire", category: "Games", access: "user" },
  { path: "/games/laws-quest", label: "LAWS Quest", category: "Games", access: "user" },
  { path: "/games/laws-quest-unified", label: "LAWS Quest Unified", category: "Games", access: "user" },
  { path: "/games/dual-path-journey", label: "Dual Path Journey", category: "Games", access: "user" },
  { path: "/games/sovereignty-journey", label: "Sovereignty Journey", category: "Games", access: "user" },
  { path: "/games/rainbow-journey", label: "Rainbow Journey", category: "Games", access: "user" },
  { path: "/games/logic-puzzles", label: "Logic Puzzles", category: "Games", access: "user" },
  { path: "/games/spider-solitaire", label: "Spider Solitaire", category: "Games", access: "user" },
  { path: "/games/word-forge", label: "Word Forge", category: "Games", access: "user" },
  { path: "/games/crossword-master", label: "Crossword Master", category: "Games", access: "user" },
  { path: "/games/climb-slide", label: "Climb & Slide", category: "Games", access: "user" },
  { path: "/games/escape-room", label: "Escape Room", category: "Games", access: "user" },
  { path: "/games/detective-academy", label: "Detective Academy", category: "Games", access: "user" },
  { path: "/games/rubiks-cube", label: "Rubik's Cube", category: "Games", access: "user" },
  { path: "/games/spades", label: "Spades", category: "Games", access: "user" },
  { path: "/games/yahtzee", label: "Yahtzee", category: "Games", access: "user" },
  { path: "/games/scrabble", label: "Scrabble", category: "Games", access: "user" },
  { path: "/games/dominoes", label: "Dominoes", category: "Games", access: "user" },
  { path: "/games/mancala", label: "Mancala", category: "Games", access: "user" },
  { path: "/games/mahjong-solitaire", label: "Mahjong Solitaire", category: "Games", access: "user" },
  { path: "/games/backgammon", label: "Backgammon", category: "Games", access: "user" },
  { path: "/games/tangram", label: "Tangram", category: "Games", access: "user" },
  { path: "/games/word-ladder", label: "Word Ladder", category: "Games", access: "user" },
  { path: "/games/trivia-challenge", label: "Trivia Challenge", category: "Games", access: "user" },
  { path: "/games/simon-says", label: "Simon Says", category: "Games", access: "user" },
  { path: "/games/community-builder", label: "Community Builder", category: "Games", access: "user" },
  { path: "/games/fleet-command", label: "Fleet Command", category: "Games", access: "user" },
  { path: "/games/hearts", label: "Hearts", category: "Games", access: "user" },
  { path: "/games/knowledge-quest", label: "Knowledge Quest", category: "Games", access: "user" },
  { path: "/games/advanced-escape-room", label: "Advanced Escape Room", category: "Games", access: "user" },
  { path: "/games/financial-literacy", label: "Financial Literacy Game", category: "Games", access: "user" },
  { path: "/games/business-tycoon", label: "Business Tycoon", category: "Games", access: "user" },

  // ── Media & Broadcasting ──
  { path: "/theater-live", label: "Theater Live", category: "Media & Broadcasting", access: "user" },
  { path: "/theater-live-enhanced", label: "Theater Live Enhanced", category: "Media & Broadcasting", access: "user" },
  { path: "/theater-vod", label: "Theater VOD", category: "Media & Broadcasting", access: "user" },
  { path: "/theater-now-playing", label: "Theater Now Playing", category: "Media & Broadcasting", access: "user" },
  { path: "/theater-playback-history", label: "Theater Playback History", category: "Media & Broadcasting", access: "user" },
  { path: "/broadcast-channels", label: "Broadcast Channels", category: "Media & Broadcasting", access: "user" },
  { path: "/broadcast-radio", label: "Broadcast Radio", category: "Media & Broadcasting", access: "user" },
  { path: "/broadcast-episodes", label: "Broadcast Episodes", category: "Media & Broadcasting", access: "user" },
  { path: "/live-broadcasts", label: "Live Broadcasts", category: "Media & Broadcasting", access: "user" },
  { path: "/music", label: "Music", category: "Media & Broadcasting", access: "user" },
  { path: "/my-library", label: "My Library", category: "Media & Broadcasting", access: "user" },
  { path: "/now-playing", label: "Now Playing", category: "Media & Broadcasting", access: "user" },
  { path: "/playback-history", label: "Playback History", category: "Media & Broadcasting", access: "user" },
  { path: "/iptv-admin", label: "IPTV Admin Panel", category: "Media & Broadcasting", access: "admin" },
  { path: "/email-campaigns", label: "Email Campaigns", category: "Media & Broadcasting", access: "admin" },

  // ── Member & Community ──
  { path: "/onboarding", label: "Member Onboarding", category: "Member & Community", access: "user" },
  { path: "/onboarding-center", label: "Onboarding Center", category: "Member & Community", access: "admin" },
  { path: "/onboarding-checklist", label: "Onboarding Checklist", category: "Member & Community", access: "admin" },
  { path: "/member-portal", label: "Member Portal", category: "Member & Community", access: "admin" },
  { path: "/member-credentials", label: "Member Credentials", category: "Member & Community", access: "admin" },
  { path: "/my-credential", label: "My Credential", category: "Member & Community", access: "public" },
  { path: "/my-profile", label: "My Profile", category: "Member & Community", access: "user" },
  { path: "/achievements", label: "Achievements", category: "Member & Community", access: "user" },
  { path: "/leaderboard", label: "Leaderboard", category: "Member & Community", access: "user" },
  { path: "/activation-progress", label: "Activation Progress", category: "Member & Community", access: "user" },
  { path: "/content-builder", label: "Content Builder", category: "Member & Community", access: "user" },
  { path: "/volunteer", label: "Volunteer", category: "Member & Community", access: "admin" },
  { path: "/communication-hub", label: "Communication Hub", category: "Member & Community", access: "admin" },
  { path: "/segmentation-engine", label: "Segmentation Engine", category: "Member & Community", access: "admin" },
  { path: "/donor-dashboard", label: "Donor Dashboard", category: "Member & Community", access: "user" },
  { path: "/family-onboarding", label: "Family Onboarding", category: "Member & Community", access: "admin" },
  { path: "/guardian-dashboard", label: "Guardian Dashboard", category: "Member & Community", access: "user" },

  // ── Admin & System ──
  { path: "/admin/seeding", label: "Admin Seeding", category: "Admin & System", access: "admin" },
  { path: "/admin/activations", label: "Admin Activations", category: "Admin & System", access: "admin" },
  { path: "/admin/system-jobs", label: "System Jobs Admin", category: "Admin & System", access: "admin" },
  { path: "/system-admin", label: "System Admin", category: "Admin & System", access: "admin" },
  { path: "/system-settings", label: "System Settings", category: "Admin & System", access: "admin" },
  { path: "/system-overview", label: "System Overview", category: "Admin & System", access: "admin" },
  { path: "/user-management", label: "User Management", category: "Admin & System", access: "admin" },
  { path: "/permission-matrix", label: "Permission Matrix", category: "Admin & System", access: "admin" },
  { path: "/role-dashboard", label: "Role Dashboard", category: "Admin & System", access: "admin" },
  { path: "/security-center", label: "Security Center", category: "Admin & System", access: "admin" },
  { path: "/two-factor-setup", label: "Two-Factor Setup", category: "Admin & System", access: "admin" },
  { path: "/data-retention-policies", label: "Data Retention Policies", category: "Admin & System", access: "admin" },
  { path: "/data-export", label: "Data Export", category: "Admin & System", access: "admin" },
  { path: "/backup-restore", label: "Backup & Restore", category: "Admin & System", access: "admin" },
  { path: "/backup-settings", label: "Backup Settings", category: "Admin & System", access: "admin" },
  { path: "/alert-rules", label: "Alert Rules", category: "Admin & System", access: "admin" },
  { path: "/audit-trail", label: "Audit Trail", category: "Admin & System", access: "admin" },
  { path: "/audit-reports", label: "Audit Reports", category: "Admin & System", access: "admin" },
  { path: "/changelog", label: "Changelog", category: "Admin & System", access: "admin" },
  { path: "/owner-actions", label: "Owner Action List", category: "Admin & System", access: "owner" },
  { path: "/owner-setup", label: "Owner House Setup", category: "Admin & System", access: "owner" },
  { path: "/ticker-admin", label: "Ticker Admin", category: "Admin & System", access: "admin" },
  { path: "/resource-links-admin", label: "Resource Links Admin", category: "Admin & System", access: "admin" },
  { path: "/government-actions-admin", label: "Government Actions Admin", category: "Admin & System", access: "admin" },

  // ── Tasks & Collaboration ──
  { path: "/my-tasks", label: "My Tasks", category: "Tasks & Collaboration", access: "user" },
  { path: "/team-tasks", label: "Team Tasks", category: "Tasks & Collaboration", access: "staff" },
  { path: "/task-delegation", label: "Task Delegation", category: "Tasks & Collaboration", access: "admin" },
  { path: "/team-workload", label: "Team Workload", category: "Tasks & Collaboration", access: "admin" },
  { path: "/delegation-analytics", label: "Delegation Analytics", category: "Tasks & Collaboration", access: "admin" },
  { path: "/delegation-approval-queue", label: "Delegation Approval Queue", category: "Tasks & Collaboration", access: "admin" },
  { path: "/delegation-history", label: "Delegation History", category: "Tasks & Collaboration", access: "admin" },
  { path: "/delegation-escalation", label: "Delegation Escalation", category: "Tasks & Collaboration", access: "admin" },
  { path: "/team-collaboration", label: "Team Collaboration", category: "Tasks & Collaboration", access: "admin" },
  { path: "/team-sessions", label: "Team Sessions", category: "Tasks & Collaboration", access: "admin" },
  { path: "/real-time-collaboration", label: "Real-Time Collaboration", category: "Tasks & Collaboration", access: "admin" },
  { path: "/chat", label: "Chat", category: "Tasks & Collaboration", access: "admin" },
  { path: "/activity-feed", label: "Activity Feed", category: "Tasks & Collaboration", access: "admin" },

  // ── Tools & Integrations ──
  { path: "/workflow-builder", label: "Workflow Builder", category: "Tools & Integrations", access: "admin" },
  { path: "/workflow-templates", label: "Workflow Templates", category: "Tools & Integrations", access: "admin" },
  { path: "/integration-hub", label: "Integration Hub", category: "Tools & Integrations", access: "admin" },
  { path: "/external-api-integrations", label: "External API Integrations", category: "Tools & Integrations", access: "admin" },
  { path: "/external-integrations", label: "External Integrations", category: "Tools & Integrations", access: "admin" },
  { path: "/api-usage-dashboard", label: "API Usage Dashboard", category: "Tools & Integrations", access: "admin" },
  { path: "/ai-document-analysis", label: "AI Document Analysis", category: "Tools & Integrations", access: "admin" },
  { path: "/ai-insights", label: "AI Insights", category: "Tools & Integrations", access: "admin" },
  { path: "/documentation-generator", label: "Documentation Generator", category: "Tools & Integrations", access: "admin" },
  { path: "/global-search", label: "Global Search", category: "Tools & Integrations", access: "staff" },
  { path: "/reporting-center", label: "Reporting Center", category: "Tools & Integrations", access: "admin" },
  { path: "/advanced-reporting", label: "Advanced Reporting", category: "Tools & Integrations", access: "admin" },
  { path: "/custom-report-scheduling", label: "Custom Report Scheduling", category: "Tools & Integrations", access: "admin" },
  { path: "/bulk-operations", label: "Bulk Operations", category: "Tools & Integrations", access: "admin" },
  { path: "/swot-analysis", label: "SWOT Analysis", category: "Tools & Integrations", access: "admin" },
  { path: "/resume-builder", label: "Resume Builder", category: "Tools & Integrations", access: "staff" },
  { path: "/procurement-catalog", label: "Procurement Catalog", category: "Tools & Integrations", access: "admin" },
  { path: "/purchase-requests", label: "Purchase Requests", category: "Tools & Integrations", access: "admin" },
  { path: "/company-calendar", label: "Company Calendar", category: "Tools & Integrations", access: "admin" },
  { path: "/calendar-integration", label: "Calendar Integration", category: "Tools & Integrations", access: "admin" },
  { path: "/office-suite", label: "Office Suite", category: "Tools & Integrations", access: "user" },
  { path: "/translation-portal", label: "Translation Portal", category: "Tools & Integrations", access: "admin" },
  { path: "/software-licenses", label: "Software Licenses", category: "Tools & Integrations", access: "admin" },
  { path: "/notification-history", label: "Notification History", category: "Tools & Integrations", access: "admin" },
  { path: "/downloads", label: "Downloads", category: "Tools & Integrations", access: "admin" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Public": <Globe className="w-4 h-4" />,
  "Core Dashboards": <LayoutDashboard className="w-4 h-4" />,
  "Trust & Governance": <Shield className="w-4 h-4" />,
  "Finance": <DollarSign className="w-4 h-4" />,
  "HR & People": <Users className="w-4 h-4" />,
  "Contractor Transition": <Briefcase className="w-4 h-4" />,
  "Business & Entity": <Building2 className="w-4 h-4" />,
  "Grants & Funding": <DollarSign className="w-4 h-4" />,
  "Documents & Compliance": <FileText className="w-4 h-4" />,
  "Academy & Education": <GraduationCap className="w-4 h-4" />,
  "Simulators": <Settings className="w-4 h-4" />,
  "Departments": <Building2 className="w-4 h-4" />,
  "Games": <Gamepad2 className="w-4 h-4" />,
  "Media & Broadcasting": <Tv className="w-4 h-4" />,
  "Member & Community": <Heart className="w-4 h-4" />,
  "Admin & System": <Shield className="w-4 h-4" />,
  "Tasks & Collaboration": <Users className="w-4 h-4" />,
  "Tools & Integrations": <Settings className="w-4 h-4" />,
};

const ACCESS_COLORS: Record<string, string> = {
  public: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  user: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  staff: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  owner: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function SystemMap() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);

  // Get table counts from backend
  const { data: tableStats } = trpc.system.getSystemStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const cats = new Map<string, RouteEntry[]>();
    for (const r of ROUTES) {
      if (!cats.has(r.category)) cats.set(r.category, []);
      cats.get(r.category)!.push(r);
    }
    return cats;
  }, []);

  const filteredRoutes = useMemo(() => {
    return ROUTES.filter((r) => {
      const matchesSearch = !search || r.label.toLowerCase().includes(search.toLowerCase()) || r.path.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || r.category === selectedCategory;
      const matchesAccess = !selectedAccess || r.access === selectedAccess;
      return matchesSearch && matchesCategory && matchesAccess;
    });
  }, [search, selectedCategory, selectedAccess]);

  const filteredCategories = useMemo(() => {
    const cats = new Map<string, RouteEntry[]>();
    for (const r of filteredRoutes) {
      if (!cats.has(r.category)) cats.set(r.category, []);
      cats.get(r.category)!.push(r);
    }
    return cats;
  }, [filteredRoutes]);

  const stats = {
    totalRoutes: ROUTES.length,
    totalRouters: 305,
    totalTables: 558,
    totalPages: 389,
    public: ROUTES.filter(r => r.access === "public").length,
    user: ROUTES.filter(r => r.access === "user").length,
    staff: ROUTES.filter(r => r.access === "staff").length,
    admin: ROUTES.filter(r => r.access === "admin").length,
    owner: ROUTES.filter(r => r.access === "owner").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">System Map</h1>
          <p className="text-muted-foreground mt-1">
            Complete navigation map of the LuvOnPurpose Sovereign System — {stats.totalRoutes} pages, {stats.totalRouters} API routers, {stats.totalTables} database tables
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="map">Navigation Map</TabsTrigger>
            <TabsTrigger value="stats">System Stats</TabsTrigger>
            <TabsTrigger value="quick">Quick Access</TabsTrigger>
          </TabsList>

          {/* ── Navigation Map ── */}
          <TabsContent value="map">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["public", "user", "staff", "admin", "owner"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedAccess(selectedAccess === level ? null : level)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedAccess === level
                        ? ACCESS_COLORS[level] + " ring-2 ring-offset-1 ring-current"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All ({filteredRoutes.length})
              </button>
              {Array.from(categories.keys()).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {CATEGORY_ICONS[cat]}
                  {cat} ({categories.get(cat)!.length})
                </button>
              ))}
            </div>

            {/* Route Grid by Category */}
            <div className="space-y-6">
              {Array.from(filteredCategories.entries()).map(([category, routes]) => (
                <div key={category} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                    {CATEGORY_ICONS[category]}
                    <h3 className="font-semibold text-sm">{category}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{routes.length} pages</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                    {routes.map((route) => (
                      <Link key={route.path} href={route.path}>
                        <div className="bg-card px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary">{route.label}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{route.path}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${ACCESS_COLORS[route.access]}`}>
                            {route.access}
                          </span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── System Stats ── */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-3xl font-bold">{stats.totalRoutes}</p>
                <p className="text-sm text-muted-foreground">Total Pages</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-3xl font-bold">{stats.totalRouters}</p>
                <p className="text-sm text-muted-foreground">API Routers</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-3xl font-bold">{stats.totalTables}</p>
                <p className="text-sm text-muted-foreground">Database Tables</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-3xl font-bold">{stats.totalPages}</p>
                <p className="text-sm text-muted-foreground">Page Components</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Access Level Distribution</h3>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {(["public", "user", "staff", "admin", "owner"] as const).map((level) => (
                <div key={level} className="border border-border rounded-lg p-4 bg-card text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${ACCESS_COLORS[level]}`}>
                    {level}
                  </span>
                  <p className="text-2xl font-bold">{stats[level]}</p>
                  <p className="text-xs text-muted-foreground">pages</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Pages by Category</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2 font-medium">Category</th>
                    <th className="text-right px-4 py-2 font-medium">Pages</th>
                    <th className="text-right px-4 py-2 font-medium">Public</th>
                    <th className="text-right px-4 py-2 font-medium">User</th>
                    <th className="text-right px-4 py-2 font-medium">Staff</th>
                    <th className="text-right px-4 py-2 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(categories.entries()).map(([cat, routes]) => (
                    <tr key={cat} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 flex items-center gap-2">
                        {CATEGORY_ICONS[cat]}
                        {cat}
                      </td>
                      <td className="text-right px-4 py-2 font-semibold">{routes.length}</td>
                      <td className="text-right px-4 py-2">{routes.filter(r => r.access === "public").length || "-"}</td>
                      <td className="text-right px-4 py-2">{routes.filter(r => r.access === "user").length || "-"}</td>
                      <td className="text-right px-4 py-2">{routes.filter(r => r.access === "staff").length || "-"}</td>
                      <td className="text-right px-4 py-2">{routes.filter(r => r.access === "admin").length || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Database table counts if available */}
            {tableStats && (
              <>
                <h3 className="text-lg font-semibold mb-4 mt-8">Database Table Row Counts</h3>
                <div className="border border-border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-2 font-medium">Table</th>
                        <th className="text-right px-4 py-2 font-medium">Rows</th>
                        <th className="text-right px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableStats.tables?.map((t: { name: string; count: number }) => (
                        <tr key={t.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs">{t.name}</td>
                          <td className="text-right px-4 py-2">{t.count.toLocaleString()}</td>
                          <td className="text-right px-4 py-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${t.count > 0 ? "bg-green-500" : "bg-gray-300"}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Quick Access ── */}
          <TabsContent value="quick">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Owner Entry Points</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { path: "/owner-actions", label: "Owner Action List", desc: "Your personal task queue" },
                    { path: "/owner-setup", label: "Owner House Setup", desc: "Configure your house" },
                    { path: "/executive-dashboard", label: "Executive Dashboard", desc: "High-level system overview" },
                    { path: "/trust-admin", label: "Trust Admin", desc: "Trust administration panel" },
                    { path: "/admin/seeding", label: "Admin Seeding", desc: "Seed test data" },
                    { path: "/system", label: "System Dashboard", desc: "Full system status" },
                  ].map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <p className="font-medium group-hover:text-primary">{item.label}</p>
                          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Core Business Flow</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {[
                    { path: "/", label: "Landing" },
                    { path: "/join", label: "Join Journey" },
                    { path: "/onboarding", label: "Onboarding" },
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/academy", label: "Academy" },
                    { path: "/business-simulator", label: "Business Simulator" },
                    { path: "/business-formation", label: "Business Formation" },
                    { path: "/contractor-transition", label: "Contractor Transition" },
                  ].map((item, i, arr) => (
                    <div key={item.path} className="flex items-center gap-2">
                      <Link href={item.path}>
                        <Button variant="outline" size="sm" className="text-xs">
                          {item.label}
                        </Button>
                      </Link>
                      {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Admin Backdoor — Direct Access</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Direct links to every admin panel and management tool. All require admin access.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {ROUTES.filter(r => r.access === "admin" || r.access === "owner").map((route) => (
                    <Link key={route.path} href={route.path}>
                      <div className="px-3 py-2 rounded border border-border hover:bg-accent/50 transition-colors cursor-pointer text-xs flex items-center gap-2 group">
                        <Route className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate group-hover:text-primary">{route.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">User Entry Flow</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The journey a new member experiences from first visit to full engagement.
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
                  {[
                    { step: 1, path: "/", label: "Landing Page", desc: "L.A.W.S. Collective intro slideshow with business name simulator" },
                    { step: 2, path: "/join", label: "Join Journey", desc: "Interactive onboarding preview and waitlist signup" },
                    { step: 3, path: "/signup", label: "Sign Up", desc: "Account creation via Manus OAuth" },
                    { step: 4, path: "/onboarding", label: "Member Onboarding", desc: "Guided setup: profile, house selection, token activation" },
                    { step: 5, path: "/getting-started", label: "Getting Started", desc: "Orientation checklist and first steps" },
                    { step: 6, path: "/academy", label: "Academy", desc: "Training courses, certifications, specialist tracks" },
                    { step: 7, path: "/business-simulator", label: "Business Simulator", desc: "Test business ideas with AI-powered simulation" },
                    { step: 8, path: "/business-formation", label: "Business Formation", desc: "Formal entity setup with document generation" },
                    { step: 9, path: "/dashboard", label: "Full Dashboard", desc: "Complete system access with all modules" },
                    { step: 10, path: "/contractor-transition", label: "Contractor Transition", desc: "2-year mark: employee → contractor + board member path" },
                  ].map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm group-hover:text-primary">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <code className="text-[10px] text-muted-foreground font-mono hidden sm:block">{item.path}</code>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
