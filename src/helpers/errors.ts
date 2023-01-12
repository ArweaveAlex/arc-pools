

export function parseError(error: any, type: string): string {
    if(type === "twitter") {
        return parseTwitterError(error);
    }

    return "Could not parse error";
}

function parseTwitterError(error: any): string {
    let returnString = "Twitter Error: ";
    returnString = returnString + error.code + " " + error.data.detail;
    return returnString;
}