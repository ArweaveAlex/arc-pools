export function parseError(error: any, type: string): string {
	if (type === 'twitter') {
		return parseTwitterError(error);
	} else if (type === 'reddit') {
		return parseRedditError(error);
	}

	return 'Could not parse error';
}

function parseTwitterError(error: any): string {
	console.log(error);
	let returnString = 'Twitter Error';
	if (error.code && error.data && error.data.detail) {
		returnString += `: ${error.code} ${error.data.detail}`;
	}
	return returnString;
}

function parseRedditError(_error: any): string {
	let returnString = 'Reddit Error';

	return returnString;
}
