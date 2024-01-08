module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['import', '@typescript-eslint', 'simple-import-sort'],
	extends: [],
	rules: {
		'import/no-duplicates': 'error',
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
	},
	overrides: [
		{
			files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
			rules: {
				'simple-import-sort/imports': [
					'error',
					{
						groups: [
							['^react', '^@?\\w'],
							['^arweave', 'arbundles', '@irys/sdk', '^warp', '^@permaweb/stampjs', '^@?\\w'],
							['^(@|arcframework)(/.*|$)'],
							[
								'^(@|api)(/.*|$)',
								'^(@|clients)(/.*|$)',
								'^(@|commands)(/.*|$)',
								'^(@|helpers)(/.*|$)',
								'^(@|miners)(/.*|$)',
								'^(@|options)(/.*|$)',
							],
							['^\\u0000'],
							['^\\.\\.(?!/?$)', '^\\.\\./?$'],
							['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						],
					},
				],
				'react-hooks/exhaustive-deps': 'off',
			},
		},
	],
};
