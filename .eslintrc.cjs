module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'airbnb',
    'airbnb-typescript',
    'prettier',
  ],
  plugins: ['react-refresh', '@typescript-eslint', 'prettier'],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.d.ts'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // Extend max line length
    'max-len': [
      'error',
      {
        code: 2000, // Increased to handle SVG paths
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],

    // Fix context value errors
    'react/jsx-no-constructed-context-values': 'off',

    // Fix array index key warnings
    'react/no-array-index-key': 'off',

    // Fix prop types and destructuring
    'react/destructuring-assignment': 'off',
    'react/no-unused-prop-types': 'off',

    // Fix fragment rules
    'react/jsx-no-useless-fragment': 'off',

    // Fix console and alert warnings
    'no-console': 'off',
    'no-alert': 'off',

    // Fix equality operator rules
    eqeqeq: 'off',

    // Fix typescript naming convention
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase', 'camelCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
    ],

    // Fix tab character errors
    'no-tabs': 'error',

    // Fix assignment arrow function
    'no-return-assign': 'off',

    // Fix import extensions
    'import/extensions': 'off',

    // Fix unused vars
    '@typescript-eslint/no-unused-vars': ['warn'],

    // Fix explicit any
    '@typescript-eslint/no-explicit-any': 'off',

    // Fix unescaped entities
    'react/no-unescaped-entities': 'off',

    // Add time to allowed React properties
    'react/no-unknown-property': [
      'error',
      {
        ignore: [
          'position',
          'args',
          'object',
          'attach',
          'geometry',
          'rotation',
          'intensity',
          'castShadow',
          'receiveShadow',
          'depthTest',
          'map',
          'transparent',
          'renderOrder',
          'envMap',
          'metalness',
          'roughness',
          'envMapIntensity',
          'reflectivity',
          'wireframe',
          'visible',
          'time',
          'shadow-mapSize-width',
          'shadow-mapSize-height',
          'shadow-camera-far',
          'shadow-camera-left',
          'shadow-camera-right',
          'shadow-camera-top',
          'shadow-camera-bottom',
        ],
      },
    ],

    // Keep existing rules
    'linebreak-style': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/function-component-definition': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
  },
};
