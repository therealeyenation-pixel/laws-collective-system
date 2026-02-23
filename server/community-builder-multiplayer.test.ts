import { describe, it, expect } from 'vitest';
import {
  generateLobbyId,
  generateVoteId,
  createLobby,
  joinLobby,
  leaveLobby,
  checkLobbyReady,
  startGame,
  createMatchmakingRequest,
  findMatchingLobbies,
  matchPlayers,
  createVote,
  castVote,
  closeVote,
  createResourceShare,
  respondToResourceShare,
  executeResourceTransfer,
  addChatMessage,
  assignRole,
  getLobbyStats,
  type Player,
  type Lobby
} from './services/community-builder-multiplayer';

describe('Community Builder Multiplayer Service', () => {
  const createMockPlayer = (id: string, name: string): Player => ({
    id,
    name,
    status: 'idle',
    resources: {
      tokens: 100,
      laborHours: 40,
      skillPoints: { building: 5, management: 3 },
      landUnits: 2
    },
    achievements: ['quest_complete'],
    questProgress: 75,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  describe('ID Generation', () => {
    it('should generate unique lobby IDs', () => {
      const id1 = generateLobbyId();
      const id2 = generateLobbyId();
      
      expect(id1).toMatch(/^LOBBY-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate unique vote IDs', () => {
      const id1 = generateVoteId();
      const id2 = generateVoteId();
      
      expect(id1).toMatch(/^VOTE-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Lobby Management', () => {
    it('should create lobby with host', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby = createLobby(host, 'Test Lobby');
      
      expect(lobby.id).toMatch(/^LOBBY-/);
      expect(lobby.name).toBe('Test Lobby');
      expect(lobby.host).toBe('player1');
      expect(lobby.players.length).toBe(1);
      expect(lobby.status).toBe('waiting');
    });

    it('should allow players to join lobby', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby = createLobby(host, 'Test Lobby');
      const player2 = createMockPlayer('player2', 'Bob');
      
      const result = joinLobby(lobby, player2);
      
      expect(result.success).toBe(true);
      expect(result.lobby?.players.length).toBe(2);
    });

    it('should prevent joining full lobby', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby');
      lobby = { ...lobby, maxPlayers: 2 };
      
      const player2 = createMockPlayer('player2', 'Bob');
      const result1 = joinLobby(lobby, player2);
      
      const player3 = createMockPlayer('player3', 'Charlie');
      const result2 = joinLobby(result1.lobby!, player3);
      
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('full');
    });

    it('should handle player leaving lobby', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby');
      const player2 = createMockPlayer('player2', 'Bob');
      lobby = joinLobby(lobby, player2).lobby!;
      
      const result = leaveLobby(lobby, 'player2');
      
      expect(result.success).toBe(true);
      expect(result.lobby?.players.length).toBe(1);
    });

    it('should transfer host when host leaves', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby');
      const player2 = createMockPlayer('player2', 'Bob');
      lobby = joinLobby(lobby, player2).lobby!;
      
      const result = leaveLobby(lobby, 'player1');
      
      expect(result.success).toBe(true);
      expect(result.lobby?.host).toBe('player2');
    });

    it('should disband lobby when last player leaves', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby = createLobby(host, 'Test Lobby');
      
      const result = leaveLobby(lobby, 'player1');
      
      expect(result.success).toBe(true);
      expect(result.disbanded).toBe(true);
    });
  });

  describe('Lobby Ready Check', () => {
    it('should require minimum players', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby = createLobby(host, 'Test Lobby');
      
      const result = checkLobbyReady(lobby);
      
      expect(result.ready).toBe(false);
      expect(result.reasons.some(r => r.includes('players'))).toBe(true);
    });

    it('should require roles in cooperative mode', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby', { gameMode: 'cooperative' });
      const player2 = createMockPlayer('player2', 'Bob');
      lobby = joinLobby(lobby, player2).lobby!;
      
      const result = checkLobbyReady(lobby);
      
      expect(result.ready).toBe(false);
      expect(result.reasons.some(r => r.includes('role'))).toBe(true);
    });
  });

  describe('Game Start', () => {
    it('should start game when ready', () => {
      const host = { ...createMockPlayer('player1', 'Alice'), role: 'builder' as const };
      let lobby = createLobby(host, 'Test Lobby', { gameMode: 'cooperative' });
      const player2 = { ...createMockPlayer('player2', 'Bob'), role: 'manager' as const };
      lobby = joinLobby(lobby, player2).lobby!;
      lobby.players = lobby.players.map(p => ({ ...p, role: p.id === 'player1' ? 'builder' : 'manager' })) as Player[];
      
      const result = startGame(lobby);
      
      expect(result.success).toBe(true);
      expect(result.lobby?.status).toBe('in_progress');
    });
  });

  describe('Matchmaking', () => {
    it('should create matchmaking request', () => {
      const player = createMockPlayer('player1', 'Alice');
      const request = createMatchmakingRequest(player, {
        gameMode: 'cooperative',
        difficulty: 'normal',
        playerCount: { min: 2, max: 4 }
      });
      
      expect(request.playerId).toBe('player1');
      expect(request.preferences.gameMode).toBe('cooperative');
    });

    it('should find matching lobbies', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby1 = createLobby(host, 'Coop Lobby', { gameMode: 'cooperative', difficulty: 'normal' });
      const lobby2 = createLobby(host, 'Comp Lobby', { gameMode: 'competitive', difficulty: 'hard' });
      
      const request = createMatchmakingRequest(createMockPlayer('player2', 'Bob'), {
        gameMode: 'cooperative',
        difficulty: 'normal',
        playerCount: { min: 2, max: 4 }
      });
      
      const matches = findMatchingLobbies([lobby1, lobby2], request);
      
      expect(matches.length).toBe(1);
      expect(matches[0].name).toBe('Coop Lobby');
    });

    it('should match compatible players', () => {
      const requests = [
        createMatchmakingRequest(createMockPlayer('p1', 'Alice'), { gameMode: 'cooperative', difficulty: 'normal', playerCount: { min: 2, max: 4 } }),
        createMatchmakingRequest(createMockPlayer('p2', 'Bob'), { gameMode: 'cooperative', difficulty: 'normal', playerCount: { min: 2, max: 4 } }),
        createMatchmakingRequest(createMockPlayer('p3', 'Charlie'), { gameMode: 'competitive', difficulty: 'hard', playerCount: { min: 2, max: 4 } })
      ];
      
      const result = matchPlayers(requests);
      
      expect(result.matched.length).toBeGreaterThan(0);
    });
  });

  describe('Voting System', () => {
    it('should create vote', () => {
      const vote = createVote(
        'LOBBY-123',
        'player1',
        'resource_allocation',
        'Build School',
        'Should we build a school?',
        [{ label: 'Yes' }, { label: 'No' }]
      );
      
      expect(vote.id).toMatch(/^VOTE-/);
      expect(vote.options.length).toBe(2);
      expect(vote.status).toBe('open');
    });

    it('should allow casting votes', () => {
      const vote = createVote(
        'LOBBY-123',
        'player1',
        'resource_allocation',
        'Build School',
        'Should we build a school?',
        [{ label: 'Yes' }, { label: 'No' }]
      );
      
      const result = castVote(vote, 'player2', 'OPT-1');
      
      expect(result.success).toBe(true);
      expect(result.vote?.votes.length).toBe(1);
    });

    it('should prevent double voting', () => {
      let vote = createVote(
        'LOBBY-123',
        'player1',
        'resource_allocation',
        'Build School',
        'Should we build a school?',
        [{ label: 'Yes' }, { label: 'No' }]
      );
      
      vote = castVote(vote, 'player2', 'OPT-1').vote!;
      const result = castVote(vote, 'player2', 'OPT-2');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already voted');
    });

    it('should close vote and determine result', () => {
      let vote = createVote(
        'LOBBY-123',
        'player1',
        'resource_allocation',
        'Build School',
        'Should we build a school?',
        [{ label: 'Yes' }, { label: 'No' }]
      );
      
      vote = castVote(vote, 'player1', 'OPT-1').vote!;
      vote = castVote(vote, 'player2', 'OPT-1').vote!;
      vote = castVote(vote, 'player3', 'OPT-2').vote!;
      
      const closed = closeVote(vote, 3);
      
      expect(closed.status).toBe('passed');
      expect(closed.result).toBe('Yes');
    });
  });

  describe('Resource Sharing', () => {
    it('should create resource share request', () => {
      const share = createResourceShare('player1', 'player2', { tokens: 50 }, 'Here are some tokens');
      
      expect(share.id).toMatch(/^SHARE-/);
      expect(share.status).toBe('pending');
      expect(share.resources.tokens).toBe(50);
    });

    it('should handle share response', () => {
      const share = createResourceShare('player1', 'player2', { tokens: 50 });
      const accepted = respondToResourceShare(share, true);
      
      expect(accepted.status).toBe('accepted');
    });

    it('should execute resource transfer', () => {
      const share = respondToResourceShare(
        createResourceShare('player1', 'player2', { tokens: 50 }),
        true
      );
      
      const player1 = createMockPlayer('player1', 'Alice');
      const player2 = createMockPlayer('player2', 'Bob');
      
      const result = executeResourceTransfer(share, player1, player2);
      
      expect(result.success).toBe(true);
      expect(result.fromPlayer?.resources.tokens).toBe(50);
      expect(result.toPlayer?.resources.tokens).toBe(150);
    });

    it('should prevent transfer with insufficient resources', () => {
      const share = respondToResourceShare(
        createResourceShare('player1', 'player2', { tokens: 500 }),
        true
      );
      
      const player1 = createMockPlayer('player1', 'Alice');
      const player2 = createMockPlayer('player2', 'Bob');
      
      const result = executeResourceTransfer(share, player1, player2);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient');
    });
  });

  describe('Chat', () => {
    it('should add chat messages', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby');
      
      lobby = addChatMessage(lobby, 'player1', 'Alice', 'Hello everyone!');
      
      const lastMessage = lobby.chat[lobby.chat.length - 1];
      expect(lastMessage.message).toBe('Hello everyone!');
      expect(lastMessage.type).toBe('chat');
    });
  });

  describe('Role Assignment', () => {
    it('should assign role to player', () => {
      const host = createMockPlayer('player1', 'Alice');
      const lobby = createLobby(host, 'Test Lobby', { gameMode: 'cooperative' });
      
      const result = assignRole(lobby, 'player1', 'builder');
      
      expect(result.success).toBe(true);
      expect(result.lobby?.players[0].role).toBe('builder');
    });

    it('should prevent duplicate roles in cooperative mode', () => {
      const host = createMockPlayer('player1', 'Alice');
      let lobby = createLobby(host, 'Test Lobby', { gameMode: 'cooperative' });
      const player2 = createMockPlayer('player2', 'Bob');
      lobby = joinLobby(lobby, player2).lobby!;
      
      lobby = assignRole(lobby, 'player1', 'builder').lobby!;
      const result = assignRole(lobby, 'player2', 'builder');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already taken');
    });
  });

  describe('Lobby Statistics', () => {
    it('should calculate lobby stats', () => {
      const host = { ...createMockPlayer('player1', 'Alice'), role: 'builder' as const };
      let lobby = createLobby(host, 'Test Lobby');
      const player2 = { ...createMockPlayer('player2', 'Bob'), role: 'manager' as const };
      lobby = joinLobby(lobby, player2).lobby!;
      
      const stats = getLobbyStats(lobby);
      
      expect(stats.playerCount).toBe(2);
      expect(stats.totalResources.tokens).toBe(200);
      expect(stats.averageQuestProgress).toBe(75);
    });
  });
});
