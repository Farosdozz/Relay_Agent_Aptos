import { Tool } from 'langchain/tools';
import { 
  convertToOpenAIFunctions, 
  executeTool, 
  extractParameterSchema 
} from './tool-adapter.utils';

// Mock LangChain Tool
class MockTool extends Tool {
  name = 'test_tool';
  description = 'Test tool for unit testing';

  async _call(input: string): Promise<string> {
    return `Executed with: ${input}`;
  }
  
  async invoke(input: string): Promise<string> {
    return this._call(input);
  }
}

class MockTransferTool extends Tool {
  name = 'aptos_transfer_token';
  description = 'Transfer APT or tokens. Input: {to: address, amount: number, tokenAddress?: string}';

  async _call(input: string): Promise<string> {
    const args = JSON.parse(input);
    return `Transferred ${args.amount} to ${args.to}`;
  }
}

describe('Tool Adapter Utils', () => {
  describe('extractParameterSchema', () => {
    it('should return known schema for aptos_transfer_token', () => {
      const schema = extractParameterSchema('aptos_transfer_token', 'Transfer tokens');
      
      expect(schema).toEqual({
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
      });
    });

    it('should return known schema for aptos_check_balance', () => {
      const schema = extractParameterSchema('aptos_check_balance', 'Check balance');
      
      expect(schema.properties).toHaveProperty('address');
      expect(schema.required).toContain('address');
    });

    it('should parse schema from description with Input format', () => {
      const description = 'Custom tool. Input: {param1: string, param2: number, param3?: boolean}';
      const schema = extractParameterSchema('custom_tool', description);
      
      expect(schema.properties).toHaveProperty('param1');
      expect(schema.properties).toHaveProperty('param2');
      expect(schema.properties).toHaveProperty('param3');
      expect(schema.required).toContain('param1');
      expect(schema.required).toContain('param2');
      expect(schema.required).not.toContain('param3');
    });

    it('should return empty schema for unknown tools', () => {
      const schema = extractParameterSchema('unknown_tool', 'Some description');
      
      expect(schema).toEqual({
        type: 'object',
        properties: {},
        required: []
      });
    });

    it('should match tool name from description', () => {
      const schema = extractParameterSchema('some_alias', 'This tool can aptos transfer token between accounts');
      
      expect(schema.properties).toHaveProperty('to');
      expect(schema.properties).toHaveProperty('amount');
    });
  });

  describe('convertToOpenAIFunctions', () => {
    it('should convert LangChain tools to OpenAI function format', () => {
      const tools = [new MockTransferTool()];
      const functions = convertToOpenAIFunctions(tools);
      
      expect(functions).toHaveLength(1);
      expect(functions[0]).toEqual({
        type: 'function',
        function: {
          name: 'aptos_transfer_token',
          description: 'Transfer APT or tokens. Input: {to: address, amount: number, tokenAddress?: string}',
          parameters: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              to: expect.any(Object),
              amount: expect.any(Object)
            })
          })
        }
      });
    });

    it('should handle multiple tools', () => {
      const tools = [
        new MockTool(),
        new MockTransferTool()
      ];
      const functions = convertToOpenAIFunctions(tools);
      
      expect(functions).toHaveLength(2);
      expect(functions.map(f => f.function.name)).toEqual(['test_tool', 'aptos_transfer_token']);
    });
  });

  describe('executeTool', () => {
    it('should execute tool successfully', async () => {
      const tools = [new MockTransferTool()];
      const result = await executeTool(
        'aptos_transfer_token',
        { to: '0x123', amount: 100 },
        tools
      );
      
      expect(result).toBe('Transferred 100 to 0x123');
    });

    it('should handle string arguments', async () => {
      const tools = [new MockTransferTool()];
      const result = await executeTool(
        'aptos_transfer_token',
        '{"to": "0x456", "amount": 50}',
        tools
      );
      
      expect(result).toBe('Transferred 50 to 0x456');
    });

    it('should throw error for non-existent tool', async () => {
      const tools = [new MockTool()];
      
      await expect(
        executeTool('non_existent_tool', {}, tools)
      ).rejects.toThrow('Tool non_existent_tool not found');
    });

    it('should handle tool execution errors', async () => {
      class ErrorTool extends Tool {
        name = 'error_tool';
        description = 'Tool that throws error';
        
        async _call(): Promise<string> {
          throw new Error('Tool execution failed');
        }
      }
      
      const tools = [new ErrorTool()];
      
      await expect(
        executeTool('error_tool', {}, tools)
      ).rejects.toThrow('Failed to execute tool error_tool: Tool execution failed');
    });
  });
});