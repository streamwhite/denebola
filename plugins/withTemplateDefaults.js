module.exports = function withTemplateDefaults(config) {
  return { ...config, extra: { ...config.extra, template: { version: "1" } } };
};
