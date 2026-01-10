/**
 * AI Council - Main Index
 * 
 * Central export point for the council module.
 */

export { runCouncilDebate, Moderator, createAllAgents, createAgent } from './orchestrator';
export * from './types';
export { executeTool, getAllQuickStats } from './tools';
