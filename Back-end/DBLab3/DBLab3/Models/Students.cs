namespace DBLab3.Models;

public partial class Students
{
    public int Student_id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public DateOnly Birth_date { get; set; }

    public string? Address { get; set; }

    public int? Group_id { get; set; }

    public virtual ICollection<Grades> Grades { get; set; } = new List<Grades>();

    public virtual Groups? Group { get; set; }
}
