import { differenceInHours, differenceInMinutes, differenceInSeconds, formatRelative } from 'date-fns';

import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc';

export default function getDate(date, prefix = "") {
    if(!date) return null;

    try{
    const utcDate = zonedTimeToUtc(date, "UTC");
    const utcNow = utcToZonedTime(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone);

    const diffSeconds = differenceInSeconds(utcNow, utcDate);
    const diffMinutes = differenceInMinutes(utcNow, utcDate);
    const diffHours = differenceInHours(utcNow, utcDate);

    if(diffSeconds < 60)
        return prefix + `${diffSeconds} seconds ago`;
    if(diffMinutes < 60)
        return prefix + `${diffMinutes} minutes ago`;
    if(diffHours < 24)
        return prefix + `${diffHours} hours ago`;

    // More than a day ago
    return prefix + formatRelative(utcDate, utcNow, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    } catch(e){
        console.error("Cannot parse Date: ", date, e);
        return null;
    }
}