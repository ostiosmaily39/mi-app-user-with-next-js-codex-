import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const usersApiTarget =
      process.env.USERS_API_TARGET ?? "http://localhost:3000/api/users";

    return [
      {
        source: "/api/users",
        destination: usersApiTarget,
      },
      {
        source: "/api/users/:path*",
        destination: `${usersApiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
