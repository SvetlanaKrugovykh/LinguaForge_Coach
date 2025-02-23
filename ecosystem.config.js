module.exports = {
  apps: [
    {
      name: "PL_Lingua_bot",
      script: "./src/index.js",
      watch: true,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
}