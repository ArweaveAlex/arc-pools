import { CLI_ARGS } from '../helpers/config';
import { OptionInterface } from '../helpers/interfaces';

const option: OptionInterface = {
	name: CLI_ARGS.options.source,
	description: `Specifies the data source`,
	arg: '<all / files / twitter / wikipedia / reddit / news-api / gnews / nostr>',
	suboptions: [
		{
			name: 'files',
			description: '',
			arg: '',
			topLevel: true,
			suboptions: [
				{
					name: 'path',
					description: 'Specifies a file or directory path to upload',
					arg: '<path>',
				},
				{
					name: 'meta-file',
					description: 'Specifies a metadata file config for uploads',
					arg: '<meta-path>',
				},
				{
					name: 'clear',
					description: 'Clear local files that have been uploaded',
					arg: '',
				},
			],
		},
		{
			name: 'reddit',
			description: '',
			arg: '',
			topLevel: true,
			suboptions: [
				{
					name: 'method',
					description: 'Archiving method',
					arg: '<search-term / subreddit / username>',
					suboptions: [
						{
							name: 'search-term',
							description: 'Search term',
							arg: '<term>',
						},
						{
							name: 'subreddit',
							description: 'Subreddit',
							arg: '<subreddit>',
						},
						{
							name: 'username',
							description: 'Username',
							arg: '<username>',
						},
					],
				},
			],
		},
		{
			name: 'twitter',
			description: '',
			arg: '',
			topLevel: true,
			suboptions: [
				{
					name: 'method',
					description: 'Archiving method',
					arg: '<mention-tag / username>',
					suboptions: [
						{
							name: 'mention-tag',
							description: 'Mention tag',
							arg: '<mention-tag>',
						},
						{
							name: 'username',
							description: 'User account',
							arg: '<username>',
						},
					],
				},
				{
					name: 'content-moderation',
					description: 'Use content moderation on twitter mining',
					arg: '',
				},
			],
		},
	],
};

export default option;
