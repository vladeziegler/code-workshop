import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@composio/core"],
  outputFileTracingIncludes: {
    "/api/draft": ["./instructions.md"],
  },
};

export default nextConfig;
