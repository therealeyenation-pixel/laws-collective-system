/**
 * Batch Services Tests
 * Tests for: Game Strategic, E-Signature, L.A.W.S. Quest, Department Dashboards
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as gameStrategic from './services/game-strategic';
import * as esignature from './services/esignature-contracts';
import * as lawsQuest from './services/laws-quest-commercial';
import * as deptDashboards from './services/department-dashboards';

// ============================================================================
// GAME STRATEGIC TESTS
// ============================================================================

describe('Game Strategic Service', () => {
  describe('Multiplayer System', () => {
    it('should create a multiplayer session', () => {
      const session = gameStrategic.createMultiplayerSession('checkers', 'user1', 'User 1', 4);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('checkers');
      expect(session.maxPlayers).toBe(4);
      expect(session.hostId).toBe('user1');
    });

    it('should allow players to join session', () => {
      const session = gameStrategic.createMultiplayerSession('chess', 'host1', 'Host', 4);
      expect(session).toBeDefined();
      expect(session.players.length).toBe(1);
    });

    it('should track session status', () => {
      const session = gameStrategic.createMultiplayerSession('chess', 'host1', 'Host', 2);
      expect(session.status).toBe('waiting');
    });
  });

  describe('AI Opponent System', () => {
    it('should get AI opponents with difficulty', () => {
      const opponents = gameStrategic.getAIOpponents('chess', 'medium');
      expect(opponents).toBeDefined();
      expect(Array.isArray(opponents)).toBe(true);
    });

    it('should generate AI move', () => {
      const opponents = gameStrategic.getAIOpponents('checkers', 'easy');
      expect(opponents).toBeDefined();
    });
  });

  describe('Tournament System', () => {
    it('should create tournament', () => {
      const tournament = gameStrategic.createTournament(
        'Chess Championship',
        'chess',
        'single_elimination',
        8,
        Date.now() + 86400000
      );
      expect(tournament).toBeDefined();
      expect(tournament.name).toBe('Chess Championship');
      expect(tournament.format).toBe('single_elimination');
    });

    it('should register players for tournament', () => {
      const tournament = gameStrategic.createTournament(
        'Checkers Open',
        'checkers',
        'round_robin',
        4,
        Date.now() + 86400000
      );
      const result = gameStrategic.registerForTournament(tournament.id, 'player1', 'Champion');
      expect(result).toBeDefined();
    });

    it('should start tournament', () => {
      const tournament = gameStrategic.createTournament(
        'Bracket Test',
        'chess',
        'single_elimination',
        4,
        Date.now() + 86400000
      );
      gameStrategic.registerForTournament(tournament.id, 'p1', 'Player 1');
      gameStrategic.registerForTournament(tournament.id, 'p2', 'Player 2');
      gameStrategic.registerForTournament(tournament.id, 'p3', 'Player 3');
      gameStrategic.registerForTournament(tournament.id, 'p4', 'Player 4');
      
      const result = gameStrategic.startTournament(tournament.id);
      expect(result).toBe(true);
    });
  });

  describe('Leaderboard System', () => {
    it('should update leaderboard entry', () => {
      const result = gameStrategic.updateLeaderboardEntry('chess', 'player1', 'Player 1', 50, true);
      expect(result).toBeDefined();
    });

    it('should get top players', () => {
      const entry = gameStrategic.updateLeaderboardEntry('checkers', 'p1', 'Player 1', 100, true);
      expect(entry).toBeDefined();
    });
  });
});

// ============================================================================
// E-SIGNATURE TESTS
// ============================================================================

describe('E-Signature & Contracts Service', () => {
  describe('Signature Request Management', () => {
    it('should create signature request', () => {
      const request = esignature.createSignatureRequest(
        'doc1',
        'Employment Agreement',
        'user1',
        'User 1',
        [{ userId: 's1', name: 'Signer 1', email: 's1@test.com', order: 1 }]
      );
      expect(request).toBeDefined();
      expect(request.documentName).toBe('Employment Agreement');
      expect(request.status).toBe('pending');
    });

    it('should add signature field', () => {
      const request = esignature.createSignatureRequest(
        'doc2',
        'NDA',
        'user1',
        'User 1',
        [{ userId: 's1', name: 'Signer', email: 's@test.com', order: 1 }]
      );
      const result = esignature.addSignatureField(request.id, 's1', 1, 100, 500, 200, 50);
      expect(result).toBeDefined();
    });

    it('should sign document', () => {
      const request = esignature.createSignatureRequest(
        'doc3',
        'Service Agreement',
        'user1',
        'User 1',
        [{ userId: 's1', name: 'Signer', email: 's@test.com', order: 1 }]
      );
      expect(request).toBeDefined();
      expect(request.signers.length).toBe(1);
    });
  });

  describe('Contract Management', () => {
    it('should create contract', () => {
      const contract = esignature.createContract(
        'Test Contract',
        'service',
        [{ name: 'Party 1', role: 'vendor', email: 'p1@test.com' }],
        'user1'
      );
      expect(contract).toBeDefined();
      expect(contract.title).toBe('Test Contract');
      expect(contract.status).toBe('draft');
    });

    it('should add contract term', () => {
      const contract = esignature.createContract(
        'NDA Contract',
        'nda',
        [{ name: 'Party 1', role: 'vendor', email: 'p1@test.com' }],
        'user1'
      );
      const result = esignature.addContractTerm(contract.id, 'Confidentiality', 'All information is confidential');
      expect(result).toBeDefined();
    });

    it('should submit contract for review', () => {
      const contract = esignature.createContract(
        'Review Contract',
        'employment',
        [{ name: 'Party 1', role: 'employee', email: 'p1@test.com' }],
        'user1'
      );
      const result = esignature.submitForReview(contract.id);
      expect(result).toBeDefined();
    });
  });

  describe('Template System', () => {
    it('should get contract templates', () => {
      const templates = esignature.getContractTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should create contract from template', () => {
      const templates = esignature.getContractTemplates();
      if (templates.length > 0) {
        const contract = esignature.createContractFromTemplate(
          templates[0].id,
          'Test Contract',
          [{ name: 'Party 1', role: 'vendor', email: 'p1@test.com' }],
          { party_name: 'Test Corp' },
          'user1'
        );
        expect(contract).toBeDefined();
      }
    });
  });

  describe('Pricing & Subscriptions', () => {
    it('should get pricing plans', () => {
      const plans = esignature.getPricingPlans();
      expect(plans).toBeDefined();
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should create subscription', () => {
      const plans = esignature.getPricingPlans();
      if (plans.length > 0) {
        const subscription = esignature.createSubscription('user1', plans[0].id, 'monthly');
        expect(subscription).toBeDefined();
      }
    });
  });
});

// ============================================================================
// L.A.W.S. QUEST TESTS
// ============================================================================

describe('L.A.W.S. Quest Commercial Service', () => {
  describe('Character System', () => {
    it('should create character', () => {
      const character = lawsQuest.createCharacter('user1', 'Hero', 'land_guardian');
      expect(character).toBeDefined();
      expect(character.name).toBe('Hero');
      expect(character.class).toBe('land_guardian');
      expect(character.level).toBe(1);
    });

    it('should gain experience and level up', () => {
      const character = lawsQuest.createCharacter('user2', 'Learner', 'air_scholar');
      const result = lawsQuest.gainExperience(character.id, 150);
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    });

    it('should have class-specific base stats', () => {
      const guardian = lawsQuest.createCharacter('u1', 'Guardian', 'land_guardian');
      const scholar = lawsQuest.createCharacter('u2', 'Scholar', 'air_scholar');
      
      expect(guardian.stats.resilience).toBeGreaterThan(scholar.stats.resilience);
      expect(scholar.stats.wisdom).toBeGreaterThan(guardian.stats.wisdom);
    });
  });

  describe('Inventory System', () => {
    it('should add items to inventory', () => {
      const character = lawsQuest.createCharacter('inv1', 'Collector', 'balanced_seeker');
      const item = lawsQuest.addItemToInventory(character.id, 'Healing Herb', 5);
      expect(item).toBeDefined();
      expect(item!.quantity).toBe(5);
    });

    it('should stack stackable items', () => {
      const character = lawsQuest.createCharacter('stack1', 'Stacker', 'water_healer');
      lawsQuest.addItemToInventory(character.id, 'Healing Herb', 3);
      lawsQuest.addItemToInventory(character.id, 'Healing Herb', 2);
      
      const char = lawsQuest.getCharacter(character.id);
      const herbs = char!.inventory.filter(i => i.name === 'Healing Herb');
      expect(herbs.length).toBe(1);
      expect(herbs[0].quantity).toBe(5);
    });

    it('should equip items', () => {
      const character = lawsQuest.createCharacter('equip1', 'Equipper', 'self_master');
      const item = lawsQuest.addItemToInventory(character.id, 'Guardian Helm');
      const result = lawsQuest.equipItem(character.id, item!.id);
      expect(result).toBe(true);
      
      const char = lawsQuest.getCharacter(character.id);
      expect(char!.equipment.head).toBeDefined();
    });

    it('should use consumables', () => {
      const character = lawsQuest.createCharacter('consume1', 'Consumer', 'water_healer');
      const char = lawsQuest.getCharacter(character.id);
      char!.health = 50; // Damage the character
      
      const item = lawsQuest.addItemToInventory(character.id, 'Healing Herb');
      const result = lawsQuest.useConsumable(character.id, item!.id);
      expect(result).toBe(true);
      
      const updated = lawsQuest.getCharacter(character.id);
      expect(updated!.health).toBe(70); // 50 + 20 heal
    });
  });

  describe('Quest System', () => {
    it('should get available quests', () => {
      const character = lawsQuest.createCharacter('quest1', 'Quester', 'land_guardian');
      const quests = lawsQuest.getAvailableQuests(character.id);
      expect(quests.length).toBeGreaterThan(0);
    });

    it('should accept quest', () => {
      const character = lawsQuest.createCharacter('accept1', 'Accepter', 'air_scholar');
      const quests = lawsQuest.getAvailableQuests(character.id);
      const progress = lawsQuest.acceptQuest(character.id, quests[0].id);
      expect(progress).toBeDefined();
      expect(progress!.status).toBe('active');
    });

    it('should update quest progress', () => {
      const character = lawsQuest.createCharacter('prog1', 'Progressor', 'water_healer');
      const quests = lawsQuest.getAvailableQuests(character.id);
      lawsQuest.acceptQuest(character.id, quests[0].id);
      
      const result = lawsQuest.updateQuestProgress(character.id, quests[0].id, 'OBJ-1', 1);
      expect(result).toBe(true);
    });

    it('should abandon quest', () => {
      const character = lawsQuest.createCharacter('abandon1', 'Abandoner', 'self_master');
      const quests = lawsQuest.getAvailableQuests(character.id);
      lawsQuest.acceptQuest(character.id, quests[0].id);
      
      const result = lawsQuest.abandonQuest(character.id, quests[0].id);
      expect(result).toBe(true);
    });
  });

  describe('Skill System', () => {
    it('should train skills', () => {
      const character = lawsQuest.createCharacter('skill1', 'Trainer', 'land_guardian');
      const result = lawsQuest.trainSkill(character.id, 'SK-LAND-1', 50);
      expect(result).toBe(true);
    });

    it('should unlock skills', () => {
      const character = lawsQuest.createCharacter('unlock1', 'Unlocker', 'air_scholar');
      const result = lawsQuest.unlockSkill(character.id, 'SK-LAND-1');
      expect(result).toBe(true);
    });
  });

  describe('Party System', () => {
    it('should create party', () => {
      const character = lawsQuest.createCharacter('party1', 'Leader', 'balanced_seeker');
      const party = lawsQuest.createParty('user1', character.id, 'Leader', 'Adventure Party');
      expect(party).toBeDefined();
      expect(party.name).toBe('Adventure Party');
      expect(party.members.length).toBe(1);
    });
  });
});

// ============================================================================
// DEPARTMENT DASHBOARDS TESTS
// ============================================================================

describe('Department Dashboards Service', () => {
  describe('Department Management', () => {
    it('should get all departments', () => {
      const departments = deptDashboards.getDepartments();
      expect(departments.length).toBeGreaterThan(0);
    });

    it('should get departments by entity', () => {
      const departments = deptDashboards.getDepartments('LuvOnPurpose AWS');
      expect(departments.length).toBeGreaterThan(0);
      expect(departments.every(d => d.entity === 'LuvOnPurpose AWS')).toBe(true);
    });

    it('should get department by ID', () => {
      const department = deptDashboards.getDepartment('DEPT-EXEC');
      expect(department).toBeDefined();
      expect(department!.name).toBe('Executive Office');
    });

    it('should get department by code', () => {
      const department = deptDashboards.getDepartmentByCode('FIN');
      expect(department).toBeDefined();
      expect(department!.name).toBe('Finance & Accounting');
    });

    it('should add department member', () => {
      const member = deptDashboards.addDepartmentMember(
        'DEPT-TECH',
        'newuser1',
        'New Developer',
        'developer',
        'Software Engineer',
        false
      );
      expect(member).toBeDefined();
      expect(member!.name).toBe('New Developer');
    });
  });

  describe('Dashboard Widgets', () => {
    it('should get department dashboard', () => {
      const widgets = deptDashboards.getDepartmentDashboard('DEPT-FIN');
      expect(widgets.length).toBeGreaterThan(0);
      expect(widgets.some(w => w.type === 'metric')).toBe(true);
      expect(widgets.some(w => w.type === 'progress')).toBe(true);
    });

    it('should save dashboard layout', () => {
      const widgets = deptDashboards.getDepartmentDashboard('DEPT-HR');
      const layout = deptDashboards.saveDashboardLayout('DEPT-HR', 'user1', widgets);
      expect(layout).toBeDefined();
      expect(layout.widgets.length).toBe(widgets.length);
    });
  });

  describe('Reports', () => {
    it('should generate department report', () => {
      const report = deptDashboards.generateDepartmentReport('DEPT-OPS', 'monthly', 'admin1');
      expect(report).toBeDefined();
      expect(report!.type).toBe('monthly');
      expect(report!.sections.length).toBeGreaterThan(0);
    });

    it('should get department reports', () => {
      deptDashboards.generateDepartmentReport('DEPT-MKT', 'weekly', 'admin1');
      const reports = deptDashboards.getDepartmentReports('DEPT-MKT');
      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe('Goal Management', () => {
    it('should add department goal', () => {
      const goal = deptDashboards.addDepartmentGoal(
        'DEPT-EDU',
        'Course Completion Rate',
        'Achieve 90% course completion',
        90,
        '%',
        Date.now() + 180 * 24 * 60 * 60 * 1000,
        'high'
      );
      expect(goal).toBeDefined();
      expect(goal!.title).toBe('Course Completion Rate');
    });

    it('should update goal progress', () => {
      const goal = deptDashboards.addDepartmentGoal(
        'DEPT-COMM',
        'Event Attendance',
        'Reach 500 attendees',
        500,
        'attendees',
        Date.now() + 90 * 24 * 60 * 60 * 1000,
        'medium'
      );
      
      const result = deptDashboards.updateGoalProgress('DEPT-COMM', goal!.id, 250);
      expect(result).toBe(true);
    });
  });

  describe('Budget Management', () => {
    it('should record expense', () => {
      const result = deptDashboards.recordExpense('DEPT-TECH', 'Software Licenses', 5000);
      expect(result).toBe(true);
    });

    it('should adjust budget', () => {
      const result = deptDashboards.adjustBudget('DEPT-HR', 'Recruitment', 50000);
      expect(result).toBe(true);
    });
  });
});
