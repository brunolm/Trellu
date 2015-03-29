class DateTime
{
    static Format(ms: number): string
    {
        var milliseconds = ms % 1000;
        var seconds = Math.floor((ms / 1000) % 60);
        var minutes = Math.floor((ms / (60 * 1000)) % 60);
        var hours = Math.floor((ms / (60 * 60 * 1000)) % 60);

        return ("0" + hours).slice(-2)
            + ":"
            + ("0" + minutes).slice(-2)
            + ":"
            + ("0" + seconds).slice(-2)
            + "."
            + milliseconds;
    }
}