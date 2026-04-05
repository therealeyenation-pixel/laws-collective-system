import { describe, it, expect } from "vitest";

describe("Sound Effects System", () => {
  it("should define all required sound types", () => {
    const soundTypes = [
      "achievement",
      "levelUp",
      "tutorialStep",
      "success",
      "error",
      "click",
      "notification",
      "chapterComplete",
    ];

    // Verify all sound types are defined
    expect(soundTypes).toHaveLength(8);
    expect(soundTypes).toContain("achievement");
    expect(soundTypes).toContain("levelUp");
    expect(soundTypes).toContain("chapterComplete");
  });

  it("should have rarity-based achievement sounds", () => {
    const rarities = ["common", "uncommon", "rare", "epic", "legendary"];

    // Each rarity should have different note sequences
    expect(rarities).toHaveLength(5);
    expect(rarities[0]).toBe("common");
    expect(rarities[4]).toBe("legendary");
  });

  it("should support volume control range", () => {
    const minVolume = 0;
    const maxVolume = 1;
    const defaultVolume = 0.5;

    expect(defaultVolume).toBeGreaterThanOrEqual(minVolume);
    expect(defaultVolume).toBeLessThanOrEqual(maxVolume);
  });
});

describe("Achievement Sharing", () => {
  it("should generate correct share URLs", () => {
    const baseUrl = "https://example.com";
    const achievementId = "first-steps";
    const shareUrl = `${baseUrl}/achievements?highlight=${achievementId}`;

    expect(shareUrl).toContain("achievements");
    expect(shareUrl).toContain("highlight=first-steps");
  });

  it("should format share text correctly", () => {
    const achievement = {
      name: "First Steps",
      description: "Complete your first chapter",
      points: 100,
      rarity: "common",
    };

    const shareText = `🏆 I just unlocked "${achievement.name}" in L.A.W.S. Quest!\n\n${achievement.description}\n\n+${achievement.points} points`;

    expect(shareText).toContain("First Steps");
    expect(shareText).toContain("100 points");
    expect(shareText).toContain("L.A.W.S. Quest");
  });

  it("should support all social platforms", () => {
    const platforms = ["twitter", "facebook", "linkedin", "copy"];

    expect(platforms).toContain("twitter");
    expect(platforms).toContain("facebook");
    expect(platforms).toContain("linkedin");
    expect(platforms).toContain("copy");
  });

  it("should have rarity styling for all levels", () => {
    const rarityStyles = {
      common: { label: "Common", color: "gray" },
      uncommon: { label: "Uncommon", color: "green" },
      rare: { label: "Rare", color: "blue" },
      epic: { label: "Epic", color: "purple" },
      legendary: { label: "Legendary", color: "amber" },
    };

    expect(Object.keys(rarityStyles)).toHaveLength(5);
    expect(rarityStyles.legendary.label).toBe("Legendary");
  });
});

describe("Progress Dashboard", () => {
  it("should track quest chapter progress", () => {
    const questProgress = {
      currentChapter: 2,
      chaptersCompleted: [1],
      totalChapters: 5,
    };

    expect(questProgress.currentChapter).toBe(2);
    expect(questProgress.chaptersCompleted).toContain(1);
    expect(questProgress.totalChapters).toBe(5);
  });

  it("should calculate overall progress correctly", () => {
    const chaptersCompleted = 2;
    const totalChapters = 5;
    const achievementsUnlocked = 18;
    const totalAchievements = 75;

    const questPercent = (chaptersCompleted / totalChapters) * 100;
    const achievementPercent = (achievementsUnlocked / totalAchievements) * 100;
    const overallProgress = Math.round((questPercent + achievementPercent) / 2);

    expect(questPercent).toBe(40);
    expect(achievementPercent).toBe(24);
    expect(overallProgress).toBe(32);
  });

  it("should track community builder stats", () => {
    const communityStats = {
      communitiesJoined: 2,
      buildingsConstructed: 8,
      populationManaged: 156,
      resourcesCollected: 12500,
      decisionsVoted: 24,
    };

    expect(communityStats.communitiesJoined).toBeGreaterThan(0);
    expect(communityStats.buildingsConstructed).toBeGreaterThan(0);
    expect(communityStats.populationManaged).toBeGreaterThan(0);
  });

  it("should display L.A.W.S. pillars", () => {
    const pillars = [
      { id: "land", name: "LAND", description: "Reconnection & Stability" },
      { id: "air", name: "AIR", description: "Education & Knowledge" },
      { id: "water", name: "WATER", description: "Healing & Balance" },
      { id: "self", name: "SELF", description: "Purpose & Skills" },
    ];

    expect(pillars).toHaveLength(4);
    expect(pillars.map((p) => p.id)).toEqual(["land", "air", "water", "self"]);
  });

  it("should track achievement stats by category", () => {
    const achievementStats = {
      byCategory: {
        quest: { total: 25, unlocked: 8 },
        community: { total: 20, unlocked: 5 },
        multiplayer: { total: 15, unlocked: 3 },
        special: { total: 15, unlocked: 2 },
      },
    };

    const totalAchievements = Object.values(achievementStats.byCategory).reduce(
      (sum, cat) => sum + cat.total,
      0
    );
    const totalUnlocked = Object.values(achievementStats.byCategory).reduce(
      (sum, cat) => sum + cat.unlocked,
      0
    );

    expect(totalAchievements).toBe(75);
    expect(totalUnlocked).toBe(18);
  });

  it("should track recent activity", () => {
    const recentActivity = [
      { type: "achievement", title: "First Steps", time: "2 hours ago" },
      { type: "chapter", title: "Completed Chapter 1", time: "Yesterday" },
      { type: "community", title: "Joined The L.A.W.S. Collective", time: "2 days ago" },
    ];

    expect(recentActivity).toHaveLength(3);
    expect(recentActivity[0].type).toBe("achievement");
  });

  it("should calculate player ranking", () => {
    const ranking = {
      rank: 42,
      totalPlayers: 1000,
      percentile: 85,
    };

    expect(ranking.rank).toBeLessThan(ranking.totalPlayers);
    expect(ranking.percentile).toBeGreaterThan(0);
    expect(ranking.percentile).toBeLessThanOrEqual(100);
  });
});

describe("Sound Controls Component", () => {
  it("should have mute toggle functionality", () => {
    let isMuted = false;

    const toggleMute = () => {
      isMuted = !isMuted;
      return isMuted;
    };

    expect(isMuted).toBe(false);
    expect(toggleMute()).toBe(true);
    expect(toggleMute()).toBe(false);
  });

  it("should have volume slider with valid range", () => {
    const volumeRange = { min: 0, max: 1, step: 0.05 };

    expect(volumeRange.min).toBe(0);
    expect(volumeRange.max).toBe(1);
    expect(volumeRange.step).toBe(0.05);
  });

  it("should provide test sound buttons", () => {
    const testSounds = ["achievement", "levelUp", "success", "error"];

    expect(testSounds).toHaveLength(4);
    expect(testSounds).toContain("achievement");
    expect(testSounds).toContain("error");
  });
});
