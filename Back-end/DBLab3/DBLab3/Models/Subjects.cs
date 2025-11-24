namespace DBLab3.Models;

public partial class Subjects
{
    public int Subject_id { get; set; }

    public string Name { get; set; } = null!;

    public decimal Hours { get; set; }

    public int? Teacher_id { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<Grades> Grades { get; set; } = new List<Grades>();

    public virtual Teachers? Teacher { get; set; }
}
