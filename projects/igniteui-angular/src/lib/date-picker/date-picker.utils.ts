export enum PREDEFINED_FORMAT_OPTIONS {
    SHORT_DATE = 'shortDate',
    MEDIUM_DATE = 'mediumDate',
    LONG_DATE = 'longDate',
    FULL_DATE = 'fullDate'
}

export enum PREDEFINED_FORMATS {
    SHORT_DATE_FORMAT = 'M/d/yy',
    MEDIUM_DATE_FORMAT = 'MMM d, y',
    LONG_DATE_FORMAT = 'MMMM d, y',
    FULL_DATE_FORMAT = 'EEEE, MMMM d, y'
}

export enum PREDEFINED_MASKS {
    SHORT_DATE_MASK = '00/00/00',
    MEDIUM_DATE_MASK = 'LLL 00, 0000',
    LONG_DATE_MASK = 'LLLLLLLLL 00, 0000', // longest month - sep - 9 chars
    FULL_DATE_MASK = 'LLLLLLLLL, LLLLLLLLL 00, 0000' // longest month - sep - 9 characters, longest week day - wed - 9 chars
}

export enum FORMAT_DESC {
    NUMERIC = 'numeric',
    TWO_DIGITS = 'twoDigits',
    SHORT = 'short',
    LONG = 'long',
    NARROW = 'narrow'
}

export enum DATE_CHARS {
    YEAR_CHAR = 'y',
    MONTH_CHAR = 'M',
    DAY_CHAR = 'd',
    WEEKDAY_CHAR = 'E'
}

export enum DATE_PARTS {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
    WEEKDAY = 'weekday'
}

export abstract class DatePickerUtil {
    public static MAX_MONTH_SYMBOLS = 9;
    public static MAX_WEEKDAY_SYMBOLS = 9;

    public static getYearFormatType(format: string) {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.YEAR_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // y (2020)
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 4: {
                // yyyy (2020)
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // yy (20)
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
        }

        return type;
    }
    public static getMonthFormatType(format: string) {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.MONTH_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // M
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // MM
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
            case 3: {
                // MMM
                type = FORMAT_DESC.SHORT;
                break;
            }
            case 4: {
                // MMMM
                type = FORMAT_DESC.LONG;
                break;
            }
            case 5: {
                // MMMMM
                type = FORMAT_DESC.NARROW;
                break;
            }
        }

        return type;
    }
    public static getDayFormatType(format: string) {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.DAY_CHAR, 'g')).length;

        switch (occurences) {
            case 1: {
                // d
                type = FORMAT_DESC.NUMERIC;
                break;
            }
            case 2: {
                // dd
                type = FORMAT_DESC.TWO_DIGITS;
                break;
            }
        }

        return type;
    }
    public static getWeekDayFormatType(format: string) {
        let type;
        const occurences = format.match(new RegExp(DATE_CHARS.WEEKDAY_CHAR, 'g')).length;

        switch (occurences) {
            case 3: {
                // EEE (Tue)
                type = FORMAT_DESC.SHORT;
                break;
            }
            case 4: {
                // EEEE (Tuesday)
                type = FORMAT_DESC.LONG;
                break;
            }
            case 5: {
                // EEEEE (T)
                type = FORMAT_DESC.NARROW;
                break;
            }
        }

        return type;
    }
    public static parseDateFormat(format: string) {
        const dateStruct = [];
        const maskArray = Array.from(format);
        const weekdayInitPosition = format.indexOf(DATE_CHARS.WEEKDAY_CHAR);
        const monthInitPosition = format.indexOf(DATE_CHARS.MONTH_CHAR);
        const dayInitPosition = format.indexOf(DATE_CHARS.DAY_CHAR);
        const yearInitPosition = format.indexOf(DATE_CHARS.YEAR_CHAR);

        if (yearInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.YEAR,
                initialPosition: yearInitPosition,
                formatType: this.getYearFormatType(format)
            });
        }

        if (weekdayInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.WEEKDAY,
                initialPosition: weekdayInitPosition,
                formatType: this.getWeekDayFormatType(format)
            });
        }

        if (monthInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.MONTH,
                initialPosition: monthInitPosition,
                formatType: this.getMonthFormatType(format)
            });
        }

        if (dayInitPosition !== -1) {
            dateStruct.push({
                type: DATE_PARTS.DAY,
                initialPosition: dayInitPosition,
                formatType: this.getDayFormatType(format)
            });
        }

        for (let i = 0; i < maskArray.length; i++) {
            if (!DatePickerUtil.isSpecialSymbol(maskArray[i])) {
                dateStruct.push({
                    type: 'literal',
                    initialPosition: i,
                    value: maskArray[i]
                });
            }
        }

        dateStruct.sort((a, b) => a.initialPosition - b.initialPosition);
        DatePickerUtil.fillDatePartsPositions(dateStruct);

        return dateStruct;
    }

    private static fillDatePartsPositions(dateArray) {
        let offset = 0;

        for (let i = 0; i < dateArray.length; i++) {
            if (dateArray[i].type === DATE_PARTS.DAY) {
                dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                offset += 2;
            }

            if (dateArray[i].type === DATE_PARTS.MONTH) {
                switch (dateArray[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 3);
                        offset += 3;
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 9);
                        offset += 9;
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 1);
                        offset++;
                        break;
                    }
                    default: {
                        // FORMAT_DESC.NUMERIC || FORMAT_DESC.TWO_DIGITS
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                        offset += 2;
                        break;
                    }
                }
            }

            if (dateArray[i].type === 'literal') {
                dateArray[i].position = DatePickerUtil.fillValues(offset, 1);
                offset++;
            }

            if (dateArray[i].type === DATE_PARTS.YEAR) {
                switch (dateArray[i].formatType) {
                    case FORMAT_DESC.NUMERIC: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 4);
                        offset += 4;
                        break;
                    }
                    case FORMAT_DESC.TWO_DIGITS: {
                        dateArray[i].position = DatePickerUtil.fillValues(offset, 2);
                        offset += 2;
                        break;
                    }
                }
            }
        }
    }

    private static fillValues(start: number, offset: number) {
        const array = [];
        for (let i = start; i < start + offset; i++) {
            array.push(i);
        }

        return array;
    }

    public static isSpecialSymbol(char: string) {
        return (char !== DATE_CHARS.YEAR_CHAR
            && char !== DATE_CHARS.MONTH_CHAR
            && char !== DATE_CHARS.DAY_CHAR
            && char !== DATE_CHARS.WEEKDAY_CHAR) ? false : true;
    }

    public static getFormatMask(format: string) {
        const mask = [];
        const dateStruct = DatePickerUtil.parseDateFormat(format);

        for (let i = 0; i < dateStruct.length; i++) {
            if (dateStruct[i].type === DATE_PARTS.DAY) {
                mask.push('00');
            }
            if (dateStruct[i].type === DATE_PARTS.MONTH) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        mask.push('LLL');
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        mask.push('LLLLLLLLL');
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        mask.push('L');
                        break;
                    }
                    default: {
                        // M && MM
                        mask.push('00');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === DATE_PARTS.YEAR) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.NUMERIC: {
                        mask.push('0000');
                        break;
                    }
                    case FORMAT_DESC.TWO_DIGITS: {
                        mask.push('00');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === DATE_PARTS.WEEKDAY) {
                switch (dateStruct[i].formatType) {
                    case FORMAT_DESC.SHORT: {
                        mask.push('LLL');
                        break;
                    }
                    case FORMAT_DESC.LONG: {
                        mask.push('LLLLLLLLL');
                        break;
                    }
                    case FORMAT_DESC.NARROW: {
                        mask.push('L');
                        break;
                    }
                }
            }
            if (dateStruct[i].type === 'literal') {
                mask.push(dateStruct[i].value);
            }
        }

        return mask.join('');
    }

    public static createDate(day, month, year) {
        const date = new Date();
        date.setDate(day);
        date.setMonth(month);
        date.setFullYear(year);
        return date;
    }

    public static trimMaskSymbols(mask) {
        return mask.replace(/0|L/g, '_');
    }

    public static trimUnderlines(value: string) {
        return value.replace(/_/g, '');
    }

    public static getLongMonthName(value) {
        return value.toLocaleString('en', {
            month: 'long'
        });
    }

    public static getLongDayName(value) {
        return value.toLocaleString('en', {
            weekday: 'long'
        });
    }
}
