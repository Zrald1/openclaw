import { beforeEach, describe, expect, it, vi } from "vitest";

describe("resolveImplicitProviders AWS Integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should include amazon-bedrock when discovery returns models and env is set", async () => {
    // Mock the dependency BEFORE importing the module under test
    vi.doMock("./bedrock-discovery.js", () => ({
      discoverBedrockModels: vi.fn().mockResolvedValue([
        {
          id: "anthropic.claude-3-sonnet-20240229-v1:0",
          name: "Claude 3 Sonnet",
          provider: "amazon-bedrock",
        },
      ]),
    }));

    // Dynamic import to pick up the mock
    const { resolveImplicitProviders } = await import("./models-config.providers.js");

    const providers = await resolveImplicitProviders({
      agentDir: "/tmp/agent",
      config: {
        models: {
          bedrockDiscovery: { enabled: true },
        },
      },
      env: {
        AWS_REGION: "us-east-1",
        AWS_ACCESS_KEY_ID: "test",
        AWS_SECRET_ACCESS_KEY: "test",
      },
    });

    expect(providers).toHaveProperty("amazon-bedrock");
    expect(providers["amazon-bedrock"]).toMatchObject({
      api: "bedrock-converse-stream",
      auth: "aws-sdk",
    });
  });
});
