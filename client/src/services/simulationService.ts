import api from './api';
import { SimulationRun } from '../simulation/types/simulationTypes';

export interface SimulationsResponse {
  success: boolean;
  count: number;
  data: SimulationRun[];
}

export interface SingleSimulationResponse {
  success: boolean;
  data: SimulationRun;
}

export const simulationService = {
  async saveSimulation(runData: Partial<SimulationRun>): Promise<SingleSimulationResponse> {
    return api.post<SingleSimulationResponse>('/simulations', runData);
  },

  async getSimulations(): Promise<SimulationsResponse> {
    return api.get<SimulationsResponse>('/simulations');
  },

  async getSimulationById(id: string): Promise<SingleSimulationResponse> {
    return api.get<SingleSimulationResponse>(`/simulations/${id}`);
  },

  async getScenarioSimulations(scenarioId: string): Promise<SimulationsResponse> {
    return api.get<SimulationsResponse>(`/simulations/scenario/${scenarioId}`);
  },

  async compareSimulations(ids?: string[]): Promise<SimulationsResponse> {
    const query = ids && ids.length > 0 ? `?ids=${ids.join(',')}` : '';
    return api.get<SimulationsResponse>(`/simulations/compare${query}`);
  }
};
