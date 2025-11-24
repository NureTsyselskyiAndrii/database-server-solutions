namespace DBLab3.Models;

public partial class GradesLogs
{
    public int Id { get; set; }

    public int Grade_id { get; set; }

    public int? OldGrade { get; set; }

    public int? NewGrade { get; set; }

    public DateTime ModifyDate { get; set; }
}
