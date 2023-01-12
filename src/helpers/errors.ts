

export function parseError(error: any, type: string): string {
    if(type === "twitter") {
        return parseTwitterError(error);
    }

    return "Could not parse error";
}

function parseTwitterError(error: any): string {
    let returnString = "Twitter Error: ";

    if(error.code === 429 || error.code === 400) {
        returnString = returnString + error.data.detail;
    }

    return returnString;
}