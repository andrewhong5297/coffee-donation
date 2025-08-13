// Reference this document for trail details and debugging:
// https://trails-api.herd.eco/v1/trails/0197604c-f761-7ade-8a5c-5e50c2d834d4/versions/0197604c-f76a-779a-8f2e-e3ba236da2c6/guidebook.txt?trailAppId=0198a42e-6183-745a-abca-cb89fd695d50

const TRAIL_CONFIG = {
  trailId: "0197604c-f761-7ade-8a5c-5e50c2d834d4",
  versionId: "0197604c-f76a-779a-8f2e-e3ba236da2c6",
  baseApiUrl: "https://trails-api.herd.eco/v1/trails",
  primaryNodeId: "0197604e-691f-7386-85a3-addc4346d6d0", // FiatTokenV2_2.transfer
  balanceNodeId: "01989ee5-c66c-7eb5-9728-faaa6ec696c9", // USDC balance read node
  stepNumber: 1,
  trailAppId: "0198a437-d9da-7232-8be9-570229bd756b",
};

const getApiHeaders = () => ({
  "Content-Type": "application/json",
  "Herd-Trail-App-Id": TRAIL_CONFIG.trailAppId,
});

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
  execution:
    | { type: "latest" }
    | { type: "new" }
    | { type: "manual"; executionId: string };
}

export interface EvaluationResponse {
  finalInputValues: Record<string, string>;
  payableAmount: string;
  contractAddress: string;
  callData: string;
}

export interface ExecutionRequest {
  nodeId: string;
  transactionHash: string;
  walletAddress: string;
  execution:
    | { type: "latest" }
    | { type: "new" }
    | { type: "manual"; executionId: string };
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
    transactions: number;
    wallets: number;
    stepStats?: {
      [stepNumber: string]: {
        wallets: number;
        walletAddresses: string[];
        transactions: number;
        transactionHashes: Array<{
          walletAddress: string;
          txHash: string;
          blockTimestamp: number;
          blockNumber: number;
          latestExecutionId: string;
          farcasterData?: {
            username: string;
            pfp_url: string;
            display_name: string;
            fid: number;
            bio: string;
          } | null;
        }>;
      };
    };
  };
  walletExecutions: Array<{
    walletAddress: string;
    executions: ExecutionHistoryItem[];
    farcasterData?: {
      username: string;
      pfp_url: string;
      display_name: string;
      fid: number;
      bio: string;
    } | null;
    txnsPerStep?: {
      [stepNumber: string]: Array<{
        txHash: string;
        blockTimestamp: number;
        blockNumber: number;
        latestExecutionId: string;
      }>;
    };
  }>;
}

export interface ReadNodeRequest {
  walletAddress: string;
  userInputs: UserInputs;
  execution:
    | { type: "latest" }
    | { type: "new" }
    | { type: "manual"; executionId: string };
}

export interface ReadNodeResponse {
  inputs?: any;
  outputs?: any;
}

export class HerdAPI {
  private static getEvaluationUrl(): string {
    return `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/steps/${TRAIL_CONFIG.stepNumber}/evaluations`;
  }

  private static getExecutionUrl(): string {
    return `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/executions`;
  }

  private static getReadNodeUrl(nodeId: string): string {
    return `${TRAIL_CONFIG.baseApiUrl}/${TRAIL_CONFIG.trailId}/versions/${TRAIL_CONFIG.versionId}/nodes/${nodeId}/read`;
  }

  static async evaluateInputs(
    request: EvaluationRequest,
  ): Promise<EvaluationResponse> {
    const response = await fetch(this.getEvaluationUrl(), {
      method: "POST",
      headers: getApiHeaders(),
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
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `Failed to create execution: ${response.status} ${errorText}`,
      );
      // Don't throw error here as transaction was already submitted
    }
  }

  static async getExecutionHistory(
    walletAddress: string,
  ): Promise<ExecutionHistoryResponse> {
    const response = await fetch(`${this.getExecutionUrl()}/query`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        walletAddresses: [walletAddress],
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { totals: { transactions: 0, wallets: 0 }, walletExecutions: [] };
      }
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch execution history: ${response.status} ${errorText}`,
      );
    }

    return response.json();
  }

  static buildUserInputs(amount: string): UserInputs {
    // Convert amount to USDC in wei (multiply by 1,000,000 for 6 decimals)
    const amountInWei = (parseFloat(amount) * 1_000_000).toString();
    
    // Based on the trail step data, required user inputs are 'inputs.value' and 'inputs.to'
    // The 'to' address is hardcoded to the same address that was previously creator_hardcoded
    // but now needs to be passed as user input (not shown in UI)
    return {
      [TRAIL_CONFIG.primaryNodeId]: {
        "inputs.value": {
          value: amountInWei,
        },
        "inputs.to": {
          value: "0x2Ae8c972fB2E6c00ddED8986E2dc672ED190DA06",
        },
      },
    };
  }

  static async getAllExecutions(): Promise<ExecutionHistoryResponse> {
    const response = await fetch(`${this.getExecutionUrl()}/query`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        walletAddresses: [], // Empty array to get all executions
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { totals: { transactions: 0, wallets: 0 }, walletExecutions: [] };
      }
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch all executions: ${response.status} ${errorText}`,
      );
    }

    return response.json();
  }

  static async readNode(
    nodeId: string,
    request: ReadNodeRequest,
  ): Promise<ReadNodeResponse> {
    const response = await fetch(this.getReadNodeUrl(nodeId), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Read node API failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  static getTrailConfig() {
    return TRAIL_CONFIG;
  }

  // Add balance read functionality
  static async getUserBalance(walletAddress: string): Promise<number> {
    try {
      const request: ReadNodeRequest = {
        walletAddress: walletAddress.toLowerCase(), // Ensure lowercase as per API example
        execution: { type: "latest" },
        userInputs: {}
      };

      console.log(`Fetching balance for wallet: ${walletAddress}`);
      const response = await this.readNode(TRAIL_CONFIG.balanceNodeId, request);
      console.log("Balance API response:", response);
      
      // Parse balance from the response
      if (response.outputs && response.outputs.arg_0) {
        const balanceWei = BigInt(response.outputs.arg_0.value);
        // Convert from wei to USDC (6 decimals)
        const balance = Number(balanceWei) / 1_000_000;
        console.log(`Parsed balance: ${balance} USDC from raw value: ${response.outputs.arg_0.value}`);
        return balance;
      }
      
      console.log("No balance data found in response");
      return 0;
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
      return 0;
    }
  }
}
