module.exports = {
  apps: [
    {
      name: "casadimoda-client",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
