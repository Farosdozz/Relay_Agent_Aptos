import { Tool } from 'langchain/tools';
import { ChatCompletionTool } from 'openai/resources/chat/completions';

interface JsonSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  description?: string;
  [key: string]: any; // Add index signature for OpenAI compatibility
}

// Map of known tools to their parameter schemas
const knownToolSchemas: Record<string, JsonSchema> = {
  'aptos_transfer_token': {
    type: 'object',
    properties: {
      to: { 
        type: 'string', 
        description: 'Recipient address',
        pattern: '^0x[a-fA-F0-9]{64}$'
      },
      amount: { 
        type: 'number', 
        description: 'Amount to transfer',
        minimum: 0
      },
      tokenAddress: { 
        type: 'string', 
        description: 'Token address (optional for APT)',
        pattern: '^0x[a-fA-F0-9]{64}$'
      }
    },
    required: ['to', 'amount']
  },
  
  'aptos_check_balance': {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Address to check balance',
        pattern: '^0x[a-fA-F0-9]{64}$'
      },
      tokenAddress: {
        type: 'string',
        description: 'Token address (optional for APT)'
      }
    },
    required: ['address']
  },

  'aptos_mint_token': {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount to mint',
        minimum: 0
      },
      tokenAddress: {
        type: 'string',
        description: 'Token address to mint'
      }
    },
    required: ['amount', 'tokenAddress']
  },

  'aptos_burn_token': {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount to burn',
        minimum: 0
      },
      tokenAddress: {
        type: 'string',
        description: 'Token address to burn'
      }
    },
    required: ['amount', 'tokenAddress']
  },

  'aptos_create_token': {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Token name'
      },
      symbol: {
        type: 'string',
        description: 'Token symbol'
      },
      decimals: {
        type: 'number',
        description: 'Token decimals',
        minimum: 0,
        maximum: 18
      },
      initialSupply: {
        type: 'number',
        description: 'Initial supply',
        minimum: 0
      }
    },
    required: ['name', 'symbol', 'decimals']
  },

  'aptos_get_token_info': {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'Token address',
        pattern: '^0x[a-fA-F0-9]{64}$'
      }
    },
    required: ['tokenAddress']
  },

  'aptos_get_account_address': {
    type: 'object',
    properties: {},
    required: []
  },

  'aptos_get_transaction': {
    type: 'object',
    properties: {
      transactionHash: {
        type: 'string',
        description: 'Transaction hash',
        pattern: '^0x[a-fA-F0-9]{64}$'
      }
    },
    required: ['transactionHash']
  }
};

/**
 * Parse tool descriptions to extract parameter schemas
 */
export function extractParameterSchema(toolName: string, description: string): JsonSchema {
  // First, check if we have a known schema for this tool
  if (knownToolSchemas[toolName]) {
    return knownToolSchemas[toolName];
  }

  // Try to match tool name from description
  for (const [knownToolName, schema] of Object.entries(knownToolSchemas)) {
    if (description.toLowerCase().includes(knownToolName.replace(/_/g, ' '))) {
      return schema;
    }
  }

  // Fallback: try to parse from description
  // Look for patterns like "Input: {param1: type, param2: type}"
  const inputMatch = description.match(/Input:\s*{([^}]+)}/i);
  if (inputMatch) {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    const params = inputMatch[1].split(',').map(p => p.trim());
    params.forEach(param => {
      const [name, type] = param.split(':').map(s => s.trim());
      if (name && type) {
        const isOptional = type.includes('?') || type.includes('optional');
        const cleanType = type.replace('?', '').replace('optional', '').trim();
        
        properties[name] = {
          type: cleanType === 'address' ? 'string' : cleanType,
          description: `${name} parameter`
        };
        
        if (!isOptional) {
          required.push(name);
        }
      }
    });

    return {
      type: 'object',
      properties,
      required
    };
  }

  // Final fallback: return empty schema
  return { 
    type: 'object', 
    properties: {},
    required: []
  };
}

/**
 * Convert LangChain tools to OpenAI function definitions
 */
export function convertToOpenAIFunctions(tools: Tool[]): ChatCompletionTool[] {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: extractParameterSchema(tool.name, tool.description)
    }
  }));
}

/**
 * Execute a tool and return the result
 */
export async function executeTool(
  toolName: string,
  args: any,
  tools: Tool[]
): Promise<string> {
  const tool = tools.find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  try {
    // LangChain tools expect JSON string input
    const input = typeof args === 'string' ? args : JSON.stringify(args);
    // Use invoke method instead of protected _call
    return await tool.invoke(input);
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    throw new Error(`Failed to execute tool ${toolName}: ${error.message}`);
  }
}