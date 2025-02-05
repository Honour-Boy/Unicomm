module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend', '<rootDir>/frontend/src'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};