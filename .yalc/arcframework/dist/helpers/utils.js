"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logJsonUpdate = exports.formatKeywordString = exports.checkGqlCursor = exports.splitArray = exports.unquoteJsonKeys = exports.checkNullValues = exports.getJSONStorage = exports.getTagValue = exports.formatTitle = exports.formatDate = exports.formatMetric = exports.formatFloat = exports.formatCount = exports.formatDataSize = exports.formatAddress = exports.formatArtifactType = exports.getHashUrl = void 0;
const config_1 = require("./config");
function getHashUrl(url) {
    return `${url}/#`;
}
exports.getHashUrl = getHashUrl;
function formatArtifactType(artifactType) {
    return artifactType.includes('Alex') ? artifactType.substring(5) : artifactType;
}
exports.formatArtifactType = formatArtifactType;
function formatAddress(address, wrap) {
    if (!address) {
        return '';
    }
    const formattedAddress = address.substring(0, 5) + '...' + address.substring(36, address.length - 1);
    return wrap ? `(${formattedAddress})` : formattedAddress;
}
exports.formatAddress = formatAddress;
function formatDataSize(size) {
    return `${size} KB`;
}
exports.formatDataSize = formatDataSize;
function formatCount(count) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.formatCount = formatCount;
function formatFloat(number, value) {
    let string = number.toString();
    string = string.slice(0, string.indexOf('.') + value + 1);
    return Number(string);
}
exports.formatFloat = formatFloat;
function formatMetric(count) {
    if (Number(count) > 1000) {
        const localeString = Number(count).toLocaleString();
        const parsedString = localeString.substring(0, localeString.indexOf(','));
        const unit = count.toString().length >= 7 ? 'm' : 'k';
        return `${parsedString}${unit}`;
    }
    else {
        return count;
    }
}
exports.formatMetric = formatMetric;
function formatTime(time) {
    return time < 10 ? `0${time.toString()}` : time.toString();
}
function getHours(hours) {
    if (hours > 12)
        return hours - 12;
    else
        return hours;
}
function getHourFormat(hours) {
    if (hours >= 12 && hours <= 23) {
        return `PM`;
    }
    else {
        return `AM`;
    }
}
function formatDate(dateArg, dateType) {
    if (!dateArg) {
        return config_1.STORAGE.none;
    }
    let date = null;
    switch (dateType) {
        case 'iso':
            date = new Date(dateArg);
            break;
        case 'epoch':
            date = new Date(Number(dateArg));
            break;
        default:
            date = new Date(dateArg);
            break;
    }
    return `${date.toLocaleString('default', {
        month: 'long',
    })} ${date.getDate()}, ${date.getUTCFullYear()} @ ${getHours(date.getHours())}:${formatTime(date.getMinutes())}:${formatTime(date.getSeconds())} ${getHourFormat(date.getHours())}`;
}
exports.formatDate = formatDate;
function formatTitle(string) {
    const result = string.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
}
exports.formatTitle = formatTitle;
function getTagValue(list, name) {
    for (let i = 0; i < list.length; i++) {
        if (list[i]) {
            if (list[i].name === name) {
                return list[i].value;
            }
        }
    }
    return config_1.STORAGE.none;
}
exports.getTagValue = getTagValue;
function getJSONStorage(key) {
    return JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem(key))));
}
exports.getJSONStorage = getJSONStorage;
function checkNullValues(obj) {
    for (const key in obj) {
        if (obj[key] === null) {
            return true;
        }
    }
    return false;
}
exports.checkNullValues = checkNullValues;
function unquoteJsonKeys(json) {
    return JSON.stringify(json).replace(/"([^"]+)":/g, '$1:');
}
exports.unquoteJsonKeys = unquoteJsonKeys;
function splitArray(array, size) {
    const splitResult = [];
    const arrayCopy = [...array];
    for (let i = 0; i < arrayCopy.length; i += size) {
        const chunk = arrayCopy.slice(i, i + size);
        splitResult.push(chunk);
    }
    return splitResult;
}
exports.splitArray = splitArray;
function checkGqlCursor(string) {
    /* All Search Cursors contain '-'
        GQL Cursors contain letters, numbers or '=' */
    if (/[-]/.test(string)) {
        return false;
    }
    else if (/[A-Za-z0-9]/.test(string) || /[=]/.test(string)) {
        return true;
    }
    else {
        return true;
    }
}
exports.checkGqlCursor = checkGqlCursor;
function formatKeywordString(text, char) {
    /* Find words containing char
        Return html string with char strings formatted in HTML tag and strip URLs */
    let finalStr = '';
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
            if (text.substring(count, i).includes(char)) {
                finalStr += `<span>${text.substring(count, i)}</span>`;
            }
            else {
                finalStr += text.substring(count, i);
            }
            count = i;
        }
    }
    if (count < text.length) {
        finalStr += text.substring(count, text.length);
    }
    return finalStr.replace(/(https?:\/\/[^\s]+)/g, '');
}
exports.formatKeywordString = formatKeywordString;
function logJsonUpdate(poolTitle, key, value) {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    console.log(`${formattedDate} - Updating ${poolTitle} JSON Object - ${key} - [`, `'${value}'`, `]`);
}
exports.logJsonUpdate = logJsonUpdate;
