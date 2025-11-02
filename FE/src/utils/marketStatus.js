export function isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (day === 0 || day === 6) return false;
    const marketOpenTime = 9 * 60;
    const marketCloseTime = 15 * 60 + 30;
    const currentTime = hours * 60 + minutes;
    return currentTime >= marketOpenTime && currentTime <= marketCloseTime;
}