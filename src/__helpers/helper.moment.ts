import moment from "moment";

moment.locale("fr");
export const timeZone = 'Africa/Lubumbashi';

export const now = ({ options }: { options: any }) => {
    options = options ? options : {}
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium', timeZone: timeZone }).format(new Date());
};

export const date = () => new Date()

export const nowPlusDays = ({ options: { days } }: { options: { days: number } }) => {
    return moment().add(days, 'days').format("LTS, L")
};

export const nowInUnix = ({ options }: { options: any }) => {
    options = options ? options : {}
    return moment(now({ options }), 'DD-MM-YYYY').unix() || moment().unix();
};

export const daysPerTypeSouscription = ({ type }: { type: any }) => {
    let days = 0;
    switch (parseInt(type)) {
        case 1:
            return days = 30;
            break;
        case 2:
            return days = 60;
            break;
        case 3:
            return days = 90;
            break;
        case 4:
            return days = 365;
            break;
        default:
            return days = 30;
            break;
    }
};

export const addDaysThenReturnUnix = ({ days }: { days: number }) => {
    return moment().add((days), 'days').unix();
};

export const dateFormated = ({ longDate }: { longDate: any }) => {
    return moment(longDate).format("L")
};

export const unixToDate = ({ unix }: { unix: number }) => {
    return moment.unix(unix).format("DD/MM/YYYY")
};

export const __endOfTheDayWithDate = ({ date }: { date: string }) => {
    return moment(date).endOf('day').unix()
}