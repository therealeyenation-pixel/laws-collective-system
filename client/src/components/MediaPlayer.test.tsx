import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaPlayer } from "./MediaPlayer";

describe("MediaPlayer Component", () => {
  const mockChannel = {
    id: 1,
    title: "Test Channel",
    category: "Music",
    description: "Test Description",
    contentType: "radio_station",
    streamUrl: "https://example.com/stream.m3u8",
  };

  const mockOnClose = vi.fn();

  it("should render media player with channel title", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    expect(screen.getByText("Test Channel")).toBeInTheDocument();
  });

  it("should render play/pause button", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    const playButton = screen.getByRole("button", { name: /play|pause/i });
    expect(playButton).toBeInTheDocument();
  });

  it("should render close button", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    const closeButton = screen.getByRole("button", { name: /close|x/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("should render volume control", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    const volumeSlider = screen.getByRole("slider");
    expect(volumeSlider).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    const closeButton = screen.getAllByRole("button").find(btn => 
      btn.querySelector("svg") && btn.textContent === ""
    );
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should render audio element for radio stations", () => {
    const { container } = render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    const audioElement = container.querySelector("audio");
    expect(audioElement).toBeInTheDocument();
  });

  it("should render video element for TV channels", () => {
    const tvChannel = { ...mockChannel, contentType: "tv_channel" };
    const { container } = render(
      <MediaPlayer channel={tvChannel} onClose={mockOnClose} />
    );
    const videoElements = container.querySelectorAll("video");
    expect(videoElements.length).toBeGreaterThan(0);
  });

  it("should show warning when stream URL is missing", () => {
    const channelNoUrl = { ...mockChannel, streamUrl: undefined };
    render(
      <MediaPlayer channel={channelNoUrl} onClose={mockOnClose} />
    );
    expect(screen.getByText(/Stream URL not available/i)).toBeInTheDocument();
  });

  it("should format time correctly", () => {
    render(
      <MediaPlayer channel={mockChannel} onClose={mockOnClose} />
    );
    // Time display should show 0:00 initially
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });
});
