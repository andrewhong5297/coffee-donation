// Reference this document for trail details and debugging: 
// https://trails-api.herd.eco/v1/trails/0197604c-f761-7ade-8a5c-5e50c2d834d4/versions/0197604c-f76a-779a-8f2e-e3ba236da2c6/llms-full.txt

const TRAIL_CONFIG = {
  trailId: '0197604c-f761-7ade-8a5c-5e50c2d834d4',
  versionId: '0197604c-f76a-779a-8f2e-e3ba236da2c6',
  baseApiUrl: 'https://trails-api.herd.eco/v1/trails',
  primaryNodeId: '0197604e-691f-7386-85a3-addc4346d6d0', // FiatTokenV2_2.transfer
  stepNumber: 1,
};

export interface UserInputs {
  [nodeId: string]: {
    [inputName: string]: {
      value: string;
    };
  };
}

export interface EvaluationRequest {
  walletAddress: string;
  userInputs: UserInputs;
  execution: { type: "latest" } | { type: "new" } | { type: "manual", executionId: string };
}

export interface EvaluationResponse {
  finalInputValues: Record<string, string>;
  finalPayableAmount: string;
  finalContractAddress: string;
  callData: string;
  allInputsValidAndFilled: boolean;
}

export interface ExecutionRequest {
  nodeId: string;
  transactionHash: string;
  walletAddress: string;
  execution: { type: "latest" } | { type: "new" } | { type: "manual", executionId: string };
}

export interface ExecutionHistoryItem {
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  steps: Array<{
    id: string;
    stepNumber: number;
    stepType: string;
    contractAddress: string;
    functionSignature: string;
    nodeId: string;
    txHash: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ExecutionHistoryResponse {
  totals: {
    executions: number;
    wallets: number;
  };
  executions: {
    [walletAddress: string]: {
      executions: ExecutionHistoryItem[];
      farcasterData?: {
        username: string;
        pfp_url: string;
        display_name: string;
        fid: number;
        bio: string;
        followers: number;
        following: number;
      };
    };
  };
}

export class HerdAPI {
  private static getEvaluationUrl(): string {
    return `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/steps/${TRAIL_CONFIG.stepNumber}/evaluations`;
  }

  private static getExecutionUrl(): string {
    return `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/executions`;
  }

  static async evaluateInputs(request: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await fetch(this.getEvaluationUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Evaluation API failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  static async createExecution(request: ExecutionRequest): Promise<void> {
    const response = await fetch(this.getExecutionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Failed to create execution: ${response.status} ${errorText}`);
      // Don't throw error here as transaction was already submitted
    }
  }

  static async getExecutionHistory(walletAddress: string): Promise<ExecutionHistoryResponse> {
    const response = await fetch(`${this.getExecutionUrl()}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddresses: [walletAddress]
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { totals: { executions: 0, wallets: 0 }, executions: {} };
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch execution history: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  static buildUserInputs(amount: string): UserInputs {
    // According to the new trail documentation, there are no required user inputs
    // The inputs.value is derived relationally, not from user input
    return {};
  }

  static async getAllExecutions(): Promise<ExecutionHistoryResponse> {
    const response = await fetch(`${this.getExecutionUrl()}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddresses: [] // Empty array to get all executions
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { totals: { executions: 0, wallets: 0 }, executions: {} };
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch all executions: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  static getTrailConfig() {
    return TRAIL_CONFIG;
  }

  // Add method to read donation amounts from executed transactions
  static async getExecutionNodeData(walletAddress: string, execution: { type: "latest" } | { type: "new" } | { type: "manual", executionId: string } = { type: "latest" }): Promise<any> {
    const readNodeUrl = `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/nodes/${TRAIL_CONFIG.primaryNodeId}/read`;
    
    const response = await fetch(readNodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress,
        userInputs: {},
        execution: execution
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to read node data: ${response.statusText}`);
    }

    return response.json();
  }
}
