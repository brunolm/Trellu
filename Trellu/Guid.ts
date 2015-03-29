class Guid
{
    private static ComposeBytes(): string
    {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    static NewGuid(): string
    {
        return Guid.ComposeBytes() + Guid.ComposeBytes()
            + '-'
            + Guid.ComposeBytes()
            + '-'
            + Guid.ComposeBytes()
            + '-'
            + Guid.ComposeBytes()
            + '-'
            + Guid.ComposeBytes() + Guid.ComposeBytes() + Guid.ComposeBytes();
    }
}