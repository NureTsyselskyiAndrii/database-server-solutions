namespace DBLab3.Models;

public partial class BlockLogs
{
    public int Id { get; set; }

    public DateTime AttemptDate { get; set; }

    public string ActionType { get; set; } = null!;

    public string Reason { get; set; } = null!;

    public string UserName { get; set; } = null!;
}
