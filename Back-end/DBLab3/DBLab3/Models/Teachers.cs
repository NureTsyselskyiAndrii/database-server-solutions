namespace DBLab3.Models;

public partial class Teachers
{
    public int Teacher_id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Department { get; set; } = null!;

    public string Position { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public virtual ICollection<Groups> Groups { get; set; } = new List<Groups>();

    public virtual ICollection<Subjects> Subjects { get; set; } = new List<Subjects>();
}
