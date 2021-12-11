export const ellipsify = (text: string, start = 6, end = 4) => {
    return `${text.slice(0, start)}...${text.slice(-end)}`;
}
