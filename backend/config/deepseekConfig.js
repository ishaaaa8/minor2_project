const { ChatDeepSeek } = require("@langchain/deepseek");

const deepseek = new ChatDeepSeek({
    model: "deepseek-chat",
    temperature: 0.5,
});

module.exports = { deepseek };
