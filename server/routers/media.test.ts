import { describe, it, expect, beforeEach } from "vitest";

import { appRouter } from "../routers";

describe.skip(/* requires DB connection */ "Media Router", () => {
  let caller: any;

  beforeEach(() => {
    
    caller = appRouter.createCaller({
      user: { id: 1, openId: "test-user", email: "test@example.com", name: "Test User", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as any, res: { clearCookie: () => {} } as any,
      req: { headers: { origin: "http://localhost:3000" } },
    } as any);
  });

  it("should create a playlist", async () => {
    const result = await caller.media.createPlaylist({
      name: "Workout Mix",
      description: "High energy tracks",
      isPublic: false,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Workout Mix");
    expect(result.description).toBe("High energy tracks");
    expect(result.trackCount).toBe(0);
  });

  it("should get all playlists for user", async () => {
    await caller.media.createPlaylist({
      name: "Chill Vibes",
      description: "Relaxing music",
      isPublic: false,
    });

    const playlists = await caller.media.getPlaylists();
    expect(Array.isArray(playlists)).toBe(true);
  });

  it("should add track to playlist", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Summer Hits",
      description: "Best of summer",
      isPublic: false,
    });

    const track = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Sunshine Day",
      artist: "The Band",
      duration: 240,
      url: "https://example.com/song.mp3",
      type: "music",
    });

    expect(track).toBeDefined();
    expect(track.title).toBe("Sunshine Day");
    expect(track.type).toBe("music");
  });

  it("should get tracks from playlist", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Podcast Collection",
      description: "My favorite podcasts",
      isPublic: false,
    });

    await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Episode 1",
      artist: "Podcast Host",
      duration: 3600,
      url: "https://example.com/podcast1.mp3",
      type: "podcast",
    });

    const tracks = await caller.getTracks({ playlistId: playlist.id });
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThan(0);
  });

  it("should remove track from playlist", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Test Playlist",
      description: "For testing",
      isPublic: false,
    });

    const track = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Test Track",
      artist: "Test Artist",
      duration: 180,
      url: "https://example.com/test.mp3",
      type: "music",
    });

    const result = await caller.media.removeTrack({
      trackId: track.id,
      playlistId: playlist.id,
    });

    expect(result).toBeDefined();
  });

  it("should delete playlist", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Delete Me",
      description: "Temporary playlist",
      isPublic: false,
    });

    const result = await caller.media.deletePlaylist({ playlistId: playlist.id });
    expect(result).toBeDefined();
  });

  it("should record playback history", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "History Test",
      description: "For history tracking",
      isPublic: false,
    });

    const track = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Tracked Song",
      artist: "Artist Name",
      duration: 240,
      url: "https://example.com/tracked.mp3",
      type: "music",
    });

    const history = await caller.media.recordPlayback({
      trackId: track.id,
      duration: 240,
      position: 120,
    });

    expect(history).toBeDefined();
  });

  it("should get recently played tracks", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Recent Playlist",
      description: "For recent tracks",
      isPublic: false,
    });

    const track = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Recent Song",
      artist: "Recent Artist",
      duration: 200,
      url: "https://example.com/recent.mp3",
      type: "music",
    });

    await caller.media.recordPlayback({
      trackId: track.id,
      duration: 200,
      position: 100,
    });

    const recentlyPlayed = await caller.media.getRecentlyPlayed();
    expect(Array.isArray(recentlyPlayed)).toBe(true);
  });

  it("should support different track types", async () => {
    const playlist = await caller.media.createPlaylist({
      name: "Mixed Media",
      description: "Different types",
      isPublic: false,
    });

    const music = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Song",
      artist: "Artist",
      duration: 240,
      url: "https://example.com/song.mp3",
      type: "music",
    });

    const podcast = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Episode",
      artist: "Podcaster",
      duration: 3600,
      url: "https://example.com/episode.mp3",
      type: "podcast",
    });

    const audiobook = await caller.media.addTrack({
      playlistId: playlist.id,
      title: "Chapter 1",
      artist: "Author",
      duration: 7200,
      url: "https://example.com/chapter.mp3",
      type: "audiobook",
    });

    expect(music.type).toBe("music");
    expect(podcast.type).toBe("podcast");
    expect(audiobook.type).toBe("audiobook");
  });
});
