import { Tournament } from '../types';

export interface TournamentStatus {
    status: 'Upcoming' | 'Live' | 'Completed';
    message: string;
    isLive: boolean;
    isUpcoming: boolean;
    isCompleted: boolean;
    timeDiff: number; // Time difference in milliseconds
}

// Function to parse the time string (e.g., "07:00 PM") into a 24-hour format { hours, minutes }
function parseTime(timeStr: string): { hours: number; minutes: number } {
    if (!timeStr || !timeStr.includes(':') || !timeStr.includes(' ')) {
        return { hours: 0, minutes: 0 }; // Default time if format is incorrect
    }
    const [time, ampm] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (ampm.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    }
    if (ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }
    return { hours, minutes };
}

export const getTournamentStatus = (tournament: Tournament): TournamentStatus => {
    const { date, time } = tournament;
    if (!date || !time) {
        return { status: 'Upcoming', message: 'Date & Time TBA', isLive: false, isUpcoming: true, isCompleted: false, timeDiff: Infinity };
    }

    const { hours, minutes } = parseTime(time);
    const tournamentDateTime = new Date(date);
    tournamentDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();

    const timeDiff = tournamentDateTime.getTime() - now.getTime();
    const liveDuration = 4 * 60 * 60 * 1000; // Assuming a tournament is "live" for 4 hours after start time

    if (timeDiff > 0) {
        // Upcoming
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        let message = '';
        if (days > 1) {
            message = `Starts in ${days} days`;
        } else if (days === 1) {
            message = `Starts in 1 day`;
        } else {
             message = `Starts soon`;
        }

        return {
            status: 'Upcoming',
            message: message,
            isLive: false,
            isUpcoming: true,
            isCompleted: false,
            timeDiff
        };
    } else if (timeDiff <= 0 && timeDiff > -liveDuration) {
        // Live
        return { status: 'Live', message: 'LIVE NOW', isLive: true, isUpcoming: false, isCompleted: false, timeDiff };
    } else {
        // Completed
        return { status: 'Completed', message: 'Completed', isLive: false, isUpcoming: false, isCompleted: true, timeDiff };
    }
};