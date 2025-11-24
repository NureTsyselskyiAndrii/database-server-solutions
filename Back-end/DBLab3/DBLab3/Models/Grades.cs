namespace DBLab3.Models;

public partial class Grades
{
    public int Grade_id { get; set; }

    public int Student_id { get; set; }

    public int Subject_id { get; set; }

    public int Grade { get; set; }

    public DateOnly Date_grade { get; set; }

    public virtual Students Student { get; set; } = null!;

    public virtual Subjects Subject { get; set; } = null!;
}
