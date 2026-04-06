import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BroadcastChannels from "./BroadcastChannels";
import { trpc } from "@/lib/trpc";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    broadcast: {
      channels: {
        getAll: {
          useQuery: vi.fn(),
        },
        create: {
          useMutation: vi.fn(),
        },
        update: {
          useMutation: vi.fn(),
        },
        delete: {
          useMutation: vi.fn(),
        },
      },
      seed: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BroadcastChannels Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    vi.mocked(trpc.broadcast.channels.getAll.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    render(<BroadcastChannels />);
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("should render empty state when no channels", () => {
    vi.mocked(trpc.broadcast.channels.getAll.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.broadcast.seed.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<BroadcastChannels />);
    expect(screen.getByText(/No channels yet/i)).toBeInTheDocument();
  });

  it("should render channels list", () => {
    const mockChannels = [
      {
        id: 1,
        userId: 1,
        name: "L.A.W.S. Radio",
        slug: "laws-radio",
        description: "Community education",
        category: "education",
        language: "en",
        status: "active",
        coverImageUrl: "/images/laws-radio.jpg",
        bannerImageUrl: "/images/laws-radio-banner.jpg",
        websiteUrl: "https://lawscollective.org",
        broadcastFormat: "live_radio",
        isMonetized: false,
        monetizationTier: "free",
        totalEpisodes: 5,
        totalListeners: 100,
        totalDownloads: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(trpc.broadcast.channels.getAll.useQuery).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(<BroadcastChannels />);
    expect(screen.getByText("L.A.W.S. Radio")).toBeInTheDocument();
    expect(screen.getByText("Community education")).toBeInTheDocument();
  });

  it("should render create channel form when button clicked", async () => {
    vi.mocked(trpc.broadcast.channels.getAll.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.broadcast.seed.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<BroadcastChannels />);
    const newChannelButton = screen.getByText(/New Channel/i);
    fireEvent.click(newChannelButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Channel/i)).toBeInTheDocument();
    });
  });

  it("should have seed data button", () => {
    vi.mocked(trpc.broadcast.channels.getAll.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.broadcast.seed.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<BroadcastChannels />);
    expect(screen.getByText(/Seed Data/i)).toBeInTheDocument();
  });
});
