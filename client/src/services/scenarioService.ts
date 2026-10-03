import api from './api';
import { Scenario } from '../simulation/types/simulationTypes';

export interface ScenariosResponse {
  success: boolean;
  count: number;
  data: Scenario[];
}

export interface SingleScenarioResponse {
  success: boolean;
  data: Scenario;
}

export const scenarioService = {
  async getScenarios(): Promise<ScenariosResponse> {
    return api.get<ScenariosResponse>('/scenarios');
  },

  async getScenarioById(id: string): Promise<SingleScenarioResponse> {
    return api.get<SingleScenarioResponse>(`/scenarios/${id}`);
  },

  async createScenario(scenario: Partial<Scenario>): Promise<SingleScenarioResponse> {
    return api.post<SingleScenarioResponse>('/scenarios', scenario);
  },

  async updateScenario(id: string, scenario: Partial<Scenario>): Promise<SingleScenarioResponse> {
    return api.put<SingleScenarioResponse>(`/scenarios/${id}`, scenario);
  },

  async deleteScenario(id: string): Promise<{ success: boolean; data: any }> {
    return api.delete<{ success: boolean; data: any }>(`/scenarios/${id}`);
  },

  async duplicateScenario(id: string): Promise<SingleScenarioResponse> {
    return api.post<SingleScenarioResponse>(`/scenarios/${id}/duplicate`);
  },

  async resetScenario(id: string): Promise<SingleScenarioResponse> {
    return api.post<SingleScenarioResponse>(`/scenarios/${id}/reset`);
  }
};
