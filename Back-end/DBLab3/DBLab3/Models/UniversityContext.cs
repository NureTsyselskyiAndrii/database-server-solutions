using DBLab3.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Models;

public partial class UniversityContext : DbContext
{
    public UniversityContext()
    {
    }

    public UniversityContext(DbContextOptions<UniversityContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BlockLogs> BlockLogs { get; set; }

    public virtual DbSet<Grades> Grades { get; set; }

    public virtual DbSet<GradesLogs> GradesLogs { get; set; }

    public virtual DbSet<Groups> Groups { get; set; }

    public virtual DbSet<Students> Students { get; set; }

    public virtual DbSet<Subjects> Subjects { get; set; }

    public virtual DbSet<Teachers> Teachers { get; set; }

    public DbSet<EachSecondStudentDto> EachSecondStudents { get; set; }

    public DbSet<EveryITeacherBelowKDto> TeachersBelowK { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=ANDREYTS_PC;Database=University;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("Cyrillic_General_CI_AS");

        modelBuilder.Entity<BlockLogs>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BlockLog__3214EC07D75F1834");

            entity.Property(e => e.ActionType).HasMaxLength(50);
            entity.Property(e => e.AttemptDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Reason).HasMaxLength(200);
            entity.Property(e => e.UserName).HasMaxLength(100);
        });

        modelBuilder.Entity<Grades>(entity =>
        {
            entity.HasKey(e => e.Grade_id).HasName("PK__Grades__D44275EBF2FFAD33");

            entity.ToTable(tb =>
                {
                    tb.HasTrigger("tr_GradesLogging");
                    tb.HasTrigger("tr_Grades_Insert_Limit");
                });

            entity.HasOne(d => d.Student).WithMany(p => p.Grades)
                .HasForeignKey(d => d.Student_id)
                .HasConstraintName("FK_Grade_Student");

            entity.HasOne(d => d.Subject).WithMany(p => p.Grades)
                .HasForeignKey(d => d.Subject_id)
                .HasConstraintName("FK_Grade_Subject");
        });

        modelBuilder.Entity<GradesLogs>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__GradesLo__3214EC07F51A0B06");

            entity.Property(e => e.ModifyDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Groups>(entity =>
        {
            entity.HasKey(e => e.Group_id).HasName("PK__Groups__319B1E1115EF27E3");

            entity.HasIndex(e => e.Name, "UQ_Groups_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.Curator).WithMany(p => p.Groups)
                .HasForeignKey(d => d.Curator_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Group_Teacher");
        });

        modelBuilder.Entity<Students>(entity =>
        {
            entity.HasKey(e => e.Student_id).HasName("PK__Students__A2F7EDF423950E59");

            entity.ToTable(tb => tb.HasTrigger("tr_Students_Insert_Weekend_Block"));

            entity.Property(e => e.Address).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);

            entity.HasOne(d => d.Group).WithMany(p => p.Students)
                .HasForeignKey(d => d.Group_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Student_Group");
        });

        modelBuilder.Entity<Subjects>(entity =>
        {
            entity.HasKey(e => e.Subject_id).HasName("PK__Subjects__D98E58EEFB0E0098");

            entity.HasIndex(e => e.Name, "UQ_Subjects_Name").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(150);
            entity.Property(e => e.Hours).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.Teacher).WithMany(p => p.Subjects)
                .HasForeignKey(d => d.Teacher_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Subject_Teacher");
        });

        modelBuilder.Entity<Teachers>(entity =>
        {
            entity.HasKey(e => e.Teacher_id).HasName("PK__Teachers__92FE70D3251956D3");

            entity.HasIndex(e => e.Phone, "UQ_Teachers_Phone").IsUnique();

            entity.Property(e => e.Department)
                .HasMaxLength(50)
                .HasDefaultValue("UNKNOWN");
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Position).HasMaxLength(50);
        });

        modelBuilder.Entity<EachSecondStudentDto>()
            .HasNoKey()
            .ToView(null);

        modelBuilder.Entity<EveryITeacherBelowKDto>()
            .HasNoKey()
            .ToView(null);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
