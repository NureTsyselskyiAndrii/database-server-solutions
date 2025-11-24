namespace DBLab3.Models;

public partial class Groups
{
    public int Group_id { get; set; }

    public string Name { get; set; } = null!;

    public int Year_start { get; set; }

    public int? Curator_id { get; set; }

    public virtual Teachers? Curator { get; set; }

    public virtual ICollection<Students> Students { get; set; } = new List<Students>();
}
