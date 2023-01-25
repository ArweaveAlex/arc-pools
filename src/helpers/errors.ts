

export function parseError(error: any, type: string): string {
    if(type === "twitter") {
        return parseTwitterError(error);
    }

    return "Could not parse error";
}

function parseTwitterError(error: any): string {
    let returnString = "Twitter Error";
    if (error.code && error.data && error.data.detail) {
        returnString += `: ${error.code} ${error.data.detail}`
    }
    return returnString;
}